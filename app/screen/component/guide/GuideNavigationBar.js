import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import {
	SafeAreaProvider,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useTheme } from '../hook/ThemeContext';

export default function GuideNavigationBar({ navigation }) {
	const insets = useSafeAreaInsets(); // Get safe area insets dynamically
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme();
	return (
		<View>
			<View
				style={[
					styles.navBar,
					{ backgroundColor: isDarkMode ? '#333' : '#fff' },
				]}>
				<TouchableOpacity
					style={{ alignItems: 'center' }}
					onPress={() => navigation.navigate('GuideHome')}>
					<Ionicons name="home" size={24} color="#C9A038" />
					<Text style={styles.navText}>{t('home')}</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={{ alignItems: 'center' }}
					onPress={() => navigation.navigate('InboxScreen')}>
					<Ionicons name="chatbubble-outline" size={24} color="#C9A038" />
					<Text style={styles.navText}>{t('messages')}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={{ alignItems: 'center' }}
					onPress={() => navigation.navigate('LocationList')}>
					<Ionicons name="location" size={24} color="#C9A038" />
					<Text style={styles.navText}>{t('location')}</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={{ alignItems: 'center' }}
					onPress={() => navigation.navigate('GuideSettings')}>
					<Entypo name="dots-three-horizontal" size={24} color="#C9A038" />
					<Text style={styles.navText}>{t('plus')}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	navBar: {
		width: '100%',
		height: 80, // Fixed height for the navigation bar
		backgroundColor: '#C9A038',
		flexDirection: 'row', // To align icons horizontally
		justifyContent: 'space-around', // Space out the icons evenly
		alignItems: 'center', // Center the icons vertically
		position: 'absolute',
		bottom: 0,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5, // For Android shadow
	},
	icon: {
		width: 20,
		height: 20,
		resizeMode: 'contain',
	},
	navText: {
		color: '#C9A038',
		fontSize: 12,
		marginTop: 5,
	},
});
