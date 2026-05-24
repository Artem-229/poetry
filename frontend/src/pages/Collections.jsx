import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCollections, getCollection } from "../api/collections";
import PoemCard from "../components/PoemCard";
import PoemModal from "../components/PoemModal";

export default function Collections() {
    const { id } = useParams();

    const [collections, setCollections] = useState([]);
    const [detail, setDetail] = useState(null);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (id) {
            getCollection(id)
                .then((r) => setDetail(r.data))
                .catch(() => setDetail(null))
                .finally(() => setLoading(false));
        } else {
            getCollections()
                .then((r) => setCollections(r.data))
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="container"><p className="loading">Загрузка...</p></div>;

    if (id) {
        if (!detail) return (
            <div className="container">
                <Link to="/collections" className="collection-back">← Все сборники</Link>
                <p className="empty">Сборник не найден</p>
            </div>
        );

        const { collection, poems } = detail;
        return (
            <div className="container">
                <Link to="/collections" className="collection-back">← Все сборники</Link>
                <h1 className="page-title">{collection.title}</h1>
                {collection.description && (
                    <p className="page-subtitle">{collection.description}</p>
                )}

                {poems.length === 0 ? (
                    <p className="empty">В этом сборнике пока нет стихов</p>
                ) : (
                    poems.map((p) => (
                        <PoemCard key={p.id} poem={p} onClick={() => setSelected(p)} />
                    ))
                )}

                {selected && (
                    <PoemModal poem={selected} onClose={() => setSelected(null)} />
                )}
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="page-title">Сборники</h1>
            <p className="page-subtitle">Стихи, объединённые по темам и циклам</p>

            {collections.length === 0 ? (
                <p className="empty">Сборников пока нет</p>
            ) : (
                <div className="collections-grid">
                    {collections.map((col) => (
                        <Link key={col.id} to={`/collections/${col.id}`} className="collection-card">
                            <h3>{col.title}</h3>
                            {col.description && <p>{col.description}</p>}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
