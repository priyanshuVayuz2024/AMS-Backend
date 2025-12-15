import {
  addAdminMapping,
  addMultiAdminMappings,
  removeAdminMappings,
  getAdminsForEntity,
} from "../repositories/entityAdminRepo.js";
import { itemValidationSchema } from "../validationSchema/itemValidationSchema.js";
import csv from "csvtojson";
import QRCode from "qrcode";
import cloudinary from "../cloudinary/useCloudinary.js";

import {
  createItem,
  deleteItemById,
  findItemById,
  findItemByName,
  getAllItems,
  updateItemById,
  ItemBulkRepository,
  getAssignedItems,
  getUserCreatedItems
  
} from "../repositories/itemRepo.js";

import {
  assignRoleToUsers,
  removeRoleFromUsers,
} from "../repositories/userRepo.js";
import Category from "../models/CategoryModel.js";
import SubCategory from "../models/SubCategoryModel.js";

const ENTITY_TYPE = "Item";

export const createItemService = async (data, assignedToSocialId) => {
  if (!data.name?.trim()) throw new Error("Item name is required.");
  if (!assignedToSocialId) throw new Error("Assigned user is required.");

  const trimmedName = data.name.trim();
  const existing = await findItemByName(trimmedName);
  if (existing) throw new Error("Item name already exists.");

  const item = await createItem({
    name: trimmedName,
    description: data?.description?.trim(),
    parentType: data?.parentType,
    parentId: data?.parentId,
    parentItemId: data?.parentItemId || null,
    createdBy : data?.createdBy,
    assignedToSocialId, 
  });

  // Wrap it in an array to reuse existing logic safely
  const ids = [assignedToSocialId];

  const adminDocs = ids.map((id) => ({
    entityId: item._id,
    entityType: ENTITY_TYPE,
    userSocialId: id,
  }));

  await addMultiAdminMappings(adminDocs);

  const message = await assignRoleToUsers(ids, "itemUser", item._id);

  return { item, message };
};

export const updateItemService = async (id, updates, adminSocialIds) => {
  const item = await findItemById(id);
  if (!item) throw new Error("Item not found.");

  let message = null;

  const newName = updates.name?.trim();
  if (newName && newName !== item.name) {
    const existing = await findItemByName(newName);
    if (existing) throw new Error("Item name already exists.");
  }

  let updatePayload = {
    name: updates.name?.trim() || item.name,
    description: updates.description?.trim() || item.description,
    assignedToSocialId: adminSocialIds,
  };


  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }

  const updatedItem = await updateItemById(id, updatePayload);

  if (Array.isArray(adminSocialIds)) {
    if (adminSocialIds.length === 0)
      throw new Error("At least one item admin is required.");

    const existingAdmins = (
      await getAdminsForEntity(item._id, ENTITY_TYPE)
    ).map((a) => a.userSocialId);

    const newAdmins = adminSocialIds.filter(
      (id) => !existingAdmins.includes(id)
    );
    const removedAdmins = existingAdmins.filter(
      (id) => !adminSocialIds.includes(id)
    );

    // Add new admins
    if (newAdmins.length > 0) {
      await Promise.all(
        newAdmins.map((id) => addAdminMapping(item._id, ENTITY_TYPE, id))
      );
      message = await assignRoleToUsers(newAdmins, "itemUser", item._id);
    }

    // Remove admins
    if (removedAdmins.length > 0) {
      await removeAdminMappings(item._id, ENTITY_TYPE, removedAdmins);
      await removeRoleFromUsers(removedAdmins, "itemUser", item._id);
    }
  }

  return { updatedItem, message };
};

export const enrichWithCategoryAndSubCategory = async (items) => {
  const categoryIds = [];
  const subCategoryIds = [];

  items.forEach((item) => {
    if (item.categoryId) categoryIds.push(item.categoryId);
    if (item.subCategoryId) subCategoryIds.push(item.subCategoryId);
  });

  const categories = await Category.find({ _id: { $in: categoryIds } }, { name: 1 });
  const subCategories = await SubCategory.find(
    { _id: { $in: subCategoryIds } },
    { name: 1 }
  );

  const categoryMap = new Map(categories.map((c) => [c._id.toString(), c.name]));
  const subCategoryMap = new Map(
    subCategories.map((sc) => [sc._id.toString(), sc.name])
  );

  return items.map((item) => ({
    ...item.toObject ? item.toObject() : item,
    categoryName: categoryMap.get(item?.categoryId?.toString()) || null,
    subCategoryName: subCategoryMap.get(item?.subCategoryId?.toString()) || null,
  }));
};


