import TVLike from "../models/tvLike.js";
import handleResponse from "../utils/helper.js";

export const toggleTVLike = async (req, res) => {
  try {
    const { tvId } = req.body;
    const userId = req.user._id;

    const existing = await TVLike.findOne({ user: userId, tvId });

    if (existing) {
      await TVLike.deleteOne({ _id: existing._id });

      return handleResponse(res, {
        message: "TV show unliked",
        data: { tvId, liked: false },
      });
    }

    await TVLike.create({ user: userId, tvId });

    return handleResponse(res, {
      message: "TV show liked",
      data: { tvId, liked: true },
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to like/unlike TV show",
      errors: error.message,
    });
  }
};

export const getMyLikedTV = async (req, res) => {
  try {
    const likes = await TVLike.find({ user: req.user._id }).select("tvId");

    return handleResponse(res, {
      message: "Liked TV shows fetched",
      data: likes.map(l => l.tvId),
    });
  } catch {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch liked TV shows",
    });
  }
};

export const getTVLikeCount = async (req, res) => {
  try {
    const { tvIds = [] } = req.body;

    if (!Array.isArray(tvIds) || tvIds.length === 0) {
      return handleResponse(res, {
        message: "No TV IDs provided",
        data: [],
      });
    }

    const likes = await TVLike.aggregate([
      { $match: { tvId: { $in: tvIds } } },
      { $group: { _id: "$tvId", count: { $sum: 1 } } },
    ]);

    return handleResponse(res, {
      message: "TV like count fetched",
      data: likes,
    });
  } catch {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch TV like count",
    });
  }
};
