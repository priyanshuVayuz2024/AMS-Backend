import Joi from "joi";

const categoryValidationSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is a required field",
  }),

  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string",
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


const categoryStatusValidationSchema = Joi.object({
  isActive: Joi.boolean().default(true).messages({
    "boolean.base": "isActive must be true or false",
  }),
});
export  {categoryValidationSchema, categoryStatusValidationSchema};
