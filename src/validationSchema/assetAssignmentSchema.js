import Joi from "joi";

const assetAssignmentValidationSchema = Joi.object({
  entityId: Joi.string()
    .trim()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.empty": "entityId is required",
      "any.required": "entityId is a required field",
      "string.pattern.base": "entityId must be a valid MongoDB ObjectId",
    }),

  userSocialId: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "userSocialId is required",
      "any.required": "userSocialId is a required field",
    }),

  status: Joi.string()
    .valid("assigned", "returned")
    .default("assigned")
    .messages({
      "any.only": "Status must be either 'assigned' or 'returned'",
      "string.base": "Status must be a string",
    }),
});

const assetAssignmentStatusValidationSchema = Joi.object({
  status: Joi.string()
    .valid("assigned", "returned")
    .required()
    .messages({
      "any.only": "Status must be either 'assigned' or 'returned'",
      "string.base": "Status must be a string",
      "any.required": "Status is required",
    }),
});

export { assetAssignmentValidationSchema, assetAssignmentStatusValidationSchema };
