import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

const LanguageSelectionModal = ({
	visible,
	onClose,
	onSelectLanguage,
	currentLanguage,
}) => {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const languages = [
		{ name: 'English', code: 'en' },
		{ name: 'French', code: 'fr' },
		{ name: 'Arabic', code: 'ar' },
	];

	return (
		<Modal
			animationType="slide"
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
						{t('selectLanguage')}
					</Text>

					{languages.map((language) => (
						<TouchableOpacity
							key={language.code}
							style={[
								styles.languageOption,
								{ borderBottomColor: isDarkMode ? '#444' : '#e0e0e0' },
								currentLanguage === language.code && {
									backgroundColor: isDarkMode ? '#444' : '#f5f5f5',
								},
							]}
							onPress={() => {
								onSelectLanguage(language.code);
								onClose();
							}}>
							<Text style={[styles.languageText, { color: theme.text }]}>
								{language.name}
							</Text>
							{currentLanguage === language.code && (
								<Ionicons name="checkmark" size={20} color={theme.text} />
							)}
						</TouchableOpacity>
					))}

					<TouchableOpacity
						style={[
							styles.closeButton,
							{ borderColor: isDarkMode ? '#555' : 'rgba(84, 76, 76, 0.14)' },
						]}
						onPress={onClose}>
						<Text style={[styles.closeButtonText, { color: theme.text }]}>
							{t('cancel')}
						</Text>
					</TouchableOpacity>
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
		marginBottom: 15,
		textAlign: 'center',
	},
	languageOption: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	selectedLanguage: {
		backgroundColor: '#f5f5f5',
	},
	languageText: {
		fontSize: 16,
		color: '#333',
	},
	closeButton: {
		marginTop: 15,
		paddingVertical: 10,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(84, 76, 76, 0.14)',
		borderRadius: 5,
	},
	closeButtonText: {
		fontSize: 16,
		color: '#666',
	},
});

export default LanguageSelectionModal;
