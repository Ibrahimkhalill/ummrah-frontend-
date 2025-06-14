// ThemeContext.js
import React, { createContext, useState, useContext } from 'react';

// Create Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
	const [isDarkMode, setIsDarkMode] = useState(false);

	// Theme styles
	const theme = {
		dark: {
			background: '#1a1a1a',
			text: '#ffffff',
			secondaryText: '#b3b3b3',
		},
		light: {
			background: '#ffffff',
			text: '#000000',
			secondaryText: '#666666',
		},
	};

	// Toggle theme function
	const toggleTheme = () => {
		setIsDarkMode((prevMode) => !prevMode);
	};

	// Current theme based on isDarkMode state
	const currentTheme = isDarkMode ? theme.dark : theme.light;

	return (
		<ThemeContext.Provider
			value={{
				isDarkMode,
				toggleTheme,
				theme: currentTheme,
			}}>
			{children}
		</ThemeContext.Provider>
	);
};

// Custom hook to use theme context
export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
