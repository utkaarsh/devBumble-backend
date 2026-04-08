const express = require("express");
const {
  getMyProfileController,
  editProfileController,
  getOtherProfileController,
} = require("../controllers/profileController");
const { userAuth } = require("../middleware/auth");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, getMyProfileController);
profileRouter.get("/profile/view/:id", userAuth, getOtherProfileController);
profileRouter.put("/profile/edit", userAuth, editProfileController);

module.exports = profileRouter;
