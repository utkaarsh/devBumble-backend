const express = require("express");
const connectDB = require("./config/database");
const app = express();
const PORT = 7000;
const cookieParser = require("cookie-parser");

app.use(express.json()); // Parse JSON to Javascript objects
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log(`Server successfully listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database has not been connected");
  });
