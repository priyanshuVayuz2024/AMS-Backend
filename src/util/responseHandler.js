const sendResponse = ({ res, statusCode, message, data = null, meta }) => {
  return res.status(statusCode).json({
    status_code: statusCode,
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    meta,
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
  console.log(error, "error");
  return error;
};

export const tryCatch = (controllerFn) => {
  return async (req, res, next) => {
    try {
      await controllerFn(req, res, next);
    } catch (error) {
      console.error(" Error caught in tryCatch:", error);
      next(error); 
    }
  };
};

export const errorHandler = (err, req, res, next) => {
  console.error(" Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return sendErrorResponse({
    res,
    statusCode,
    message,
  });
};

export { sendResponse, sendErrorResponse, createError };
