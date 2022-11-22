const bcrypt = require("bcryptjs");

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
};
