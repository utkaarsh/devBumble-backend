const User = require("../models/user");
const { validateEditProfileData } = require("../utility/validatiors");

module.exports.getMyProfileController = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);

    res.send(user);
  } catch (error) {
    console.error("Get Profile Error :  ", error.message);
    res.status(400).send("Error : " + error.message);
  }
};

module.exports.editProfileController = async (req, res) => {
  try {
    const checkValid = validateEditProfileData(req);
    if (!checkValid) {
      throw new Error("Invalid data request");
    }
    const loggedUser = req.user;
    console.log("User ", loggedUser);

    Object.keys(req.body).forEach(
      (keys) => (loggedUser[keys] = req.body[keys])
    );

    await loggedUser.save();

    res.json({
      message: `${loggedUser.firstName}, your profile was updated successfully`,
      data: loggedUser,
    });
  } catch (error) {
    console.error("Edit Profile error : ", error.message);
    res.status(400).send("Edit Profile error : " + error.message);
  }
};
