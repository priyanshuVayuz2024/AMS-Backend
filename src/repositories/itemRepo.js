import Item from "../models/ItemModel.js";
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";
import Category from "../models/CategoryModel.js";
import SubCategory from "../models/SubCategoryModel.js";
import Group from "../models/GroupModel.js";

export const createItem = async (itemData) => {
  return await Item.create(itemData);
};

export const findItemById = async (id) => {
  
  const item = await Item.findById(id).lean();
  
  if (!item) return null;

  let categoryName = null;
  let subCategoryName = null;
  let categoryId = null;
  let subCategoryId = null;

  const category = await Category.findById(item.parentId).select("name");
  if (category) {
    categoryName = category.name;
    categoryId = item.parentId;
    subCategoryId = null; 

    return {
      ...item,
      categoryName,
      subCategoryName: null,
      categoryId,
      subCategoryId,
    };
  }

  const subCategory = await SubCategory.findById(item.parentId).select(
    "name categoryId"
  );

  if (subCategory) {
    subCategoryName = subCategory.name;
    subCategoryId = item.parentId; 

    const parentCat = await Category.findById(subCategory.categoryId).select(
      "name"
    );

    categoryName = parentCat?.name || null;
    categoryId = subCategory.categoryId; 

    return {
      ...item,
      categoryName,
      subCategoryName,
      categoryId,
      subCategoryId,
    };
  }

  return {
    ...item,
    categoryName: null,
    subCategoryName: null,
    categoryId: null,
    subCategoryId: null,
  };
};

export const updateItemById = async (id, updateData) => {
  return await Item.findByIdAndUpdate(id, updateData, { new: true });
};

export const findItemByName = async (name) => {
  return await Item.findOne({ name: new RegExp(`^${name}$`, "i") });
};

export const deleteItemById = async (id) => {
  return await Item.findByIdAndDelete(id);
};

export const getAllItems = async (filter = {}, { page, limit } = {}) => {
  if (!page || !limit) {
    const data = await Item.find(filter).sort({ createdAt: -1 }).lean();
    const total = await Item.countDocuments(filter);

    return { data, total };
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const data = await Item.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  const total = await Item.countDocuments(filter);

  return { data, total };
};


export const getAssignedItems = async (
  userSocialId,
  filter = {},
  { page , limit  } = {}
) => {
  const mappings = await EntityAdminMapping.find({
    userSocialId,
    entityType: "Item",
  });

  const itemIds = mappings.map((m) => m.entityId);

  if (itemIds.length === 0) {
    return { data: [], total: 0 };
  }

  const skip = (page - 1) * limit;

  const query = { _id: { $in: itemIds }, ...filter };

  const [data, total] = await Promise.all([
    Item.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Item.countDocuments(query),
  ]);

  return { data, total };
};


export const ItemBulkRepository = {
  /**
   * Find parent entity by type and name, returns _id only
   * @param {string} name - Name of the parent
   * @param {string} type - Type of the parent (Group, Category, SubCategory)
   * @returns {string|null} - Parent ID if found, otherwise null
   */
  findParentByNameAndType: async (name, type) => {
    if (!name || !type) return null;

    let parent = null;

    switch (type) {
      case "Group":
        parent = await Group.findOne({ name: new RegExp(`^${name}$`, "i") }).select("_id").lean();
        break;
      case "Category":
        parent = await Category.findOne({ name: new RegExp(`^${name}$`, "i") }).select("_id").lean();
        break;
      case "SubCategory":
        parent = await SubCategory.findOne({ name: new RegExp(`^${name}$`, "i") }).select("_id").lean();
        break;
      default:
        return null;
    }


    return parent ? parent._id : null;
  },
};



export const getUserCreatedItems = async (
  userSocialId,
  filter = {},
  { page, limit } = {}
) => {
  let query = { createdBy: userSocialId, ...filter };

  let findQuery = Item.find(query).sort({ createdAt: -1 });

  if (page && limit) {
    const skip = (page - 1) * limit;
    findQuery = findQuery.skip(skip).limit(limit);
  }

  const [data, total] = await Promise.all([
    findQuery,
    Item.countDocuments(query),
  ]);

  return { data, total };
};