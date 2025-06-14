import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	StyleSheet,
	Modal,
	ActivityIndicator,
	Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import NavigationBar from '../component/NavigationBar';
import SearchModal from './SearchModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../component/ProgressBar';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../component/axiosInstance';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

const GuideCard = ({ guide, navigation, route }) => {
	const { place, adults, children, selectedStartDate, selectedEndDate } =
		route.params || {};
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	const formatPrice = (price) => {
		return t('priceFormat', { price: price, currency: '$' });
	};

	// Dynamic styles for GuideCard
	const cardStyles = StyleSheet.create({
		card: {
			flexDirection: 'row',
			backgroundColor: theme.background,
			borderRadius: 12,
			padding: 10,
			marginBottom: 10,
			shadowColor: '#000',
			shadowOpacity: 0.1,
			shadowOffset: { width: 0, height: 2 },
			shadowRadius: 4,
			elevation: 3,
			alignItems: 'center',
			borderWidth: 2,
			borderColor: isDarkMode ? theme.secondaryText : 'rgba(34, 34, 34, 0.1)',
		},
		image: {
			width: '30%',
			height: '100%',
			borderRadius: 10,
			marginRight: 10,
			borderWidth: 1,
			borderColor: isDarkMode ? theme.secondaryText : 'rgba(34, 34, 34, 0.3)',
		},
		details: { flex: 1, width: '70%' },
		headerRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		name: { fontSize: 14, fontWeight: 'bold', width: 200, color: theme.text },
		location: {
			fontSize: 11,
			color: theme.secondaryText,
			marginTop: 4,
			alignItems: 'center',
			flexDirection: 'row',
		},
		reviewRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
		joined: { fontSize: 12, color: theme.secondaryText, marginTop: 4 },
		seeMore: { fontSize: 12, color: '#FFA500', marginTop: 4 },
		priceContainer: { alignItems: 'flex-end' },
		price: { fontSize: 18, fontWeight: 'bold', color: '#008000' },
		perDay: { fontSize: 11, color: theme.secondaryText },
		bookButton: {
			backgroundColor: '#008000',
			borderRadius: 5,
			paddingVertical: 5,
			paddingHorizontal: 12,
			marginTop: 5,
			position: 'absolute',
			right: 10,
			bottom: 5,
		},
		bookText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
	});
	console.log(guide);

	return (
		<TouchableOpacity
			style={cardStyles.card}
			onPress={() =>
				navigation.navigate('GuideProfile', {
					guideId: guide.id,
					start_date: selectedStartDate,
					end_date: selectedEndDate,
					location_ids: place,
					adults,
					children,
					guide_data: guide,
				})
			}>
			<Image
				source={{
					uri:
						guide.image ||
						'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
				}}
				style={cardStyles.image}
			/>
			<View style={cardStyles.details}>
				<View style={cardStyles.headerRow}>
					<Text style={cardStyles.name}>{guide.user}</Text>
				</View>
				<View style={cardStyles.location}>
					<Ionicons
						name="location-outline"
						size={14}
						color={theme.secondaryText}
					/>
					<Text style={{ color: theme.secondaryText }}>
						{guide.location || 'N/A'}
					</Text>
				</View>
				<View style={cardStyles.reviewRow}>
					{[...Array(5)].map((_, index) => (
						<Ionicons
							key={index}
							name={index < Math.floor(guide.reviews) ? 'star' : 'star-outline'}
							size={12}
							color="#FFC107"
						/>
					))}
					<Text style={{ marginLeft: 5, color: theme.secondaryText }}>
						({guide.total_reviews || 0.0})
					</Text>
				</View>
				<Text style={cardStyles.joined}>
					{t('joined', { date: guide.joined || 'N/A' })}
				</Text>
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						gap: 10,
						marginTop: 5,
					}}>
					<TouchableOpacity
						onPress={() =>
							navigation.navigate('GuideProfile', {
								guideId: guide.id,
								start_date: selectedStartDate,
								end_date: selectedEndDate,
								location_ids: place,
								adults,
								children,
								guide_data: guide,
							})
						}>
						<Text style={cardStyles.seeMore}>{t('seeMore')}</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View style={cardStyles.priceContainer}>
				<Text style={cardStyles.price}>{formatPrice(guide.price || 100)}</Text>
				<Text style={cardStyles.perDay}>{t('perDayTwoAdults')}</Text>
			</View>

			<TouchableOpacity
				style={{
					position: 'absolute',
					right: 10,
					top: 9,
					flexDirection: 'row',
					gap: 2,
					alignItems: 'center',
				}}
				onPress={() => navigation.navigate('Calender', { guide })}>
				<Text style={{ color: theme.text }}>{t('availability')}</Text>
				<FontAwesome name="calendar" size={17} color={theme.text} />
			</TouchableOpacity>
			<TouchableOpacity
				style={cardStyles.bookButton}
				onPress={() =>
					navigation.navigate('BookingSummary', {
						start_date: selectedStartDate,
						end_date: selectedEndDate,
						location_ids: place,
						adults,
						children,
						guide,
					})
				}>
				<Text style={cardStyles.bookText}>{t('bookNow')}</Text>
			</TouchableOpacity>
		</TouchableOpacity>
	);
};

