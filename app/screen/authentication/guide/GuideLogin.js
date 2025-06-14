import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Password icon
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; // Email icon
import axiosInstance from '../../component/axiosInstance';
import { useAuth } from '.././Auth';
import ErrorModal from '../../component/ErrorModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../../assets/moha.svg';
import BackButton from '../../component/BackButton';
import { useTheme } from '../../component/hook/ThemeContext'; // Import ThemeContext

const { height } = Dimensions.get('window');

function GuideLogin({ navigation }) {
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [errorVisible, setErrorVisible] = useState(false);
	const [error, setError] = useState('');
	const { login } = useAuth();
	const [errors, setErrors] = useState({
		userName: '',
		password: '',
	});

	// Email format validation
	const validateEmail = (email) => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};

	// Handle Username Change with Real-time Validation
	const handleUserNameChange = (text) => {
		setUserName(text);
		if (text === '') {
			setErrors((prev) => ({ ...prev, userName: 'Email cannot be empty' }));
		} else if (!validateEmail(text)) {
			setErrors((prev) => ({
				...prev,
				userName: 'Please enter a valid email address',
			}));
		} else {
			setErrors((prev) => ({ ...prev, userName: '' }));
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

	const handleGuideLogin = async () => {
		let valid = true;
		const formErrors = { userName: '', password: '' };

		if (userName === '') {
			formErrors.userName = 'Email cannot be empty';
			valid = false;
		} else if (!validateEmail(userName)) {
			formErrors.userName = 'Please enter a valid email address';
			valid = false;
		}

		if (password === '') {
			formErrors.password = 'Password cannot be empty';
			valid = false;
		}

		setErrors(formErrors);
		if (!valid) return;

		setIsLoading(true);

		try {
			const response = await axiosInstance.post('/auth/login/', {
				email: userName,
				password: password,
				role: 'guide',
			});
			console.log('response.data.user.user.id', response.data.user.user.id);
			if (response.status === 200) {
				console.log();
				login(
					response.data.access_token,
					response.data.refresh_token,
					'guide',
					response.data.user.user.id
				);
				navigation.navigate('GuideHome');
			} else {
				setErrorVisible(true);
				setError('Invalid username or password');
			}
		} catch (error) {
			if (error.response) {
				const serverErrors = 'Email or Password is not valid';
				const formErrors = { userName: '', password: '' };
				setErrors(formErrors);
				setErrorVisible(true);
				setError(serverErrors);
			} else {
				console.log('Error without response:', error);
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
			<ScrollView
				showsVerticalScrollIndicator={false}
				showsHorizontalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				style={{ flexGrow: 1 }}>
				<View
					style={[
						styles.container,
						{ height: height, backgroundColor: theme.background },
					]}>
					{/* Back Button */}
					<View style={{ width: '100%', justifyContent: 'flex-start' }}>
						<BackButton navigation={navigation} />
					</View>
					{/* Logo Image */}
					<View style={styles.imageContainer}>
						<Text style={[styles.title, { color: theme.text }]}>Sign In</Text>
					</View>

					{/* Username Input */}
					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Email</Text>
						<View
							style={[
								styles.inputWrapper,
								{ borderColor: isDarkMode ? '#444' : '#D1D5DB' },
								errors.userName ? styles.errorInputWrapper : null,
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
								value={userName}
								onChangeText={handleUserNameChange}
								keyboardType="email-address"
								autoCapitalize="none"
								accessibilityLabel="Email Input"
								accessibilityRole="keyboardkey"
							/>
						</View>
						{errors.userName ? (
							<Text style={styles.errorText}>{errors.userName}</Text>
						) : null}
					</View>

					{/* Password Input */}
					<View style={styles.inputContainer}>
						<Text style={[styles.label, { color: theme.text }]}>Password</Text>
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
								accessibilityRole="keyboardkey"
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

					<View style={styles.forgotPasswordContainer}>
						<TouchableOpacity
							onPress={() => navigation.navigate('GuideForgetPassword')}>
							<Text style={[styles.forgotPasswordText, { color: theme.text }]}>
								Forgot Password?
							</Text>
						</TouchableOpacity>
					</View>

					{/* Login Button */}
					<TouchableOpacity
						style={styles.loginButton}
						onPress={() => handleGuideLogin()}
						disabled={isLoading}>
						{isLoading ? (
							<ActivityIndicator size="small" color="#fff" />
						) : (
							<Text style={styles.loginButtonText}>Sign In</Text>
						)}
					</TouchableOpacity>

					{/* <Text style={[styles.orText, { color: theme.text }]}>Or continue with</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDarkMode ? '#444' : '#F4F4F4' }]} disabled={isLoading}>
              <Ionicons name="logo-google" size={30} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { backgroundColor: isDarkMode ? '#444' : '#F4F4F4' }]}>
              <FontAwesome5 name="apple" size={30} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View> */}

					{/* Already signed in? */}
					<View style={styles.alreadySignInContainer}>
						<Text style={[styles.alreadySignInText, { color: theme.text }]}>
							Don’t Have an account?{' '}
						</Text>
						<TouchableOpacity
							onPress={() => navigation.navigate('GuideSignUp')}>
							<Text style={[styles.link, { color: theme.text }]}>Sign up</Text>
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
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 30,
		fontWeight: 'bold',
		color: '#C9A038',
	},
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingHorizontal: 20,
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
	forgotPasswordContainer: {
		width: '100%',
		marginBottom: 20,
	},
	forgotPasswordText: {
		fontSize: 14,
		color: '#C9A038',
		textAlign: 'right',
	},
});

export default GuideLogin;
