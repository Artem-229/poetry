import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
    const { token, user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const close = () => setOpen(false);

    const handleLogout = () => {
        logout();
        navigate("/");
        close();
    };

    return (
        <nav className="nav">
            <Link className="nav-brand" to="/" onClick={close}>Сергей Низамов</Link>

            <Link className="nav-desktop-link" to="/">Главная</Link>
            <Link className="nav-desktop-link" to="/poems">Стихи</Link>
            <Link className="nav-desktop-link" to="/collections">Сборники</Link>
            <Link className="nav-desktop-link" to="/gallery">Галерея</Link>
            <span className="nav-spacer" />
            {token ? (
                <>
                    {user?.role === "ADMIN" && <Link className="nav-desktop-link" to="/admin">Панель</Link>}
                    <Link className="nav-desktop-link" to="/profile">Профиль</Link>
                    <button className="btn btn-sm nav-desktop-link" onClick={handleLogout}>Выйти</button>
                </>
            ) : (
                <>
                    <Link className="nav-desktop-link" to="/login">Войти</Link>
                    <Link className="nav-desktop-link nav-register" to="/register">Регистрация</Link>
                </>
            )}

            <button
                className="nav-toggle"
                onClick={() => setOpen((v) => !v)}
                aria-label="Меню"
            >
                {open ? "✕" : "☰"}
            </button>

            {open && (
                <div className="nav-mobile-menu">
                    <Link to="/" onClick={close}>Главная</Link>
                    <Link to="/poems" onClick={close}>Стихи</Link>
                    <Link to="/collections" onClick={close}>Сборники</Link>
                    <Link to="/gallery" onClick={close}>Галерея</Link>
                    <div className="nav-mobile-divider" />
                    {token ? (
                        <>
                            {user?.role === "ADMIN" && (
                                <Link to="/admin" onClick={close}>Панель управления</Link>
                            )}
                            <Link to="/profile" onClick={close}>Профиль</Link>
                            <button onClick={handleLogout}>Выйти</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={close}>Войти</Link>
                            <Link to="/register" onClick={close} className="nav-register">Регистрация</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
