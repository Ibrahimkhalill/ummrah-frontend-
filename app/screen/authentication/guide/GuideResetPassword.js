import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
	ActivityIndicator,
	Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../component/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../component/axiosInstance';
import ErrorModal from '../../component/ErrorModal';
import { useTheme } from '../../component/hook/ThemeContext'; // Import ThemeContext

export default function GuideResetPassword({ route, navigation }) {
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const { email } = route.params || {};
	const [newPassword, setNewPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [errorVisible, setErrorVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const handleResetPassword = async () => {
		if (!newPassword) {
			setErrorMessage('Please enter a new password');
			setErrorVisible(true);
			return;
		}

		setIsLoading(true);
		try {
			const response = await axiosInstance.post('/auth/password-reset/', {
				email,
				new_password: newPassword,
			});
			if (response.status === 200) {
				Alert.alert('Success', 'Password reset successfully!');
				navigation.navigate('GuideLogin');
			}
		} catch (error) {
			setErrorMessage(
				error.response?.data?.error ||
					'Failed to reset password. Please try again.'
			);
			setErrorVisible(true);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<StatusBar
					barStyle={isDarkMode ? 'light-content' : 'dark-content'}
					translucent
				/>

				{/* Back Button */}
				<TouchableOpacity
					style={styles.backButton}
					onPress={() => navigation.goBack()}>
					<BackButton navigation={navigation} />
				</TouchableOpacity>
				<Text style={[styles.title, { color: theme.text }]}>
					Reset Password
				</Text>

				{/* Subtitle */}
				<Text style={[styles.subtitle, { color: theme.text }]}>
					Generate New Password
				</Text>
				<Text style={[styles.description, { color: theme.text }]}>
					Enter your new password here and make it different from the previous
					one
				</Text>

				{/* New Password Input */}
				<View style={styles.inputContainer}>
					<Text style={[styles.inputLabel, { color: theme.text }]}>
						New Password
					</Text>
					<TextInput
						style={[
							styles.input,
							{
								color: theme.text,
								borderBottomColor: isDarkMode ? '#444' : '#ddd',
							},
						]}
						placeholder="Enter your new password"
						placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
						secureTextEntry
						value={newPassword}
						onChangeText={setNewPassword}
					/>
				</View>

				{/* Reset Button */}
				<TouchableOpacity
					style={[styles.nextButton, isLoading && styles.disabledButton]}
					onPress={handleResetPassword}
					disabled={isLoading}>
					{isLoading ? (
						<ActivityIndicator size="small" color="#fff" />
					) : (
						<Text style={styles.nextButtonText}>Reset</Text>
					)}
				</TouchableOpacity>

				{/* Error Modal */}
				<ErrorModal
					message={errorMessage}
					isVisible={errorVisible}
					onClose={() => setErrorVisible(false)}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingHorizontal: 20,
	},
	backButton: {
		alignItems: 'flex-start',
		justifyContent: 'flex-start',
		width: '100%',
		marginTop: 10,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#C9A038',
		marginBottom: 100,
	},
	subtitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#C9A038',
		marginBottom: 5,
	},
	description: {
		fontSize: 14,
		color: '#777',
		textAlign: 'center',
		marginBottom: 30,
		width: '80%',
	},
	inputContainer: {
		width: '100%',
	},
	inputLabel: {
		fontSize: 14,
		color: '#555',
		marginBottom: 5,
	},
	input: {
		width: '100%',
		borderBottomWidth: 1,
		borderBottomColor: '#ddd',
		paddingVertical: 10,
		fontSize: 16,
		color: '#333',
	},
	nextButton: {
		width: '100%',
		backgroundColor: '#C9A038',
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		marginTop: 30,
	},
	disabledButton: {
		backgroundColor: '#A9A9A9',
	},
	nextButtonText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff',
	},
});
