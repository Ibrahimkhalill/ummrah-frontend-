import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosRetry from 'axios-retry';

// Create axios instance
const axiosInstance = axios.create({
	baseURL: 'https://nusukey.duckdns.org/api',
});

axiosInstance.interceptors.request.use(
	async (config) => {
		const token = await AsyncStorage.getItem('token'); // Standardize on 'access_token'

		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}

		console.log('Request:', config); // Log the full request for debugging
		return config;
	},
	(error) => Promise.reject(error)
);

// Configure axios-retry
axiosRetry(axiosInstance, {
	retries: Infinity, // Retry indefinitely until success
	retryDelay: (retryCount) => {
		// Exponential backoff: 1s, 2s, 4s, 8s, etc., capped at 10s
		const delay = Math.min(Math.pow(2, retryCount) * 1000, 10000);
		console.log(`Retry attempt #${retryCount} after ${delay}ms delay`);
		return delay;
	},
	retryCondition: (error) => {
		// Retry on network errors or specific status codes
		const isNetworkError = !error.response; // No response means network error (e.g., offline, timeout)
		const isTimeout = error.code === 'ECONNABORTED'; // Timeout error
		const isRetryableStatus =
			error.response && [503, 504].includes(error.response.status); // Retry on 503 (Service Unavailable) or 504 (Gateway Timeout)

		if (isNetworkError || isTimeout || isRetryableStatus) {
			console.log(
				'Retrying due to network error or retryable status:',
				error.message
			);
			return true;
		}
		return false; // Don't retry for other errors (e.g., 400, 401, 404)
	},
	shouldResetTimeout: true, // Reset timeout for each retry
});

// Function to refresh access token using the refresh token
const refreshAccessToken = async () => {
	try {
		const refreshToken = await AsyncStorage.getItem('refresh_token');
		if (!refreshToken) {
			throw new Error('No refresh token found');
		}

		const response = await axios.get(
			'https://nusukey.duckdns.org/api/auth/refresh-token',
			{
				params: {
					refresh_token: refreshToken,
				},
			}
		);

		const { access_token } = response.data;
		await AsyncStorage.setItem('token', access_token); // Standardize on 'access_token'

		return access_token;
	} catch (error) {
		console.error('Error refreshing access token:', error);
		throw new Error('Failed to refresh access token');
	}
};

// Attach token to requests (removed redundant interceptor)

// Handle 401 errors and token refresh
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Skip retry for token refresh requests to avoid infinite loops
		if (error.config.url.includes('/auth/refresh-token')) {
			return Promise.reject(error);
		}

		// Handle 401 errors with token refresh
		if (
			error.response &&
			error.response.status === 401 &&
			!originalRequest._retry
		) {
			originalRequest._retry = true;
			const token = await AsyncStorage.getItem('token');
			if (token) {
				const newToken = await refreshAccessToken();
				if (newToken) {
					originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
					return axiosInstance(originalRequest);
				}
			}
		}

		return Promise.reject(error);
	}
);

export default axiosInstance;
