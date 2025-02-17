const validator = require("validator");

const validateData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("Please write full name");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email not valid");
  } else if (!validator.isStrongPassword(password))
    throw new Error("Please enter a strong password");
};

const validateEditProfileData = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "skills",
    "about",
  ];

  const isValidData = Object.keys(req.body).every((field) =>
    allowedFields.includes(field)
  );
  return isValidData;
};

module.exports = { validateData, validateEditProfileData };
