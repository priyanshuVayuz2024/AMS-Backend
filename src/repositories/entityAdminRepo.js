import EntityAdminMapping from "../models/EntityAdminMappingModel.js";

export const getAdminsForEntity = async (entityId, entityType) => {
  return EntityAdminMapping.find({ entityId, entityType });
};

export const addAdminMapping = async (entityId, entityType, userSocialId) => {
  return EntityAdminMapping.create({ entityId, entityType, userSocialId });
};

export const addMultiAdminMappings = async (adminDocs) => {
  return EntityAdminMapping.insertMany(adminDocs);
};

export const removeAdminMappings = async (entityId, entityType, adminIds) => {
  return EntityAdminMapping.deleteMany({
    entityId,
    entityType,
    userSocialId: { $in: adminIds },
  });
};

export const getEntitiesFromEntityAdminMappingRepoBySocialIdAndEntityId =
  async (entityId, soicalId) => {
    return await EntityAdminMapping.findOne({
      entityId: entityId,
      userSocialId: soicalId,
    });
  };
