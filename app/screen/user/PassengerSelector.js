import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Modal,
	Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function PassengerSelector({
	navigation,
	adults,
	setAdults,
	children,
	setChildren,
	onSubmit,
}) {
	const [isPetsAllowed, setIsPetsAllowed] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: theme.background,
		},
		passengerContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: isDarkMode ? '#333' : '#E0E0E0',
			borderRadius: 8,
			padding: 0,
			paddingVertical: 20,
			width: '100%',
			justifyContent: 'space-evenly',
		},
		passenger: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: isDarkMode ? '#333' : '#E0E0E0',
			borderRadius: 8,
			gap: 10,
			width: '90%',
			justifyContent: 'space-between',
		},
		passengerText: {
			fontSize: 16,
			color: theme.text,
		},

		modalContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: 'rgba(0,0,0,0.5)',
		},
		modalContent: {
			backgroundColor: theme.background,
			padding: 20,
			borderRadius: 10,
			width: '80%',
		},
		counterRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 15,
		},
		counterLabel: {
			fontSize: 16,
			fontWeight: 'bold',
			color: theme.text,
		},
		counterButtons: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		counterButton: {
			borderWidth: 1,
			borderColor: '#C9A038',
			paddingVertical: 5,
			paddingHorizontal: 10,
			borderRadius: 5,
			marginHorizontal: 5,
		},
		counterText: {
			fontSize: 18,
			color: '#C9A038',
		},
		counterValue: {
			fontSize: 18,
			fontWeight: 'bold',
			color: theme.text,
		},
		toggleRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginVertical: 15,
		},
		toggleLabel: {
			fontSize: 16,
			color: theme.text,
		},
		doneButton: {
			backgroundColor: '#C9A038',
			padding: 12,
			borderRadius: 8,
			alignItems: 'center',
		},
		doneText: {
			color: '#fff',
			fontSize: 16,
			fontWeight: 'bold',
		},
	});

	return (
		<View style={themeStyles.container}>
			{/* Passenger Selection Bar */}
			<View style={themeStyles.passengerContainer}>
				<TouchableOpacity
					onPress={() => setModalVisible(true)}
					style={themeStyles.passenger}>
					<View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
						<Ionicons name="person-outline" size={20} color={theme.text} />
						<Text style={themeStyles.passengerText}>
							{t('adults', { count: adults })} •{' '}
							{t('children', { count: children })}
						</Text>
					</View>
					<Ionicons name="chevron-down-outline" size={20} color={theme.text} />
				</TouchableOpacity>
			</View>

			{/* Modal Popup */}
			<Modal visible={modalVisible} transparent animationType="slide">
				<View style={themeStyles.modalContainer}>
					<View style={themeStyles.modalContent}>
						{/* Adult Count */}
						<View style={themeStyles.counterRow}>
							<Text style={themeStyles.counterLabel}>{t('adultsLabel')}</Text>
							<View style={themeStyles.counterButtons}>
								<TouchableOpacity
									onPress={() => setAdults(Math.max(1, adults - 1))}
									style={themeStyles.counterButton}>
									<Text style={themeStyles.counterText}>-</Text>
								</TouchableOpacity>
								<Text style={themeStyles.counterValue}>{adults}</Text>
								<TouchableOpacity
									onPress={() => setAdults(adults + 1)}
									style={themeStyles.counterButton}>
									<Text style={themeStyles.counterText}>+</Text>
								</TouchableOpacity>
							</View>
						</View>

						{/* Children Count */}
						<View style={themeStyles.counterRow}>
							<Text style={themeStyles.counterLabel}>{t('childrenLabel')}</Text>
							<View style={themeStyles.counterButtons}>
								<TouchableOpacity
									onPress={() => setChildren(Math.max(0, children - 1))}
									style={themeStyles.counterButton}>
									<Text style={themeStyles.counterText}>-</Text>
								</TouchableOpacity>
								<Text style={themeStyles.counterValue}>{children}</Text>
								<TouchableOpacity
									onPress={() => setChildren(children + 1)}
									style={themeStyles.counterButton}>
									<Text style={themeStyles.counterText}>+</Text>
								</TouchableOpacity>
							</View>
						</View>

						{/* Pets Toggle */}
						<View style={themeStyles.toggleRow}>
							<Text style={themeStyles.toggleLabel}>
								{t('travelingWithPets')}
							</Text>
							<Switch
								value={isPetsAllowed}
								onValueChange={setIsPetsAllowed}
								trackColor={{ false: '#767577', true: '#C9A038' }}
								thumbColor={isPetsAllowed ? '#f4f3f4' : '#f4f3f4'}
							/>
						</View>

						{/* Done Button */}
						<TouchableOpacity
							style={themeStyles.doneButton}
							onPress={() => setModalVisible(false)}>
							<Text style={themeStyles.doneText}>{t('done')}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
}
