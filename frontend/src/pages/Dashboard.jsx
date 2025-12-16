// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
	const [profile, setProfile] = useState(null);

	useEffect(() => {
		let mounted = true;
		api.get("/api/me/")
			.then((r) => mounted && setProfile(r.data))
			.catch((err) => {
				console.error("Failed to fetch profile:", err);
			});
		return () => { mounted = false; };
	}, []);

	if (!profile) return <div>Loading profile...</div>;

	return (
		<div style={{ padding: 20 }}>
			<h2>Welcome {profile.first_name}</h2>
			<p>Email: {profile.email}</p>
			<p>Role: {profile.role}</p>
		</div>
	);
}
