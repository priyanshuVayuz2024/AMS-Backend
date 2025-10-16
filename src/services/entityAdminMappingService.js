import { getEntitiesFromEntityAdminMappingRepoBySocialIdAndEntityId } from "../repositories/entityAdminRepo.js";

export const getEntitiesFromEntityAdminMappingServiceBySocialIdAndEntityId =
  async (entityId, soicalId) => {
    return await getEntitiesFromEntityAdminMappingRepoBySocialIdAndEntityId(
      entityId,
      soicalId
    );
  };
