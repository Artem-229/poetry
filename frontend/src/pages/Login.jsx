import { useState } from "react";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export default function Login() {
    const setToken = useAuthStore((s) => s.setToken);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submit = async () => {
        const res = await login({ email, password });
        setToken(res.data.token);
    };

    return (
        <div className="container">
            <h2>Login</h2>
            <input onChange={(e) => setEmail(e.target.value)} placeholder="email" />
            <input type="password" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={submit}>Login</button>
        </div>
    );
}