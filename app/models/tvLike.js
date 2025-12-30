import mongoose from "mongoose";

const tvLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tvId: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

tvLikeSchema.index(
  { user: 1, tvId: 1 },
  { unique: true }
);

export default mongoose.model("TVLike", tvLikeSchema);
