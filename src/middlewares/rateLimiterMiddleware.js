import rateLimit from "express-rate-limit";


export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});

/**
 * Strict limiter for auth routes (login/register)
 */
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10, 
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later."
  }
});
