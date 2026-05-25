import api from "./client";

export const getGallery = () => api.get("/gallery");

export const createGalleryItem = (formData) =>
    api.post("/gallery", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const updateGalleryItem = (id, data) => api.put(`/gallery/${id}`, data);

export const deleteGalleryItem = (id) => api.delete(`/gallery/${id}`);

export const uploadFile = (formData) =>
    api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const reorderGallery = (items) => api.put("/gallery/reorder", items);
