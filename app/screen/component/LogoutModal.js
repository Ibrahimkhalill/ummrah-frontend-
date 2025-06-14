import React from 'react';
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	TextInput,
	StyleSheet,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../authentication/Auth';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

const LogoutModal = ({ isVisible, setIsVisible, navigation }) => {
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const closeLogoutModal = () => {
		setIsVisible(false);
	};

	const { logout, token } = useAuth();

	const handleLogout = () => {
		logout(navigation);
	};

	return (
		<View className="justify-center items-center">
			{/* LogoutModal */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={isVisible}
				onRequestClose={closeLogoutModal}>
				<View className="flex-1 justify-center items-center bg-black/50">
					{/* Animated LogoutModal */}
					<Animatable.View
						animation="zoomIn"
						duration={500} // Animation duration (milliseconds)
						easing="ease-out" // Optional easing
						style={[
							styles.container,
							{ backgroundColor: isDarkMode ? '#333' : 'white' },
						]}>
						<Text style={[styles.header, { color: theme.text }]}>Logout</Text>
						<View style={{ marginTop: 20 }}>
							<Text style={[styles.second_text, { color: theme.text }]}>
								Are you confirm to logout?
							</Text>
						</View>

						<TouchableOpacity
							onPress={handleLogout}
							style={styles.button_first}>
							<Text
								style={{ fontSize: 16, textAlign: 'center', color: '#ffff' }}>
								LOGOUT
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={closeLogoutModal}
							style={[
								styles.button_second,
								{
									backgroundColor: isDarkMode ? '#444' : '#ffff',
									borderColor: isDarkMode ? '#555' : '#FFDC58',
								},
							]}>
							<Text
								style={{
									fontSize: 16,
									textAlign: 'center',
									color: isDarkMode ? '#fff' : '#00000',
								}}>
								CANCEL
							</Text>
						</TouchableOpacity>
					</Animatable.View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white', // bg-white
		width: '90%', // w-[90%]
		height: 260, // h-[200px]
		padding: 20, // p-5 (padding 5 usually equals 20px)
		borderRadius: 8, // rounded-lg (large border radius)
	},
	header: {
		fontSize: 20,
		textAlign: 'center',
	},
	second_text: {
		fontSize: 14,
		textAlign: 'center',
	},
	button_first: {
		backgroundColor: '#FF3B30',
		height: 48,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 15,
		borderRadius: 20,
	},
	button_second: {
		backgroundColor: '#ffff',
		height: 48,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 15,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: '#FFDC58',
	},
});

export default LogoutModal;
