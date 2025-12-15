import Joi from "joi";

export const createTransferRequestSchema = Joi.object({
  assetId: Joi.string().required().messages({
    "any.required": "Asset ID is required",
    "string.base": "Asset ID must be a string",
  }),

  from: Joi.string().required().messages({
    "any.required": "From user (current owner) is required",
    "string.base": "From must be a string",
  }),

  title: Joi.string().min(3).required().messages({
    "string.min": "Title must be at least 3 characters",
    "any.required": "Title is required",
  }),

  issue: Joi.string().allow("", null).messages({
    "string.base": "Issue must be a string",
  }),

  // requesterSocialId is optional IF user is requesting for himself
  requesterSocialId: Joi.string().optional().messages({
    "string.base": "RequesterSocialId must be a string",
  }),
});



export const updateTransferRequestSchema = Joi.object({
  title: Joi.string().min(3).optional().messages({
    "string.min": "Title must be at least 3 characters",
  }),

  issue: Joi.string().allow("", null).optional().messages({
    "string.base": "Issue must be a string",
  }),

  to: Joi.string().allow(null).optional().messages({
    "string.base": "To must be a string",
  }),
});


export const updateTransferStatusSchema = Joi.object({
  status: Joi.string()
    .valid("open", "in-progress", "approved", "rejected")
    .required()
    .messages({
      "any.only": "Status must be one of: open, in-progress, approved, rejected",
      "any.required": "Status is required"
    }),

  comment: Joi.string().trim().allow("", null).messages({
    "string.base": "Comment must be a string"
  }),
});



export const approvalActionSchema = Joi.object({
  level: Joi.number().valid(1, 2, 3).required().messages({
    "any.only": "Level must be 1, 2 or 3",
    "any.required": "Approval level is required",
  }),

  status: Joi.string()
    .valid("approved", "pending", "rejected")
    .required()
    .messages({
      "any.only": "Status must be either approved, pending, or rejected",
      "any.required": "Status is required",
    }),

  comment: Joi.string().trim().allow("", null).messages({
    "string.base": "Comment must be a string",
  }),
});
