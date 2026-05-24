import { useEffect, useState } from "react";
import { getPoems } from "../api/poems";
import PoemCard from "../components/PoemCard";
import PoemModal from "../components/PoemModal";

export default function Poems() {
    const [poems, setPoems] = useState([]);
    const [sort, setSort] = useState("popular");
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load(sort);
    }, []);

    const load = (s) => {
        setLoading(true);
        setSort(s);
        getPoems(s)
            .then((res) => setPoems(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    return (
        <div className="container">
            <h1 className="page-title">Стихи</h1>
            <p className="page-subtitle">Лирика, написанная с душой</p>

            <div className="filters">
                <button
                    className={`btn ${sort === "popular" ? "active" : ""}`}
                    onClick={() => load("popular")}
                >
                    Популярные
                </button>
                <button
                    className={`btn ${sort === "" ? "active" : ""}`}
                    onClick={() => load("")}
                >
                    Новые
                </button>
            </div>

            {loading ? (
                <p className="loading">Загрузка...</p>
            ) : poems.length === 0 ? (
                <p className="empty">Стихов пока нет</p>
            ) : (
                poems.map((p) => (
                    <PoemCard key={p.id} poem={p} onClick={() => setSelected(p)} />
                ))
            )}

            {selected && (
                <PoemModal
                    poem={selected}
                    onClose={() => setSelected(null)}
                    onLikeChange={(id, delta) =>
                        setPoems((prev) =>
                            prev.map((p) =>
                                p.id === id ? { ...p, likes_count: p.likes_count + delta } : p
                            )
                        )
                    }
                />
            )}
        </div>
    );
}
