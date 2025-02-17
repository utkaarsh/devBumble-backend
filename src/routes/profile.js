const express = require("express");
const {
  getMyProfileController,
  editProfileController,
} = require("../controllers/profileController");
const { userAuth } = require("../middleware/auth");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, getMyProfileController);
profileRouter.patch("/profile/edit", userAuth, editProfileController);

module.exports = profileRouter;
