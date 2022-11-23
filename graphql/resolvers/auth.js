const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");

module.exports = {
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User exists already.");
      }

      const hassedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hassedPassword,
      });

      const result = await user.save();

      return { ...result._doc };
    } catch (error) {
      throw error;
    }
  },
  login: async ({ email, password }) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        throw new Error("User does not exits!");
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error("Invalid password!");
      }
      const token = jwt.sign({ userId: user.id, email: user.email }, "somesupersecretkey", {
        expiresIn: "1h",
      });
      return { userId: user._id, token, tokenExpiration: 1 };
    } catch (error) {
      throw error;
    }
  },
};
