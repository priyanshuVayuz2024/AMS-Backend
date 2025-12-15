import Joi from "joi";

export const createReportValidation = Joi.object({
  reportedAssetId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),

  title: Joi.string().trim().min(3).max(100).required(),

  issue: Joi.string().trim().max(500).allow(""),
});

export const updateReportValidation = Joi.object({
  title: Joi.string().trim().min(3).max(100).optional(),
  issue: Joi.string().trim().max(500).optional(),
});


export const updateReportStatusValidation = Joi.object({
  status: Joi.string()
    .valid("open", "in-progress", "resolved", "closed")
    .required()
    .messages({
      "any.only": "Status must be one of 'open', 'in-progress', 'resolved', or 'closed'.",
      "string.empty": "Status is required.",
    }),
});
