import { sendErrorResponse } from "../util/responseHandler";

export const validateRequestData = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "Validation error",
        error: error.details.map((err) => err.message),
      });
    }
    req.body = value; // sanitized input
    next();
  };
};
