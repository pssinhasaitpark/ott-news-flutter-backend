import mongoose from "mongoose";

const tvSaveSchema = new mongoose.Schema(
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

tvSaveSchema.index(
  { user: 1, tvId: 1 },
  { unique: true }
);

export default mongoose.model("TVSave", tvSaveSchema);
