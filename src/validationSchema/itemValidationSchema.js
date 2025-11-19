import Joi from "joi";

const itemValidationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is a required field",
    }),

    description: Joi.string().trim().allow("").messages({
        "string.base": "Description must be a string",
    }),

    parentType: Joi.string().valid("Category", "SubCategory", "Group").required().messages({
        "string.empty": "Parent type is required",
        "any.required": "Parent type is a required field",
    }),

    parentId: Joi.string().trim().required().messages({
        "string.empty": "Parent ID is required",
        "any.required": "Parent ID is a required field",
    }),

    assignedToSocialId: Joi.string().trim().required().messages({
        "string.base": "AssignedToSocialId must be a string",
        "any.required": "AssignedToSocialId is a required field",
        "string.empty": "AssignedToSocialId cannot be empty",

    }),

    parentItemId: Joi.string().trim().allow(null, "").messages({
        "string.base": "ParentItemId must be a string",
    }),

    isActive: Joi.boolean().default(true).messages({
        "boolean.base": "isActive must be true or false",
    }),
});

export default itemValidationSchema;
