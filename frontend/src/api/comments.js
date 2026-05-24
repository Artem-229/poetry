import api from "./client";

export const getComments = (poemId) =>
    api.get(`/poems/${poemId}/comments`);

export const createComment = (poem_id, text) =>
    api.post("/comments", { poem_id, text });

export const deleteComment = (id) =>
    api.delete(`/comments/${id}`);
