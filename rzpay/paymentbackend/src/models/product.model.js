import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    product_id: {
        type: String,
        required: true,
        unique: true
    },
    product_price: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "INR"
        }
    },
    product_quantity: {
        type: Number,
        required: true
    },
    description: {
        type: String,
    }
});

export default mongoose.model("Product", productSchema);