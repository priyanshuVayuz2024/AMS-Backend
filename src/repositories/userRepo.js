import User from "../models/UserModel.js";

export const findUserById = async (id) => {
  return await User.findById(id);
};
