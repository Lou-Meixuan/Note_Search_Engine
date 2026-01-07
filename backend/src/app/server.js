/**
 * server.js - Express 服务器入口
 * 
 * Modified by: C
 * Date: 2026-01-07
 * 
 * 修改记录:
 * - C: 添加 dotenv 配置，支持环境变量 (Google API Key 等)
 */

// 加载环境变量 (必须在其他 require 之前)
require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { registerRoutes } = require("./routes");
const { connectToMongoDB } = require("../data_access/mongodb");

const app = express();
app.use(cors());
app.use(express.json());

registerRoutes(app);

const PORT = 3001;

// Start server and connect to MongoDB
async function startServer() {
    try {
        // Connect to MongoDB first
        await connectToMongoDB();

        // Then start the Express server
        app.listen(PORT, () => {
            console.log(`Backend running: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
