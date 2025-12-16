import Joi from "joi";

const itemValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is a required field",
  }),

  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string",
  }),

  reportCount: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Report count must be a number",
    "number.min": "Report count cannot be negative",
  }),

  allocationStatus: Joi.string()
    .valid("unallocated", "allocated", "in-use", "under-maintenance")
    .default("unallocated")
    .messages({
      "any.only": "Invalid allocation status",
    }),

  isActive: Joi.boolean().strict().default(true).messages({
    "boolean.base": "isActive must be true or false",
  }),
});

const itemStatusValidationSchema = Joi.object({
  isActive: Joi.boolean().strict().default(true).messages({
    "boolean.base": "isActive must be true or false",
  }),
});

export { itemValidationSchema, itemStatusValidationSchema };
