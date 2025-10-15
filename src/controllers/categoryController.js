import { createCategoryService, getCategoryByIdService, getMyCategoriesService, listCategoriesService, updateCategoryService } from "../services/categoryService.js";
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

        const category = await updateCategoryService(id, { name, description }, adminSocialIds);

        return sendResponse({
            res,
            statusCode: 200,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        return sendErrorResponse({
            res,
            statusCode: 400,
            message: error.message || "Failed to update category",
        });
    }
};


export const getAllCategories = async (req, res) => {
    try {
        const categories = await listCategoriesService({}); // optionally pass filter like { isActive: true }
        return sendResponse({
            res,
            statusCode: 200,
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (err) {
        console.error("List Categories Error:", err.message);
        return sendErrorResponse({ res, statusCode: 500, message: err.message });
    }
};


export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await getCategoryByIdService(id);
        return sendResponse({
            res,
            statusCode: 200,
            message: "Category fetched successfully",
            data: category,
        });
    } catch (err) {
        console.error("Get Category By ID Error:", err.message);
        return sendErrorResponse({ res, statusCode: 404, message: err.message });
    }
};


export const getMyCategories = async (req, res) => {
    try {
        const userSocialId = req.user.socialId; // from authenticate middleware

        const categories = await getMyCategoriesService(userSocialId);

        return sendResponse({
            res,
            statusCode: 200,
            message: "Fetched your categories",
            data: categories,
        });
    } catch (err) {
        console.error("Get My Categories Error:", err.message);
        return sendErrorResponse({ res, statusCode: 500, message: err.message });
    }
};


// export const updateCategoryStatus = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { isActive } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return sendErrorResponse({
//                 res,
//                 statusCode: 400,
//                 message: "Invalid category ID",
//             });
//         }

//         if (typeof isActive !== "boolean") {
//             return sendErrorResponse({
//                 res,
//                 statusCode: 400,
//                 message: "isActive must be a boolean",
//             });
//         }

//         const category = await Category.findByIdAndUpdate(
//             id,
//             { isActive },
//             { new: true }
//         );

//         if (!category) {
//             return sendErrorResponse({
//                 res,
//                 statusCode: 404,
//                 message: "Category not found",
//             });
//         }

//         return sendResponse({
//             res,
//             statusCode: 200,
//             message: "Category status updated successfully",
//             data: { category },
//         });
//     } catch (err) {
//         console.error("❌ Error updating category status:", err.message);
//         return sendErrorResponse({
//             res,
//             statusCode: 500,
//             message: "Failed to update category status",
//             error: err.message,
//         });
//     }
// };