export const validateRequestData = (schema) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message: "Validation error",
        errors: ["Request body is required and must be a valid JSON object"],
      });
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false });


    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }
    req.body = value; // sanitized input
    next();
  };
};
