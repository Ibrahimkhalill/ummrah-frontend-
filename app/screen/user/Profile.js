import React, { useEffect, useState } from 'react';
import {
	Text,
	View,
	TextInput,
	ToastAndroid,
	TouchableOpacity,
	Platform,
	ActivityIndicator,
	Alert,
	StyleSheet,
	Image,
	ScrollView,
	Dimensions,
	KeyboardAvoidingView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../component/axiosInstance';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import BackButton from '../component/BackButton';
import ErrorModal from '../component/ErrorModal';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

const { height } = Dimensions.get('window');

function Profile({ navigation }) {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [isLoading, setIsLoading] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [errorVisible, setErrorVisible] = useState(false);
	const [error, setError] = useState('');
	const [mimType, setMimType] = useState('');

	// Profile state
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [address, setAddress] = useState('');
	const [imageUri, setImageUri] = useState(null);

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
				setAddress(data.address || '');
				setImageUri(data.image || null);
			} catch (error) {
				setErrorVisible(true);
				setError('Failed to load profile. Please try again.');
			} finally {
				setIsLoading(false);
			}
		};
		fetchProfile();
	}, []);

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
		console.log('esult.assets[0]', result.assets[0]);
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
		formData.append('address', address);

		if (imageUri && imageUri.startsWith('file://')) {
			formData.append('image', {
				uri: imageUri,
				type: mimType,
				name: 'profile.jpg',
			});
		}

		console.log('formData', formData);

		try {
			const response = await axiosInstance.put('/auth/profile/', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});

			if (response.status === 200) {
				Alert.alert('Success', 'Profile updated successfully!');
				setIsEdit(false);
			}
		} catch (error) {
			console.log('error', error);
			setErrorVisible(true);
			setError(error.response?.data?.error || 'Failed to update profile.');
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading && !isEdit) {
		return (
			<View
				style={[styles.loaderContainer, { backgroundColor: theme.background }]}>
				<ActivityIndicator size="large" color="#C9A038" />
			</View>
		);
	}

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.background }]}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardAvoidingContainer}>
				<ScrollView
					contentContainerStyle={styles.scrollViewContent}
					keyboardShouldPersistTaps="handled">
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
									color="#C9A038"
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
										color: theme.text,
										backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
									},
								]}
								value={name}
								onChangeText={setName}
								editable={isEdit}
								placeholder={t('name')}
								placeholderTextColor={isDarkMode ? '#888' : '#888888'}
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
										color: theme.text,
										backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
									},
								]}
								value={email}
								editable={false} // Email is read-only
								placeholder={t('email')}
								placeholderTextColor={isDarkMode ? '#888' : '#888888'}
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
										color: theme.text,
										backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
									},
								]}
								value={phoneNumber}
								onChangeText={setPhoneNumber}
								editable={isEdit}
								keyboardType="phone-pad"
								placeholder={t('cell')}
								placeholderTextColor={isDarkMode ? '#888' : '#888888'}
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
										color: theme.text,
										backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
									},
								]}
								value={address}
								onChangeText={setAddress}
								editable={isEdit}
								placeholder={t('address')}
								placeholderTextColor={isDarkMode ? '#888' : '#888888'}
							/>
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
		borderWidth: 1,
		borderRadius: 50,
		borderColor: '#ddd',
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
	saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	loaderContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
});

export default Profile;
