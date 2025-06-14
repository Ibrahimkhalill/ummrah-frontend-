import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
} from 'react-native';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../component/BackButton';
import LogoutConfirmationModal from './LogoutConfirmationModal';
import LanguageSelectionModal from '../component/LanguageSelectionModal';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../authentication/Auth';
import { useTheme } from '../component/hook/ThemeContext'; // Import theme context
import NavigationBar from '../component/NavigationBar';
export default function Settings({ navigation }) {
	const [languageModalVisible, setLanguageModalVisible] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState('en');
	const { t, i18n } = useTranslation();
	const { token } = useAuth();
	const { isDarkMode, toggleTheme, theme } = useTheme(); // Use theme context

	// Load saved language and theme preference
	useEffect(() => {
		const loadPreferences = async () => {
			try {
				const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
				if (savedLanguage) {
					setSelectedLanguage(savedLanguage);
					await i18n.changeLanguage(savedLanguage);
				}
			} catch (error) {
				console.error('Failed to load preferences:', error);
			}
		};
		loadPreferences();
	}, []);

	// Handle language selection
	const handleSelectLanguage = async (languageCode) => {
		try {
			await AsyncStorage.setItem('selectedLanguage', languageCode);
			setSelectedLanguage(languageCode);
			await i18n.changeLanguage(languageCode);
		} catch (error) {
			console.error('Failed to save language:', error);
		}
	};

	// Dynamic styles using theme from context
	const themeStyles = {
		container: {
			...styles.container,
			backgroundColor: theme.background,
		},
		title: {
			...styles.title,
			color: isDarkMode ? theme.text : '#C9A038',
		},
		optionText: {
			...styles.optionText,
			color: theme.text,
		},
		optionRow: {
			...styles.optionRow,
			borderBottomColor: isDarkMode ? '#333' : '#ddd',
			borderBottomWidth: 1,
		},
	};
	const handleCheckAuth = (value) => {
		if (token) {
			if (value === 'Profile') {
				navigation.navigate('Profile');
			}
		} else {
			console.log('Navigating to UserLogin, token:', token);
			navigation.navigate('UserLogin');
		}
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<View style={{ flex: 1 }}>
				<ScrollView style={themeStyles.container}>
					<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
						<Text style={themeStyles.title}>{t('settings')}</Text>
					</View>
					<TouchableOpacity
						style={themeStyles.optionRow}
						onPress={() => handleCheckAuth('Profile')}>
						<Ionicons name="person-outline" size={20} color={theme.text} />
						<Text style={themeStyles.optionText}>{t('profile')}</Text>
						<Ionicons
							name="chevron-forward-outline"
							size={20}
							color={theme.text}
						/>
					</TouchableOpacity>
					{/* Theme Toggle Option */}
					<TouchableOpacity style={themeStyles.optionRow} onPress={toggleTheme}>
						<Ionicons
							name={isDarkMode ? 'moon' : 'sunny'}
							size={20}
							color={theme.text}
						/>
						<Text style={themeStyles.optionText}>
							{isDarkMode ? t('darkMode') : t('lightMode')}
						</Text>
						<Ionicons
							name="chevron-forward-outline"
							size={20}
							color={theme.text}
						/>
					</TouchableOpacity>

					{/* Other Settings Options */}
					<TouchableOpacity
						style={themeStyles.optionRow}
						onPress={() => navigation.navigate('HelpSupport')}>
						<Ionicons name="headset-outline" size={20} color={theme.text} />
						<Text style={themeStyles.optionText}>{t('helpSupport')}</Text>
						<Ionicons
							name="chevron-forward-outline"
							size={20}
							color={theme.text}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={themeStyles.optionRow}
						onPress={() => setLanguageModalVisible(true)}>
						<Ionicons name="language" size={20} color={theme.text} />
						<Text style={themeStyles.optionText}>{t('language')}</Text>
						<Ionicons
							name="chevron-forward-outline"
							size={20}
							color={theme.text}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={themeStyles.optionRow}
						onPress={() => navigation.navigate('PrivacyPolicy')}>
						<Ionicons name="lock-closed-outline" size={20} color={theme.text} />
						<Text style={themeStyles.optionText}>{t('privacySecurity')}</Text>
						<Ionicons
							name="chevron-forward-outline"
							size={20}
							color={theme.text}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={themeStyles.optionRow}
						onPress={() => navigation.navigate('TermsAndCondition')}>
						<Ionicons
							name="document-text-outline"
							size={20}
							color={theme.text}
						/>
						<Text style={themeStyles.optionText}>{t('termsCondition')}</Text>
						<Ionicons
							name="chevron-forward-outline"
							size={20}
							color={theme.text}
						/>
					</TouchableOpacity>

					{/* Logout/Login Button */}
					{token ? (
						<LogoutConfirmationModal navigation={navigation} />
					) : (
						<TouchableOpacity
							style={themeStyles.optionRow}
							onPress={() => navigation.navigate('UserLogin')}>
							<SimpleLineIcons name="login" size={20} color={theme.text} />
							<Text style={themeStyles.optionText}>{t('login')}</Text>
							<Ionicons
								name="chevron-forward-outline"
								size={20}
								color={theme.text}
							/>
						</TouchableOpacity>
					)}
				</ScrollView>
				<NavigationBar navigation={navigation} />
			</View>

			{/* Language Selection Modal */}
			<LanguageSelectionModal
				visible={languageModalVisible}
				onClose={() => setLanguageModalVisible(false)}
				onSelectLanguage={handleSelectLanguage}
				currentLanguage={selectedLanguage}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20 },
	backButton: { marginBottom: 10 },
	title: {
		fontSize: 24,
		fontWeight: 'bold',
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
