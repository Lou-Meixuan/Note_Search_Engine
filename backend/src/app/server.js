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
