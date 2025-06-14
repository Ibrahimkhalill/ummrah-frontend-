import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
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
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../../component/axiosInstance';
import { useAuth } from '.././Auth';
import ErrorModal from '../../component/ErrorModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../component/BackButton';
import TermsAgreement from './TermsAgreement';
import Checkbox from 'expo-checkbox';

function GuideSignUp({ navigation }) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [aboutUs, setAboutUs] = useState('');
	const [guideCardNumber, setGuideCardNumber] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [errorVisible, setErrorVisible] = useState(false);
	const [error, setError] = useState('');
	const { login } = useAuth();
	const { height } = Dimensions.get('window');
	const [isChecked, setIsChecked] = useState(false);
	// State for fetched languages and their selection
	const [langMap, setLangMap] = useState({}); // { Arabic: 1, French: 3, English: 2 }
	const [languages, setLanguages] = useState({}); // { Arabic: false, French: false, English: false }

	const [errors, setErrors] = useState({
		name: '',
		email: '',
		phoneNumber: '',
		aboutUs: '',
		guideCardNumber: '',
		password: '',
	});

	// Email format validation
	const validateEmail = (email) => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};

	// Handle input changes with validation
	const handleNameChange = (text) => {
		setName(text);
		if (text === '') {
			setErrors((prev) => ({ ...prev, name: 'Name cannot be empty' }));
		} else {
			setErrors((prev) => ({ ...prev, name: '' }));
		}
	};

	const handleEmailChange = (text) => {
		setEmail(text);
		if (text === '') {
			setErrors((prev) => ({ ...prev, email: 'Email cannot be empty' }));
		} else if (!validateEmail(text)) {
			setErrors((prev) => ({
				...prev,
				email: 'Please enter a valid email address',
			}));
		} else {
			setErrors((prev) => ({ ...prev, email: '' }));
		}
	};

	const handlePhoneNumberChange = (text) => {
		setPhoneNumber(text);
		if (text && !/^\d+$/.test(text)) {
			setErrors((prev) => ({
				...prev,
				phoneNumber: 'Phone number must be numeric',
			}));
		} else {
			setErrors((prev) => ({ ...prev, phoneNumber: '' }));
		}
	};

	const handleAboutUsChange = (text) => {
		setAboutUs(text);
		if (text === '') {
			setErrors((prev) => ({ ...prev, aboutUs: 'About Us cannot be empty' }));
		} else {
			setErrors((prev) => ({ ...prev, aboutUs: '' }));
		}
	};

	const handleGuideCardNumberChange = (text) => {
		setGuideCardNumber(text);
		if (text && !/^\d+$/.test(text)) {
			setErrors((prev) => ({
				...prev,
				guideCardNumber: 'Card number must be numeric',
			}));
		} else {
			setErrors((prev) => ({ ...prev, guideCardNumber: '' }));
		}
	};

	const handlePasswordChange = (text) => {
		setPassword(text);
		if (text === '') {
			setErrors((prev) => ({ ...prev, password: 'Password cannot be empty' }));
		} else {
			setErrors((prev) => ({ ...prev, password: '' }));
		}
	};

	// Toggle language selection
	const toggleLanguage = (lang) => {
		setLanguages((prev) => ({ ...prev, [lang]: !prev[lang] }));
	};

	// Fetch languages from backend
	const handleFetchLanguage = async () => {
		try {
			const response = await axiosInstance.get('/auth/all-langauge/');
			const fetchedLangMap = response.data; // { Arabic: 1, French: 3, English: 2 }
			setLangMap(fetchedLangMap);
			console.log('Fetched langMap:', fetchedLangMap);

			// Initialize languages state dynamically
			const initialLanguages = Object.keys(fetchedLangMap).reduce(
				(acc, lang) => {
					acc[lang] = false;
					return acc;
				},
				{}
			);
			setLanguages(initialLanguages);
			console.log('Initialized languages:', initialLanguages);
		} catch (error) {
			console.error(
				'Error fetching languages:',
				error.response?.data || error.message
			);
			setErrorVisible(true);
			setError('Failed to fetch languages. Using default languages.');
			// Fallback to default languages if fetch fails
			const defaultLangMap = { Arabic: 2, French: 3, English: 1 };
			setLangMap(defaultLangMap);
			setLanguages({ Arabic: false, French: false, English: false });
		}
	};

	useEffect(() => {
		handleFetchLanguage();
	}, []);

	const handleGuideSignUp = async () => {
		let valid = true;
		const formErrors = {
			name: '',
			email: '',
			phoneNumber: '',
			aboutUs: '',
			guideCardNumber: '',
			password: '',
		};

		if (name === '') {
			formErrors.name = 'Name cannot be empty';
			valid = false;
		}
		if (email === '') {
			formErrors.email = 'Email cannot be empty';
			valid = false;
		} else if (!validateEmail(email)) {
			formErrors.email = 'Please enter a valid email address';
			valid = false;
		}
		if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
			formErrors.phoneNumber = 'Phone number must be numeric';
			valid = false;
		}
		if (aboutUs === '') {
			formErrors.aboutUs = 'About Us cannot be empty';
			valid = false;
		}
		if (guideCardNumber && !/^\d+$/.test(guideCardNumber)) {
			formErrors.guideCardNumber = 'Card number must be numeric';
			valid = false;
		}
		if (password === '') {
			formErrors.password = 'Password cannot be empty';
			valid = false;
		}
		if (!isChecked) {
			Alert.alert('Please accept the terms & privacy policy');
		}

		setErrors(formErrors);
		if (!valid) return;

		setIsLoading(true);

		// Prepare selected languages in the format { name: id }
		const selectedLanguages = Object.keys(languages)
			.filter((lang) => languages[lang])
			.reduce((acc, lang) => {
				acc[lang] = langMap[lang];
				return acc;
			}, {});
		console.log('Selected languages:', selectedLanguages);

		try {
			const response = await axiosInstance.post('/auth/register-guide/', {
				name: name,
				email: email,
				phone_number: phoneNumber,
				about_us: aboutUs,
				guide_card_number: guideCardNumber,
				password: password,
				languages: selectedLanguages, // Send as { Arabic: 1, French: 3, English: 2 }
			});
			console.log('Registration response:', response.data);

			if (response.status === 201) {
				Alert.alert('Registration Done Successfully');
				navigation.navigate('GuideLogin');
			}
		} catch (error) {
			if (error.response) {
				const serverErrors = error.response.data;
				setErrorVisible(true);
				setError(serverErrors.error || 'Guide registration failed');
			} else {
				setErrorVisible(true);
				setError('Network error. Please try again.');
			}
			console.log('error', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeAreaContainer}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardAvoidingContainer}>
				<ScrollView
					contentContainerStyle={styles.scrollViewContent}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					showsHorizontalScrollIndicator={false}>
					<View style={styles.container}>
						<View style={{ width: '100%', justifyContent: 'flex-start' }}>
							<BackButton navigation={navigation} />
						</View>
						<View style={styles.imageContainer}>
							<Text style={styles.title}>Guide Sign Up</Text>
						</View>

						{/* Name Input */}
						<View style={styles.inputContainer}>
							<View
								style={[
									styles.inputWrapper,
									errors.name ? styles.errorInputWrapper : null,
								]}>
								<TextInput
									style={styles.input}
									placeholderTextColor="#888888"
									placeholder="Enter Name"
									value={name}
									onChangeText={handleNameChange}
									autoCapitalize="words"
									accessibilityLabel="Name Input"
								/>
							</View>
							{errors.name ? (
								<Text style={styles.errorText}>{errors.name}</Text>
							) : null}
						</View>

						{/* Email Input */}
						<View style={styles.inputContainer}>
							<View
								style={[
									styles.inputWrapper,
									errors.email ? styles.errorInputWrapper : null,
								]}>
								<TextInput
									style={styles.input}
									placeholderTextColor="#888888"
									placeholder="Enter your email address"
									value={email}
									onChangeText={handleEmailChange}
									keyboardType="email-address"
									autoCapitalize="none"
									accessibilityLabel="Email Input"
								/>
							</View>
							{errors.email ? (
								<Text style={styles.errorText}>{errors.email}</Text>
							) : null}
						</View>

						{/* Phone Number Input */}
						<View style={styles.inputContainer}>
							<View
								style={[
									styles.inputWrapper,
									errors.phoneNumber ? styles.errorInputWrapper : null,
								]}>
								<TextInput
									style={styles.input}
									placeholderTextColor="#888888"
									placeholder="Enter phone number "
									value={phoneNumber}
									onChangeText={handlePhoneNumberChange}
									keyboardType="phone-pad"
									accessibilityLabel="Phone Number Input"
								/>
							</View>
							{errors.phoneNumber ? (
								<Text style={styles.errorText}>{errors.phoneNumber}</Text>
							) : null}
						</View>

						{/* About Us Input */}
						<View style={styles.inputContainer}>
							<View
								style={[
									styles.inputWrapper,
									errors.aboutUs ? styles.errorInputWrapper : null,
									{ height: 80 },
								]}>
								<TextInput
									style={[styles.input, { textAlignVertical: 'top' }]}
									placeholderTextColor="#888888"
									placeholder="Tell us about yourself"
									value={aboutUs}
									onChangeText={handleAboutUsChange}
									multiline
									numberOfLines={3}
									accessibilityLabel="About Us Input"
								/>
							</View>
							{errors.aboutUs ? (
								<Text style={styles.errorText}>{errors.aboutUs}</Text>
							) : null}
						</View>

						{/* Card Number Input */}
						<View style={styles.inputContainer}>
							<View
								style={[
									styles.inputWrapper,
									errors.guideCardNumber ? styles.errorInputWrapper : null,
								]}>
								<TextInput
									style={styles.input}
									placeholderTextColor="#888888"
									placeholder="Enter card number "
									value={guideCardNumber}
									onChangeText={handleGuideCardNumberChange}
									keyboardType="numeric"
									accessibilityLabel="Card Number Input"
								/>
							</View>
							{errors.guideCardNumber ? (
								<Text style={styles.errorText}>{errors.guideCardNumber}</Text>
							) : null}
						</View>

						{/* Password Input */}
						<View style={styles.inputContainer}>
							<View
								style={[
									styles.inputWrapper,
									errors.password ? styles.errorInputWrapper : null,
								]}>
								<TextInput
									style={styles.input}
									placeholderTextColor="#888888"
									placeholder="Enter your password"
									secureTextEntry={!passwordVisible}
									value={password}
									onChangeText={handlePasswordChange}
									autoCapitalize="none"
									accessibilityLabel="Password Input"
								/>
								<TouchableOpacity
									onPress={() => setPasswordVisible(!passwordVisible)}>
									<Icon
										name={passwordVisible ? 'eye' : 'eye-off'}
										size={20}
										color="#B5B5B5"
									/>
								</TouchableOpacity>
							</View>
							{errors.password ? (
								<Text style={styles.errorText}>{errors.password}</Text>
							) : null}
						</View>

						{/* Language Preferences */}
						<View style={styles.languageContainer}>
							<Text style={styles.languageLabel}>Language Preferences:</Text>
							<View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
								{Object.keys(languages).map((lang) => (
									<View key={lang} style={styles.checkboxContainer}>
										<Checkbox
											value={languages[lang]}
											onValueChange={() => toggleLanguage(lang)}
											color={languages[lang] ? '#C9A038' : undefined}
											style={styles.checkbox}
										/>
										<Text style={styles.checkboxLabel}>{lang}</Text>
									</View>
								))}
							</View>
						</View>

						{/* Terms Agreement */}
						<TermsAgreement
							navigation={navigation}
							isChecked={isChecked}
							setIsChecked={setIsChecked}
						/>

						{/* Sign Up Button */}
						<TouchableOpacity
							style={styles.loginButton}
							onPress={handleGuideSignUp}
							disabled={isLoading}>
							{isLoading ? (
								<ActivityIndicator size="small" color="#fff" />
							) : (
								<Text style={styles.loginButtonText}>Sign Up</Text>
							)}
						</TouchableOpacity>

						{/* Social Login Options */}
						{/* <Text style={styles.orText}>Or continue with</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
                <Ionicons name="logo-google" size={30} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome5 name="apple" size={30} color="#000" />
              </TouchableOpacity>
            </View> */}

						{/* Already Signed In */}
						<View style={styles.alreadySignInContainer}>
							<Text style={styles.alreadySignInText}>
								Do you have an account?
							</Text>
							<TouchableOpacity
								onPress={() => navigation.navigate('GuideLogin')}>
								<Text style={styles.link}>Sign In</Text>
							</TouchableOpacity>
						</View>

						{/* Error Modal */}
						<ErrorModal
							message={error}
							isVisible={errorVisible}
							onClose={() => setErrorVisible(false)}
						/>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	keyboardAvoidingContainer: {
		flex: 1,
	},
	scrollViewContent: {
		flexGrow: 1,
		paddingBottom: 20,
	},
	container: {
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingHorizontal: 20,
	},
	title: {
		fontSize: 30,
		fontWeight: 'bold',
		color: '#C9A038',
	},
	imageContainer: {
		paddingVertical: 40,
	},
	orText: {
		color: '#AAAAAA',
		marginBottom: 20,
		marginTop: 20,
	},
	socialButtons: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		width: '70%',
	},
	socialButton: {
		width: 60,
		height: 52,
		backgroundColor: '#F4F4F4',
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 8,
	},
	inputContainer: {
		width: '100%',
		marginBottom: 15,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderRadius: 12,
		borderColor: '#D1D5DB',
		height: 56,
	},
	errorInputWrapper: {
		borderColor: '#E91111',
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: '#333',
		paddingLeft: 10,
	},
	errorText: {
		fontSize: 12,
		color: '#E91111',
		marginTop: 5,
		marginLeft: 10,
	},
	loginButton: {
		width: '100%',
		height: 50,
		backgroundColor: '#C9A038',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 30,
		marginTop: 5,
	},
	loginButtonText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#fff',
	},
	alreadySignInContainer: {
		marginTop: 15,
		flexDirection: 'row',
		alignItems: 'center',
	},
	alreadySignInText: {
		fontSize: 14,
		color: '#777',
	},
	link: {
		fontSize: 14,
		color: '#C9A038',
		marginLeft: 5,
		textDecorationLine: 'underline',
	},
	languageContainer: {
		width: '100%',
		marginBottom: 15,
		paddingLeft: 10,
	},
	languageLabel: {
		fontSize: 16,
		fontWeight: '500',
		color: '#888888',
		marginBottom: 10,
	},
	checkboxContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		marginTop: 10,
	},
	checkbox: {
		marginRight: 10,
	},
	checkboxLabel: {
		fontSize: 16,
		color: '#333',
	},
});

export default GuideSignUp;
