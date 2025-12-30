import express from "express";
import { signup, loginWithPassword, forgotPasswordEmail, resetPasswordEmail, changePassword, getMe } from "../controllers/user.js";
import { signupValidator, loginWithPasswordValidator, forgotPasswordEmailValidator, resetPasswordEmailValidator, changePasswordValidator } from "../validators/user.js";
import validate from "../middlewares/validator.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signupValidator, validate, signup);
router.post("/login", loginWithPasswordValidator, validate, loginWithPassword);
router.post("/password/forgot-email", forgotPasswordEmailValidator, validate, forgotPasswordEmail);
router.post("/password/reset-email", resetPasswordEmailValidator, validate, resetPasswordEmail);
router.post("/password/change", auth, changePasswordValidator, validate, changePassword);
router.get("/me", auth, getMe);

export default router;
