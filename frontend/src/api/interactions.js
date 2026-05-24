import api from "./client";

export const addLike = (poem_id) =>
    api.post("/likes", { poem_id });

export const removeLike = (poem_id) =>
    api.delete("/likes", { data: { poem_id } });

export const addFavorite = (poem_id) =>
    api.post("/favorites", { poem_id });

export const removeFavorite = (poem_id) =>
    api.delete("/favorites", { data: { poem_id } });

export const getUserFavorites = () =>
    api.get("/users/me/favorites");
