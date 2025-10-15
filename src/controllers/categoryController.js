import { createCategoryService } from "../services/categoryService.js";
import { sendResponse, sendErrorResponse } from "../util/responseHandler.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description, adminSocialIds } = req.body;

    const category = await createCategoryService(
      { name, description },
      adminSocialIds
    );

    return sendResponse({
      res,
      statusCode: 201,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return sendErrorResponse({
      res,
      statusCode: 400,
      message: error.message || "Failed to create category",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, adminSocialIds } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "Invalid category ID",
      });
    }

    // Find existing category
    const category = await Category.findById(id);
    if (!category) {
      return sendErrorResponse({
        res,
        statusCode: 404,
        message: "Category not found",
      });
    }

    // Update name and description if provided
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();

    // Save category updates
    await category.save();

    // 🧠 Handle admin mapping updates (if provided)
    if (Array.isArray(adminSocialIds)) {
      // 🚫 Validation: at least one admin must be present
      if (adminSocialIds.length === 0) {
        return sendErrorResponse({
          res,
          statusCode: 400,
          message: "At least one category admin is required.",
        });
      }

      // Fetch current admins
      const existingMappings = await CategoryAdminMapping.find({
        categoryId: id,
      });
      const existingAdmins = existingMappings.map((m) => m.userSocialId);

      const newAdmins = adminSocialIds.filter(
        (sid) => !existingAdmins.includes(sid)
      );
      const removedAdmins = existingAdmins.filter(
        (sid) => !adminSocialIds.includes(sid)
      );

      // Add new admin mappings
      if (newAdmins.length > 0) {
        const mappingsToAdd = newAdmins.map((socialId) => ({
          categoryId: id,
          userSocialId: socialId,
        }));
        await CategoryAdminMapping.insertMany(mappingsToAdd, {
          ordered: false,
        });
      }

      // Remove old admin mappings
      if (removedAdmins.length > 0) {
        await CategoryAdminMapping.deleteMany({
          categoryId: id,
          userSocialId: { $in: removedAdmins },
        });
      }
    }

    return sendResponse({
      res,
      statusCode: 200,
      message: "Category updated successfully",
      data: { category },
    });
  } catch (err) {
    console.error("❌ Error updating category:", err.message);
    return sendErrorResponse({
      res,
      statusCode: 500,
      message: "Failed to update category",
      error: err.message,
    });
  }
};

export const updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "Invalid category ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "isActive must be a boolean",
      });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!category) {
      return sendErrorResponse({
        res,
        statusCode: 404,
        message: "Category not found",
      });
    }

    return sendResponse({
      res,
      statusCode: 200,
      message: "Category status updated successfully",
      data: { category },
    });
  } catch (err) {
    console.error("❌ Error updating category status:", err.message);
    return sendErrorResponse({
      res,
      statusCode: 500,
      message: "Failed to update category status",
      error: err.message,
    });
  }
};
