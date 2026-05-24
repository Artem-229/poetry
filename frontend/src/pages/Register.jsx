import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export default function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== password2) {
            setError("Пароли не совпадают");
            return;
        }
        if (password.length < 6) {
            setError("Пароль должен быть не менее 6 символов");
            return;
        }

        setLoading(true);
        try {
            await register({ email, password });
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.error || "Ошибка регистрации");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <h1>Регистрация</h1>
            <p className="form-subtitle">Создайте аккаунт, чтобы участвовать в жизни сайта</p>

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
                        placeholder="Не менее 6 символов"
                        required
                    />
                </div>
                <div className="field">
                    <label>Повторите пароль</label>
                    <input
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Повторите пароль"
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                    {loading ? "Регистрируем..." : "Зарегистрироваться"}
                </button>
            </form>

            <div className="form-footer">
                Уже есть аккаунт? <Link to="/login">Войти</Link>
            </div>
        </div>
    );
}
