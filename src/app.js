const express = require("express");
const connectDB = require("./config/database");
const app = express();
const http = require("http");
const PORT = 7000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const configCors = require("./config/corsConfig");
const logger = require("./utility/logger"); // <— import the logger

require("dotenv").config();
//Cron Jobs
require("./utility/cronJob");

app.use(cors(configCors)); // ✅ Apply CORS properly
app.options("*", cors(configCors)); // ✅ Handle preflight
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health/wakeup endpoint for quick server warmup after inactivity
app.get("/hello", (req, res) => {
  res.status(200).json({ message: "hello world" });
});

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const jobRouter = require("./routes/jobs");
const initializeSocket = require("./config/socket");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/", jobRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connection established");
    server.listen(PORT, () => {
      console.log(`Server successfully listening on port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database has not been connected", err);
    logger.error("Database has not been connected", err);
  });
