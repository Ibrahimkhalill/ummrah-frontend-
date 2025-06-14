import React, { useState } from 'react';
import {
	View,
	Text,
	ImageBackground,
	Modal,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../assets/logo.svg';
import { Ionicons } from '@expo/vector-icons';
import Profile from '../assets/profile.svg';
export default function SplashScreen({ navigation }) {
	const [isModalVisible, setModalVisible] = useState(false);

	return (
		<ImageBackground
			source={require('../assets/kaba.png')} // Add your background image to assets
			style={styles.background}>
			<StatusBar barStyle="light-content" backgroundColor="#000" />
			<View style={styles.logoContainer}></View>

			{/* Tagline */}
			<View style={{ justifyContent: 'center', alignItems: 'center', gap: 50 }}>
				<Text style={styles.tagline}>
					Your Companion for{'\n'}Every step of Hajj & Umrah
				</Text>

				{/* "Let's Go" Button */}
				<TouchableOpacity
					style={styles.letsGoButton}
					onPress={() => setModalVisible(true)}>
					<LinearGradient
						colors={['#C9A038', '#C9A038']}
						style={styles.buttonGradient}>
						<Text style={styles.buttonText}>Let's Go →</Text>
					</LinearGradient>
				</TouchableOpacity>
			</View>
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
						<Text style={styles.modalTitle}>Choose User Type</Text>
						<View style={styles.loginOptions}>
							<TouchableOpacity
								style={styles.optionButton}
								onPress={() => {
									navigation.navigate('UserHome');
									setModalVisible(false);
								}}>
								<Profile />
								<Text style={styles.optionText}>Tourist</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.optionButton}
								onPress={() => {
									navigation.navigate('WELCOME');
									setModalVisible(false);
								}}>
								<Profile />
								<Text style={styles.optionText}>Guide </Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	background: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 40,
	},
	skipButton: {
		position: 'absolute',
		top: 50,
		right: 20,
		padding: 10,
	},
	skipText: {
		color: '#fff',
		fontSize: 16,
	},
	logoContainer: {
		alignItems: 'center',
		marginTop: 100,
	},
	logo: {
		width: 100,
		height: 80,
		resizeMode: 'contain',
	},
	appTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFD700',
		marginTop: 10,
	},
	subtitle: {
		fontSize: 14,
		color: '#FFD700',
	},
	tagline: {
		fontSize: 28,
		textAlign: 'center',
		color: '#fff',
		fontWeight: 'bold',
	},
	letsGoButton: {
		width: 200,
	},
	buttonGradient: {
		paddingVertical: 12,
		borderRadius: 25,
		alignItems: 'center',
	},
	buttonText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#fff',
	},
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
