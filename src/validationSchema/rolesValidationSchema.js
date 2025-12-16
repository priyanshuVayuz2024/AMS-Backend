import Joi from "joi";
import mongoose from "mongoose";

const objectId = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  })
  .messages({
    "any.invalid": "Invalid ObjectId",
  });

const roleModuleValidationSchema = Joi.object({
  module: objectId.required().messages({
    "any.required": "Module is required",
  }),

  permissions: Joi.array()
    .items(
      Joi.string()
        .trim()
        .valid("create", "read", "update", "delete") 
        .required()
    )
    .min(1)
    .max(4)
    .required()
    .messages({
      "array.base": "Permissions must be an array",
      "array.min": "At least one permission is required per module",
      "array.max": "Maximum 4 permissions allowed per module",
      "any.required": "Permissions are required",
      "any.only": "Invalid permission value",
    }),
});


const roleValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Role name is required",
    "any.required": "Role name is a required field",
  }),

  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string",
  }),

  modules: Joi.array()
    .items(roleModuleValidationSchema)
    .min(1)
    .required()
    .messages({
      "array.base": "Modules must be an array",
      "array.min": "At least one module is required",
      "any.required": "Modules is a required field",
    }),

  isActive: Joi.boolean().strict().default(true).messages({
    "boolean.base": "isActive must be true or false",
  }),
});

const roleStatusValidationSchema = Joi.object({
  isActive: Joi.boolean().strict().default(true).messages({
    "boolean.base": "isActive must be true or false",
  }),
});

export { roleValidationSchema, roleStatusValidationSchema };
