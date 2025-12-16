import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const api = axios.create({
	baseURL: API_BASE,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Attach access token automatically for each request
api.interceptors.request.use((config) => {
	const access = localStorage.getItem("access_token");
	if (access) {
		config.headers.Authorization = `Bearer ${access}`;
	}
	return config;
});

// Response interceptor to attempt refresh on 401
let isRefreshing = false;
let subscribers = [];

function subscribe(cb) {
	subscribers.push(cb);
}

function onRefreshed(token) {
	subscribers.forEach((cb) => cb(token));
	subscribers = [];
}

api.interceptors.response.use(
	(res) => res,
	async (error) => {
		
		const originalRequest = error.config;
		if (!originalRequest) return Promise.reject(error);

		// avoid infinite loop
		if (error.response && error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const refresh = localStorage.getItem("refresh_token");
			if (!refresh) {
				// no refresh token -> force logout/redirect
				window.location.href = "/login";
				return Promise.reject(error);
			}

			if (isRefreshing) {
				// queue requests until refresh completes
				return new Promise((resolve) => {
					subscribe((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						resolve(axios(originalRequest));
					});
				});
			}

			isRefreshing = true;
			try {
				const resp = await axios.post(`${API_BASE}/api/token/refresh/`, { refresh });
				const newAccess = resp.data.access;
				localStorage.setItem("access_token", newAccess);
				onRefreshed(newAccess);
				isRefreshing = false;

				originalRequest.headers.Authorization = `Bearer ${newAccess}`;
				return axios(originalRequest);
			} catch (err) {
				isRefreshing = false;
				// refresh failed => logout
				localStorage.removeItem("access_token");
				localStorage.removeItem("refresh_token");
				window.location.href = "/login";
				return Promise.reject(err);
			}
		}

		return Promise.reject(error);
	}
);

export default api;
