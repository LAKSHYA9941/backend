import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/product.model.js";

dotenv.config();

const products = [
  {
    name: "Wireless Mouse",
    product_id: "PROD001",
    product_price: { amount: 799, currency: "INR" },
    product_quantity: 50,
    description: "Ergonomic wireless mouse with adjustable DPI."
  },
  {
    name: "Mechanical Keyboard",
    product_id: "PROD002",
    product_price: { amount: 2499, currency: "INR" },
    product_quantity: 30,
    description: "RGB mechanical keyboard with blue switches."
  },
  {
    name: "USB-C Hub",
    product_id: "PROD003",
    product_price: { amount: 1299, currency: "INR" },
    product_quantity: 40,
    description: "Multiport USB-C hub with HDMI and USB 3.0."
  },
  {
    name: "Bluetooth Headphones",
    product_id: "PROD004",
    product_price: { amount: 1999, currency: "INR" },
    product_quantity: 25,
    description: "Over-ear wireless headphones with noise isolation."
  },
  {
    name: "Laptop Stand",
    product_id: "PROD005",
    product_price: { amount: 999, currency: "INR" },
    product_quantity: 60,
    description: "Adjustable aluminium laptop stand."
  },
  {
    name: "27-inch Monitor",
    product_id: "PROD006",
    product_price: { amount: 14999, currency: "INR" },
    product_quantity: 15,
    description: "Full HD IPS monitor with a 75Hz refresh rate."
  },
  {
    name: "Power Bank",
    product_id: "PROD007",
    product_price: { amount: 1599, currency: "INR" },
    product_quantity: 45,
    description: "20000mAh fast-charging power bank."
  },
  {
    name: "Webcam",
    product_id: "PROD008",
    product_price: { amount: 1799, currency: "INR" },
    product_quantity: 20,
    description: "1080p webcam with built-in microphone."
  },
  {
    name: "Portable SSD",
    product_id: "PROD009",
    product_price: { amount: 4999, currency: "INR" },
    product_quantity: 18,
    description: "1TB portable SSD with USB-C connectivity."
  },
  {
    name: "Smart Watch",
    product_id: "PROD010",
    product_price: { amount: 3499, currency: "INR" },
    product_quantity: 35,
    description: "Smartwatch with fitness tracking and notifications."
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Avoid duplicate product IDs when running the script again
    const operations = products.map((product) => ({
      updateOne: {
        filter: { product_id: product.product_id },
        update: { $set: product },
        upsert: true
      }
    }));

    await Product.bulkWrite(operations);

    console.log("10 sample products seeded successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

seedProducts();
