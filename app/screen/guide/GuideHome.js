import React, { useEffect, useState, useCallback } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	Image,
	StyleSheet,
	ActivityIndicator,
	Alert,
	Linking,
	Modal,
	RefreshControl, // Added for pull-to-refresh
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import GuideNavigationBar from '../component/guide/GuideNavigationBar';
import axiosInstance from '../component/axiosInstance';
import { useTranslation } from 'react-i18next';
import OrderAcceptModal from '../component/guide/OrderAcceptModal';
import * as Notifications from 'expo-notifications';
import MessengerIcon from '../component/MessengerIcon';
import { useTheme } from '../component/hook/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

const GuideHome = ({ navigation }) => {
	const { t } = useTranslation();

	const { theme, isDarkMode } = useTheme();
	const [activeTab, setActiveTab] = useState('pending');
	const [transactions, setTransactions] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [apiLoading, setApiLoading] = useState(false);
	const [error, setError] = useState(null);
	const [guideId, setGuideId] = useState(null);
	const [visible, setVisible] = useState(false);
	const [newTransaction, setNewTransaction] = useState({});
	const [unreadCount, setUnreadCount] = useState(0);
	const [metrics, setMetrics] = useState({
		total_income: 0,
		ongoing_trips: 0,
		review_average: 0,
		total_completed_trips: 0,
	});
	const [refreshing, setRefreshing] = useState(false); // Added for pull-to-refresh

	// Fetch initial data
	useFocusEffect(
		React.useCallback(() => {
			const fetchInitialData = async () => {
				setLoading(true);
				try {
					await Promise.all([
						fetchProfile(),
						fetchTransactions(),
						fetchChatCountUnread(),
						fetchMetrics(),
					]);
				} catch (err) {
					setError(t('errorLoadingData'));
				} finally {
					setLoading(false);
				}
			};

			fetchInitialData();
		}, [])
	);

	// WebSocket for new transactions
	useFocusEffect(
		React.useCallback(() => {
			if (guideId) {
				const ws = new WebSocket(
					`wss://nusukey.duckdns.org/ws/guide/transactions/?guide_id=${guideId}`
				);

				ws.onopen = () =>
					console.log('✅ WebSocket connected for transactions');

				ws.onmessage = (event) => {
					const data = JSON.parse(event.data);
					if (data.type === 'new_transaction') {
						console.log('🚀 New Transaction Received:', data);
						fetchTransactions(data.transaction_id);
					}
				};

				ws.onclose = () => console.log('⚠️ WebSocket Disconnected');

				return () => ws.close();
			}
		}, [guideId])
	);

	// Filter transactions when activeTab or transactions change
	useFocusEffect(
		React.useCallback(() => {
			if (transactions.length > 0) {
				filterTransactions(activeTab);
			}
		}, [activeTab, transactions])
	);

	// Notification listener for unread chat count
	useEffect(() => {
		const notificationListener = Notifications.addNotificationReceivedListener(
			() => {
				console.log('Push notification received');
				fetchChatCountUnread();
				fetchTransactions();
			}
		);

		return () => {
			if (notificationListener) {
				Notifications.removeNotificationSubscription(notificationListener);
			}
		};
	}, []);

	// Fetch guide profile
	const fetchProfile = async () => {
		try {
			const response = await axiosInstance.get('/auth/profile/');
			setGuideId(response.data.user.id);
		} catch (error) {
			console.error('Error fetching profile:', error);
			setError(t('errorLoadingProfile'));
		}
	};

	// Fetch transaction metrics
	const fetchMetrics = async () => {
		try {
			const response = await axiosInstance.get('/mainapp/guide/metrics/');
			setMetrics(response.data);
		} catch (error) {
			console.error('Error fetching metrics:', error);
			setError(t('errorLoadingMetrics'));
		}
	};

	// Fetch unread chat count
	const fetchChatCountUnread = async () => {
		try {
			const response = await axiosInstance.get('/chat/count/unread/');
			console.log('red', response.data);
			setUnreadCount(response.data.total_unread);
		} catch (error) {
			console.error('Error fetching unread count:', error);
			setError(t('errorLoadingUnreadCount'));
		}
	};

	// Fetch transactions
	const fetchTransactions = async (transactionId = null) => {
		try {
			const response = await axiosInstance.get('/mainapp/transactions/');
			if (Array.isArray(response.data)) {
				setTransactions(response.data);
				filterTransactions(activeTab, response.data);
				if (transactionId) {
					const newTransaction = response.data.find(
						(item) => item.id === transactionId
					);
					if (newTransaction) {
						setNewTransaction(newTransaction);
						setVisible(true);
					}
				}
			} else {
				throw new Error('Unexpected API response format');
			}
		} catch (error) {
			console.error('Error fetching transactions:', error);
			setTransactions([]);
			setError(t('errorLoadingTransactions'));
		}
	};

	// Filter transactions by status
	const filterTransactions = (status, data = transactions) => {
		if (!Array.isArray(data)) {
			setFilteredData([]);
			return;
		}
		const filtered = data.filter(
			(transaction) => transaction.status.toLowerCase() === status.toLowerCase()
		);
		setFilteredData(filtered);
	};

	// Handle pull-to-refresh
	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		try {
			await Promise.all([
				fetchProfile(),
				fetchTransactions(),
				fetchChatCountUnread(),
				fetchMetrics(),
			]);
		} catch (err) {
			setError(t('errorLoadingData'));
		} finally {
			setRefreshing(false);
		}
	}, []);

	// Format date
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const options = { day: '2-digit', month: 'short' };
		return date.toLocaleDateString('en-US', options);
	};

	// Get translated status text
	const getStatusText = (status) => {
		return t(status.toLowerCase());
	};

	// Handle cancel action
	const handleCancel = async (transactionId) => {
		Alert.alert(t('confirmCancellation'), t('areYouSureCancel'), [
			{ text: t('no'), style: 'cancel' },
			{
				text: t('yes'),
				onPress: async () => {
					setApiLoading(true);
					try {
						const response = await axiosInstance.delete(
							`/mainapp/transactions/${transactionId}/`
						);
						if (response.status === 204) {
							Alert.alert(t('success'), t('orderCanceled'));
							fetchTransactions();
							setVisible(false);
						} else {
							Alert.alert(t('error'), t('failedToCancelOrder'));
						}
					} catch (error) {
						console.error('Cancel error:', error);
						Alert.alert(t('error'), t('somethingWentWrong'));
					} finally {
						setApiLoading(false);
					}
				},
			},
		]);
	};

	// Handle update action
	const handleUpdate = async (transactionId) => {
		Alert.alert(t('confirmBooking'), t('areYouSureAccept'), [
			{ text: t('no'), style: 'cancel' },
			{
				text: t('yes'),
				onPress: async () => {
					setApiLoading(true);
					try {
						const response = await axiosInstance.put(
							`/mainapp/transactions/${transactionId}/`,
							{
								status: 'Payment',
							}
						);
						if (response.status === 200) {
							Alert.alert(t('success'), t('orderMarkedAsPayment'));
							fetchTransactions();
							setVisible(false);
						} else {
							Alert.alert(t('error'), t('failedToUpdateOrder'));
						}
					} catch (error) {
						console.error('Update error:', error);
						Alert.alert(t('error'), t('somethingWentWrong'));
					} finally {
						setApiLoading(false);
					}
				},
			},
		]);
	};

	// Render transaction item
	const renderTransactionItem = ({ item }) => {
		const handleCall = () => {
			const phoneNumber = `tel:${item.user.phone_number}`;
			Linking.openURL(phoneNumber).catch((err) => {
				if (err.message.includes('Unable to open URL')) {
					Alert.alert(t('callError'), t('phoneCallNotSupported'), [
						{ text: t('ok') },
					]);
				}
			});
		};
		return (
			<View
				style={[
					styles.card,
					{
						backgroundColor: isDarkMode ? '#333' : '#fff',
						borderColor: isDarkMode ? '#444' : 'rgba(34, 34, 34, 0.1)',
					},
				]}>
				<Image source={{ uri: item.user.image }} style={styles.image} />
				<View style={styles.details}>
					<View style={styles.header}>
						<Text style={[styles.name, { color: theme.text }]}>
							{item.user?.name}
						</Text>
						<MessengerIcon
							size={30}
							navigation={navigation}
							screen_name={'Chat'}
							reciver_id={item.user.user.id}
							name={item.user.name}
						/>
					</View>
					<View style={styles.locationContainer}>
						<Ionicons name="location-outline" size={15} color={theme.text} />
						<Text style={[styles.location, { color: theme.text }]}>
							{Array.isArray(item.services)
								? item.services
										.map((loc) => loc.location.location_name)
										.join(', ')
								: t('unknownLocation')}
						</Text>
					</View>
					{item.status === 'Ongoing' && (
						<Text style={[styles.status, { color: '#D32F2F' }]}>
							{t('statusLabel')}: {getStatusText(item.status)} (
							{formatDate(item.trip_started_date)} -{' '}
							{formatDate(item.trip_end_date)})
						</Text>
					)}
					{item.status === 'Complete' && (
						<Text style={[styles.status, { color: '#2E8B57' }]}>
							{t('statusLabel')}: {getStatusText(item.status)}
						</Text>
					)}
					{item.status === 'Pending' && (
						<Text style={[styles.status, { color: '#C9A038' }]}>
							{t('statusLabel')}: {getStatusText(item.status)} (
							{formatDate(item.trip_started_date)} -{' '}
							{formatDate(item.trip_end_date)})
						</Text>
					)}
					{item.status === 'Payment' && (
						<Text style={[styles.status, { color: '#C9A038' }]}>
							{t('statusLabel')}: {getStatusText(item.status)} (
							{formatDate(item.trip_started_date)} -{' '}
							{formatDate(item.trip_end_date)})
						</Text>
					)}
					{item.status === 'Pending' ? (
						<View style={styles.actionContainer}>
							<Text
								style={[styles.phone, { color: theme.text }]}
								onPress={handleCall}>
								<Ionicons name="call-outline" size={14} color={theme.text} />{' '}
								{item.user?.phone_number}
							</Text>
							<View style={styles.buttonContainer}>
								<TouchableOpacity
									onPress={() => handleCancel(item.id)}
									style={[
										styles.cancelButton,
										{
											backgroundColor: isDarkMode ? '#444' : '#fff',
											borderColor: isDarkMode
												? '#555'
												: 'rgba(34, 34, 34, 0.2)',
										},
									]}>
									<Text style={[styles.buttonText, { color: theme.text }]}>
										{t('cancel')}
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => handleUpdate(item.id)}
									style={styles.acceptButton}>
									<Text style={styles.aceptbuttonText}>{t('accept')}</Text>
								</TouchableOpacity>
							</View>
						</View>
					) : (
						<Text
							style={[styles.phone, { color: theme.text }]}
							onPress={handleCall}>
							<Ionicons name="call-outline" size={14} color={theme.text} />{' '}
							{item.user?.phone_number}
						</Text>
					)}
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView
			style={[styles.safeAreaContainer, { backgroundColor: theme.background }]}>
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				{/* Earnings Section */}
				<View style={styles.earningsContainer}>
					<Text style={styles.earningsTitle}>{t('stcPay')}</Text>
					<Text>
						<Text style={styles.earningsAmount}>
							{metrics.total_income.toFixed(2)}
						</Text>
						<Text style={styles.earningsAmount}>{t('currencySar')}</Text>
					</Text>
				</View>

				{/* Stats Section */}
				<View style={styles.statsContainer}>
					<View
						style={[
							styles.statBox,
							{
								backgroundColor: isDarkMode
									? 'rgba(201, 160, 56, 0.2)'
									: 'rgba(201, 160, 56, 0.1)',
								borderColor: isDarkMode
									? 'rgba(201, 160, 56, 0.3)'
									: 'rgba(201, 160, 56, 0.1)',
							},
						]}>
						<Text style={[styles.statLabel, { color: theme.text }]}>
							{t('totalEarning')}
						</Text>
						<View style={styles.statValueContainer}>
							<Text style={[styles.statValue, { color: theme.text }]}>
								{t('currencySar')}
							</Text>
							<Text style={[styles.statValue, { color: theme.text }]}>
								{metrics.total_income.toFixed(2)}
							</Text>
						</View>
					</View>
					<View
						style={[
							styles.statBox,
							{
								backgroundColor: isDarkMode
									? 'rgba(201, 160, 56, 0.2)'
									: 'rgba(201, 160, 56, 0.1)',
								borderColor: isDarkMode
									? 'rgba(201, 160, 56, 0.3)'
									: 'rgba(201, 160, 56, 0.1)',
							},
						]}>
						<Text style={[styles.statLabel, { color: theme.text }]}>
							{t('ongoingTrip')}
						</Text>
						<Text style={[styles.statValue, { color: theme.text }]}>
							{metrics.ongoing_trips || 0}
						</Text>
					</View>
					<View
						style={[
							styles.statBox,
							{
								backgroundColor: isDarkMode
									? 'rgba(201, 160, 56, 0.2)'
									: 'rgba(201, 160, 56, 0.1)',
								borderColor: isDarkMode
									? 'rgba(201, 160, 56, 0.3)'
									: 'rgba(201, 160, 56, 0.1)',
							},
						]}>
						<Text style={[styles.statLabel, { color: theme.text }]}>
							{t('fiveStarPercentage')}
						</Text>
						<Text style={[styles.statValue, { color: theme.text }]}>
							{metrics.review_average.toFixed(1)}/5
						</Text>
					</View>
					<View
						style={[
							styles.statBox,
							{
								backgroundColor: isDarkMode
									? 'rgba(201, 160, 56, 0.2)'
									: 'rgba(201, 160, 56, 0.1)',
								borderColor: isDarkMode
									? 'rgba(201, 160, 56, 0.3)'
									: 'rgba(201, 160, 56, 0.1)',
							},
						]}>
						<Text style={[styles.statLabel, { color: theme.text }]}>
							{t('tripsCompleted')}
						</Text>
						<Text style={[styles.statValue, { color: theme.text }]}>
							{metrics.total_completed_trips || 0}
						</Text>
					</View>
				</View>

				{/* Tabs */}
				<View
					style={[
						styles.tabContainer,
						{ backgroundColor: isDarkMode ? '#333' : '#f5f5f5' },
					]}>
					{['pending', 'payment', 'ongoing', 'complete'].map((tab) => (
						<TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
							<Text
								style={[
									styles.tabText,
									{ color: theme.text },
									activeTab === tab && styles.activeTab,
								]}>
								{t(tab)}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Transaction List */}
				{loading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={theme.text} />
					</View>
				) : error ? (
					<View style={styles.errorContainer}>
						<Text style={[styles.errorText, { color: theme.text }]}>
							{error}
						</Text>
						<TouchableOpacity
							onPress={() => fetchTransactions()}
							style={styles.retryButton}>
							<Text style={styles.retryButtonText}>{t('retry')}</Text>
						</TouchableOpacity>
					</View>
				) : (
					<FlatList
						data={filteredData}
						keyExtractor={(item) => item.id.toString()}
						renderItem={renderTransactionItem}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={onRefresh}
								colors={[theme.text]} // Loader color
								tintColor={theme.text} // iOS loader color
							/>
						}
						ListEmptyComponent={
							<View style={styles.emptyContainer}>
								<Text style={[styles.emptyText, { color: theme.text }]}>
									{t('noTransactions')}
								</Text>
							</View>
						}
					/>
				)}

				{/* Order Accept Modal */}
				<OrderAcceptModal
					navigation={navigation}
					visible={visible}
					setVisible={setVisible}
					data={newTransaction}
					onAccept={handleUpdate}
					onClose={handleCancel}
				/>

				{/* Loading Overlay */}
				<Modal
					transparent={true}
					animationType="fade"
					visible={apiLoading}
					onRequestClose={() => {}}>
					<View style={styles.overlay}>
						<ActivityIndicator size="large" color={theme.text} />
					</View>
				</Modal>
			</View>
			<GuideNavigationBar navigation={navigation} />
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingHorizontal: 16,
		paddingBottom: 54,
	},
	earningsContainer: {
		backgroundColor: '#C9A038',
		padding: 15,
		borderRadius: 8,
		alignItems: 'flex-start',
		marginBottom: 10,
	},
	earningsTitle: {
		fontSize: 16,
		color: '#fff',
		marginBottom: 5,
	},
	earningsAmount: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#fff',
	},
	statsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	statBox: {
		width: '48%',
		backgroundColor: 'rgba(201, 160, 56, 0.1)',
		padding: 15,
		borderRadius: 8,
		alignItems: 'flex-start',
		marginBottom: 10,
		borderWidth: 2,
		borderColor: 'rgba(201, 160, 56, 0.1)',
		gap: 6,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.32,
		shadowRadius: 5.46,
	},
	statLabel: {
		fontSize: 14,
		color: '#555',
	},
	statValueContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statValue: {
		fontSize: 18,
		fontWeight: '700',
		color: '#000',
	},
	tabContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 10,
		backgroundColor: '#f5f5f5',
		paddingVertical: 5,
		borderRadius: 8,
	},
	tabText: {
		fontSize: 16,
		color: '#555',
		paddingVertical: 5,
	},
	activeTab: {
		fontWeight: 'bold',
		borderBottomWidth: 2,
		borderBottomColor: '#F7B825',
	},
	card: {
		flexDirection: 'row',
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 10,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: 'rgba(34, 34, 34, 0.1)',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		alignItems: 'center',
	},
	image: {
		width: 70,
		height: 85,
		borderRadius: 10,
		marginRight: 10,
	},
	details: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	name: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
	locationContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 4,
	},
	location: {
		fontSize: 14,
		color: '#555',
		marginLeft: 5,
	},
	status: {
		fontSize: 13,
		fontWeight: 'bold',
		marginVertical: 2,
	},
	phone: {
		fontSize: 14,
		color: '#666',
		marginTop: 5,
	},
	actionContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingTop: 5,
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 5,
	},
	cancelButton: {
		borderWidth: 1,
		padding: 4,
		borderColor: 'rgba(34, 34, 34, 0.2)',
		backgroundColor: '#fff',
		borderRadius: 5,
	},
	acceptButton: {
		borderWidth: 1,
		padding: 4,
		borderColor: 'rgba(34, 34, 34, 0.2)',
		backgroundColor: '#2E8B57',
		borderRadius: 5,
	},
	buttonText: {
		fontSize: 11,
		color: '#000',
	},
	aceptbuttonText: {
		fontSize: 11,
		color: '#fff',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorText: {
		fontSize: 16,
		color: 'red',
		textAlign: 'center',
		marginBottom: 10,
	},
	retryButton: {
		padding: 10,
		backgroundColor: '#2E8B57',
		borderRadius: 5,
	},
	retryButtonText: {
		color: '#fff',
		fontSize: 16,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		fontSize: 16,
		color: '#555',
		textAlign: 'center',
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default GuideHome;
