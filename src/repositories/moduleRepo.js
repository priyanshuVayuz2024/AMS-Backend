import mongoose from "mongoose";
import Module from "../models/moduleModel.js";
import Role from "../models/RoleModel.js";

/**
 * Create Module
 */
export const createModule = async (moduleData) => {
  return await Module.create(moduleData);
};

/**
 * Find Module by ID
 */
export const findModuleById = async (id) => {
  return await Module.findById(id);
};

export const findModuleByName = async (name) => {
  return await Module.findOne({ name: new RegExp(`^${name}$`, "i") });
};

/**
 * Update Module by ID
 */
export const updateModuleById = async (id, updateData) => {
  return await Module.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Get All Modules (with pagination)
 */
export const getAllModules = async ({ search } = {}, { page, limit } = {}) => {
  const queryObj = {};

  if (search) {
    queryObj.name = { $regex: search, $options: "i" };
  }

  let query = Module.find(queryObj).sort({ createdAt: -1 });

  if (page || limit) {
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const pageSize = Number(limit) > 0 ? Number(limit) : 10;

    const skip = (pageNumber - 1) * pageSize;
    query = query.skip(skip).limit(pageSize);
  }

  const [data, total] = await Promise.all([
    query.exec(),
    Module.countDocuments(queryObj),
  ]);

  return { data, total };
};

/**
 * Delete Module by ID
 * */

export const deleteModuleById = async (id) => {
  const moduleId = new mongoose.Types.ObjectId(id);

  const res = await Role.updateMany(
    { "modules.module": moduleId },  
    { $pull: { modules: { module: moduleId } } }
  );

  return await Module.findByIdAndDelete(moduleId);
};
