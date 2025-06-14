import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../axiosInstance';
import { useAuth } from '../../authentication/Auth';
import BackButton from '../BackButton';
import { useTheme } from '../hook/ThemeContext';
import { useTranslation } from 'react-i18next';

const GuideCalendar = ({ navigation }) => {
	const { token } = useAuth();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [availableTimes, setAvailableTimes] = useState([]);
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [loading, setLoading] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const { theme, isDarkMode } = useTheme();
	const { t } = useTranslation();
	const currentDate = new Date();

	useEffect(() => {
		fetchGuideAvailability(currentDate);
	}, []);

	/** Fetch guide's available time slots */
	const fetchGuideAvailability = async (date) => {
		setLoading(true);
		try {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const formattedDate = `${year}-${month}-${day}`;
			console.log('Fetching availability for:', formattedDate);

			const response = await axiosInstance.get(
				`/mainapp/guide/calendar/?date=${formattedDate}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setAvailableTimes(response.data || []);
		} catch (error) {
			console.error('Error fetching calendar data:', error);
		} finally {
			setLoading(false);
		}
	};

	/** Generate 24-hour time slots with AM/PM format and check booking status */
	const generateTimeSlots = () => {
		const slots = [];
		for (let hour = 0; hour < 24; hour++) {
			const period = hour < 12 ? 'AM' : 'PM';
			const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
			const time = `${formattedHour}:00 ${period}`;

			const hour24 = hour.toString().padStart(2, '0') + ':00:00';
			const isBooked = availableTimes.some((slot) => {
				const start = slot.start_time;
				const end = slot.end_time;
				return hour24 >= start && hour24 <= end && slot.status === 'booked';
			});

			slots.push({ time, booked: isBooked });
		}
		return slots;
	};

	/** Select a time slot */
	const handleTimeSelection = (time) => {
		if (!startTime) {
			setStartTime(time);
		} else if (!endTime && time !== startTime) {
			setEndTime(time);
		} else {
			setStartTime(time);
			setEndTime(null);
		}
	};

	/** Get selected time range */
	const getSelectedTimeRange = () => {
		if (!startTime || !endTime) return [startTime].filter(Boolean);

		const times = generateTimeSlots().map((slot) => slot.time);
		const startIndex = times.indexOf(startTime);
		const endIndex = times.indexOf(endTime);

		if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
			return [startTime];
		}

		return times.slice(startIndex, endIndex + 1);
	};

	/** Book selected time slot */
	const bookTimeSlot = async () => {
		if (!startTime || !endTime) {
			alert('Please select both start and end times');
			return;
		}

		setConfirmLoading(true);
		try {
			const convertTo24Hour = (time) => {
				const [hourMinute, period] = time.split(' ');
				let [hour] = hourMinute.split(':');
				hour = parseInt(hour);
				if (period === 'PM' && hour !== 12) hour += 12;
				if (period === 'AM' && hour === 12) hour = 0;
				return `${hour.toString().padStart(2, '0')}:00:00`;
			};

			const year = selectedDate.getFullYear();
			const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
			const day = String(selectedDate.getDate()).padStart(2, '0');
			const formattedDate = `${year}-${month}-${day}`;

			const bookingData = {
				date: formattedDate,
				start_time: convertTo24Hour(startTime),
				end_time: convertTo24Hour(endTime),
				status: 'booked',
			};

			const response = await axiosInstance.post(
				'/mainapp/guide/book-time-slot/',
				bookingData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
				}
			);

			alert(response.data.message);
			await fetchGuideAvailability(selectedDate);
			setStartTime(null);
			setEndTime(null);
		} catch (error) {
			console.error('Error booking time slot:', error);
			alert(error.response?.data?.detail || 'Failed to book time slot');
		} finally {
			setConfirmLoading(false);
		}
	};

	/** Check if date is in the past */
	const isPastDate = (date) => {
		const checkDate = new Date(date);
		checkDate.setHours(0, 0, 0, 0);
		const today = new Date(currentDate);
		today.setHours(0, 0, 0, 0);
		return checkDate < today;
	};

	/** Check if previous month is disabled */
	const isPreviousMonthDisabled = () => {
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth();
		const selectedYear = selectedDate.getFullYear();
		const selectedMonth = selectedDate.getMonth();

		return (
			(selectedYear === currentYear && selectedMonth <= currentMonth) ||
			selectedYear < currentYear
		);
	};

	/** Get days in current month */
	const getDaysInMonth = () => {
		return new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth() + 1,
			0
		).getDate();
	};

	/** Get first day of the month (0 = Sunday, 1 = Monday, etc.) */
	const getFirstDayOfMonth = () => {
		return new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth(),
			1
		).getDay();
	};

	/** Handle date selection */
	const handleDateSelection = (day) => {
		const newDate = new Date(
			selectedDate.getFullYear(),
			selectedDate.getMonth(),
			day
		);
		newDate.setHours(0, 0, 0, 0);
		// Prevent re-selection of the same date
		if (
			selectedDate.getDate() === day &&
			selectedDate.getMonth() === newDate.getMonth() &&
			selectedDate.getFullYear() === newDate.getFullYear()
		) {
			return; // Ignore if the same date is already selected
		}
		console.log('Selected single date:', day);
		setSelectedDate(newDate);
		fetchGuideAvailability(newDate);
		setStartTime(null);
		setEndTime(null);
	};

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Define colors using theme with dark mode logic
	const availableColor = theme.available
		? isDarkMode
			? theme.available.dark
			: theme.available.light
		: isDarkMode
		? '#66BB6A'
		: '#90EE90';
	const selectedColor = theme.selected
		? isDarkMode
			? theme.selected.dark
			: theme.selected.light
		: isDarkMode
		? '#42A5F5'
		: '#3498db';
	const bookedColor = theme.booked || '#d9b650';

	const styles = StyleSheet.create({
		container: {
			flex: 1,
			paddingHorizontal: 20,
			backgroundColor: theme.background,
		},
		header: {
			fontSize: 20,
			fontWeight: 'bold',
			textAlign: 'center',
			marginBottom: 10,
			color: theme.text,
		},
		monthContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 10,
		},
		monthText: { fontSize: 18, fontWeight: 'bold', color: theme.text },
		calendarContainer: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'flex-start',
			marginBottom: 15,
		},
		dayNamesContainer: {
			flexDirection: 'row',
			width: '100%',
			justifyContent: 'space-between',
			marginBottom: 10,
		},
		dayNameText: {
			width: '14%',
			textAlign: 'center',
			fontSize: 14,
			fontWeight: 'bold',
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : '#666'),
		},
		calendarDay: {
			width: '14%',
			height: 40,
			justifyContent: 'center',
			alignItems: 'center',
			marginBottom: 2,
			marginVertical: 5,
			borderRadius: 5,
		},
		emptyDay: {
			width: '14%',
			height: 40,
			marginBottom: 2,
		},

		selectedDay: {
			backgroundColor: selectedColor,
		},
		dayText: { fontSize: 16, color: theme.text },
		selectedDayText: { color: theme.textOnPrimary || '#fff' },
		disabledDayText: {
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : '#999'),
		},
		disabledChevron: {
			opacity: 0.5,
		},
		timeContainer: {
			marginTop: 0,
			minHeight: 200, // Ensure enough height for time slots
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: 'bold',
			paddingBottom: 10,
			color: theme.text,
		},
		loadingContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			height: 300,
			width: '100%',
		},
		timeSlot: {
			width: '20%',
			paddingVertical: 10,
			justifyContent: 'center',
			alignItems: 'center',
			margin: 9,
			borderRadius: 5,
			backgroundColor: availableColor,
		},
		selectedSlot: { backgroundColor: selectedColor },
		bookedSlot: { backgroundColor: bookedColor },
		timeText: {
			fontSize: 14,
			fontWeight: 'bold',
		},
		bookButton: {
			backgroundColor: theme.primary || (isDarkMode ? '#333' : '#000'),
			paddingVertical: 12,
			borderRadius: 8,
			alignItems: 'center',
			marginTop: 20,
			marginBottom: 20, // Ensure spacing at the bottom
			width: '94%',
			alignSelf: 'center',
		},
		disabledButton: {
			backgroundColor: theme.disabled || (isDarkMode ? '#555' : '#666'),
			opacity: 0.7,
		},
		bookButtonText: {
			color: theme.textOnPrimary || '#fff',
			fontSize: 16,
			fontWeight: 'bold',
		},
		legendContainer: {
			marginBottom: 15,
			gap: 10,
			flexDirection: 'row',
		},
		legendItem: {
			flexDirection: 'row',
			alignItems: 'center',
			marginVertical: 5,
		},
		colorBox: {
			width: 20,
			height: 20,
			marginRight: 7,
			borderRadius: 3,
		},
		legendText: {
			fontSize: 14,
			color: theme.text,
		},
	});

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					paddingBottom: Platform.OS === 'ios' ? 40 : 60, // Extra padding for Confirm button
				}}
				showsVerticalScrollIndicator={false}>
				<View style={styles.container}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							paddingBottom: 20,
						}}>
						<BackButton navigation={navigation} />
						<Text style={styles.header}>{t('guide_calender')}</Text>
						<View />
					</View>

					{/* Month & Year */}
					<View style={styles.monthContainer}>
						<TouchableOpacity
							onPress={() => {
								const newDate = new Date(selectedDate);
								newDate.setMonth(newDate.getMonth() - 1);
								setSelectedDate(newDate);
								fetchGuideAvailability(newDate);
							}}
							disabled={isPreviousMonthDisabled()}
							style={isPreviousMonthDisabled() ? styles.disabledChevron : {}}>
							<Ionicons
								name="chevron-back-outline"
								size={24}
								color={
									isPreviousMonthDisabled()
										? theme.disabled || (isDarkMode ? '#b3b3b3' : '#999')
										: theme.text
								}
							/>
						</TouchableOpacity>
						<Text style={styles.monthText}>
							{selectedDate.toLocaleString('default', { month: 'long' })}{' '}
							{selectedDate.getFullYear()}
						</Text>
						<TouchableOpacity
							onPress={() => {
								const newDate = new Date(selectedDate);
								newDate.setMonth(newDate.getMonth() + 1);
								setSelectedDate(newDate);
								fetchGuideAvailability(newDate);
							}}>
							<Ionicons
								name="chevron-forward-outline"
								size={24}
								color={theme.text}
							/>
						</TouchableOpacity>
					</View>

					{/* Calendar */}
					<View style={styles.calendarContainer}>
						<View style={styles.dayNamesContainer}>
							{dayNames.map((dayName) => (
								<Text key={dayName} style={styles.dayNameText}>
									{dayName}
								</Text>
							))}
						</View>
						{[...Array(getFirstDayOfMonth())].map((_, index) => (
							<View key={`empty-${index}`} style={styles.emptyDay} />
						))}
						{[...Array(getDaysInMonth())].map((_, index) => {
							const day = index + 1;
							const currentDay = new Date(
								selectedDate.getFullYear(),
								selectedDate.getMonth(),
								day
							);
							const isDisabled = isPastDate(currentDay);
							const isSelected =
								selectedDate.getDate() === day &&
								selectedDate.getMonth() === currentDay.getMonth() &&
								selectedDate.getFullYear() === currentDay.getFullYear();

							return (
								<TouchableOpacity
									key={day}
									style={[
										styles.calendarDay,
										isDisabled && { opacity: 0.5 },
										!isDisabled && !isSelected && styles.availableDay,
										isSelected && styles.selectedDay,
									]}
									onPress={() => {
										if (!isDisabled) {
											handleDateSelection(day);
										}
									}}
									disabled={isDisabled}>
									<Text
										style={[
											styles.dayText,
											isDisabled && styles.disabledDayText,
											isSelected && styles.selectedDayText,
										]}>
										{day}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>

					{/* Color Legend */}
					<View style={styles.legendContainer}>
						<View style={styles.legendItem}>
							<View
								style={[styles.colorBox, { backgroundColor: availableColor }]}
							/>
							<Text style={styles.legendText}>{t('available')}</Text>
						</View>
						<View style={styles.legendItem}>
							<View
								style={[styles.colorBox, { backgroundColor: bookedColor }]}
							/>
							<Text style={styles.legendText}>{t('booked')}</Text>
						</View>
						<View style={styles.legendItem}>
							<View
								style={[styles.colorBox, { backgroundColor: selectedColor }]}
							/>
							<Text style={styles.legendText}>{t('select_date')}</Text>
						</View>
					</View>

					{/* 24-hour Time Slots */}
					<Text style={styles.sectionTitle}>{t('showavailabletime')}</Text>
					<View style={styles.timeContainer}>
						{loading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color={theme.text} />
							</View>
						) : (
							<FlatList
								data={generateTimeSlots()}
								numColumns={4}
								keyExtractor={(item) => item.time}
								scrollEnabled={false} // Let ScrollView handle scrolling
								renderItem={({ item }) => {
									const selectedRange = getSelectedTimeRange();
									const isSelected = selectedRange.includes(item.time);
									return (
										<TouchableOpacity
											style={[
												styles.timeSlot,
												isSelected && styles.selectedSlot,
												item.booked && styles.bookedSlot,
											]}
											onPress={() => handleTimeSelection(item.time)}
											disabled={item.booked || loading}>
											<Text style={styles.timeText}>{item.time}</Text>
										</TouchableOpacity>
									);
								}}
							/>
						)}
					</View>

					{/* Confirm Booking Button */}
				</View>
			</ScrollView>
			{startTime && endTime && (
				<TouchableOpacity
					style={[styles.bookButton, confirmLoading && styles.disabledButton]}
					onPress={bookTimeSlot}
					disabled={confirmLoading}>
					<Text style={styles.bookButtonText}>
						{confirmLoading ? (
							<ActivityIndicator size="small" color={theme.text} />
						) : (
							t('confirm')
						)}
					</Text>
				</TouchableOpacity>
			)}
		</SafeAreaView>
	);
};

export default GuideCalendar;
