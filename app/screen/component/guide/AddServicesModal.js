import React, { useEffect, useState } from 'react';
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
import { useTranslation } from 'react-i18next'; // Import react-i18next
import axiosInstance from '../axiosInstance';
import { useTheme } from '../hook/ThemeContext';

const AddServicesModal = ({ visible, onClose, onAddService }) => {
	const { t } = useTranslation(); // Use translation hook
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [selected, setSelected] = useState('');
	const [selectedLocation, setSelectedLocation] = useState('');
	const [data, setData] = useState([]);
	const [location, setLocation] = useState([]);
	const [location_id, setLocationId] = useState(null);
	const [price, setPrice] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [showCityModal, setShowCityModal] = useState(false);

	console.log('location_id', location_id);

	const handleAddService = () => {
		if (location_id && price) {
			onAddService({
				location_id: parseInt(location_id, 10), // Ensure integer
				price: price, // String or number
			});
			setPrice(null);
			setSelected('');
			setSelectedLocation('');
			onClose();
		} else {
			alert(t('pleaseFillAllFields'));
		}
	};

	const toggleDropdown = () => {
		setShowModal(!showModal);
	};

	const handleSelectItem = (item) => {
		setSelected(item.name);
		setShowModal(false); // Close the dropdown after selection
	};

	const handleLocationSelect = (item) => {
		setSelectedLocation(item.location_name);
		setLocationId(item.id);
		setShowCityModal(false); // Close the dropdown after selection
	};

	useEffect(() => {
		fetchMainCities();
		fetchCities();
	}, []);

	const fetchMainCities = async () => {
		try {
			const response = await axiosInstance.get('/mainapp/main-cities/');
			console.log('d', response.data);
			setData(response.data);
		} catch (error) {
			console.error('Error fetching Main Cities:', error);
			alert(t('error_fetching_services'));
		}
	};

	const fetchCities = async () => {
		try {
			const response = await axiosInstance.get('/mainapp/locations/');
			setLocation(response.data);
		} catch (error) {
			console.error('Error fetching Cities:', error);
			alert(t('error_fetching_services'));
		}
	};

	console.log(location);

	const [filterLocationData, setFilterLocationData] = useState([]);

	useEffect(() => {
		if (selected) {
			const filter = location.filter(
				(item) => item.main_city.name === selected
			);
			setFilterLocationData(filter);
			setSelectedLocation('');
		}
	}, [selected]);

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
							{t('addLocation')}
						</Text>
						<Text style={[styles.modalSubText, { color: theme.text }]}>
							{t('locationPublicNotice')}
						</Text>
						<View style={{ position: 'relative' }}>
							<Text style={[styles.label, { color: theme.text }]}>
								{t('city')}
							</Text>
							{/* Custom Dropdown */}
							<TouchableOpacity
								style={[
									styles.dropdownContainer,
									{ borderColor: isDarkMode ? '#444' : '#e0e0e0' },
								]}
								onPress={toggleDropdown}>
								<Text style={[styles.dropdownText, { color: theme.text }]}>
									{selected || t('Select a place')}
								</Text>
							</TouchableOpacity>

							{showModal && (
								<View
									style={[
										styles.dropdownOptions,
										{
											backgroundColor: isDarkMode ? '#333' : '#fff',
											borderColor: isDarkMode ? '#444' : '#e0e0e0',
										},
									]}>
									<FlatList
										data={data}
										keyExtractor={(item) => item.key}
										renderItem={({ item, index }) => (
											<TouchableOpacity
												key={index}
												style={[
													styles.option,
													{ borderColor: isDarkMode ? '#444' : '#e0e0e0' },
												]}
												onPress={() => handleSelectItem(item)}>
												<Text
													style={[styles.optionText, { color: theme.text }]}>
													{item.name}
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
								onPress={() => setShowCityModal(!showCityModal)}>
								<Text style={[styles.dropdownText, { color: theme.text }]}>
									{selectedLocation || t('Select a place')}
								</Text>
							</TouchableOpacity>

							{showCityModal && (
								<View
									style={[
										styles.dropdownOptions,
										{
											backgroundColor: isDarkMode ? '#333' : '#fff',
											borderColor: isDarkMode ? '#444' : '#e0e0e0',
										},
									]}>
									<FlatList
										data={filterLocationData}
										keyExtractor={(item) => item.id}
										renderItem={({ item, index }) => (
											<TouchableOpacity
												key={index}
												style={[
													styles.option,
													{ borderColor: isDarkMode ? '#444' : '#e0e0e0' },
												]}
												onPress={() => handleLocationSelect(item)}>
												<Text
													style={[styles.optionText, { color: theme.text }]}>
													{item.location_name}
												</Text>
											</TouchableOpacity>
										)}
									/>
								</View>
							)}
						</View>

						<Text style={[styles.label, { color: theme.text }]}>
							{t('pricePerDay')}
						</Text>
						<TextInput
							style={[
								styles.input,
								{
									borderColor: isDarkMode ? '#444' : '#e0e0e0',
									color: theme.text,
								},
							]}
							value={price}
							onChangeText={setPrice}
							placeholder={t('enterPrice')}
							placeholderTextColor={isDarkMode ? '#aaa' : '#999'}
							keyboardType="numeric"
						/>

						<TouchableOpacity
							style={styles.updateButton}
							onPress={handleAddService}>
							<Text style={styles.updateButtonText}>{t('add')}</Text>
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
		borderRadius: 5,
		padding: 10,
		marginBottom: 15,
		justifyContent: 'center',
	},
	dropdownText: {
		fontSize: 16,
		color: '#333',
	},
	dropdownOptions: {
		position: 'absolute',
		top: 70,
		width: '100%',
		backgroundColor: '#fff',
		borderRadius: 5,
		elevation: 5,
		zIndex: 1,
		left: 0,
		maxHeight: 200,
		borderWidth: 1,
	},
	option: {
		padding: 10,
		borderBottomWidth: 1,
		borderColor: '#e0e0e0',
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

export default AddServicesModal;
