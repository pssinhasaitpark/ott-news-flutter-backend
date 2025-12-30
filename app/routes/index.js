import userRoutes from "./user.js";
import movieRoutes from "./movie.js";
import likeRoutes from "./like.js";
import tvRoutes from "./tv.js";
import tvLikeRoutes from "./tvLike.js";

const setupRoutes = (app) => {
    app.use("/api/v1/user", userRoutes);
    app.use("/api/v1/movies", movieRoutes);
    app.use("/api/v1/tv", tvRoutes);
    app.use("/api/v1/like", likeRoutes);
    app.use("/api/v1/like/tv", tvLikeRoutes);
};

export default setupRoutes;
