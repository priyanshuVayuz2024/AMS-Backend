import Joi from "joi";

const roleAssigneeValidationSchema = Joi.object({
  roleId: Joi.string()
    .required()
    .messages({
      "string.empty": "Role ID is required",
      "any.required": "Role ID is a required field",
    }),

  assignedToSocialId: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Assigned user social ID is required",
      "any.required": "Assigned user social ID is a required field",
    }),

  description: Joi.string()
    .trim()
    .allow("")
    .messages({
      "string.base": "Description must be a string",
    }),

  isActive: Joi.boolean()
    .strict()
    .default(true)
    .messages({
      "boolean.base": "isActive must be true or false",
    }),
});

const roleAssigneeStatusValidationSchema = Joi.object({
  isActive: Joi.boolean()
    .strict()
    .required()
    .messages({
      "boolean.base": "isActive must be true or false",
      "any.required": "isActive is required",
    }),
});

export {
  roleAssigneeValidationSchema,
  roleAssigneeStatusValidationSchema,
};
