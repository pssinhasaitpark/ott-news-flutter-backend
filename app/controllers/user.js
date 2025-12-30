import bcrypt from "bcryptjs";
import User from "../models/user.js";
import handleResponse from "../utils/helper.js";
import { generateToken } from "../utils/jwt.js";
import crypto from "crypto";
import sendEmail from "../utils/email.js";

export const signup = async (req, res) => {
  try {
    let { name, email, mobile, password } = req.body;

    if (!mobile.startsWith("+")) {
      mobile = `+91${mobile}`;
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser) {
      return handleResponse(res, {
        statusCode: 409,
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    return handleResponse(res, {
      statusCode: 201,
      message: "Signup successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Signup failed",
      errors: error.message,
    });
  }
};

export const loginWithPassword = async (req, res) => {

  try {
    let { mobile, password } = req.body;

    mobile = mobile.replace(/\s+/g, "").replace(/-/g, "");

    let mobileWithCountry = mobile;

    if (!mobile.startsWith("+")) {
      mobileWithCountry = `+91${mobile.slice(-10)}`;
    }

    const rawMobile = mobile.slice(-10);

    const user = await User.findOne({
      $or: [
        { mobile: mobileWithCountry },
        { mobile: rawMobile },
        { mobile: `+91${rawMobile}` }
      ]
    });

    if (!user) {
      return handleResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return handleResponse(res, {
        statusCode: 401,
        success: false,
        message: "Invalid mobile number or password",
      });
    }

    const token = generateToken({
      id: user._id,
      mobile: user.mobile,
    });

    return handleResponse(res, {
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
        },
      },
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Login failed",
      errors: error.message,
    });
  }
};

export const forgotPasswordEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return handleResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_APP}://reset-password?token=${resetToken}&email=${email}`;

await sendEmail({
  to: email,
  subject: "Password Reset Request",
  text: `Reset your password using this link: ${resetUrl}`,
  html: `
    <p>You requested a password reset.</p>
    <p>
      Click this link to reset your password:<br/>
      <a href="${resetUrl}">${resetUrl}</a>
    </p>
    <p>This link will expire in 15 minutes.</p>
  `,
});


    return handleResponse(res, {
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to send password reset email",
      errors: error.message,
    });
  }
};

export const resetPasswordEmail = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return handleResponse(res, {
        statusCode: 400,
        success: false,
        message: "Email, token and new password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return handleResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    if (
      user.resetPasswordToken !== tokenHash ||
      user.resetPasswordTokenExpiry < Date.now()
    ) {
      return handleResponse(res, {
        statusCode: 400,
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    await user.save();

    return handleResponse(res, {
      message: "Password reset successfully",
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Password reset failed",
      errors: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return handleResponse(res, {
        statusCode: 400,
        success: false,
        message: "Old password and new password are required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return handleResponse(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isPasswordMatch) {
      return handleResponse(res, {
        statusCode: 400,
        success: false,
        message: "Old password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return handleResponse(res, {
        statusCode: 400,
        success: false,
        message: "New password cannot be same as old password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return handleResponse(res, {
      message: "Password changed successfully",
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to change password",
      errors: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    return handleResponse(res, {
      message: "User profile fetched successfully",
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch user profile",
      errors: error.message,
    });
  }
};
