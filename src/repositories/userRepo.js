import User from "../models/UserModel";

export const findUserById = async (id) => {
  return await User.findById(id);
};