export default function GuideSearchPage({ navigation, route }) {
	const { place, adults, children, selectedStartDate, selectedEndDate } =
		route.params || {};
	const [modalVisible, setModalVisible] = useState(false);
	const [filterModalVisible, setFilterModalVisible] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState(null);
	const [guides, setGuides] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	const languages = [
		{ label: t('English'), value: 'English' },
		{ label: t('Arabic'), value: 'Arabic' },
		{ label: t('French'), value: 'French' },
	];

	useEffect(() => {
		const fetchAvailableGuides = async () => {
			setIsLoading(true);
			try {
				const response = await axiosInstance.get(
					'/mainapp/search-available-guides/',
					{
						params: {
							start_date: selectedStartDate,
							end_date: selectedEndDate,
							location_ids: place,
							adults,
							children,
						},
					}
				);
				setGuides(response.data.guides);
			} catch (error) {
				console.error('Error fetching guides:', error);
				Alert.alert(t('error'), t('failedToFetchGuides'));
			} finally {
				setIsLoading(false);
			}
		};

		if (selectedStartDate && selectedEndDate && place) {
			fetchAvailableGuides();
		}
	}, [selectedStartDate, selectedEndDate, place, adults, children]);

	const filteredGuides = selectedLanguage
		? guides.filter((guide) => guide.language.includes(selectedLanguage))
		: guides;

	const handleLanguageFilter = (language) => {
		setSelectedLanguage(language);
		setFilterModalVisible(false);
	};

	const clearFilter = () => {
		setSelectedLanguage(null);
		setFilterModalVisible(false);
	};

	// Dynamic styles for GuideSearchPage
	const themeStyles = StyleSheet.create({
		container: {
			flex: 1,
			padding: 16,
			backgroundColor: theme.background,
			paddingBottom: 60,
		},
		heading: {
			fontSize: 18,
			fontWeight: 'bold',
			marginBottom: 5,
			color: theme.text,
		},
		subHeading: {
			fontSize: 16,
			color: theme.secondaryText,
			marginBottom: 15,
		},
		guideCount: {
			fontSize: 14,
			marginBottom: 10,
			color: theme.text,
		},
		searchBox: {
			backgroundColor: isDarkMode ? '#333' : 'rgba(201, 160, 56, 0.14)',
			borderRadius: 24,
			paddingHorizontal: 10,
			alignItems: 'flex-start',
			height: 58,
			paddingLeft: 20,
			paddingTop: 5,
			marginBottom: 20,
		},
		filterRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 10,
		},
		filterContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 5,
		},
		filterIcon: {
			padding: 5,
		},
		filterText: {
			fontSize: 12,
			color: '#8E44AD',
			fontWeight: 'bold',
		},
		modalOverlay: {
			flex: 1,
			backgroundColor: 'rgba(0, 0, 0, 0.5)',
			justifyContent: 'center',
			alignItems: 'center',
		},
		modalContent: {
			backgroundColor: theme.background,
			borderRadius: 10,
			padding: 20,
			width: '80%',
			maxHeight: '50%',
		},
		modalTitle: {
			fontSize: 18,
			fontWeight: 'bold',
			marginBottom: 15,
			color: theme.text,
		},
		languageItem: {
			paddingVertical: 10,
			borderBottomWidth: 1,
			borderBottomColor: isDarkMode ? theme.secondaryText : '#ddd',
		},
		activeLanguageItem: {
			backgroundColor: '#008000',
			borderRadius: 8,
			paddingLeft: 10,
		},
		languageItemText: {
			fontSize: 13,
			color: theme.text,
		},
		activeLanguageItemText: {
			color: '#fff',
		},
		clearFilterButton: {
			marginTop: 10,
			paddingVertical: 10,
			borderColor: '#008000',
			borderWidth: 1,
			borderRadius: 8,
			alignItems: 'center',
		},
		clearFilterText: {
			fontSize: 13,
			fontWeight: 'bold',
			color: theme.text,
		},
		closeFilterButton: {
			marginTop: 10,
			paddingVertical: 10,
			backgroundColor: '#C9A038',
			borderRadius: 8,
			alignItems: 'center',
		},
		closeFilterText: {
			color: '#fff',
			fontSize: 13,
			fontWeight: 'bold',
		},
		loadingText: {
			textAlign: 'center',
			fontSize: 16,
			color: theme.secondaryText,
			marginTop: 20,
		},
		emptyText: {
			textAlign: 'center',
			fontSize: 16,
			color: theme.secondaryText,
			marginTop: 20,
		},
	});

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<View style={{ flex: 1 }}>
				<View
					style={{
						paddingHorizontal: 20,
						flexDirection: 'row',
						gap: 5,
						alignItems: 'center',
					}}>
					<TouchableOpacity
						style={{ marginTop: 4 }}
						onPress={() => navigation.goBack()}>
						<Ionicons
							name="arrow-back-outline"
							size={30}
							color={isDarkMode ? theme.text : '#C9A038'}
						/>
					</TouchableOpacity>
					<ProgressBar progress={0.7} />
				</View>
				<View style={themeStyles.container}>
					<TouchableOpacity
						style={themeStyles.searchBox}
						onPress={() => setModalVisible(true)}>
						<Text style={themeStyles.heading}>
							{guides[0]?.location || place.join(', ')}
						</Text>
						<Text style={themeStyles.subHeading}>
							{t('dateRange', {
								start: selectedStartDate?.split('-').reverse().join('/'),
								end: selectedEndDate?.split('-').reverse().join('/'),
							})}
						</Text>
					</TouchableOpacity>
					<View style={themeStyles.filterRow}>
						<Text style={{ color: theme.text }}>
							{t('guidesAvailable', { count: filteredGuides.length })}
						</Text>
						<View style={themeStyles.filterContainer}>
							{selectedLanguage && (
								<Text style={themeStyles.filterText}>
									{t('filteredBy', {
										language: t(selectedLanguage.toLowerCase()),
									})}
								</Text>
							)}
							<TouchableOpacity onPress={() => setFilterModalVisible(true)}>
								<Ionicons
									name="filter-outline"
									size={20}
									color={selectedLanguage ? '#8E44AD' : '#C9A038'}
									style={themeStyles.filterIcon}
								/>
							</TouchableOpacity>
						</View>
					</View>
					<Text style={themeStyles.guideCount}>
						{t('guidesLocatedInAndAround')}
					</Text>
					{isLoading ? (
						<View
							style={{
								flex: 1,
								alignItems: 'center',
								justifyContent: 'center',
							}}>
							<ActivityIndicator size="large" color={theme.text} />
						</View>
					) : (
						<FlatList
							data={filteredGuides}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => (
								<GuideCard guide={item} route={route} navigation={navigation} />
							)}
							ListEmptyComponent={() => (
								<Text style={themeStyles.emptyText}>{t('noGuidesFound')}</Text>
							)}
						/>
					)}
				</View>
				<NavigationBar navigation={navigation} />

				<SearchModal
					modalVisible={modalVisible}
					navigation={navigation}
					setModalVisible={setModalVisible}
					place={place}
					start_date={selectedStartDate}
					end_date={selectedEndDate}
				/>

				<Modal
					visible={filterModalVisible}
					transparent={true}
					animationType="slide"
					onRequestClose={() => setFilterModalVisible(false)}>
					<View style={themeStyles.modalOverlay}>
						<View style={themeStyles.modalContent}>
							<Text style={themeStyles.modalTitle}>
								{t('filterByLanguage')}
							</Text>
							<FlatList
								data={languages}
								keyExtractor={(item) => item.value}
								renderItem={({ item }) => (
									<TouchableOpacity
										style={[
											themeStyles.languageItem,
											selectedLanguage === item.value &&
												themeStyles.activeLanguageItem,
										]}
										onPress={() => handleLanguageFilter(item.value)}>
										<Text
											style={[
												themeStyles.languageItemText,
												selectedLanguage === item.value &&
													themeStyles.activeLanguageItemText,
											]}>
											{item.label}
										</Text>
									</TouchableOpacity>
								)}
							/>
							<TouchableOpacity
								style={themeStyles.clearFilterButton}
								onPress={clearFilter}>
								<Text style={themeStyles.clearFilterText}>
									{t('clearFilter')}
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={themeStyles.closeFilterButton}
								onPress={() => setFilterModalVisible(false)}>
								<Text style={themeStyles.closeFilterText}>{t('close')}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
			</View>
		</SafeAreaView>
	);
}
