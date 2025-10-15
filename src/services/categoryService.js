import User from "../models/UserModel.js";
import { addMultiAdminMappings } from "../repositories/categoryAdminRepo.js";
import {
  createCategory,
  findCategoryById,
  updateCategoryById,
} from "../repositories/categoryRepo.js";

export const createCategoryService = async (data, adminSocialIds) => {
  const category = await createCategory({
    name: data.name.trim(),
    description: data.description?.trim(),
  });

  // Map admins
  const adminDocs = adminSocialIds.map((id) => ({
    categoryId: category._id,
    userSocialId: id,
  }));
  await addMultiAdminMappings(adminDocs);

  for (const socialId of adminSocialIds) {
    const user = await User.findOne({ socialId });
    if (user) {
      await addUserRole({
        userId: user._id,
        roleName: "categoryAdmin",
        entityId: category._id, // scoped to this category
      });
    } else {
      console.warn(
        `⚠️ User with socialId ${socialId} not found — skipping role assignment`
      );
    }

    return category;
  }
};
// export const updateCategoryService = async (id, updates, adminSocialIds) => {
//     const category = await findCategoryById(id);
//     if (!category) throw new Error("Category not found.");

//     // Update main fields
//     const updatedCategory = await updateCategoryById(id, {
//         name: updates.name?.trim() || category.name,
//         description: updates.description?.trim() || category.description,
//     });

//     // Update admin mapping if provided
//     if (Array.isArray(adminSocialIds)) {
//         if (adminSocialIds.length === 0)
//             throw new Error("At least one category admin is required.");

//         const existingAdmins = (await getAdminsForCategory(id)).map(
//             (a) => a.userSocialId
//         );

//         const newAdmins = adminSocialIds.filter((id) => !existingAdmins.includes(id));
//         const removedAdmins = existingAdmins.filter(
//             (id) => !adminSocialIds.includes(id)
//         );

//         if (newAdmins.length > 0)
//             await Promise.all(newAdmins.map((id) => addAdminMapping(category._id, id)));

//         if (removedAdmins.length > 0)
//             await removeAdminMappings(category._id, removedAdmins);
//     }

//     return updatedCategory;
