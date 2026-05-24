import api from "./client";

export const getPoems = (sort = "") =>
    api.get(`/poems?sort=${sort}`);

export const getPoem = (id) =>
    api.get(`/poems/${id}`);

export const getPoemStatus = (id) =>
    api.get(`/poems/${id}/status`);

export const createPoem = (data) =>
    api.post("/poems", data);

export const updatePoem = (id, data) =>
    api.put(`/poems/${id}`, data);

export const deletePoem = (id) =>
    api.delete(`/poems/${id}`);
