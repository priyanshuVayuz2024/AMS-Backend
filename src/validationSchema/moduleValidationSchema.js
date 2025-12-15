import Joi from "joi";

const moduleValidationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Name is required",
      "any.required": "Name is a required field",
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

const moduleStatusValidationSchema = Joi.object({
  isActive: Joi.boolean()
    .strict()
    .default(true)
    .messages({
      "boolean.base": "isActive must be true or false",
    }),
})

export { moduleValidationSchema, moduleStatusValidationSchema };
