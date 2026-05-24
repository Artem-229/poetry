import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getUserFavorites } from "../api/interactions";
import PoemCard from "../components/PoemCard";
import PoemModal from "../components/PoemModal";

export default function Profile() {
    const { user, token, logout } = useAuthStore();
    const navigate = useNavigate();

    const [favorites, setFavorites] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        getUserFavorites()
            .then((res) => setFavorites(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    if (!user) return null;

    return (
        <div className="container">
            <div className="profile-header">
                <div className="profile-avatar">{user.email[0].toUpperCase()}</div>
                <div className="profile-info">
                    <h2>{user.email}</h2>
                    <span className="profile-role">
                        {user.role === "ADMIN" ? "Администратор" : "Читатель"}
                    </span>
                </div>
                <button
                    className="btn btn-sm btn-danger"
                    style={{ marginLeft: "auto" }}
                    onClick={handleLogout}
                >
                    Выйти
                </button>
            </div>

            <h2 className="section-title">Избранные стихи</h2>

            {loading ? (
                <p className="loading">Загрузка...</p>
            ) : favorites.length === 0 ? (
                <p className="empty">
                    У вас пока нет избранных стихов.{" "}
                    <Link to="/poems" style={{ color: "var(--accent)" }}>Перейти к стихам</Link>
                </p>
            ) : (
                favorites.map((p) => (
                    <PoemCard key={p.id} poem={p} onClick={() => setSelected(p)} />
                ))
            )}

            {selected && (
                <PoemModal
                    poem={selected}
                    onClose={() => setSelected(null)}
                    onUnfavorite={(id) => setFavorites((f) => f.filter((p) => p.id !== id))}
                />
            )}
        </div>
    );
}
