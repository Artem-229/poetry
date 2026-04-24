import api from "./client";

export const getPoems = (sort = "") =>
    api.get(`/poems?sort=${sort}`);

export const getPoem = (id) =>
    api.get(`/poems/${id}`);

export const createPoem = (data) =>
    api.post("/poems", data);