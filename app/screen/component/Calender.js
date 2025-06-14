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
import { useAuth } from '../authentication/Auth';
import axiosInstance from './axiosInstance';
import BackButton from './BackButton';
import MessengerIcon from './MessengerIcon';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext
import { useTranslation } from 'react-i18next';

const GuideAvailableCalender = ({ navigation, route }) => {
	const { guide } = route.params || {};
	const { token } = useAuth();
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [availableTimes, setAvailableTimes] = useState([]);
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [loading, setLoading] = useState(false);
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const { t } = useTranslation();

	const currentDate = new Date(); // Today’s date

	console.log('guide', guide);

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
				`/mainapp/guide/available/calender/?date=${formattedDate}&guide_id=${guide.id}`
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
		console.log('Selected day:', day);
		setSelectedDate(newDate);
		fetchGuideAvailability(newDate);
		setStartTime(null);
		setEndTime(null);
	};

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	// Adjusted colors for dark mode
	const availableColor = isDarkMode ? '#66BB6A' : '#90EE90'; // Darker green for dark mode
	const selectedColor = isDarkMode ? '#42A5F5' : '#3498db'; // Lighter blue for dark mode
	const bookedColor = '#d9b650'; // Keep booked color consistent

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			flex: 1,
			padding: 20,
			backgroundColor: theme.background,
		},
		header: {
			fontSize: 17,
			fontWeight: 'bold',
			textAlign: 'center',
			color: theme.text,
		},
		monthContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 10,
		},
		monthText: {
			fontSize: 17,
			fontWeight: 'bold',
			color: theme.text,
		},
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
			height: 30,
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
		dayText: {
			fontSize: 16,
			color: theme.text,
		},
		selectedDayText: {
			color: '#fff',
		},
		disabledDayText: {
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : '#999'),
		},
		disabledChevron: {
			opacity: 0.5,
		},
		timeContainer: {
			flexDirection: 'col',
			flexWrap: 'wrap',
			justifyContent: 'space-between',
			marginTop: 0,
			width: '100%',
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: 'bold',
			paddingBottom: 10,
			color: theme.text,
		},
		loadingText: {
			fontSize: 16,
			textAlign: 'center',
			marginTop: 20,
			color: theme.text,
		},
		timeSlot: {
			width: 75,
			height: 35,
			justifyContent: 'center',
			alignItems: 'center',
			margin: Platform.OS === 'android' ? 3 : 7,
			borderRadius: 5,
			backgroundColor: availableColor,
		},
		selectedSlot: {
			backgroundColor: selectedColor,
		},
		bookedSlot: {
			backgroundColor: bookedColor,
		},
		timeText: {
			fontSize: 14,
			fontWeight: 'bold',
			color: theme.text,
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
			<View style={themeStyles.container}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingBottom: 20,
					}}>
					<BackButton navigation={navigation} />
					<Text style={themeStyles.header}>{t('guideavailablecalender')}r</Text>
					<MessengerIcon
						screen_name={'Chat'}
						reciver_id={guide.user_id}
						name={guide.user}
						navigation={navigation}
					/>
				</View>

				{/* Month & Year */}
				<View style={themeStyles.monthContainer}>
					<TouchableOpacity
						onPress={() => {
							const newDate = new Date(selectedDate);
							newDate.setMonth(newDate.getMonth() - 1);
							setSelectedDate(newDate);
							fetchGuideAvailability(newDate);
						}}
						disabled={isPreviousMonthDisabled()}
						style={
							isPreviousMonthDisabled() ? themeStyles.disabledChevron : {}
						}>
						<Ionicons
							name="chevron-back-outline"
							size={24}
							color={
								isPreviousMonthDisabled()
									? theme.secondaryText || '#999'
									: theme.text
							}
						/>
					</TouchableOpacity>
					<Text style={themeStyles.monthText}>
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
				<View style={themeStyles.calendarContainer}>
					<View style={themeStyles.dayNamesContainer}>
						{dayNames.map((dayName) => (
							<Text key={dayName} style={themeStyles.dayNameText}>
								{dayName}
							</Text>
						))}
					</View>
					{[...Array(getFirstDayOfMonth())].map((_, index) => (
						<View key={`empty-${index}`} style={themeStyles.emptyDay} />
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
									themeStyles.calendarDay,
									isDisabled && { opacity: 0.5 },
									!isDisabled && !isSelected && { backgroundColor: '' },
									isSelected && themeStyles.selectedDay,
								]}
								onPress={() => {
									if (!isDisabled) {
										handleDateSelection(day);
									}
								}}
								disabled={isDisabled}>
								<Text
									style={[
										themeStyles.dayText,
										isDisabled && themeStyles.disabledDayText,
										isSelected && themeStyles.selectedDayText,
									]}>
									{day}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				{/* Color Legend */}
				<View style={themeStyles.legendContainer}>
					<View style={themeStyles.legendItem}>
						<View
							style={[
								themeStyles.colorBox,
								{ backgroundColor: availableColor },
							]}
						/>
						<Text style={themeStyles.legendText}>{t('available')}</Text>
					</View>
					<View style={themeStyles.legendItem}>
						<View
							style={[themeStyles.colorBox, { backgroundColor: bookedColor }]}
						/>
						<Text style={themeStyles.legendText}>{t('booked')}</Text>
					</View>
					<View style={themeStyles.legendItem}>
						<View
							style={[themeStyles.colorBox, { backgroundColor: selectedColor }]}
						/>
						<Text style={themeStyles.legendText}>{t('select_date')}</Text>
					</View>
				</View>

				{/* 24-hour Time Slots */}
				<Text style={themeStyles.sectionTitle}>{t('showavailabletime')}</Text>
				<ScrollView contentContainerStyle={themeStyles.timeContainer}>
					{loading ? (
						<View
							style={{
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center',
								height: 300,
								width: '100%',
							}}>
							<ActivityIndicator size="large" color={theme.text} />
						</View>
					) : (
						<View style={{ paddingTop: 10 }}>
							<FlatList
								data={generateTimeSlots()}
								numColumns={4}
								keyExtractor={(item) => item.time}
								nestedScrollEnabled={true}
								scrollEnabled={false}
								renderItem={({ item }) => {
									const selectedRange = getSelectedTimeRange();
									const isSelected = selectedRange.includes(item.time);
									return (
										<View
											style={[
												themeStyles.timeSlot,
												item.booked && themeStyles.bookedSlot,
											]}
											onPress={() => handleTimeSelection(item.time)}
											disabled={item.booked || loading}>
											<Text style={themeStyles.timeText}>{item.time}</Text>
										</View>
									);
								}}
							/>
						</View>
					)}
				</ScrollView>
			</View>
		</SafeAreaView>
	);
};

export default GuideAvailableCalender;
