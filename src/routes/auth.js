const express = require("express");
const {
  loginController,
  signUpController,
  logoutController,
} = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/login", loginController);

authRouter.post("/signup", signUpController);

authRouter.post("/logout", logoutController);

module.exports = authRouter;
