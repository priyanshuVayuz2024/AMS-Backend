import Joi from "joi";
import mongoose from "mongoose";

const objectIdValidation = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const policyValidationSchema = Joi.object({
  url: Joi.string().trim().required().messages({
    "string.empty": "Url is required",
    "any.required": "Url is a required field",
  }),

  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string",
  }),

  parentType: Joi.string()
    .valid("Category", "SubCategory", "Group")
    .required()
    .messages({
      "string.empty": "Parent type is required",
      "any.required": "Parent type is a required field",
      "any.only": "Parent type must be one of Category, SubCategory, or Group",
    }),

  parentId: Joi.string()
    .custom(objectIdValidation, "ObjectId validation")
    .required()
    .messages({
      "string.empty": "Parent ID is required",
      "any.required": "Parent ID is a required field",
      "any.invalid": "Parent ID must be a valid ObjectId",
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

  isActive: Joi.boolean().default(true).messages({
    "boolean.base": "isActive must be true or false",
  }),
});

const policyStatusValidationSchema = Joi.object({
  isActive: Joi.boolean().default(true).messages({
    "boolean.base": "isActive must be true or false",
  }),
});

export { policyValidationSchema, policyStatusValidationSchema };
