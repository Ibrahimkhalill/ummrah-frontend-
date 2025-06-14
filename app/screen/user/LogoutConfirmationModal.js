import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next'; // Import react-i18next
import { useAuth } from '../authentication/Auth';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function LogoutConfirmationModal({ navigation }) {
	const [modalVisible, setModalVisible] = useState(false);
	const { t } = useTranslation(); // Initialize translation hooks
	const { logout, token } = useAuth();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	const handleLogout = () => {
		logout();
		if (!token) {
			navigation.navigate('SplashScreen');
		}
	};

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			{/* Logout Button to trigger modal */}
			<TouchableOpacity
				style={styles.logoutRow}
				onPress={() => setModalVisible(true)}>
				<Ionicons
					name="log-out-outline"
					size={20}
					color={isDarkMode ? '#ff6666' : 'red'}
				/>
				<Text
					style={[
						styles.logoutText,
						{ color: isDarkMode ? '#ff6666' : 'red' },
					]}>
					{t('logOut')}
				</Text>
				<Ionicons
					name="chevron-forward-outline"
					size={20}
					color={isDarkMode ? '#ff6666' : 'red'}
				/>
			</TouchableOpacity>

			{/* Modal */}
			<Modal visible={modalVisible} transparent animationType="fade">
				<View style={styles.overlay}>
					<View
						style={[
							styles.modalContent,
							{ backgroundColor: isDarkMode ? '#333' : '#fff' },
						]}>
						{/* Close Button */}
						<TouchableOpacity
							style={styles.closeButton}
							onPress={() => setModalVisible(false)}>
							<Ionicons name="close" size={20} color={theme.text} />
						</TouchableOpacity>

						{/* Title */}
						<Text style={[styles.modalTitle, { color: theme.text }]}>
							{t('areYouSure')}
						</Text>
						<Text style={[styles.modalSubTitle, { color: theme.text }]}>
							{t('wantToLogout')}
						</Text>

						{/* Description */}
						<Text style={[styles.modalDescription, { color: theme.text }]}>
							{t('logoutDescription')}
						</Text>

						{/* Buttons */}
						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={[styles.cancelButton, { borderColor: theme.text }]}
								onPress={() => setModalVisible(false)}>
								<Text style={[styles.cancelButtonText, { color: theme.text }]}>
									{t('cancel')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.logoutButton}
								onPress={handleLogout}>
								<Text style={styles.logoutButtonText}>{t('logOut')}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	logoutTriggerButton: {
		backgroundColor: 'red',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
	},
	logoutTriggerText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	overlay: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalContent: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 20,
		width: '85%',
		alignItems: 'center',
	},
	closeButton: { position: 'absolute', top: 10, right: 10 },
	modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
	modalSubTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
		color: '#333',
		marginBottom: 10,
	},
	modalDescription: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
		marginBottom: 20,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
	},
	cancelButton: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#000',
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: 'center',
		marginRight: 10,
	},
	cancelButtonText: { fontSize: 16, color: '#000' },
	logoutButton: {
		flex: 1,
		backgroundColor: 'red',
		paddingVertical: 10,
		borderRadius: 8,
		alignItems: 'center',
	},
	logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	logoutRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 20,
	},
	logoutText: { fontSize: 16, color: 'red', flex: 1, marginLeft: 10 },
});
