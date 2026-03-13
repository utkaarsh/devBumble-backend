const express = require("express");
const {
  loginController,
  signUpController,
  logoutController,
} = require("../controllers/authController");
const { userAuth } = require("../middleware/auth");

const authRouter = express.Router();

authRouter.post("/login", loginController);

authRouter.post("/signup", signUpController);

authRouter.post("/logout", userAuth, logoutController);

module.exports = authRouter;
