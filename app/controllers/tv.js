import axios from "axios";
import TVSave from "../models/tvSave.js";
import handleResponse from "../utils/helper.js";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_URL = process.env.TMDB_URL;


const INDIA_PROVIDERS = {
  netflix: 8,
  hotstar: "122|337",
  sonyliv: 237,
  zee5: 232,
  jiocinema: 220,
  mxplayer: 119,
  apple: 350,
  disney: 122,
};

export const getTVShows = async (req, res) => {
  try {
    const { page = 1, language, year, genre, sort = "popularity.desc", provider } = req.query;

    const currentYear = new Date().getFullYear();
    const safeYear = year && Number(year) <= currentYear ? Number(year) : undefined;

    const params = {
      api_key: TMDB_API_KEY,
      sort_by: sort,
      page: Number(page),
      watch_region: "IN",
    };

    if (language) params.with_original_language = language;
    if (safeYear) params.first_air_date_year = safeYear;
    if (genre) params.with_genres = genre;

    if (provider) {
      const providerId = INDIA_PROVIDERS[provider.toLowerCase()];
      if (!providerId) {
        return res.status(400).json({ success: false, message: "Invalid provider" });
      }
      params.with_watch_providers = providerId;
      params.with_watch_monetization_types = "flatrate";
    }

    const response = await axios.get(`${TMDB_URL}/discover/tv`, { params });

    return res.json({
      success: true,
      page: response.data.page,
      total_pages: response.data.total_pages,
      data: response.data.results,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch TV shows" });
  }
};

export const toggleTVSave = async (req, res) => {
  try {
    const { tvId } = req.body;
    const userId = req.user._id;

    const existing = await TVSave.findOne({ user: userId, tvId });

    if (existing) {
      await TVSave.deleteOne({ _id: existing._id });

      return handleResponse(res, {
        message: "TV show removed from saved",
        data: { tvId, saved: false },
      });
    }

    await TVSave.create({ user: userId, tvId });

    return handleResponse(res, {
      message: "TV show saved",
      data: { tvId, saved: true },
    });
  } catch (error) {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to save/unsave TV show",
      errors: error.message,
    });
  }
};

export const getMySavedTV = async (req, res) => {
  try {
    const saved = await TVSave.find({ user: req.user._id }).select("tvId");

    return handleResponse(res, {
      message: "Saved TV shows fetched",
      data: saved.map(s => s.tvId),
    });
  } catch {
    return handleResponse(res, {
      statusCode: 500,
      success: false,
      message: "Failed to fetch saved TV shows",
    });
  }
};