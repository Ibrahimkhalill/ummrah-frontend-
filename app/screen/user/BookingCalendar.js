import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Dimensions,
	Alert,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import PassengerSelector from './PassengerSelector';
import NavigationBar from '../component/NavigationBar';
import ProgressBar from '../component/ProgressBar';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../component/hook/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function BookingCalendar({ route, navigation }) {
	const { place } = route.params || {};
	const [adults, setAdults] = useState(1);
	const [children, setChildren] = useState(0);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedStartDate, setSelectedStartDate] = useState(null);
	const [selectedEndDate, setSelectedEndDate] = useState(null);
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme();

	const changeMonth = (direction) => {
		setCurrentMonth((prevMonth) => {
			const newMonth = new Date(prevMonth);
			newMonth.setMonth(prevMonth.getMonth() + direction);
			if (newMonth < new Date()) {
				return new Date();
			}
			return newMonth;
		});
	};

	const onDayPress = (day) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const selectedDay = new Date(day);
		selectedDay.setHours(0, 0, 0, 0);

		if (selectedDay < today) {
			Alert.alert(t('warning'), t('cannotSelectPastDate'));
			return;
		}

		if (!selectedStartDate) {
			setSelectedStartDate(day);
			setSelectedEndDate(null);
		} else if (!selectedEndDate) {
			if (new Date(day) < new Date(selectedStartDate)) {
				setSelectedStartDate(day);
				setSelectedEndDate(null);
			} else if (new Date(day) > new Date(selectedStartDate)) {
				setSelectedEndDate(day);
			} else {
				setSelectedEndDate(day);
			}
		} else {
			setSelectedStartDate(day);
			setSelectedEndDate(null);
		}
	};

	const handleSubmit = () => {
		if (!selectedStartDate) {
			Alert.alert(t('warning'), t('pleaseSelectDate'));
			return;
		}
		const endDate = selectedEndDate || selectedStartDate;
		navigation.navigate('GuideSearchPage', {
			place,
			adults,
			children,
			selectedStartDate,
			selectedEndDate: endDate,
		});
	};

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
			paddingHorizontal: 20,
			paddingTop: 5,
			paddingBottom: 40,
		},
		backButton: {
			marginTop: 4,
		},
		monthSelector: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			marginVertical: 16,
		},
		monthText: {
			fontSize: 18,
			fontWeight: 'bold',
			color: theme.text,
		},
		dateDisplay: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingBottom: 10,
		},
		dateText: {
			fontSize: 18,
			fontWeight: 'bold',
			color: theme.text,
		},
		arrow: {
			fontSize: 18,
			fontWeight: 'bold',
			color: theme.text,
		},
		calendarContainer: {
			backgroundColor: isDarkMode ? '#2a2a2a' : '#F9F3E4',
			padding: 10,
			borderRadius: 10,
			marginBottom: 15,
		},
		weekRow: {
			flexDirection: 'row',
			justifyContent: 'space-around',
			marginBottom: 5,
		},
		weekText: {
			fontSize: 14,
			fontWeight: 'bold',
			color: theme.secondaryText,
		},
		daysRow: {
			flexDirection: 'row',
			flexWrap: 'wrap',

		},
		dayItem: {
			width: screenWidth / 7 - 9,
			aspectRatio: 1.3,
			justifyContent: 'center',
			alignItems: 'center',
			marginVertical: 5,
		},
		dayText: {
			fontSize: 16,
			color: theme.text,
		},
		startDate: {
			backgroundColor: '#C9A038',
			borderRadius: 50,
		},
		endDate: {
			backgroundColor: '#C9A038',
			borderRadius: 50,
		},
		betweenDates: {
			backgroundColor: isDarkMode ? '#3a3a3a' : '#F5E0C3',
		},
		betweenDateText: {
			color: theme.text,
		},
		selectedDateText: {
			color: '#fff',
		},
		pastDate: {
			opacity: 0.5,
		},
		pastDateText: {
			color: theme.secondaryText,
		},
		searchButton: {
			backgroundColor: '#C9A038',
			padding: 10,
			borderRadius: 8,
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 3,
			marginVertical: 20,
		},
	});

	// Calendar Component (Moved Inside)
	const renderCalendar = () => {
		const days = [];
		const weeks = [
			t('sun'),
			t('mon'),
			t('tue'),
			t('wed'),
			t('thu'),
			t('fri'),
			t('sat'),
		];

		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const firstDayIndex = new Date(year, month, 1).getDay();
		const totalDays = new Date(year, month + 1, 0).getDate();

		days.push(
			<View key="week-header" style={themeStyles.weekRow}>
				{weeks.map((day, index) => (
					<Text key={index} style={themeStyles.weekText}>
						{day}
					</Text>
				))}
			</View>
		);

		const monthDays = [];
		for (let i = 0; i < firstDayIndex; i++) {
			monthDays.push(<View key={`empty-${i}`} style={themeStyles.dayItem} />);
		}

		for (let i = 1; i <= totalDays; i++) {
			const formattedDate = `${year}-${String(month + 1).padStart(
				2,
				'0'
			)}-${String(i).padStart(2, '0')}`;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const selectedDay = new Date(formattedDate);
			selectedDay.setHours(0, 0, 0, 0);

			const isPast = selectedDay < today;
			const isStart = formattedDate === selectedStartDate;
			const isEnd = formattedDate === selectedEndDate;
			const isBetween =
				selectedStartDate &&
				selectedEndDate &&
				new Date(formattedDate) > new Date(selectedStartDate) &&
				new Date(formattedDate) < new Date(selectedEndDate);

			monthDays.push(
				<TouchableOpacity
					key={i}
					style={[
						themeStyles.dayItem,
						isStart && themeStyles.startDate,
						isEnd && themeStyles.endDate,
						isBetween && themeStyles.betweenDates,
						isPast && themeStyles.pastDate,
					]}
					onPress={() => !isPast && onDayPress(formattedDate)}
					disabled={isPast}>
					<Text
						style={[
							themeStyles.dayText,
							isPast && themeStyles.pastDateText,
							isStart && themeStyles.selectedDateText,
							isEnd && themeStyles.selectedDateText,
							isBetween && themeStyles.betweenDateText,
						]}>
						{i}
					</Text>
				</TouchableOpacity>
			);
		}

		days.push(
			<View key="days" style={themeStyles.daysRow}>
				{monthDays}
			</View>
		);
		return days;
	};

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
				<View style={{ flex: 1 }}>
					<View
						style={{
							paddingHorizontal: 20,
							flexDirection: 'row',
							alignItems: 'center',
							gap: 5,
						}}>
						<TouchableOpacity
							style={themeStyles.backButton}
							onPress={() => navigation.goBack()}>
							<Ionicons
								name="arrow-back-outline"
								size={30}
								color={isDarkMode ? theme.text : '#C9A038'}
							/>
						</TouchableOpacity>
						<ProgressBar progress={0.4} />
					</View>
					<ScrollView
						style={themeStyles.container}
						contentContainerStyle={{ paddingBottom: 40 }}
						nestedScrollEnabled={true}
						overScrollMode="never"
						contentInsetAdjustmentBehavior="never">
						{/* Month Selector */}
						<View style={themeStyles.monthSelector}>
							<TouchableOpacity onPress={() => changeMonth(-1)}>
								<Ionicons
									name="chevron-back-outline"
									size={20}
									color={theme.text}
								/>
							</TouchableOpacity>
							<Text style={themeStyles.monthText}>
								{currentMonth.toLocaleString('default', {
									month: 'long',
									year: 'numeric',
								})}
							</Text>
							<TouchableOpacity onPress={() => changeMonth(1)}>
								<Ionicons
									name="chevron-forward-outline"
									size={20}
									color={theme.text}
								/>
							</TouchableOpacity>
						</View>

						{/* Selected Date Display */}
						{(selectedStartDate || selectedEndDate) && (
							<View style={themeStyles.dateDisplay}>
								<View>
									<Text style={themeStyles.dateText}>{selectedStartDate}</Text>
								</View>
								{selectedEndDate && (
									<>
										<Text style={themeStyles.arrow}>
											{t('dateRangeSeparator')}
										</Text>
										<View>
											<Text style={themeStyles.dateText}>
												{selectedEndDate}
											</Text>
										</View>
									</>
								)}
							</View>
						)}

						{/* Calendar */}
						<View style={themeStyles.calendarContainer}>
							{renderCalendar()}
						</View>

						{/* Passenger Selection */}
						<PassengerSelector
							onSubmit={handleSubmit}
							adults={adults}
							setAdults={setAdults}
							setChildren={setChildren}
							children={children}
							navigation={navigation}
						/>

						<TouchableOpacity
							style={themeStyles.searchButton}
							onPress={() => handleSubmit()}>
							<Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
								{t('search')}
							</Text>
						</TouchableOpacity>
					</ScrollView>
					<NavigationBar navigation={navigation} />
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
