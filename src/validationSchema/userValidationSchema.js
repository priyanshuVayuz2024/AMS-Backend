import Joi from "joi";

export const userValidationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name should have at least 2 characters",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Invalid email address",
    "any.required": "Email is required",
  }),

  socialId: Joi.string().required().messages({
    "string.empty": "Social ID is required",
  }),

  department: Joi.string().allow("", null).optional(),

  syncedAt: Joi.date().default(() => new Date()),

  isActive: Joi.boolean().default(true),
});
