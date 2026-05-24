import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export default function Login() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await login({ email, password });
            setAuth(res.data.token, {
                id: res.data.user_id,
                role: res.data.role,
                email: res.data.email,
            });
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <h1>Войти</h1>
            <p className="form-subtitle">Войдите, чтобы оставлять комментарии и добавлять в избранное</p>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={submit}>
                <div className="field">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ваш@email.com"
                        required
                    />
                </div>
                <div className="field">
                    <label>Пароль</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Пароль"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                    {loading ? "Входим..." : "Войти"}
                </button>
            </form>

            <div className="form-footer">
                Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </div>
        </div>
    );
}
