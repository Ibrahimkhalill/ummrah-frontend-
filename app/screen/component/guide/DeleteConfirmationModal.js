import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../hook/ThemeContext'; // Import ThemeContext

const DeleteConfirmationModal = ({
	visible,
	onClose,
	onConfirmDelete,
	serviceName,
}) => {
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	return (
		<Modal
			animationType="fade"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}>
			<View style={styles.modalContainer}>
				<View
					style={[
						styles.modalContent,
						{ backgroundColor: isDarkMode ? '#333' : '#fff' },
					]}>
					<Text style={[styles.modalTitle, { color: theme.text }]}>
						Confirm Delete
					</Text>
					<Text style={[styles.modalMessage, { color: theme.text }]}>
						You can delete this "{serviceName}" location. Are you sure?
					</Text>

					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[
								styles.button,
								styles.cancelButton,
								{
									backgroundColor: isDarkMode ? '#444' : '#fff',
									borderColor: isDarkMode ? '#555' : '#666',
								},
							]}
							onPress={onClose}>
							<Text style={[styles.buttonText, { color: theme.text }]}>
								Cancel
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.button, styles.deleteButton]}
							onPress={onConfirmDelete}>
							<Text style={styles.buttonDeleteText}>Delete</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 10,
		width: '80%',
		elevation: 5,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 10,
	},
	modalMessage: {
		fontSize: 16,
		color: '#666',
		marginBottom: 20,
		textAlign: 'center',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 10,
	},
	button: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 5,
		alignItems: 'center',
	},
	cancelButton: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#666',
	},
	deleteButton: {
		backgroundColor: '#FF4444', // Red color for delete action
		borderWidth: 1,
		borderColor: '#FF4444',
	},
	buttonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#000',
	},
	buttonDeleteText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#fff',
	},
});

export default DeleteConfirmationModal;
