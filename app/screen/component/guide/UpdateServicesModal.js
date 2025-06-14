import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Modal,
	TextInput,
	FlatList,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SimpleLineIcons } from '@expo/vector-icons';
import axiosInstance from '../axiosInstance';
import { useTheme } from '../hook/ThemeContext';

const UpdateServiceModal = ({
	visible,
	onClose,
	onUpdateService,
	initialService,
}) => {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [service, setService] = useState({
		main_city_id: '',
		location_id: '',
		price: '',
	});
	const [mainCities, setMainCities] = useState([]);
	const [locations, setLocations] = useState([]);
	const [filteredLocations, setFilteredLocations] = useState([]);
	const [showMainCityDropdown, setShowMainCityDropdown] = useState(false);
	const [showLocationDropdown, setShowLocationDropdown] = useState(false);
	const [locationName, setLocationName] = useState('');

	// Fetch data when modal opens
	useEffect(() => {
		if (visible) {
			fetchMainCities();
			fetchLocations();
		}
	}, [visible]);

	// Update service state and filter locations when initialService or locations change
	useEffect(() => {
		if (initialService && locations.length > 0) {
			const mainCityId =
				initialService.location?.main_city?.id?.toString() || '';
			setService({
				main_city_id: mainCityId,
				location_id: initialService.location?.id?.toString() || '',
				price: initialService.price || '',
			});
			setLocationName(initialService.location?.location_name || '');
			filterLocations(mainCityId);
		}
	}, [initialService, locations]);

	const fetchMainCities = async () => {
		try {
			const response = await axiosInstance.get('/mainapp/main-cities/');
			setMainCities(response.data);
		} catch (error) {
			console.error('Error fetching Main Cities:', error);
			alert(t('error_fetching_main_cities'));
		}
	};

	const fetchLocations = async () => {
		try {
			const response = await axiosInstance.get('/mainapp/locations/');
			setLocations(response.data);
		} catch (error) {
			console.error('Error fetching Locations:', error);
			alert(t('error_fetching_locations'));
		}
	};

	const filterLocations = (mainCityId) => {
		const filtered = locations.filter(
			(loc) => loc.main_city && loc.main_city.id.toString() === mainCityId
		);
		setFilteredLocations(filtered);
		console.log('Filtered Locations:', filtered); // Debug filtered results
	};

	const handleMainCitySelect = (item) => {
		setService((prev) => ({
			...prev,
			main_city_id: item.id.toString(),
			location_id: '',
		}));
		setLocationName(''); // Reset location name when main city changes
		filterLocations(item.id.toString());
		setShowMainCityDropdown(false);
	};

	const handleLocationSelect = (item) => {
		setService((prev) => ({ ...prev, location_id: item.id.toString() }));
		setLocationName(item.location_name);
		setShowLocationDropdown(false);
	};

	const handleUpdateService = () => {
		if (service.location_id && service.price) {
			const updatedService = {
				id: initialService.id,
				location_id: parseInt(service.location_id, 10),
				price: service.price,
			};
			console.log('Sending to onUpdateService:', updatedService); // Debug payload
			onUpdateService(updatedService);
			onClose();
		} else {
			alert(t('pleaseFillAllFields'));
		}
	};

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}>
				<View style={styles.modalContainer}>
					<View
						style={[
							styles.modalContent,
							{ backgroundColor: isDarkMode ? '#333' : '#fff' },
						]}>
						<Text style={[styles.modalTitle, { color: theme.text }]}>
							{t('editService')}
						</Text>
						<Text style={[styles.modalSubText, { color: theme.text }]}>
							{t('servicesPublicNotice')}
						</Text>

						<View>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('city')}
							</Text>
							<TouchableOpacity
								style={[
									styles.dropdownContainer,
									{ borderColor: isDarkMode ? '#444' : '#e0e0e0' },
								]}
								onPress={() => setShowMainCityDropdown(!showMainCityDropdown)}>
								<Text style={[styles.dropdownText, { color: theme.text }]}>
									{mainCities.find(
										(city) => city.id.toString() === service.main_city_id
									)?.name || t('selectMainCity')}
								</Text>
								{showMainCityDropdown ? (
									<SimpleLineIcons
										name="arrow-up"
										size={16}
										color={theme.text}
									/>
								) : (
									<SimpleLineIcons
										name="arrow-down"
										size={16}
										color={theme.text}
									/>
								)}
							</TouchableOpacity>
							{showMainCityDropdown && (
								<View
									style={[
										styles.dropdownOptions,
										{
											backgroundColor: isDarkMode ? '#333' : '#fff',
											borderColor: isDarkMode ? '#444' : '#e0e0e0',
										},
									]}>
									<FlatList
										data={mainCities}
										keyExtractor={(item) => item.id.toString()}
										renderItem={({ item }) => (
											<TouchableOpacity
												style={styles.option}
												onPress={() => handleMainCitySelect(item)}>
												<Text
													style={[styles.optionText, { color: theme.text }]}>
													{item.name || t('unnamed_city')}
												</Text>
											</TouchableOpacity>
										)}
									/>
								</View>
							)}
						</View>

						<View>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('location')}
							</Text>
							<TouchableOpacity
								style={[
									styles.dropdownContainer,
									{ borderColor: isDarkMode ? '#444' : '#e0e0e0' },
								]}
								onPress={() => setShowLocationDropdown(!showLocationDropdown)}
								disabled={filteredLocations.length === 0}>
								<Text style={[styles.dropdownText, { color: theme.text }]}>
									{locationName || t('selectLocation')}
								</Text>
								{showLocationDropdown ? (
									<SimpleLineIcons
										name="arrow-up"
										size={16}
										color={theme.text}
									/>
								) : (
									<SimpleLineIcons
										name="arrow-down"
										size={16}
										color={theme.text}
									/>
								)}
							</TouchableOpacity>
							{showLocationDropdown && (
								<View
									style={[
										styles.dropdownOptions,
										{
											backgroundColor: isDarkMode ? '#333' : '#fff',
											borderColor: isDarkMode ? '#444' : '#e0e0e0',
										},
									]}>
									<FlatList
										data={filteredLocations}
										keyExtractor={(item) => item.id.toString()}
										renderItem={({ item }) => (
											<TouchableOpacity
												style={styles.option}
												onPress={() => handleLocationSelect(item)}>
												<Text
													style={[styles.optionText, { color: theme.text }]}>
													{item.location_name || t('unnamed_location')}
												</Text>
											</TouchableOpacity>
										)}
									/>
								</View>
							)}
						</View>

						<Text style={[styles.label, { color: theme.text }]}>
							{t('price')}
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									borderColor: isDarkMode ? '#444' : '#e0e0e0',
									color: theme.text,
								},
							]}
							value={service.price}
							onChangeText={(text) => setService({ ...service, price: text })}
							placeholder={t('enterPrice')}
							placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
							keyboardType="numeric"
						/>

						<TouchableOpacity
							style={styles.updateButton}
							onPress={handleUpdateService}>
							<Text style={styles.updateButtonText}>{t('update')}</Text>
						</TouchableOpacity>

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
			</KeyboardAvoidingView>
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
		width: '90%',
		elevation: 5,
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
		paddingBottom: 10,
	},
	modalSubText: {
		fontSize: 14,
		color: '#666',
		fontWeight: '400',
		marginBottom: 15,
	},
	label: {
		fontSize: 16,
		color: '#333',
		marginBottom: 5,
		fontWeight: '500',
	},
	input: {
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
		fontSize: 16,
	},
	dropdownContainer: {
		borderWidth: 1,
		borderColor: '#e0e0e0',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
	},
	dropdownText: {
		fontSize: 16,
		color: '#333',
	},
	dropdownOptions: {
		position: 'absolute',
		top: 70,
		left: 0,
		right: 0,
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#e0e0e0',
		borderRadius: 5,
		maxHeight: 200,
		zIndex: 1000,
	},
	option: {
		padding: 10,
	},
	optionText: {
		fontSize: 16,
		color: '#333',
	},
	updateButton: {
		backgroundColor: '#D4A017',
		paddingVertical: 12,
		borderRadius: 5,
		alignItems: 'center',
		marginTop: 10,
	},
	updateButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
	closeButton: {
		marginTop: 10,
		paddingVertical: 10,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(84, 76, 76, 0.14)',
	},
	closeButtonText: {
		color: '#666',
		fontSize: 16,
	},
});

export default UpdateServiceModal;