export const listItemsService = async ({
  page,
  limit,
  search = "",
  categoryId = "",
  subCategoryId = "",
}) => {
  const filter = {};

  // Search by name
  if (search) filter.name = { $regex: search, $options: "i" };

  // Filter by categoryId OR subCategoryId
  if (categoryId) {
    filter.parentType = "Category";
    filter.parentId = categoryId;
  } else if (subCategoryId) {
    filter.parentType = "SubCategory";
    filter.parentId = subCategoryId;
  }

  // Fetch items with pagination
  const { data, total } = await getAllItems(filter, { page, limit });

  // Batch fetch categories and subcategories for enrichment
  const categoryParentIds = data
    .filter((item) => item.parentType === "Category")
    .map((item) => item.parentId);

  const subCategoryParentIds = data
    .filter((item) => item.parentType === "SubCategory")
    .map((item) => item.parentId);

  const [categories, subCategories] = await Promise.all([
    Category.find({ _id: { $in: categoryParentIds } }).select("name").lean(),
    SubCategory.find({ _id: { $in: subCategoryParentIds } }).select("name categoryId").lean(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c._id.toString(), c.name]));
  const subCategoryMap = new Map(
    subCategories.map((sc) => [sc._id.toString(), { name: sc.name, categoryId: sc.categoryId }])
  );

  // Enrich each item with category/subcategory names
  const enrichedData = data.map((item) => {
    let categoryName = null;
    let subCategoryName = null;
    let categoryIdVal = null;
    let subCategoryIdVal = null;

    if (item.parentType === "Category") {
      categoryName = categoryMap.get(item.parentId.toString()) || null;
      categoryIdVal = item.parentId;
    } else if (item.parentType === "SubCategory") {
      const subCat = subCategoryMap.get(item.parentId.toString());
      if (subCat) {
        subCategoryName = subCat.name;
        subCategoryIdVal = item.parentId;
        categoryName = categoryMap.get(subCat.categoryId.toString()) || null;
        categoryIdVal = subCat.categoryId;
      }
    }

    return {
      ...item,
      categoryName,
      subCategoryName,
      categoryId: categoryIdVal,
      subCategoryId: subCategoryIdVal,
    };
  });

  return {
    data: enrichedData,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};



export const getItemByIdService = async (itemId) => {
  const item = await findItemById(itemId);
  if (!item) throw new Error("Item not found.");
  return item;
};
export const getAssignedItemsService = async (
  userSocialId,
  { page, limit, search = "", categoryId, subCategoryId }
) => {
  const filter = {};

  if (search) filter.name = { $regex: search, $options: "i" };

  // 🔹 Apply parentType + parentId filter instead of categoryId/subCategoryId
  if (categoryId) {
    filter.parentType = "Category";
    filter.parentId = categoryId;
  } else if (subCategoryId) {
    filter.parentType = "SubCategory";
    filter.parentId = subCategoryId;
  }

  const { data, total } = await getAssignedItems(userSocialId, filter, { page, limit });

  const enrichedData = await enrichWithCategoryAndSubCategory(data);

  return {
    data: enrichedData,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserCreatedItemsService = async (
  userSocialId,
  { page, limit, search = "", categoryId, subCategoryId }
) => {
  const filter = { createdBy: userSocialId };

  if (search) filter.name = { $regex: search, $options: "i" };

  // 🔹 Apply parentType + parentId filter instead of categoryId/subCategoryId
  if (categoryId) {
    filter.parentType = "Category";
    filter.parentId = categoryId;
  } else if (subCategoryId) {
    filter.parentType = "SubCategory";
    filter.parentId = subCategoryId;
  }

  const { data, total } = await getUserCreatedItems(userSocialId, filter, { page, limit });

  const enrichedData = await enrichWithCategoryAndSubCategory(data);

  return {
    data: enrichedData,
    meta: {
      total,
      page,
      limit,
      totalPages: page && limit ? Math.ceil(total / limit) : 1,
    },
  };
};






export const deleteItemService = async (id) => {
  const deleted = await deleteItemById(id);

  if (!deleted) {
    return {
      success: false,
      message: "Item not found",
    };
  }

  return {
    success: true,
    data: deleted,
  };
};


const REQUIRED_COLUMNS = [
  "name",
  "description",
  "parentType",
  "parentName",
  "assignedToSocialId",
  "isActive",
];


export const ItemBulkService = {
  processCSV: async (filePath) => {
    const rows = await csv().fromFile(filePath);
    if (!rows.length) throw new Error("CSV file is empty");

    const csvColumns = Object.keys(rows[0]);
    const missing = REQUIRED_COLUMNS.filter(c => !csvColumns.includes(c));
    const extra = csvColumns.filter(c => !REQUIRED_COLUMNS.includes(c));

    if (missing.length > 0)
      throw new Error(`CSV is missing required columns: ${missing.join(", ")}`);
    if (extra.length > 0)
      throw new Error(`CSV has extra unexpected columns: ${extra.join(", ")}`);

    const results = [];

    for (const row of rows) {
      try {

        // 1️⃣ FIRST: Find parent ID
        const parentId = await ItemBulkRepository.findParentByNameAndType(
          row.parentName,
          row.parentType
        );

        if (!parentId)
          throw new Error(
            `Parent '${row.parentName}' of type '${row.parentType}' not found`
          );


        const rowData = {
          name: row.name,
          description: row.description || "",
          parentType: row.parentType,
          parentId : parentId.toString(), 
          assignedToSocialId: row.assignedToSocialId,
          parentItemId: null,
          isActive: row.isActive?.toLowerCase() === "true",
        };
        

        // 3️⃣ Validate (now parentId exists, no Joi error)
        const { error, value } = itemValidationSchema.validate(rowData, {
          abortEarly: false,
          convert: true,
        });

        

        if (error) {
          throw new Error(error.details.map(d => d.message).join(", "));
        }

        // 4️⃣ Create item
        const { item, message } = await createItemService(value, row.assignedToSocialId);

        // 5️⃣ QR code
        const qrUrl = `http://localhost:5000/report?itemId=${item._id}`;
        const qrBase64 = await QRCode.toDataURL(qrUrl);

        const upload = await cloudinary.uploader.upload(qrBase64, {
          folder: "qr",
          public_id: `item-${item._id}`,
          overwrite: true,
        });

        item.qrCodeUrl = upload.secure_url;

        results.push({
          row,
          status: "success",
          _id: item._id,
          message,
        });
      } catch (err) {
        results.push({
          row,
          status: "failed",
          reason: err.message,
        });
      }
    }

    return results;
  },
};





