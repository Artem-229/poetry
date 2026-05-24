import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
    const { token, user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="nav">
            <Link className="nav-brand" to="/">Поэзия</Link>
            <Link to="/">Главная</Link>
            <Link to="/poems">Стихи</Link>
            <Link to="/collections">Сборники</Link>
            <span className="nav-spacer" />
            {token ? (
                <>
                    {user?.role === "ADMIN" && <Link to="/admin">Панель</Link>}
                    <Link to="/profile">Профиль</Link>
                    <button className="btn btn-sm" onClick={handleLogout}>Выйти</button>
                </>
            ) : (
                <>
                    <Link to="/login">Войти</Link>
                    <Link to="/register" className="nav-register">Регистрация</Link>
                </>
            )}
        </nav>
    );
}
