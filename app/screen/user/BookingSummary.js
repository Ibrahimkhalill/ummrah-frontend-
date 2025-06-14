import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../component/BackButton';
import BookingConfirmation from './BookingConfirmation';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../component/ProgressBar';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../component/axiosInstance';
import { useAuth } from '../authentication/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function BookingSummary({ navigation, route }) {
	const [modalVisible, setModalVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const { t } = useTranslation();
	const { token } = useAuth();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	const { adults, children, start_date, end_date, guide } = route.params || {};


	const calculateDaysBetweenDates = (startDate, endDate) => {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const timeDiff = end - start;
		const dayDiff = timeDiff / (1000 * 3600 * 24);
		return dayDiff + 1;
	};

	const numberOfDays = calculateDaysBetweenDates(start_date, end_date);

	const getDayOfWeek = (date) => {
		const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		return days[new Date(date).getDay()];
	};

	const pricePerAdult = parseFloat(guide.price);
	const totalPrice = adults * pricePerAdult * numberOfDays;
	const estimatedTax = 0;
	const grandTotal = totalPrice + estimatedTax;

	const handleCreateTransaction = async () => {
		const data = { adults, children, start_date, end_date, guide };
		if (!token) {
			await AsyncStorage.setItem('data', JSON.stringify(data));
			await AsyncStorage.setItem('loginNavigation', 'BookingSummary');
			navigation.navigate('UserLogin');
			return;
		}
		await AsyncStorage.removeItem('data');
		await AsyncStorage.removeItem('loginNavigation');
		setLoading(true);
		try {
			const response = await axiosInstance.post('/mainapp/transactions/', {
				guide_id: guide.id,
				locations: guide.location,
				adult: adults,
				children: children,
				total_amount: totalPrice,
				trip_started_date: start_date,
				trip_end_date: end_date,
				tax: 0,
				status: 'Pending',
				payment_status: false,
			});

			if (response.status === 201) {
				setModalVisible(true);
			} else {
				Alert.alert(
					'Error',
					response.data.error || 'Failed to create transaction.'
				);
			}
		} catch (error) {
			Alert.alert('Error', 'Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
			padding: 20,
		},
		title: {
			fontSize: 22,
			fontWeight: 'bold',
			textAlign: 'center',
			marginBottom: 30,
			color: theme.text,
		},
		guideName: {
			fontSize: 18,
			fontWeight: 'bold',
			textAlign: 'center',
			marginBottom: 5,
			color: theme.text,
		},
		tripDetails: {
			fontSize: 14,
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : '#666'),
			textAlign: 'center',
			marginBottom: 20,
		},
		dateContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 20,
		},
		dateBox: {
			alignItems: 'center',
			flex: 1,
		},
		dateLabel: {
			fontSize: 14,
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : '#666'),
		},
		dateValue: {
			fontSize: 20,
			fontWeight: 'bold',
			color: theme.text,
		},
		dayValue: {
			fontSize: 14,
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : '#666'),
		},
		dateDivider: {
			fontSize: 20,
			fontWeight: 'bold',
			color: theme.text,
		},
		locationContainer: {
			marginBottom: 20,
			padding: 15,
			backgroundColor: isDarkMode ? '#333' : '#f7f7f7',
			borderRadius: 8,
		},
		locationLabel: {
			fontSize: 16,
			fontWeight: 'bold',
			paddingBottom: 10,
			color: theme.text,
		},
		locationValue: {
			fontSize: 16,
			color: theme.text,
		},
		priceBreakdown: {
			borderTopWidth: 1,
			borderTopColor: isDarkMode ? '#555' : '#ccc',
			paddingTop: 10,
			marginBottom: 20,
		},
		priceRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginBottom: 10,
			color: theme.text,
		},
		totalRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginTop: 10,
			borderTopWidth: 1,
			borderTopColor: isDarkMode ? '#555' : '#ccc',
			paddingTop: 10,
		},
		boldText: {
			fontWeight: 'bold',
			color: theme.text,
		},
		checkoutButton: {
			backgroundColor: '#C62828',
			paddingVertical: 15,
			borderRadius: 8,
			alignItems: 'center',
		},
		checkoutButtonText: {
			color: '#fff',
			fontSize: 16,
			fontWeight: 'bold',
		},
		noteContainer: {
			marginBottom: 20,
			padding: 15,
			backgroundColor: isDarkMode ? '#333' : '#f7f7f7',
			borderRadius: 8,
		},
		noteDescription: {
			fontSize: 14,
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : '#666'),
			marginBottom: 10,
		},
	});

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<View
				style={{
					paddingHorizontal: 10,
					gap: 2,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}>
				<TouchableOpacity
					style={{ marginTop: 5 }}
					onPress={() => navigation.goBack()}>
					<Ionicons
						name="arrow-back-outline"
						size={30}
						color={isDarkMode ? theme.text : '#C9A038'}
					/>
				</TouchableOpacity>
				<ProgressBar progress={0.9} />
			</View>
			<ScrollView style={themeStyles.container}>
				<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
					<Text style={themeStyles.title}>{t('bookingSummary')}</Text>
				</View>

				<Text style={themeStyles.guideName}>
					{t('guideName', { name: guide.user })}{' '}
					<Ionicons name="checkmark-circle" size={16} color="green" />
				</Text>
				<Text style={themeStyles.tripDetails}>
					{t('tripDetails', { days: numberOfDays, persons: adults })}
				</Text>

				<View style={themeStyles.dateContainer}>
					<View style={themeStyles.dateBox}>
						<Text style={themeStyles.dateLabel}>{t('tripStart')}</Text>
						<Text style={themeStyles.dateValue}>{start_date}</Text>
						<Text style={themeStyles.dayValue}>{getDayOfWeek(start_date)}</Text>
					</View>
					<Text style={themeStyles.dateDivider}>{t('dateDivider')}</Text>
					<View style={themeStyles.dateBox}>
						<Text style={themeStyles.dateLabel}>{t('tripEnd')}</Text>
						<Text style={themeStyles.dateValue}>{end_date}</Text>
						<Text style={themeStyles.dayValue}>{getDayOfWeek(end_date)}</Text>
					</View>
				</View>

				<View style={themeStyles.locationContainer}>
					<Text style={themeStyles.locationLabel}>{t('location')}</Text>
					<Text style={themeStyles.locationValue}>{guide.location}</Text>
				</View>

				<View style={themeStyles.priceBreakdown}>
					<View style={themeStyles.priceRow}>
						<Text style={{ color: theme.text }}>
							{t('pricePerDayPerPerson')}
						</Text>
						<Text style={{ color: theme.text }}>${pricePerAdult}</Text>
					</View>
					<View style={themeStyles.priceRow}>
						<Text style={{ color: theme.text }}>
							{t('priceForDaysAndPersons', {
								days: numberOfDays,
								persons: adults,
							})}
						</Text>
						<Text style={{ color: theme.text }}>${totalPrice}</Text>
					</View>
					<View style={themeStyles.priceRow}>
						<Text style={themeStyles.boldText}>{t('subtotal')}</Text>
						<Text style={themeStyles.boldText}>${totalPrice}</Text>
					</View>
					<View style={themeStyles.priceRow}>
						<Text style={{ color: theme.text }}>{t('estimatedTaxes')}</Text>
						<Text style={{ color: theme.text }}>$0</Text>
					</View>
					<View style={themeStyles.totalRow}>
						<Text style={themeStyles.boldText}>{t('totalPrice')}</Text>
						<Text style={themeStyles.boldText}>${grandTotal}</Text>
					</View>
				</View>

				<View style={themeStyles.noteContainer}>
					<Text style={themeStyles.noteDescription}>
						{t('noteDescription')}
					</Text>
				</View>

				<TouchableOpacity
					style={themeStyles.checkoutButton}
					onPress={handleCreateTransaction}
					disabled={loading}>
					{loading ? (
						<ActivityIndicator color="#fff" />
					) : (
						<Text style={themeStyles.checkoutButtonText}>
							{t('continueCheckout')}
						</Text>
					)}
				</TouchableOpacity>
			</ScrollView>

			<BookingConfirmation
				modalVisible={modalVisible}
				setModalVisible={setModalVisible}
				navigation={navigation}
			/>
		</SafeAreaView>
	);
}
