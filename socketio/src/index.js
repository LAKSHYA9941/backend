import app from "../app/app.js";
import { createServer } from "http";
import initializeSocket from "./socket/socket.server.js"; "./socket/socket.server.js";
const PORT = process.env.PORT || 4000;

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`);
})