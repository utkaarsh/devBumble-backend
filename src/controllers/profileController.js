const User = require("../models/user");
const ConnectionRequest = require("../models/connectionRequests");

const { validateEditProfileData } = require("../utility/validatiors");

module.exports.getMyProfileController = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);

    res.send(user);
  } catch (error) {
    console.error("Get Profile Error :  ", error.message);
    res
      .status(401)
      .json({ message: "Get Profile Error : " + error.message, error });
  }
};

module.exports.getOtherProfileController = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedUser = req.user;

    const user = await User.findById(id).lean();

    if (!user) {
      throw new Error("User not found");
    }

    const conn = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: loggedUser._id, toUserId: id },
        { fromUserId: id, toUserId: loggedUser._id },
      ],
    }).lean();
    user.connectionStatus = conn?.status ? conn.status : "none";
    user.connection = conn ? {
      ...conn,
      fromUserId: conn.fromUserId.toString() === loggedUser._id.toString() ? "me" : conn.fromUserId.toString(),
      toUserId: conn.toUserId.toString() === loggedUser._id.toString() ? "me" : conn.fromUserId.toString(),
    } : null;

        console.log("connection status", user?.connection);

    return res
      .status(200)
      .json({ message: "User fetched successfully! ", data: user });
  } catch (error) {
    console.error("Error fetching user details:", error.message);
    res.status(400).send("Error fetching user details");
  }
};

module.exports.editProfileController = async (req, res) => {
  try {
    const checkValid = validateEditProfileData(req);
    if (!checkValid) {
      throw new Error("Invalid data request");
    }
    const loggedUser = req.user;

    Object.keys(req.body).forEach(
      (keys) => (loggedUser[keys] = req.body[keys]),
    );

    await loggedUser.save();

    res.json({
      message: `${loggedUser.firstName}, your profile was updated successfully`,
      data: loggedUser,
    });
  } catch (error) {
    console.error("Edit Profile error : ", error.message);
    res
      .status(400)
      .json({ message: "Edit Profile error : " + error.message, error });
  }
};
