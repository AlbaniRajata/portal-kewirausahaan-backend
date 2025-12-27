const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const testRoutes = require("./routes/test.routes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.use("/test", testRoutes);

module.exports = app;
