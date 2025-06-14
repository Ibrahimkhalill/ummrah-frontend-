import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from './hook/ThemeContext';

const BackButton = ({ navigation }) => {
	const { theme, isDarkMode } = useTheme(); // Get theme from context

	// Dynamic styles using theme
	const themeStyles = StyleSheet.create({
		container: {
			width: 25,
			height: 25,
			borderRadius: 10,
			backgroundColor: 'transparent',
			borderWidth: 1,
			borderColor: isDarkMode ? theme.secondaryText : '#ccc',
			justifyContent: 'center',
			alignItems: 'center',
		},
	});

	return (
		<TouchableOpacity
			style={themeStyles.container}
			onPress={() => navigation.goBack()}>
			<Icon
				name="chevron-back"
				size={21}
				color={theme.text} // Use theme text color
			/>
		</TouchableOpacity>
	);
};

export default BackButton;
