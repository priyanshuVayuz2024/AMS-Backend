import ItemModel from "../models/ItemModel.js";
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";

export const createItem = async (itemData) => {
    return await ItemModel.create(itemData);
};

export const findItemById = async (id) => {
    return await ItemModel.findById(id);
};

export const updateItemById = async (id, updateData) => {
    return await ItemModel.findByIdAndUpdate(id, updateData, { new: true });
};


export const findItemByName = async (name) => {
    return await ItemModel.findOne({ name: new RegExp(`^${name}$`, "i") });
};

export const deleteItemById = async (id) => {
    return await ItemModel.findByIdAndDelete(id);
};

export const getAllItems = async (filter = {}, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        ItemModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ItemModel.countDocuments(filter),
    ]);

    return { data, total };
};


export const getMyItems = async (userSocialId, filter = {}, { page = 1, limit = 10 } = {}) => {
    // Find all mappings where user is admin for items
    const mappings = await EntityAdminMapping.find({
        userSocialId,
        entityType: "Item",
    });

    const itemIds = mappings.map((m) => m.entityId);

    if (itemIds.length === 0) {
        return { data: [], total: 0 };
    }

    // 🔹 Add item ID filter + pagination
    const skip = (page - 1) * limit;

    const query = { _id: { $in: itemIds }, ...filter };

    const [data, total] = await Promise.all([
        ItemModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        ItemModel.countDocuments(query),
    ]);

    return { data, total };
};
