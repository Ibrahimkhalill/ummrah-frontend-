import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../authentication/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

const MessengerIcon = ({
	size = 40,
	navigation,
	screen_name,
	reciver_id,
	name,
	count,
}) => {
	console.log('reciver_id', reciver_id, count);

	const { token } = useAuth();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	const handleNavigate = async () => {
		if (token) {
			navigation.navigate(screen_name, { reciver_id, name });
		} else {
			await AsyncStorage.setItem('loginNavigation', screen_name);
			if (reciver_id) {
				await AsyncStorage.setItem('reciver_id', JSON.stringify(reciver_id));
			}
			if (name) {
				await AsyncStorage.setItem('name', name);
			}
			navigation.navigate('UserLogin');
		}
	};

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			justifyContent: 'center',
			alignItems: 'center',
			width: size,
			height: size,
		},
		iconContainer: {
			position: 'relative',
		},
		badge: {
			position: 'absolute',
			top: -5,
			right: -5,
			backgroundColor: 'red', // Keeping red for visibility, could use theme if desired
			borderRadius: 10,
			minWidth: 20,
			height: 20,
			justifyContent: 'center',
			alignItems: 'center',
			borderWidth: 1,
			borderColor: theme.background, // Matches background for contrast
		},
		badgeText: {
			color: '#fff',
			fontSize: 12,
			fontWeight: 'bold',
			textAlign: 'center',
		},
	});

	return (
		<TouchableOpacity
			onPress={() => handleNavigate()}
			style={themeStyles.container}>
			<View style={themeStyles.iconContainer}>
				<MaterialCommunityIcons
					name="facebook-messenger"
					size={size * 0.7}
					color={theme.text} // Use theme text color
				/>
				{count > 0 && (
					<View style={themeStyles.badge}>
						<Text style={themeStyles.badgeText}>
							{count > 99 ? '99+' : count}
						</Text>
					</View>
				)}
			</View>
		</TouchableOpacity>
	);
};

export default MessengerIcon;
