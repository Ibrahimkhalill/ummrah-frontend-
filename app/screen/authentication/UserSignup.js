import React, { useState } from 'react';
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
	ScrollView,
	Dimensions,
	KeyboardAvoidingView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../component/axiosInstance';
import { useAuth } from './Auth';
import ErrorModal from '../component/ErrorModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../assets/logo.svg';
import { useTheme } from '../component/hook/ThemeContext';
import BackButton from '../component/BackButton';
import TermsAgreement from './guide/TermsAgreement';

const { height } = Dimensions.get('window');

function UserSignup({ navigation }) {
	const { theme, isDarkMode } = useTheme();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [gender, setGender] = useState(''); // New state for gender
	const [hasMahram, setHasMahram] = useState(null); // New state for mahram question (Yes/No)
	const [isLoading, setIsLoading] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [isChecked, setIsChecked] = useState(false);
	const [errorVisible, setErrorVisible] = useState(false);
	const [error, setError] = useState('');
	const { login } = useAuth();
	const [errors, setErrors] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		gender: '', // Added for gender validation
	});

	// Email format validation
	const validateEmail = (email) => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};

	// Handle Name Change with Real-time Validation
	const handleNameChange = (text) => {
		setName(text);
		if (text === '') {
			setErrors((prev) => ({ ...prev, name: 'Name cannot be empty' }));
		} else {
			setErrors((prev) => ({ ...prev, name: '' }));
		}
	};

	// Handle Email Change with Real-time Validation
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

	// Handle Password Change with Real-time Validation
	const handlePasswordChange = (text) => {
		setPassword(text);
		if (text === '') {
			setErrors((prev) => ({ ...prev, password: 'Password cannot be empty' }));
		} else {
			setErrors((prev) => ({ ...prev, password: '' }));
		}
	};

	// Handle Confirm Password Change with Real-time Validation
	const handleConfirmPasswordChange = (text) => {
		setConfirmPassword(text);
		if (text === '') {
			setErrors((prev) => ({
				...prev,
				confirmPassword: 'Confirm password cannot be empty',
			}));
		} else if (text !== password) {
			setErrors((prev) => ({
				...prev,
				confirmPassword: 'Passwords do not match',
			}));
		} else {
			setErrors((prev) => ({ ...prev, confirmPassword: '' }));
		}
	};

	// Handle Gender Change with Real-time Validation
	const handleGenderChange = (selectedGender) => {
		setGender(selectedGender);
		if (selectedGender === '') {
			setErrors((prev) => ({ ...prev, gender: 'Please select a gender' }));
		} else {
			setErrors((prev) => ({ ...prev, gender: '' }));
		}
		// Reset mahram state when gender changes
		if (selectedGender !== 'Female') {
			setHasMahram(null);
		}
	};

	// Handle Mahram Response
	const handleMahramResponse = (response) => {
		setHasMahram(response);
	};

	const handleUserSignup = async () => {
		let valid = true;
		const formErrors = {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
			gender: '',
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
		if (password === '') {
			formErrors.password = 'Password cannot be empty';
			valid = false;
		}
		if (confirmPassword === '') {
			formErrors.confirmPassword = 'Confirm password cannot be empty';
			valid = false;
		} else if (confirmPassword !== password) {
			formErrors.confirmPassword = 'Passwords do not match';
			valid = false;
		}
		if (gender === '') {
			formErrors.gender = 'Please select a gender';
			valid = false;
		}
		if (!isChecked) {
			Alert.alert('Please accept the terms & privacy policy');
			valid = false;
		}
		// Mahram validation for female users
		if (gender === 'Female' && hasMahram === null) {
			Alert.alert('Please answer if you will be traveling with a mahram');
			valid = false;
		}
		if (gender === 'Female' && hasMahram === 'No') {
			valid = false; // Block registration
		}

		setErrors(formErrors);
		if (!valid) return;

		setIsLoading(true);

		try {
			const response = await axiosInstance.post('/auth/register-user/', {
				name,
				email,
				password,
				gender, // Include gender in the API payload
				role: 'tourist',
			});
			console.log(response.status, response.data);

			if (response.status === 201) {
				Alert.alert('Registration Done Successfully');
				navigation.navigate('UserLogin');
			}
		} catch (error) {
			if (error.response) {
				const serverErrors = error.response.data.error || 'Signup failed';
				setErrorVisible(true);
				setError(serverErrors);
			} else {
				console.log('Error without response:', error.message);
				setErrorVisible(true);
				setError('Network error. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView
			style={[styles.safeAreaContainer, { backgroundColor: theme.background }]}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardAvoidingContainer}>
				<View style={{ paddingLeft: 20 }}>
					<BackButton navigation={navigation} />
				</View>
				<ScrollView
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={styles.scrollViewContent}>
					<View
						style={[styles.container, { backgroundColor: theme.background }]}>
						{/* Logo Image */}
						<View style={styles.imageContainer}>
							<Logo style={styles.image} height={200} />
						</View>

						{/* Name Input */}
						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>Name</Text>
							<View
								style={[
									styles.inputWrapper,
									{ borderColor: isDarkMode ? '#444' : '#D1D5DB' },
									errors.name ? styles.errorInputWrapper : null,
								]}>
								<MaterialCommunityIcons
									name="account-outline"
									size={20}
									color={isDarkMode ? '#aaa' : '#B5B5B5'}
								/>
								<TextInput
									style={[styles.input, { color: theme.text }]}
									placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
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
							<Text style={[styles.label, { color: theme.text }]}>Email</Text>
							<View
								style={[
									styles.inputWrapper,
									{ borderColor: isDarkMode ? '#444' : '#D1D5DB' },
									errors.email ? styles.errorInputWrapper : null,
								]}>
								<MaterialCommunityIcons
									name="email-outline"
									size={20}
									color={isDarkMode ? '#aaa' : '#B5B5B5'}
								/>
								<TextInput
									style={[styles.input, { color: theme.text }]}
									placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
									placeholder="Enter Email"
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

						{/* Password Input */}
						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								Password
							</Text>
							<View
								style={[
									styles.inputWrapper,
									{ borderColor: isDarkMode ? '#444' : '#D1D5DB' },
									errors.password ? styles.errorInputWrapper : null,
								]}>
								<Icon
									name="lock-closed-outline"
									size={20}
									color={isDarkMode ? '#aaa' : '#B5B5B5'}
								/>
								<TextInput
									style={[styles.input, { color: theme.text }]}
									placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
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
										color={isDarkMode ? '#aaa' : '#B5B5B5'}
									/>
								</TouchableOpacity>
							</View>
							{errors.password ? (
								<Text style={styles.errorText}>{errors.password}</Text>
							) : null}
						</View>

						{/* Confirm Password Input */}
						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								Confirm Password
							</Text>
							<View
								style={[
									styles.inputWrapper,
									{ borderColor: isDarkMode ? '#444' : '#D1D5DB' },
									errors.confirmPassword ? styles.errorInputWrapper : null,
								]}>
								<Icon
									name="lock-closed-outline"
									size={20}
									color={isDarkMode ? '#aaa' : '#B5B5B5'}
								/>
								<TextInput
									style={[styles.input, { color: theme.text }]}
									placeholderTextColor={isDarkMode ? '#aaa' : '#888888'}
									placeholder="Re-enter your password"
									secureTextEntry={!confirmPasswordVisible}
									value={confirmPassword}
									onChangeText={handleConfirmPasswordChange}
									autoCapitalize="none"
									accessibilityLabel="Confirm Password Input"
								/>
								<TouchableOpacity
									onPress={() =>
										setConfirmPasswordVisible(!confirmPasswordVisible)
									}>
									<Icon
										name={confirmPasswordVisible ? 'eye' : 'eye-off'}
										size={20}
										color={isDarkMode ? '#aaa' : '#B5B5B5'}
									/>
								</TouchableOpacity>
							</View>
							{errors.confirmPassword ? (
								<Text style={styles.errorText}>{errors.confirmPassword}</Text>
							) : null}
						</View>

						{/* Gender Selection */}
						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>Gender</Text>
							<View
								style={[
									styles.genderContainer,
									errors.gender ? styles.errorInputWrapper : null,
								]}>
								<TouchableOpacity
									style={[
										styles.genderOption,
										gender === 'Male' && styles.selectedGender,
									]}
									onPress={() => handleGenderChange('Male')}>
									<Text
										style={[
											styles.genderText,
											{
												color:
													gender === 'Male'
														? theme.textOnPrimary || '#fff'
														: theme.text,
											},
										]}>
										Male
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[
										styles.genderOption,
										gender === 'Female' && styles.selectedGender,
									]}
									onPress={() => handleGenderChange('Female')}>
									<Text
										style={[
											styles.genderText,
											{
												color:
													gender === 'Female'
														? theme.textOnPrimary || '#fff'
														: theme.text,
											},
										]}>
										Female
									</Text>
								</TouchableOpacity>
							</View>
							{errors.gender ? (
								<Text style={styles.errorText}>{errors.gender}</Text>
							) : null}
						</View>

						{/* Mahram Question (Visible only for Female) */}
						{gender === 'Female' && (
							<View style={styles.inputContainer}>
								<Text style={[styles.label, { color: theme.text }]}>
									Will you be traveling with a mahram?
								</Text>
								<View style={styles.genderContainer}>
									<TouchableOpacity
										style={[
											styles.genderOption,
											hasMahram === 'Yes' && styles.selectedGender,
										]}
										onPress={() => handleMahramResponse('Yes')}>
										<Text
											style={[
												styles.genderText,
												{
													color:
														hasMahram === 'Yes'
															? theme.textOnPrimary || '#fff'
															: theme.text,
												},
											]}>
											Yes
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[
											styles.genderOption,
											hasMahram === 'No' && styles.selectedGender,
										]}
										onPress={() => handleMahramResponse('No')}>
										<Text
											style={[
												styles.genderText,
												{
													color:
														hasMahram === 'No'
															? theme.textOnPrimary || '#fff'
															: theme.text,
												},
											]}>
											No
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}

						{/* Blocking Message for Female Users without Mahram */}
						{gender === 'Female' && hasMahram === 'No' && (
							<Text style={styles.blockingMessage}>
								According to our policy, we do not accept registrations from
								women traveling without a mahram.
							</Text>
						)}

						<TermsAgreement
							navigation={navigation}
							setIsChecked={setIsChecked}
							isChecked={isChecked}
						/>

						{/* Sign Up Button */}
						<TouchableOpacity
							style={[
								styles.loginButton,
								gender === 'Female' &&
									hasMahram === 'No' &&
									styles.disabledButton,
							]}
							onPress={handleUserSignup}
							disabled={
								isLoading || (gender === 'Female' && hasMahram === 'No')
							}>
							{isLoading ? (
								<ActivityIndicator
									size="small"
									color={theme.textOnPrimary || '#fff'}
								/>
							) : (
								<Text style={styles.loginButtonText}>Sign Up</Text>
							)}
						</TouchableOpacity>

						{/* Already signed in? */}
						<View style={styles.alreadySignInContainer}>
							<Text style={[styles.alreadySignInText, { color: theme.text }]}>
								Have an account?{' '}
							</Text>
							<TouchableOpacity
								onPress={() => navigation.navigate('UserLogin')}>
								<Text
									style={[styles.link, { color: theme.primary || '#C9A038' }]}>
									Sign In
								</Text>
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
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 20,
	},
	container: {
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingHorizontal: 20,
	},
	imageContainer: {
		marginBottom: 30,
	},
	image: {
		width: 165,
		height: 140,
	},
	inputContainer: {
		width: '100%',
		marginBottom: 15,
	},
	label: {
		fontSize: 16,
		fontWeight: '500',
		color: '#CBCBCB',
		marginBottom: 5,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 12,
		borderColor: '#D1D5DB',
		paddingHorizontal: 10,
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
	},
	genderContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 5,
	},
	genderOption: {
		flex: 1,
		paddingVertical: 10,
		marginHorizontal: 5,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#D1D5DB',
		alignItems: 'center',
	},
	selectedGender: {
		backgroundColor: '#C9A038',
		borderColor: '#C9A038',
	},
	genderText: {
		fontSize: 16,
		fontWeight: '500',
	},
	blockingMessage: {
		fontSize: 14,
		color: '#E91111',
		textAlign: 'center',
		marginVertical: 10,
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
	disabledButton: {
		backgroundColor: '#666',
		opacity: 0.7,
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
});

export default UserSignup;
