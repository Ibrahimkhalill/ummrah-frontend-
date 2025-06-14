import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function BookingConfirmation({
	modalVisible,
	setModalVisible,
	navigation,
}) {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			justifyContent: 'center',
			alignItems: 'center',
		},
		overlay: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: 'rgba(0,0,0,0.5)', // Kept static for consistency
		},
		modalContent: {
			width: '80%',
			backgroundColor: theme.background,
			borderRadius: 12,
			padding: 20,
			alignItems: 'center',
			shadowColor: '#000',
			shadowOpacity: 0.2,
			shadowOffset: { width: 0, height: 2 },
			shadowRadius: 4,
			elevation: 5,
		},
		successIconContainer: {
			position: 'absolute',
			top: -30,
			backgroundColor: theme.background, // Matches modal background
			borderRadius: 50,
			padding: 5,
			elevation: 3,
		},
		successIcon: {
			alignSelf: 'center',
		},
		closeButton: {
			position: 'absolute',
			top: 10,
			right: 10,
		},
		confirmationText: {
			fontSize: 20,
			fontWeight: 'bold',
			color: isDarkMode ? '#64B5F6' : '#002D62', // Lighter blue in dark mode
			marginTop: 30,
		},
		subText: {
			fontSize: 14,
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : '#555'),
			marginTop: 5,
		},
	});

	return (
		<View style={themeStyles.container}>
			<Modal visible={modalVisible} transparent animationType="fade">
				<View style={themeStyles.overlay}>
					<View style={themeStyles.modalContent}>
						<View style={themeStyles.successIconContainer}>
							<Ionicons
								name="checkmark-circle"
								size={50}
								color="green"
								style={themeStyles.successIcon}
							/>
						</View>
						<TouchableOpacity
							style={themeStyles.closeButton}
							onPress={() => navigation.navigate('UserHome')}>
							<Ionicons name="close" size={20} color={theme.text} />
						</TouchableOpacity>
						<Text style={themeStyles.confirmationText}>
							{t('bookingConfirmed')}
						</Text>
						<Text style={themeStyles.subText}>{t('thankYouForService')}</Text>
					</View>
				</View>
			</Modal>
		</View>
	);
}
