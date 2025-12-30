import { validationResult } from "express-validator";
import handleResponse from "../utils/helper.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return handleResponse(res, {
      statusCode: 422,
      success: false,
      message: "Validation error",
      errors: errors.array(),
    });
  }

  next();
};

export default validate;
