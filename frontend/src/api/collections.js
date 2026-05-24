import api from "./client";

export const getCollections = () =>
    api.get("/collections");

export const getCollection = (id) =>
    api.get(`/collections/${id}`);

export const createCollection = (data) =>
    api.post("/collections", data);

export const addPoemToCollection = (collectionId, poem_id) =>
    api.post(`/collections/${collectionId}/poems`, { poem_id });

export const removePoemFromCollection = (collectionId, poem_id) =>
    api.delete(`/collections/${collectionId}/poems`, { data: { poem_id } });

export const deleteCollection = (id) =>
    api.delete(`/collections/${id}`);
