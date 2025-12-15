import { sendErrorResponse } from "../util/responseHandler.js";

export const validateRequestData = (schema) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "Validation error",
        errors: ["Request body is required and must be a valid JSON object"],
      });
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false });


    if (error) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "Validation error",
        error: error.details.map((err) => err.message),
      });
    }
    req.body = value; 
    next();
  };
};
