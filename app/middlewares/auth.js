import jwt from "jsonwebtoken";
import handleResponse from "../utils/helper.js";
import User from "../models/user.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return handleResponse(res, {
        statusCode: 401,
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return handleResponse(res, {
        statusCode: 401,
        success: false,
        message: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return handleResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
    });
  }
};

export default auth;
