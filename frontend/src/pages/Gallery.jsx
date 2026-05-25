import { useEffect, useState } from "react";
import { getGallery } from "../api/gallery";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function Gallery() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightbox, setLightbox] = useState(null);

    useEffect(() => {
        getGallery()
            .then((r) => setItems(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="container"><p className="loading">Загрузка...</p></div>;

    return (
        <div className="container">
            <h1 className="page-title">Галерея</h1>
            <p className="page-subtitle">Фотографии и памятные моменты</p>

            {items.length === 0 ? (
                <p className="empty">Фотографий пока нет</p>
            ) : (
                <div className="gallery-grid">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="gallery-card"
                            onClick={() => setLightbox(item)}
                        >
                            <img
                                src={API_URL + item.image_url}
                                alt={item.caption}
                                className="gallery-img"
                            />
                            {item.caption && (
                                <p className="gallery-caption">{item.caption}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {lightbox && (
                <div className="gallery-lightbox" onClick={() => setLightbox(null)}>
                    <div className="gallery-lightbox-inner" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn gallery-lightbox-close" onClick={() => setLightbox(null)}>×</button>
                        <img
                            src={API_URL + lightbox.image_url}
                            alt={lightbox.caption}
                            className="gallery-lightbox-img"
                        />
                        {lightbox.caption && (
                            <p className="gallery-lightbox-caption">{lightbox.caption}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
