import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
    const { token, logout } = useAuthStore();

    return (
        <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/poems">Poems</Link>
            <Link to="/collections">Collections</Link>

            {token ? (
                <>
                    <Link to="/profile">Profile</Link>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <Link to="/login">Login</Link>
            )}
        </nav>
    );
}