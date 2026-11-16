import crypto from "crypto";
import mongoose from "mongoose";
import razorpayInst from "../config/razorpay.js";
import productModel from "../models/product.model.js";
import paymentModel from "../models/payment.model.js";

// GET /products → fetch all products from MongoDB
async function getProducts(req, res) {
  try {
    const products = await productModel.find({});
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
}

// POST /create/order/:productId or POST /create/order (cart)
async function createOrder(req, res) {
  try {
    const productId = req.params.productId;

    // Case 1: Single product purchase via URL param
    if (productId) {
      let product = null;
      if (mongoose.Types.ObjectId.isValid(productId)) {
        product = await productModel.findById(productId);
      }
      if (!product) {
        product = await productModel.findOne({ product_id: productId });
      }

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      const itemPrice = product.product_price?.amount ?? product.price ?? 0;
      if (!itemPrice || isNaN(itemPrice)) {
        return res.status(400).json({ success: false, message: "Invalid product price in database" });
      }

      const amountInPaise = Math.round(itemPrice * 100);

      const order = await razorpayInst.orders.create({
        amount: amountInPaise,
        currency: product.product_price?.currency || "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          productId: String(product._id),
          productName: product.name,
        },
      });

      await paymentModel.create({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        product: product._id,
        items: [
          {
            product: product._id,
            name: product.name,
            quantity: 1,
            price: itemPrice,
          },
        ],
        status: "pending",
      });

      return res.status(201).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    // Case 2: Cart checkout via req.body.items
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items provided in cart" });
    }

    let totalAmountRupees = 0;
    const resolvedItems = [];

    for (const item of items) {
      const pId = item.productId || item._id;
      const qty = Number(item.quantity) || 1;

      let product = null;
      if (mongoose.Types.ObjectId.isValid(pId)) {
        product = await productModel.findById(pId);
      }
      if (!product) {
        product = await productModel.findOne({ product_id: pId });
      }

      if (product) {
        const price = product.product_price?.amount ?? product.price ?? 0;
        totalAmountRupees += price * qty;
        resolvedItems.push({
          product: product._id,
          name: product.name,
          quantity: qty,
          price,
        });
      }
    }

    if (resolvedItems.length === 0 || totalAmountRupees <= 0) {
      return res.status(400).json({ success: false, message: "No valid products found for checkout" });
    }

    const totalAmountPaise = Math.round(totalAmountRupees * 100);

    const order = await razorpayInst.orders.create({
      amount: totalAmountPaise,
      currency: "INR",
      receipt: `cart_${Date.now()}`,
      notes: {
        itemCount: String(resolvedItems.length),
        description: `kapda.co order with ${resolvedItems.length} items`,
      },
    });

    await paymentModel.create({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      product: resolvedItems[0].product,
      items: resolvedItems,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: error.error?.description || error.message || "Failed to create order",
    });
  }
}

// POST /verify → verify signature and update status
async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters",
      });
    }

    // 1. Create the expected signature using HMAC SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // 2. Compare signatures safely
    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature",
      });
    }

    // 3. Update payment record to 'completed'
    const updatedPayment = await paymentModel.findOneAndUpdate(
      { orderId: razorpay_order_id },
      {
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "completed",
      },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    // 4. Send success response back to the client
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export { getProducts, createOrder, verifyPayment };
