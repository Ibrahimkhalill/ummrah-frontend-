import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	FlatList,
	StyleSheet,
	ActivityIndicator,
	Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import PlaceIcon from '../../assets/place_icon.svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../component/ProgressBar';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../component/axiosInstance';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function PlaceSelection({ navigation }) {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [selectedTab, setSelectedTab] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedPlaces, setSelectedPlaces] = useState([]);
	const [locations, setLocations] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const fetchLocations = async () => {
			setIsLoading(true);
			try {
				const response = await axiosInstance.get('/mainapp/locations/');
				console.log('Fetched Locations:', response.data);
				setLocations(response.data);
				const meccaTab = response.data.find(
					(loc) => loc.main_city?.name.toLowerCase() === 'mecca'
				)?.main_city?.name;
				setSelectedTab(meccaTab || response.data[0]?.main_city?.name || '');
			} catch (error) {
				console.error('Error fetching locations:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchLocations();
	}, []);

	const toggleSelection = (id) => {
		if (selectedPlaces.includes(id)) {
			setSelectedPlaces(selectedPlaces.filter((placeId) => placeId !== id));
		} else {
			setSelectedPlaces([...selectedPlaces, id]);
		}
	};

	const filteredPlaces = locations.filter((place) => {
		const matchesSearch = place.location_name
			.toLowerCase()
			.includes(searchQuery.toLowerCase());
		const matchesTab =
			!selectedTab ||
			(place.main_city?.name &&
				place.main_city.name.toLowerCase() === selectedTab.toLowerCase());
		return matchesSearch && matchesTab;
	});

	console.log('selectedPlaces', selectedPlaces);

	const mainCities = [
		...new Set(locations.map((loc) => loc.main_city?.name).filter(Boolean)),
	];

	const handleConfirm = () => {
		if (!selectedPlaces.length) {
			Alert.alert('Warning', t('Please_select_Place'));
			return;
		}
		navigation.navigate('BookingCalendar', { place: selectedPlaces });
	};

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
			paddingHorizontal: 20,
			paddingTop: 10,
		},
		loadingContainer: {
			justifyContent: 'center',
			alignItems: 'center',
			flex: 1,
			width: '100%',
		},
		tabContainer: {
			flexDirection: 'row',
			borderBottomWidth: 1,
			borderBottomColor: isDarkMode ? theme.secondaryText : '#ddd',
			marginVertical: 10,
		},
		tab: {
			paddingVertical: 8,
			marginRight: 15,
		},
		selectedTab: {
			borderBottomWidth: 2,
			borderBottomColor: theme.text,
		},
		tabText: {
			fontSize: 16,
			color: theme.secondaryText,
		},
		selectedTabText: {
			color: theme.text,
			fontWeight: 'bold',
		},
		searchContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: isDarkMode ? '#333' : '#F5F5F5',
			borderRadius: 8,
			paddingHorizontal: 10,
			marginVertical: 15,
		},
		searchIcon: {
			marginRight: 8,
			color: theme.secondaryText,
		},
		searchInput: {
			flex: 1,
			fontSize: 16,
			height: 43,
			color: theme.text,
		},
		servicesTitle: {
			fontSize: 18,
			fontWeight: 'bold',
			color: theme.text,
			marginVertical: 10,
			paddingBottom: 20,
		},
		placeItem: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: isDarkMode ? '#333' : '#eee',
		},
		iconContainer: {
			padding: 8,
			borderRadius: 8,
			marginRight: 10,
		},
		placeIcon: {
			width: 20,
			height: 20,
		},
		placeName: {
			flex: 1,
			fontSize: 16,
			color: theme.text,
		},
		checkbox: {
			width: 22,
			height: 22,
		},
		confirmButton: {
			backgroundColor: '#C9A038',
			paddingVertical: 12,
			borderRadius: 8,
			alignItems: 'center',
			marginVertical: 20,
		},
		confirmText: {
			fontSize: 16,
			fontWeight: 'bold',
			color: '#fff',
		},
		backButton: {
			marginTop: 4,
		},
		emptyText: {
			textAlign: 'center',
			color: theme.secondaryText,
			marginVertical: 20,
		},
	});

	if (isLoading) {
		return (
			<View style={themeStyles.container}>
				<View style={themeStyles.loadingContainer}>
					<ActivityIndicator
						size="large"
						color={isDarkMode ? theme.text : '#2D6A4F'}
					/>
				</View>
			</View>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<View style={themeStyles.container}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						gap: 8,
						paddingBottom: 10,
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
				<View>
					<Text style={{ fontSize: 18, fontWeight: 600, color: theme.text }}>
						{t('find')}
					</Text>
				</View>

				{/* Tab Navigation */}
				<View style={themeStyles.tabContainer}>
					{mainCities.map((city) => (
						<TouchableOpacity
							key={city}
							style={[
								themeStyles.tab,
								selectedTab === city && themeStyles.selectedTab,
							]}
							onPress={() => setSelectedTab(city)}>
							<Text
								style={[
									themeStyles.tabText,
									selectedTab === city && themeStyles.selectedTabText,
								]}>
								{city}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Search Bar */}
				<View style={themeStyles.searchContainer}>
					<Ionicons
						name="search-outline"
						size={20}
						color={theme.secondaryText}
						style={themeStyles.searchIcon}
					/>
					<TextInput
						style={themeStyles.searchInput}
						placeholder={t('search')}
						placeholderTextColor={theme.secondaryText}
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
				</View>

				{/* Services Section */}
				<Text style={themeStyles.servicesTitle}>{t('services')}</Text>

				{/* Places List */}
				<FlatList
					data={filteredPlaces}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<View style={themeStyles.placeItem}>
							<View style={themeStyles.iconContainer}>
								<PlaceIcon style={themeStyles.placeIcon} />
							</View>
							<Text
								onPress={() => toggleSelection(item.location_name)}
								style={themeStyles.placeName}>
								{item.location_name}
							</Text>
							<Checkbox
								value={selectedPlaces.includes(item.location_name)}
								onValueChange={() => toggleSelection(item.location_name)}
								color={
									selectedPlaces.includes(item.location_name)
										? '#4CAF50'
										: undefined
								}
								style={themeStyles.checkbox}
							/>
						</View>
					)}
					ListEmptyComponent={() => (
						<Text style={themeStyles.emptyText}>{t('noPlacesFound')}</Text>
					)}
					showsVerticalScrollIndicator={false} // 👈 This hides the scrollbar
				/>

				{/* Confirm Button */}
				<TouchableOpacity
					style={themeStyles.confirmButton}
					onPress={handleConfirm}>
					<Text style={themeStyles.confirmText}>{t('confirm')}</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
