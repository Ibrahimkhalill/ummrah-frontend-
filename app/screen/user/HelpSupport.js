import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	TextInput,
	Dimensions,
	Alert,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Navbar from '../component/Navbar';
import HelpModal from '../component/HelpModal';
import axiosInstance from '../component/axiosInstance';
import { useAuth } from '../authentication/Auth';
import { useTranslation } from 'react-i18next'; // Import react-i18next
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

const { height } = Dimensions.get('window');
const scrollViewHeight = height * 0.8;

const HelpSupport = ({ navigation }) => {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [isVisible, setIsVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const { token } = useAuth();

	const handleSendEmail = async () => {
		// Email format validation using regex
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!email) {
			Alert.alert(t('warning'), t('emailRequired'));
			return;
		}

		if (!emailRegex.test(email)) {
			Alert.alert(t('warning'), t('validEmailRequired'));
			return;
		}

		if (!message) {
			Alert.alert(t('warning'), t('messageRequired'));
			return;
		}

		const payload = { email, message };
		setIsLoading(true);

		try {
			const response = await axiosInstance.post(
				'/mainapp/send_messages_for_help_support/',
				payload
			);

			if (response.status === 200) {
				setIsVisible(true);
				setEmail('');
				setMessage('');
			}
		} catch (error) {
			console.error('Error sending email:', error);
			Alert.alert(t('error'), t('sendFailed'));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView
			style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
				<Navbar navigation={navigation} label={t('helpSupport')} />
				<ScrollView contentContainerStyle={styles.container}>
					<View style={{ marginTop: 10 }}>
						<Text style={[styles.title, { color: theme.text }]}>
							{t('helpSupport')}
						</Text>

						{/* Email Input */}
						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('yourEmail')}
							</Text>
							<View
								style={[
									styles.inputWrapper,
									{ borderColor: isDarkMode ? '#444' : '#ccc' },
								]}>
								<MaterialCommunityIcons
									name="email-outline"
									size={20}
									color={isDarkMode ? '#aaa' : '#B5B5B5'}
								/>
								<TextInput
									style={[styles.input, { color: theme.text }]}
									placeholder={t('enterEmail')}
									placeholderTextColor={isDarkMode ? '#aaa' : '#B5B5B5'}
									value={email}
									onChangeText={setEmail}
									keyboardType="email-address"
									autoCapitalize="none"
								/>
							</View>
						</View>

						{/* Message Input */}
						<View style={styles.inputContainer}>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('description')}
							</Text>
							<TextInput
								style={[
									styles.textArea,
									{
										borderColor: isDarkMode ? '#444' : '#ccc',
										color: theme.text,
									},
								]}
								multiline
								placeholder={t('describeIssue')}
								placeholderTextColor={isDarkMode ? '#aaa' : '#B5B5B5'}
								value={message}
								onChangeText={setMessage}
							/>
						</View>
					</View>
					<TouchableOpacity
						style={styles.sentButton}
						onPress={handleSendEmail}
						disabled={isLoading}>
						{isLoading ? (
							<ActivityIndicator size="small" color="#fff" />
						) : (
							<Text style={styles.sentButtonText}>{t('send')}</Text>
						)}
					</TouchableOpacity>
				</ScrollView>

				{/* Submit Button */}

				{/* Success Modal */}
				<HelpModal setIsVisible={setIsVisible} isVisible={isVisible} />
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: 'white',
		paddingHorizontal: 20,
	},
	container: {
		flexGrow: 1,
		marginTop: 50,
		paddingBottom: 80, // Space for button
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		color: 'black',
	},
	inputContainer: {
		marginTop: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: '500',
		color: '#333',
		marginBottom: 5,
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 12,
		borderColor: '#ccc',
		paddingHorizontal: 10,
		height: 50,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: '#333',
		paddingLeft: 10,
	},
	textArea: {
		height: 150,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 12,
		padding: 10,
		textAlignVertical: 'top',
		fontSize: 16,
	},
	sentButton: {
		position: 'absolute',
		bottom: 30,
		left: 20,
		right: 20,
		backgroundColor: '#C9A038',
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 30,
	},
	sentButtonText: {
		fontSize: 18,
		fontWeight: '600',
		color: 'white',
	},
	errorBorder: {
		borderColor: 'red',
	},
});

export default HelpSupport;
