const express = require("express");
const connectDB = require("./config/database");
const app = express();
const http = require("http");
const PORT = 7000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const configCors = require("./config/corsConfig");
require("dotenv").config();
//Cron Jobs
require("./utility/cronJob");

app.use(cors(configCors)); // ✅ Apply CORS properly
app.options("*", cors(configCors)); // ✅ Handle preflight
app.use(express.json()); // Parse JSON to Javascript objects
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");

const initializeSocket = require("./config/socket");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database connection established");
    server.listen(PORT, () => {
      console.log(`Server successfully listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database has not been connected");
  });
