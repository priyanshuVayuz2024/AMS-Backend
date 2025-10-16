const sendResponse = ({ res, statusCode, message, data = null }) => {
  return res.status(statusCode).json({
    status_code: statusCode,
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  });
};

const sendErrorResponse = ({
  res,
  statusCode = 500,
  message,
  error = null,
}) => {
  return res.status(statusCode).json({
    status_code: statusCode,
    success: false,
    message,
    error,
  });
};

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const tryCatch = (controllerFn) => {
  return async (req, res, next) => {
    try {
      await controllerFn(req, res, next);
    } catch (error) {
      console.error("❌ Error caught in tryCatch:", error);
      next(error); // Pass error to Express error handler middleware
    }
  };
};

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Use your reusable error response function
  return sendErrorResponse({
    res,
    statusCode,
    message,
    error: err?.stack, // optional: hide stack in prod
  });
};

export { sendResponse, sendErrorResponse, createError };
