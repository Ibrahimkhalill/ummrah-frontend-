import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Alert,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

import BackButton from '../component/BackButton';
import LogoutConfirmationModal from '../user/LogoutConfirmationModal';
import { Switch } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import react-i18next
import LanguageSelectionModal from '../component/LanguageSelectionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../component/axiosInstance';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext
import GuideNavigationBar from '../component/guide/GuideNavigationBar';

export default function GuideSettings({ navigation }) {
	const [isPetsAllowed, setIsPetsAllowed] = useState(false);
	const [languageModalVisible, setLanguageModalVisible] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to English
	const { t, i18n } = useTranslation(); // Initialize translation hooks
	const { theme, isDarkMode, toggleTheme } = useTheme(); // Use ThemeContext for dark/light mode

	// Load saved language from AsyncStorage when the component mounts
	useEffect(() => {
		const loadSavedLanguage = async () => {
			try {
				const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
				if (savedLanguage) {
					setSelectedLanguage(savedLanguage);
					await i18n.changeLanguage(savedLanguage); // Update i18n locale asynchronously
				}
			} catch (error) {
				console.error('Failed to load saved language:', error);
			}
		};
		loadSavedLanguage();
	}, []);

	const fetchProfile = async () => {
		try {
			const response = await axiosInstance.get('/auth/profile/');
			const data = response.data;
			console.log('profile settings', data);
			setIsPetsAllowed(data.guide_status);
		} catch (error) {
			console.log('Failed to load profile. Please try again.');
		}
	};

	// Save selected language to AsyncStorage and update i18n locale
	const handleSelectLanguage = async (languageCode) => {
		try {
			await AsyncStorage.setItem('selectedLanguage', languageCode);
			setSelectedLanguage(languageCode);
			await i18n.changeLanguage(languageCode); // Update the app's language using i18n
			console.log('Selected language saved and applied:', languageCode);
		} catch (error) {
			console.error('Failed to save language:', error);
		}
	};

	const handleUpdateProfile = async (value) => {
		setIsPetsAllowed(value);
		const formData = new FormData();
		formData.append('guide_status', value);
		try {
			const response = await axiosInstance.put('/auth/profile/', formData);
			console.log(response.data, response.status);
			if (response.status === 200) {
				fetchProfile();
				Alert.alert('Success', 'Your status updated successfully!');
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchProfile();
	}, []);

	// Handle dark/light mode toggle
	const handleToggleTheme = () => {
		toggleTheme(); // Toggle the theme using ThemeContext
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<ScrollView
				style={[styles.container, { backgroundColor: theme.background }]}>
				<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
					<Text style={[styles.title, { color: theme.text }]}>
						{t('settings')}
					</Text>
				</View>

				{/* Guide Settings Options */}
				<TouchableOpacity
					style={styles.optionRow}
					onPress={() => navigation.navigate('HelpSupport')}>
					<Text style={[styles.optionText, { color: theme.text }]}>
						{t('online')}
					</Text>
					<Switch value={isPetsAllowed} onValueChange={handleUpdateProfile} />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.optionRow}
					onPress={() => navigation.navigate('GuideOwnProfile')}>
					<Ionicons name="person-outline" size={20} color={theme.text} />
					<Text style={[styles.optionText, { color: theme.text }]}>
						{t('profile')}
					</Text>
					<Ionicons
						name="chevron-forward-outline"
						size={20}
						color={theme.text}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.optionRow}
					onPress={() => navigation.navigate('GuideCalendar')}>
					<FontAwesome name="calendar" size={18} color={theme.text} />
					<Text style={[styles.optionText, { color: theme.text }]}>
						{t('calender')}
					</Text>
					<Ionicons
						name="chevron-forward-outline"
						size={20}
						color={theme.text}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.optionRow}
					onPress={() => setLanguageModalVisible(true)}>
					<Ionicons name="language" size={20} color={theme.text} />
					<Text style={[styles.optionText, { color: theme.text }]}>
						{t('language')}
					</Text>
					<Ionicons
						name="chevron-forward-outline"
						size={20}
						color={theme.text}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.optionRow}
					onPress={() => navigation.navigate('HelpSupport')}>
					<Ionicons name="headset-outline" size={20} color={theme.text} />
					<Text style={[styles.optionText, { color: theme.text }]}>
						{t('helpSupport')}
					</Text>
					<Ionicons
						name="chevron-forward-outline"
						size={20}
						color={theme.text}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.optionRow}
					onPress={() => navigation.navigate('PrivacyPolicy')}>
					<Ionicons name="lock-closed-outline" size={20} color={theme.text} />
					<Text style={[styles.optionText, { color: theme.text }]}>
						{t('privacySecurity')}
					</Text>
					<Ionicons
						name="chevron-forward-outline"
						size={20}
						color={theme.text}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.optionRow}
					onPress={() => navigation.navigate('TermsAndCondition')}>
					<Ionicons name="document-text-outline" size={20} color={theme.text} />
					<Text style={[styles.optionText, { color: theme.text }]}>
						{t('termsCondition')}
					</Text>
					<Ionicons
						name="chevron-forward-outline"
						size={20}
						color={theme.text}
					/>
				</TouchableOpacity>

				{/* Dark/Light Mode Toggle */}
				<View style={styles.optionRow}>
					<Ionicons name="moon-outline" size={20} color={theme.text} />
					<Text style={[styles.optionText, { color: theme.text }]}>
						{isDarkMode ? t('darkMode') : t('lightMode')}
					</Text>
					<Switch
						value={isDarkMode}
						onValueChange={handleToggleTheme}
						trackColor={{ false: '#767577', true: '#81b0ff' }}
						thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
					/>
				</View>

				{/* Logout Button */}
				<LogoutConfirmationModal navigation={navigation} />
			</ScrollView>
			{/* Language Selection Modal */}
			<LanguageSelectionModal
				visible={languageModalVisible}
				onClose={() => setLanguageModalVisible(false)}
				onSelectLanguage={handleSelectLanguage}
				currentLanguage={selectedLanguage}
			/>
			<GuideNavigationBar navigation={navigation} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff', padding: 20 },
	backButton: { marginBottom: 10 },
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#C9A038',
		textAlign: 'center',
		marginBottom: 20,
	},
	optionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 15,
	},
	optionText: { fontSize: 16, flex: 1, marginLeft: 10 },
	logoutRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 20,
	},
	logoutText: { fontSize: 16, color: 'red', flex: 1, marginLeft: 10 },
});

// export default GuideSettings;
