import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function SearchModal({
	modalVisible,
	setModalVisible,
	place,
	start_date,
	end_date,
	navigation,
}) {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: theme.background,
		},
		overlay: {
			flex: 1,
			backgroundColor: 'rgba(0,0,0,0.5)',
			justifyContent: 'center',
			alignItems: 'center',
		},
		modalContent: {
			backgroundColor: theme.background,
			padding: 20,
			borderRadius: 12,
			width: '85%',
			elevation: 5,
		},
		inputField: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
			padding: 15,
			borderRadius: 8,
			marginBottom: 10,
		},
		inputText: {
			fontSize: 16,
			color: theme.text,
		},
	});

	return (
		<View style={themeStyles.container}>
			{/* Modal */}
			<Modal visible={modalVisible} transparent>
				<TouchableOpacity
					style={themeStyles.overlay}
					onPress={() => setModalVisible(false)}>
					<View style={themeStyles.modalContent}>
						{/* Location Selection */}
						<TouchableOpacity
							style={themeStyles.inputField}
							onPress={() => navigation.navigate('PlaceSelection', { place })}>
							<View
								style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
								<Ionicons
									name="location-outline"
									size={20}
									color={isDarkMode ? theme.text : '#C9A038'}
								/>
								<Text style={themeStyles.inputText}>{place.join(', ')}</Text>
							</View>
							<Ionicons
								name="chevron-down-outline"
								size={20}
								color={theme.text}
							/>
						</TouchableOpacity>

						{/* Date Selection */}
						<TouchableOpacity
							style={themeStyles.inputField}
							onPress={() =>
								navigation.navigate('BookingCalendar', {
									place,
									start_date,
									end_date,
								})
							}>
							<View
								style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
								<Ionicons
									name="calendar-outline"
									size={20}
									color={theme.text}
								/>
								<Text style={themeStyles.inputText}>
									{t('dateRange', {
										start: start_date?.split('-').reverse().join('/'),
										end: end_date?.split('-').reverse().join('/'),
									})}
								</Text>
							</View>
							<Ionicons
								name="chevron-down-outline"
								size={20}
								color={theme.text}
							/>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
}
