import Joi from "joi";
import mongoose from "mongoose";

// Custom validator to check for valid MongoDB ObjectId
const objectIdValidator = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

export const createSubCategorySchema = Joi.object({
  categoryId: Joi.string()
    .required()
    .custom(objectIdValidator, "ObjectId validation")
    .messages({
      "any.required": "categoryId is required",
      "any.invalid": "categoryId must be a valid ObjectId",
    }),

  name: Joi.string().trim().required().messages({
    "string.base": "name must be a string",
    "string.empty": "name cannot be empty",
    "any.required": "name is required",
  }),

  description: Joi.string().trim().allow("").optional().messages({
    "string.base": "description must be a string",
  }),

  isActive: Joi.boolean().default(true).messages({
    "boolean.base": "isActive must be a boolean value",
  }),
  adminSocialIds: Joi.array()
    .items(Joi.string().trim().required())
    .min(1)
    .required()
    .messages({
      "array.base": "adminSocialIds must be an array",
      "array.min": "At least one admin social ID is required",
      "any.required": "adminSocialIds is a required field",
      "string.base": "Each adminSocialId must be a string",
      "string.empty": "adminSocialId cannot be empty",
    }),
});


export const createStatusSubCategorySchema = Joi.object({
  
  isActive: Joi.boolean().default(true).messages({
    "boolean.base": "isActive must be a boolean value",
  }),
 
});
