import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../authentication/Auth';
import { useTheme } from './hook/ThemeContext';
import axiosInstance from './axiosInstance';

export default function NavigationBar({ navigation, count }) {
	const insets = useSafeAreaInsets(); // Get safe area insets dynamically
	const { t } = useTranslation(); // Use translation hook
	const { token } = useAuth(); // Get authentication token
	const { theme, isDarkMode } = useTheme();

	const [countNotification, setCountNotification] = useState(0); // Fixed initial count value

	const fetchChatCountUnread = async () => {
		try {
			const response = await axiosInstance.get('/chat/count/unread/');
			const data = response.data;
			console.log('guideId', data);
			setCountNotification(data.total_unread);
		} catch (error) {
			setError('Failed to load profile. Please try again.');
		}
	};

	useEffect(() => {
		fetchChatCountUnread();
	}, []);

	// Handle navigation with authentication check
	const handleCheckAuth = (value) => {
		if (token) {
			if (value === 'InboxScreen') {
				navigation.navigate('InboxScreen');
			} else {
				navigation.navigate('YourGuidePage');
			}
		} else {
			console.log('Navigating to UserLogin, token:', token);
			navigation.navigate('UserLogin');
		}
	};

	const styles = StyleSheet.create({
		navBar: {
			width: '100%',
			flexDirection: 'row',
			paddingVertical: 5,
			justifyContent: 'space-around',
			alignItems: 'center',
			position: 'absolute',
			bottom: 0,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: -2 },
			shadowOpacity: 0.2,
			shadowRadius: 4,
			elevation: 5, // For Android shadow
		},
		badge: {
			position: 'absolute',
			top: 5,
			right: 30,
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
		navItem: {
			alignItems: 'center',
			justifyContent: 'center',
			flex: 1,
			paddingVertical: 10,
		},
		navText: {
			fontSize: 12,
			marginTop: 5,
			fontWeight: '500',
		},
	});

	return (
		<View
			style={[
				styles.navBar,
				{ backgroundColor: isDarkMode ? '#333' : '#fff' },
			]}>
			<TouchableOpacity
				style={styles.navItem}
				onPress={() => navigation.navigate('UserHome')}>
				<Ionicons
					name="home-outline"
					size={24}
					color={
						navigation.getState().routes[navigation.getState().index].name ===
						'UserHome'
							? '#C9A038'
							: '#C9A038'
					}
				/>
				<Text
					style={[
						styles.navText,
						{
							color:
								navigation.getState().routes[navigation.getState().index]
									.name === 'UserHome'
									? '#C9A038'
									: '#C9A038',
						},
					]}>
					{t('home')}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.navItem}
				onPress={() => handleCheckAuth('YourGuidePage')}>
				<Ionicons
					name="compass-outline"
					size={24}
					color={
						navigation.getState().routes[navigation.getState().index].name ===
						'YourGuidePage'
							? '#C9A038'
							: '#C9A038'
					}
				/>
				<Text
					style={[
						styles.navText,
						{
							color:
								navigation.getState().routes[navigation.getState().index]
									.name === 'YourGuidePage'
									? '#C9A038'
									: '#C9A038',
						},
					]}>
					{t('yourGuide')}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.navItem, { position: 'relative' }]}
				onPress={() => handleCheckAuth('InboxScreen')}>
				<Ionicons
					name="chatbubble-outline"
					size={24}
					color={
						navigation.getState().routes[navigation.getState().index].name ===
						'Settings'
							? '#C9A038'
							: '#C9A038'
					}
				/>
				<Text
					style={[
						styles.navText,
						{
							color:
								navigation.getState().routes[navigation.getState().index]
									.name === 'Settings'
									? '#C9A038'
									: '#C9A038',
						},
					]}>
					{t('messages')}
				</Text>
				{count ||
					(countNotification > 0 && (
						<View style={styles.badge}>
							<Text style={styles.badgeText}>
								{count || countNotification > 99
									? '99+'
									: countNotification || count}
							</Text>
						</View>
					))}
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.navItem}
				onPress={() => navigation.navigate('Settings')}>
				<Entypo
					name="dots-three-horizontal"
					size={24}
					color={
						navigation.getState().routes[navigation.getState().index].name ===
						'plus'
							? '#C9A038'
							: '#C9A038'
					}
				/>
				<Text
					style={[
						styles.navText,
						{
							color:
								navigation.getState().routes[navigation.getState().index]
									.name === 'Settings'
									? '#C9A038'
									: '#C9A038',
						},
					]}>
					{t('plus')}
				</Text>
			</TouchableOpacity>
		</View>
	);
}
