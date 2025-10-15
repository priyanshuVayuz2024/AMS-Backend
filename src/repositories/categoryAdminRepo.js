import CategoryAdminMapping from "../models/CategoryAdminMappingModel.js";

export const getAdminsForCategory = async (categoryId) => {
    return await CategoryAdminMapping.find({ categoryId });
};

export const addAdminMapping = async (categoryId, userSocialId) => {
    return await CategoryAdminMapping.create({ categoryId, userSocialId });
};
export const addMultiAdminMappings = async (adminDocs) => {
    return await CategoryAdminMapping.insertMany(adminDocs);
};

export const removeAdminMappings = async (categoryId, adminIds) => {
    return await CategoryAdminMapping.deleteMany({
        categoryId,
        userSocialId: { $in: adminIds },
    });
};
