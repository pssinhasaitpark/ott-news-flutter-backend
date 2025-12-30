import MovieLike from "../models/like.js";
import handleResponse from "../utils/helper.js";

export const toggleMovieLike = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.user._id;

    if (!movieId) {
      return handleResponse(res, {
        statusCode: 400,
        success: false,
        message: "movieId is required",
      });
    }

    const existingLike = await MovieLike.findOne({ user: userId, movieId });

    if (existingLike) {
      await MovieLike.deleteOne({ _id: existingLike._id });

      return handleResponse(res, {
        message: "Movie unliked successfully",
        data: { movieId, liked: false },
      });
    }

    await MovieLike.create({ user: userId, movieId });

    return handleResponse(res, {
      message: "Movie liked successfully",
      data: { movieId, liked: true },
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to like/unlike movie",
      errors: error.message,
    });
  }
};

export const getMyLikedMovies = async (req, res) => {
  try {
    const likes = await MovieLike.find({ user: req.user._id })
      .select("movieId");

    const movieIds = likes.map(like => like.movieId);

    return handleResponse(res, {
      message: "Liked movies fetched successfully",
      data: movieIds,
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch liked movies",
    });
  }
};

export const getMoviesLikeCount = async (req, res) => {
  try {
    const { movieIds = [] } = req.body;

    if (!Array.isArray(movieIds) || movieIds.length === 0) {
      return handleResponse(res, {
        message: "No movie IDs provided",
        data: [],
      });
    }

    const likes = await MovieLike.aggregate([
      { $match: { movieId: { $in: movieIds } } },
      {
        $group: {
          _id: "$movieId",
          count: { $sum: 1 },
        },
      },
    ]);

    return handleResponse(res, {
      message: "Movies like count fetched",
      data: likes,
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch likes",
    });
  }
};
