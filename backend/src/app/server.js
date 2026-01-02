const express = require("express");
const cors = require("cors");
const { registerRoutes } = require("./routes");

const app = express();
app.use(cors());
app.use(express.json());

registerRoutes(app);

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend running: http://localhost:${PORT}`));
