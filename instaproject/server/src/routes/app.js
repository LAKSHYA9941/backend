import express from "express";
import router from "./post.route.js"; 

const app = express();


app.use("/api/posts", router);

export default app;