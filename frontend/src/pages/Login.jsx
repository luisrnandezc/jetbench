// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

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
		<div className={styles.page}>
			<div className={styles.card}>
				<h2 className={styles.title}>Sign in</h2>
				<form onSubmit={handleSubmit} className={styles.form}>
					<label className={styles.label}>Email</label>
					<input
						className={styles.input}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<label className={styles.label}>Password</label>
					<input
						className={styles.input}
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					{error && <div className={styles.error}>{error}</div>}
					<button type="submit" className={styles.button}>
						Sign in
					</button>
				</form>
			</div>
		</div>
	);
}
