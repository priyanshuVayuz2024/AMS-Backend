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
    "string.empty": "S3 link is required",
    "any.required": "S3 link is a required field",
  }),

  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string",
  }),

  parentType: Joi.string().valid("Category", "SubCategory", "Group").required().messages({
    "string.empty": "Parent type is required",
    "any.required": "Parent type is a required field",
    "any.only": "Parent type must be one of Category, SubCategory, or Group",
  }),

  parentId: Joi.string().custom(objectIdValidation, "ObjectId validation").required().messages({
    "string.empty": "Parent ID is required",
    "any.required": "Parent ID is a required field",
    "any.invalid": "Parent ID must be a valid ObjectId",
  }),

  assignedToSocialId: Joi.string().trim().required().messages({
    "string.empty": "AssignedToSocialId is required",
    "any.required": "AssignedToSocialId is a required field",
  }),

  isActive: Joi.boolean().default(true).messages({
    "boolean.base": "isActive must be true or false",
  }),
});


export default policyValidationSchema;
