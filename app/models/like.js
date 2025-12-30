import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    movieId: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

likeSchema.index(
  { user: 1, movieId: 1 },
  { unique: true }
);

export default mongoose.model("Like", likeSchema);
