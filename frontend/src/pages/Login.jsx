// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
	const { login, user } = useContext(AuthContext);
	const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user]);

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		try {
			await login(email, password);
			navigate("/dashboard");
		} catch (err) {
			setError("Invalid credentials or server error");
			console.error(err);
		}
	};

	return (
		<div style={{ maxWidth: 420, margin: "auto", padding: 20 }}>
			<h2>Sign in</h2>
			<form onSubmit={handleSubmit}>
				<label>Email</label>
				<input value={email} onChange={(e) => setEmail(e.target.value)} required />
				<label>Password</label>
				<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				{error && <div style={{ color: "red" }}>{error}</div>}
				<button type="submit">Sign in</button>
			</form>
		</div>
	);
}
