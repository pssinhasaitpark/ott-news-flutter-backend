import axios from "axios";
import MovieSave from "../models/movieSave.js";
import handleResponse from "../utils/helper.js";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_URL = process.env.TMDB_URL;

export const getMovies = async (req, res) => {
  try {
    const {
      page = 1,
      country = "IN",
      language,
      year,
      genre,
      sort = "popularity.desc",
      vote,
      movieId,
      topRated, 
    } = req.query;

    if (movieId) {
      const response = await axios.get(
        `${TMDB_URL}/movie/${movieId}`,
        { params: { api_key: TMDB_API_KEY } }
      );

      return res.json({
        success: true,
        data: response.data,
      });
    }

    const currentYear = new Date().getFullYear();
    const safeYear =
      year && Number(year) <= currentYear ? Number(year) : undefined;

    const params = {
      api_key: TMDB_API_KEY,
      region: country,
      sort_by: sort,
      page: Number(page) || 1,
    };

    if (language) params.with_original_language = language;
    if (safeYear) params.primary_release_year = safeYear;
    if (genre) params.with_genres = genre;
    if (vote) params["vote_average.gte"] = Number(vote);

    const response = await axios.get(
      `${TMDB_URL}/discover/movie`,
      { params }
    );

    return res.json({
      success: true,
      applied_filters: params,
      page: response.data.page,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
      data: response.data.results,
    });

  } catch (error) {
    console.error(
      "TMDB ERROR:",
      error.response?.status,
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch movies from TMDB",
    });
  }
};

export const toggleSaveMovie = async (req, res) => {
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

    const existingSave = await MovieSave.findOne({
      user: userId,
      movieId,
    });

    if (existingSave) {
      await MovieSave.deleteOne({ _id: existingSave._id });

      return handleResponse(res, {
        message: "Movie removed from saved",
        data: {
          movieId,
          saved: false,
        },
      });
    }

    await MovieSave.create({
      user: userId,
      movieId,
    });

    return handleResponse(res, {
      message: "Movie saved successfully",
      data: {
        movieId,
        saved: true,
      },
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to save/unsave movie",
      errors: error.message,
    });
  }
};

export const getMySavedMovies = async (req, res) => {
  try {
    const savedMovies = await MovieSave.find({
      user: req.user._id,
    }).select("movieId");

    const movieIds = savedMovies.map(item => item.movieId);

    return handleResponse(res, {
      message: "Saved movies fetched successfully",
      data: movieIds,
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch saved movies",
    });
  }
};

export const getMovieVideos = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId) {
      return res.status(400).json({
        success: false,
        message: "movieId is required",
      });
    }

    const response = await axios.get(`${TMDB_URL}/movie/${movieId}/videos`, {
      params: {
        api_key: TMDB_API_KEY,
        language: 'en-US',
      },
    });

    const youtubeBase = "https://www.youtube.com/watch?v=";
    const videos = response.data.results.map(video => ({
      name: video.name,
      type: video.type,
      url: video.site === "YouTube" ? youtubeBase + video.key : null,
      official: video.official,
      published_at: video.published_at
    }));

    return res.json({
      success: true,
      movieId,
      videos,
    });
  } catch (error) {
    console.error("TMDB VIDEOS ERROR:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch videos from TMDb",
    });
  }
};
