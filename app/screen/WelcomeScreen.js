import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
	Modal,
} from 'react-native';
import SvgLogo from '../assets/logo.svg'; // Import the SVG logo
import { Ionicons } from '@expo/vector-icons';
import Profile from '../assets/profile.svg';
import BackButton from './component/BackButton';
export default function WelcomeScreen({ navigation }) {
	const [isModalVisible, setModalVisible] = useState(false);
	const [isSignUpModalVisible, setSignUpModalVisible] = useState(false);
	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" translucent />
			<View style={{ position: 'absolute', top: 70, left: 20 }}>
				<BackButton navigation={navigation} />
			</View>
			{/* Logo Section */}
			<View style={styles.logoContainer}>
				<SvgLogo height={200} />
			</View>

			{/* Welcome Text */}
			<View style={{ width: '90%', gap: 10 }}>
				<Text style={styles.welcomeText}>Welcome to Umrah Guide!</Text>
				<Text style={styles.description}>
					Discover amazing deals and exclusive offers just for you
				</Text>
			</View>

			{/* Buttons */}
			<TouchableOpacity
				style={styles.loginButton}
				onPress={() => {
					navigation.navigate('GuideLogin');
				}}>
				<Text style={styles.loginButtonText}>Sign In</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.signupButton}
				onPress={() => {
					navigation.navigate('GuideSignUp');
				}}>
				<Text style={styles.signupButtonText}>Sign Up</Text>
			</TouchableOpacity>

			{/* Bottom-Aligned Modal */}
			<Modal visible={isModalVisible} transparent animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						{/* Close Button */}
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => setModalVisible(false)}>
							<Ionicons name="close" size={24} color="black" />
						</TouchableOpacity>

						{/* Login Options */}
						<Text style={styles.modalTitle}>Choose Login Type</Text>
						<View style={styles.loginOptions}>
							<TouchableOpacity
								style={styles.optionButton}
								onPress={() => {
									navigation.navigate('UserLogin');
									setModalVisible(false);
								}}>
								<Profile />
								<Text style={styles.optionText}>Tourist Log in</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.optionButton}
								onPress={() => {
									navigation.navigate('GuideLogin');
									setModalVisible(false);
								}}>
								<Profile />
								<Text style={styles.optionText}>Guide Log in</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
			<Modal visible={isSignUpModalVisible} transparent animationType="slide">
				<View style={styles.modalOverlay}>
					<View style={styles.modalContainer}>
						{/* Close Button */}
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => setSignUpModalVisible(false)}>
							<Ionicons name="close" size={24} color="black" />
						</TouchableOpacity>

						{/* Login Options */}
						<Text style={styles.modalTitle}>Choose Login Type</Text>
						<View style={styles.loginOptions}>
							<TouchableOpacity
								style={styles.optionButton}
								onPress={() => {
									navigation.navigate('UserSignup');
									setModalVisible(false);
								}}>
								<Profile />
								<Text style={styles.optionText}>Tourist SignUp</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.optionButton}
								onPress={() => {
									navigation.navigate('GuideSignUp');
									setModalVisible(false);
								}}>
								<Profile />
								<Text style={styles.optionText}>Guide SignUp</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
		paddingHorizontal: 20,
	},
	skipButton: {
		position: 'absolute',
		top: 50,
		right: 20,
	},
	skipText: {
		fontSize: 16,
		color: '#FFA500',
	},
	logoContainer: {
		alignItems: 'center',
		marginBottom: 30,
	},
	welcomeText: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginTop: 20,
		lineHeight: 30,
	},
	description: {
		fontSize: 14,
		textAlign: 'center',
		color: '#777',
		marginBottom: 30,
	},
	loginButton: {
		width: '80%',
		backgroundColor: '#C9A038',
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 50,
	},
	loginButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#fff',
	},
	signupButton: {
		width: '80%',
		borderWidth: 1,
		borderColor: '#000',
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: 'center',
		marginTop: 20,
	},
	signupButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#000',
	},

	// Modal Overlay to keep the background visible
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
		justifyContent: 'flex-end', // Align to bottom
	},

	// Modal Box
	modalContainer: {
		backgroundColor: '#E0E0E0',
		padding: 20,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		alignItems: 'center',
		paddingBottom: 25,
	},

	closeButton: {
		alignSelf: 'flex-end',
		marginBottom: 10,
	},

	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
	},

	loginOptions: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},

	optionButton: {
		width: '45%',
		backgroundColor: '#E2EAF4',
		padding: 20,
		borderRadius: 10,
		alignItems: 'center',
	},

	optionText: {
		fontSize: 14,
		fontWeight: 'bold',
		marginTop: 5,
		textAlign: 'center',
	},
});
