import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	FlatList,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../component/BackButton';
import { useTranslation } from 'react-i18next';
import UpdateServiceModal from '../component/guide/UpdateServicesModal';
import DeleteConfirmationModal from '../component/guide/DeleteConfirmationModal';
import axiosInstance from '../component/axiosInstance';
import AddServicesModal from '../component/guide/AddServicesModal';
import { useTheme } from '../component/hook/ThemeContext';

export default function ServiceList({ navigation }) {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme();
	const [modalVisible, setModalVisible] = useState(false);
	const [updateModalVisible, setUpdateModalVisible] = useState(false);
	const [deleteModalVisible, setDeleteModalVisible] = useState(false);
	const [selectedService, setSelectedService] = useState(null);
	const [services, setServices] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch services from backend on mount
	useEffect(() => {
		fetchServices();
	}, []);

	const fetchServices = async () => {
		setIsLoading(true);
		try {
			const response = await axiosInstance.get('/mainapp/services/');
			setServices(response.data);
			console.log('services', response.data);
		} catch (error) {
			console.error('Error fetching services:', error);
			alert(t('error_fetching_services'));
		} finally {
			setIsLoading(false);
		}
	};

	// Helper function to check for duplicate service names
	const checkDuplicateServiceName = (serviceName, excludeId = null) => {
		if (!serviceName) return false;
		return services.some((service) => service.location.id === serviceName);
	};

	const handleAddService = async (newService) => {
		// Check for duplicate name

		const serviceName = newService?.location_id;

		if (checkDuplicateServiceName(serviceName)) {
			console.log('Duplicate service name found:', serviceName);
			Alert.alert(t('warning'), t('service_already_exists'));
			return;
		}

		try {
			const response = await axiosInstance.post(
				'/mainapp/services/',
				newService
			);
			setServices([...services, response.data]);
			setModalVisible(false);
			Alert.alert('Success', 'Services Added Successfully');
			fetchServices();
		} catch (error) {
			console.error('Error adding service:', error);
			alert(t('error_adding_service'));
		}
	};

	const handleUpdateService = async (updatedService) => {
		// Check for duplicate name, excluding the current service
		const serviceName = updatedService?.location?.location_name;
		if (checkDuplicateServiceName(serviceName, updatedService.id)) {
			Alert.alert(t('error'), t('service_already_exists'));
			return;
		}
		try {
			const response = await axiosInstance.put(
				`/mainapp/services/${updatedService.id}/`,
				updatedService
			);
			const updatedServices = services.map((svc) =>
				svc.id === updatedService.id ? response.data : svc
			);
			Alert.alert('Success', 'Services Updated Successfully');
			setServices(updatedServices);
			setUpdateModalVisible(false);
			setSelectedService(null);
		} catch (error) {
			console.error('Error updating service:', error);
			alert(t('error_updating_service'));
		}
	};

	const handleDeleteService = async () => {
		try {
			await axiosInstance.delete(`/mainapp/services/${selectedService.id}/`);
			const updatedServices = services.filter(
				(svc) => svc.id !== selectedService.id
			);
			Alert.alert('Success', 'Services Deleted Successfully');
			setServices(updatedServices);
			setDeleteModalVisible(false);
			setSelectedService(null);
		} catch (error) {
			console.error('Error deleting service:', error);
			alert(t('error_deleting_service'));
		}
	};

	const handleUpdateRow = (item) => {
		setSelectedService(item);
		setUpdateModalVisible(true);
	};

	const renderHeader = () => (
		<View
			style={[
				styles.headerRow,
				{ borderBottomColor: isDarkMode ? '#444' : '#e0e0e0' },
			]}>
			<Text style={[styles.headerColumnText, { color: theme.text }]}>
				{t('location')}
			</Text>
			<Text style={[styles.headerColumnText, { color: theme.text }]}>
				{t('price')}
			</Text>
			<Text style={[styles.headerColumnText, { color: theme.text }]}>
				{t('action')}
			</Text>
		</View>
	);

	const renderItem = ({ item }) => (
		<View
			style={[
				styles.listItem,
				{ borderBottomColor: isDarkMode ? '#444' : '#e0e0e0' },
			]}
			key={item.id}>
			<Text style={[styles.locationText, { color: theme.text }]}>
				{item.location ? item.location.location_name : t('no_location')}
			</Text>
			<Text style={[styles.priceText, { color: theme.text }]}>
				{item.price || t('no_price')}
			</Text>
			<View style={styles.actionContainer}>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => {
						setSelectedService(item);
						setDeleteModalVisible(true);
					}}>
					<Ionicons name="trash-outline" size={20} color={theme.text} />
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.actionButton}
					onPress={() => handleUpdateRow(item)}>
					<Feather name="edit" size={20} color={theme.text} />
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<SafeAreaView
			style={[styles.safeArea, { backgroundColor: theme.background }]}>
			<View style={{ paddingLeft: 19 }}>
				<BackButton navigation={navigation} />
			</View>
			<View
				style={[
					styles.header,
					{
						backgroundColor: theme.background,
						borderBottomColor: isDarkMode ? '#444' : '#e0e0e0',
					},
				]}>
				<Text style={[styles.headerText, { color: theme.text }]}>
					{t('services')}
				</Text>
				<Text style={[styles.subHeaderText, { color: theme.text }]}>
					{t('servicesPublicNotice')}
				</Text>
			</View>
			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={theme.text} />
				</View>
			) : (
				<FlatList
					data={services}
					renderItem={renderItem}
					keyExtractor={(item) => item.id.toString()}
					style={styles.list}
					showsVerticalScrollIndicator={false}
					ListHeaderComponent={renderHeader}
				/>
			)}
			<TouchableOpacity
				style={styles.addButton}
				onPress={() => setModalVisible(true)}>
				<Ionicons name="add" size={24} color="#fff" />
			</TouchableOpacity>
			<AddServicesModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				onAddService={handleAddService}
			/>
			<UpdateServiceModal
				visible={updateModalVisible}
				onClose={() => {
					setUpdateModalVisible(false);
					setSelectedService(null);
				}}
				onUpdateService={handleUpdateService}
				initialService={selectedService}
			/>
			<DeleteConfirmationModal
				visible={deleteModalVisible}
				onClose={() => {
					setDeleteModalVisible(false);
					setSelectedService(null);
				}}
				onConfirmDelete={handleDeleteService}
				serviceName={
					selectedService?.location?.location_name || t('unnamed_service')
				}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	header: {
		padding: 20,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	headerText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#333',
	},
	subHeaderText: {
		fontSize: 14,
		color: '#666',
		fontWeight: '400',
	},
	list: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 10,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 15,
		borderBottomWidth: 2,
		borderBottomColor: '#e0e0e0',
		width: '100%',
	},
	headerColumnText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	listItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	locationText: {
		fontSize: 16,
		color: '#333',
		width: 100,
		fontWeight: '500',
	},
	priceText: {
		fontSize: 16,
		color: '#333',
		textAlign: 'left',
		fontWeight: '500',
	},
	actionContainer: {
		flexDirection: 'row',
		gap: 0,
	},
	actionButton: {
		padding: 8,
	},
	addButton: {
		position: 'absolute',
		bottom: 20,
		right: 20,
		backgroundColor: '#4CAF50',
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
