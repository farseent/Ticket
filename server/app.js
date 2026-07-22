const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler")

const app = express();

app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/dispatcher", require("./routes/dispatcherRoutes"));

app.use(errorHandler);

module.exports = app;