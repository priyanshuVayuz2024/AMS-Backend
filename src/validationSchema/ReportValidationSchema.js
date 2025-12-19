import Joi from "joi";


const reportValidationSchema = Joi.object({
  assetId: Joi.string().trim().required().messages({
    "string.empty": "Asset ID is required",
    "any.required": "Asset ID is a required field",
  }),

  reportTitle: Joi.string().trim().required().messages({
    "string.empty": "Report title is required",
    "any.required": "Report title is a required field",
  }),

  reportDescription: Joi.string().trim().allow("").messages({
    "string.base": "Report description must be a string",
  }),

  reportedBy: Joi.any(),

  status: Joi.string()
    .valid("open", "in-progress", "resolved", "closed")
    .default("open")
    .messages({
      "any.only": "Invalid report status",
    }),
});


const reportStatusValidationSchema = Joi.object({
  status: Joi.string()
    .valid("open", "in-progress", "resolved", "closed")
    .default("open")
    .messages({
      "any.only": "Invalid report status",
    }),
});

export { reportValidationSchema, reportStatusValidationSchema };
