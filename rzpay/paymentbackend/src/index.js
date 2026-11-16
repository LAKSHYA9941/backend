import "dotenv/config";

import app from "../app/app.js";
import connectDB from "./config/db.js";

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
    res.send("Payment backend is running");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Payment backend is running on port http://localhost:${PORT}`);
});
