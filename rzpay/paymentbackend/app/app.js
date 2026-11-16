import cors from "cors";
import express from "express";
import morgan from "morgan";
import paymentRoutes from "../src/routes/payment.route.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Mount payment routes under both /api/payment and /api
app.use("/api/payment", paymentRoutes);
app.use("/api", paymentRoutes);

export default app;
