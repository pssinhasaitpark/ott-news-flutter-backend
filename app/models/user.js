import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
    },

    otpExpiresAt: {
      type: Date,
    },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiry: { type: Date },

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
