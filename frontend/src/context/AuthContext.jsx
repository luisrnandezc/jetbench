// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(() => {
		const access = localStorage.getItem("access_token");
		if (!access) return null;
		try {
			const payload = jwtDecode(access);
			return {
				id: payload.user_id || payload.id,
				email: payload.email,
				role: payload.role,
				exp: payload.exp,
			};
		} catch {
			return null;
		}
	});

	// Optionally refresh on mount if close to expiry (not required)
	useEffect(() => {
		// Example: if token expires within 2 minutes, try a refresh
		const check = async () => {
			const access = localStorage.getItem("access_token");
			if (!access) return;
			try {
				const payload = jwtDecode(access);
				const expiresIn = payload.exp * 1000 - Date.now();
				if (expiresIn < 2 * 60 * 1000) {
					// #TODO: let axios interceptor handle refresh next time a call is made
					// or proactively refresh here using refresh token
				}
			} catch {}
		};
		check();
	}, []);

	const login = async (email, password) => {
		const resp = await api.post("/api/token/", { email, password });
		const { access, refresh, user: userObj } = resp.data;
		localStorage.setItem("access_token", access);
		localStorage.setItem("refresh_token", refresh);
		// Prefer server user object if provided:
		if (userObj) {
			setUser(userObj);
		} else {
			// fallback to decode
			const payload = jwtDecode(access);
			setUser({
				id: payload.user_id || payload.id,
				email: payload.email,
				role: payload.role,
				exp: payload.exp,
			});
		}
		return resp;
	};

	const logout = () => {
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		setUser(null);
		window.location.href = "/login";
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
