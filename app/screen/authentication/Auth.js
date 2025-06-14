import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
	const [isLoggedIn, setLoggedIn] = useState(false);
	const [token, setToken] = useState(null);
	const [role, setRole] = useState('');

	useEffect(() => {
		const checkAuthentication = async () => {
			const refresh_token = await AsyncStorage.getItem('refresh_token');

			const storedToken = await AsyncStorage.getItem('token');
			const role = await AsyncStorage.getItem('role');

			if (refresh_token && storedToken) {
				setLoggedIn(true);
				setToken(storedToken);
				setRole(role);
			}
		};
		checkAuthentication();
	}, []);

	const login = async (token, refresh_token, role, id) => {
		await AsyncStorage.setItem('refresh_token', refresh_token);

		await AsyncStorage.setItem('token', token); // Save token
		await AsyncStorage.setItem('role', role); // Save token
		await AsyncStorage.setItem('sender_id', JSON.stringify(id)); // Save token

		setLoggedIn(true);
		setToken(token); // Update state with the token
		setRole(role);
	};

	const logout = async () => {
		await AsyncStorage.removeItem('refresh_token');
		await AsyncStorage.removeItem('token'); // Remove token on logout
		await AsyncStorage.removeItem('role'); // Save token
		await AsyncStorage.removeItem('sender_id'); // Save token

		setRole(null);
		setLoggedIn(false);
		setToken(null); // Clear token
	};

	return (
		<AuthContext.Provider value={{ isLoggedIn, token, login, logout, role }}>
			{children}
		</AuthContext.Provider>
	);
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
