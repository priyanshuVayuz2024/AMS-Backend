import Joi from "joi";

const handoverValidationSchema = Joi.object({
  itemId: Joi.string().length(24).required().messages({
    "string.length": "Item ID must be a valid 24-character ObjectId",
    "string.empty": "Item ID is required",
    "any.required": "Item ID is a required field",
  }),

  transferRequestId: Joi.string().length(24).required().messages({
    "string.length":
      "Transfer Request ID must be a valid 24-character ObjectId",
    "string.empty": "Transfer Request ID is required",
    "any.required": "Transfer Request ID is a required field",
  }),

  fromSocialId: Joi.string().trim().required().messages({
    "string.empty": "From Social ID is required",
    "any.required": "From Social ID is a required field",
  }),

  toSocialId: Joi.string().trim().required().messages({
    "string.empty": "To Social ID is required",
    "any.required": "To Social ID is a required field",
  }),

  notes: Joi.string().trim().allow("").messages({
    "string.base": "Notes must be a string",
  }),

  //  Prevent manipulation by sender
  receiverAcknowledged: Joi.forbidden().messages({
    "any.unknown": "Receiver acknowledgment cannot be set manually",
  }),

  status: Joi.forbidden().messages({
    "any.unknown": "Status cannot be set during creation",
  }),
});

const handoverUpdateValidationSchema = Joi.object({
  notes: Joi.string().trim().optional().messages({
    "string.base": "Notes must be a string",
  }),

  //  Prevent unwanted updates
  itemId: Joi.forbidden(),
  transferRequestId: Joi.forbidden(),
  fromSocialId: Joi.forbidden(),
  toSocialId: Joi.forbidden(),
  receiverAcknowledged: Joi.forbidden(),
  status: Joi.forbidden(),
});

const handoverStatusValidationSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "handover-in-progress", "completed", "cancelled")
    .required()
    .messages({
      "any.only": "status must be pending, handover-in-progress, completed, or cancelled",
      "any.required": "Status field is required",
    }),
});

 const handoverAcknowledgeSchema = Joi.object({
  receiverAcknowledged: Joi.boolean().valid(true).required().messages({
    "any.only": "Acknowledgment must be true",
    "any.required": "Acknowledgment is required",
  }),
  status: Joi.string().valid("completed").required().messages({
    "any.only": "Status must be 'completed'",
    "any.required": "Status is required",
  }),

  // Prevent updating other fields
  itemId: Joi.forbidden(),
  transferRequestId: Joi.forbidden(),
  fromSocialId: Joi.forbidden(),
  toSocialId: Joi.forbidden(),
  notes: Joi.forbidden(),
});

export {
  handoverAcknowledgeSchema,
  handoverValidationSchema,
  handoverUpdateValidationSchema,
  handoverStatusValidationSchema,
};
