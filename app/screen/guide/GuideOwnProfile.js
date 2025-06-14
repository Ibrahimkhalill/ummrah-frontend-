import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
	Text,
	View,
	TextInput,
	TouchableOpacity,
	Platform,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
	Dimensions,
	KeyboardAvoidingView,
	Image,
	Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../component/axiosInstance';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import BackButton from '../component/BackButton';
import Checkbox from 'expo-checkbox';
import ErrorModal from '../component/ErrorModal';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

const { height } = Dimensions.get('window');

function GuideOwnProfile({ navigation }) {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [isLoading, setIsLoading] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [error, setError] = useState('');
	const [errorVisible, setErrorVisible] = useState(false);

	// Profile state
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [aboutUs, setAboutUs] = useState('');
	const [guideCardNumber, setGuideCardNumber] = useState('');
	const [address, setAddress] = useState('');
	const [imageUri, setImageUri] = useState(null);
	const [languages, setLanguages] = useState({
		Arabic: false,
		French: false,
		English: false,
	});

	const [mimType, setMimType] = useState('');

	// Fetch profile data on mount
	useEffect(() => {
		const fetchProfile = async () => {
			setIsLoading(true);
			try {
				const response = await axiosInstance.get('/auth/profile/');
				const data = response.data;

				setName(data.name || '');
				setEmail(data.user.email || '');
				setPhoneNumber(data.phone_number || '');
				setAboutUs(data.about_us || '');
				setGuideCardNumber(data.guide_card_number || '');
				setAddress(data.address || '');
				setImageUri(data.image || null);

				// Set languages based on backend data (String values instead of IDs)
				const updatedLanguages = {
					Arabic: false,
					French: false,
					English: false,
				};
				(data.languages || []).forEach((langName) => {
					if (updatedLanguages.hasOwnProperty(langName)) {
						updatedLanguages[langName] = true;
					}
				});

				setLanguages(updatedLanguages);
			} catch (error) {
				setErrorVisible(true);
				setError('Failed to load profile. Please try again.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, []);

	// Toggle language selection
	const toggleLanguage = (lang) => {
		if (isEdit) {
			setLanguages((prev) => ({ ...prev, [lang]: !prev[lang] }));
		}
	};

	// Pick image from gallery
	const pickImage = async () => {
		if (!isEdit) return;
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert(
				'Permission denied',
				'We need camera roll permissions to upload an image.'
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			setMimType(result.assets[0].mimeType);
			setImageUri(result.assets[0].uri);
		}
	};

	// Handle profile update
	const handleUpdateProfile = async () => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append('name', name);
		formData.append('phone_number', phoneNumber);
		formData.append('about_us', aboutUs);
		formData.append('guide_card_number', guideCardNumber);
		formData.append('address', address);

		const selectedLanguages = Object.keys(languages).filter(
			(lang) => languages[lang]
		);
		selectedLanguages.forEach((lang) => {
			formData.append('languages', lang); // Send each language separately
		});

		if (imageUri && imageUri.startsWith('file://')) {
			formData.append('image', {
				uri: imageUri,
				type: mimType,
				name: 'profile.jpg',
			});
		}

		console.log('formdata', formData);

		try {
			const response = await axiosInstance.put('/auth/profile/', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			console.log(response.data, response.status);

			if (response.status === 200) {
				setIsEdit(false);
				Alert.alert('Success', 'Profile updated successfully!');
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.background }]}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardAvoidingContainer}>
				<ScrollView contentContainerStyle={styles.scrollViewContent}>
					<View style={styles.innerContainer}>
						{/* Header */}
						<View style={styles.header}>
							<BackButton navigation={navigation} />
							<Text style={[styles.title, { color: theme.text }]}>
								{t('editProfile')}
							</Text>
							<TouchableOpacity onPress={() => setIsEdit(!isEdit)}>
								<Ionicons
									name={isEdit ? 'checkmark' : 'pencil'}
									size={24}
									color={theme.text}
								/>
							</TouchableOpacity>
						</View>

						{/* Profile Image */}
						<View style={styles.profileImageContainer}>
							<Image
								source={{
									uri:
										imageUri ||
										'https://i.pinimg.com/474x/25/b9/c9/25b9c99d1a7f5bcc86d09ee85d82ee02.jpg',
								}}
								style={styles.profileImage}
							/>
							{isEdit && (
								<TouchableOpacity style={styles.editIcon} onPress={pickImage}>
									<Ionicons name="camera" size={20} color="#fff" />
								</TouchableOpacity>
							)}
						</View>

						{/* Input Fields */}
						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('name')}
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: isDarkMode ? '#444' : '#F5F5F5',
										color: theme.text,
									},
								]}
								value={name}
								onChangeText={setName}
								editable={isEdit}
								placeholder={t('name')}
								placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
							/>
						</View>

						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('email')}
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: isDarkMode ? '#444' : '#F5F5F5',
										color: theme.text,
									},
								]}
								value={email}
								editable={false} // Email is read-only
								placeholder={t('email')}
								placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
							/>
						</View>

						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('cell')}
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: isDarkMode ? '#444' : '#F5F5F5',
										color: theme.text,
									},
								]}
								value={phoneNumber}
								onChangeText={setPhoneNumber}
								editable={isEdit}
								keyboardType="phone-pad"
								placeholder={t('cell')}
								placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
							/>
						</View>

						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('aboutUs')}
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										height: 100,
										textAlignVertical: 'top',
										backgroundColor: isDarkMode ? '#444' : '#F5F5F5',
										color: theme.text,
									},
								]}
								value={aboutUs}
								onChangeText={setAboutUs}
								editable={isEdit}
								multiline
								numberOfLines={4}
								placeholder={t('aboutUs')}
								placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
							/>
						</View>

						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('address')}
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: isDarkMode ? '#444' : '#F5F5F5',
										color: theme.text,
									},
								]}
								value={address}
								onChangeText={setAddress}
								editable={isEdit}
								placeholder={t('address')}
								placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
							/>
						</View>

						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('card')}
							</Text>
							<TextInput
								style={[
									styles.input,
									{
										backgroundColor: isDarkMode ? '#444' : '#F5F5F5',
										color: theme.text,
									},
								]}
								value={guideCardNumber}
								onChangeText={setGuideCardNumber}
								editable={isEdit}
								keyboardType="numeric"
								placeholder={t('card')}
								placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
							/>
						</View>

						{/* Language Preferences */}
						<View style={styles.languageContainer}>
							<Text style={[styles.languageLabel, { color: theme.text }]}>
								{t('languagePreferences')}
							</Text>
							<View style={{ flexDirection: 'row', gap: 10 }}>
								<View style={styles.checkboxContainer}>
									<Checkbox
										value={languages.Arabic}
										onValueChange={() => toggleLanguage('Arabic')}
										color={languages.Arabic ? '#C9A038' : undefined}
										style={styles.checkbox}
										disabled={!isEdit}
									/>
									<Text style={[styles.checkboxLabel, { color: theme.text }]}>
										Arabic
									</Text>
								</View>
								<View style={styles.checkboxContainer}>
									<Checkbox
										value={languages.French}
										onValueChange={() => toggleLanguage('French')}
										color={languages.French ? '#C9A038' : undefined}
										style={styles.checkbox}
										disabled={!isEdit}
									/>
									<Text style={[styles.checkboxLabel, { color: theme.text }]}>
										French
									</Text>
								</View>
								<View style={styles.checkboxContainer}>
									<Checkbox
										value={languages.English}
										onValueChange={() => toggleLanguage('English')}
										color={languages.English ? '#C9A038' : undefined}
										style={styles.checkbox}
										disabled={!isEdit}
									/>
									<Text style={[styles.checkboxLabel, { color: theme.text }]}>
										English
									</Text>
								</View>
							</View>
						</View>

						{/* Save Button (visible only in edit mode) */}
						{isEdit && (
							<TouchableOpacity
								style={styles.saveButton}
								onPress={handleUpdateProfile}
								disabled={isLoading}>
								{isLoading ? (
									<ActivityIndicator size="small" color="#fff" />
								) : (
									<Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
								)}
							</TouchableOpacity>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

			{/* Error Modal */}
			<ErrorModal
				message={error}
				isVisible={errorVisible}
				onClose={() => setErrorVisible(false)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	keyboardAvoidingContainer: { flex: 1 },
	scrollViewContent: { flexGrow: 1, paddingBottom: 20 },
	innerContainer: {
		paddingHorizontal: 20,
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#C9A038',
		textAlign: 'center',
	},
	profileImageContainer: {
		alignItems: 'center',
		marginBottom: 20,
		position: 'relative',
	},
	profileImage: { width: 100, height: 100, borderRadius: 50 },
	editIcon: {
		position: 'absolute',
		bottom: 0,
		right: '0%',
		backgroundColor: '#C9A038',
		padding: 6,
		borderRadius: 20,
	},
	inputContainer: { width: '100%', marginBottom: 15 },
	label: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 5,
	},
	input: {
		backgroundColor: '#F5F5F5',
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 12,
		fontSize: 16,
	},
	saveButton: {
		backgroundColor: '#C9A038',
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		width: '100%',
		marginTop: 20,
	},
	saveButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	languageContainer: {
		width: '100%',
		marginBottom: 15,
	},
	languageLabel: {
		fontSize: 16,
		fontWeight: '500',
		color: '#000',
		marginBottom: 10,
	},
	checkboxContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	checkbox: {
		marginRight: 10,
	},
	checkboxLabel: {
		fontSize: 16,
		color: '#333',
	},
});

export default GuideOwnProfile;
