import React, { useEffect, useState } from 'react';
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ActivityIndicator,
	RefreshControl,
} from 'react-native';
import { Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationBar from '../component/NavigationBar';
import RatingModal from './RatingModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import MessengerIcon from '../component/MessengerIcon';
import axiosInstance from '../component/axiosInstance';
import { WebView } from 'react-native-webview';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

const GuideCard = ({ guide, navigation, setCheckoutUrl, fetchData }) => {
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	const handleCall = () => {
		const phoneNumber = `tel:${guide.guide.phone_number}`;
		Linking.openURL(phoneNumber).catch((err) => {
			if (err.message.includes('Unable to open URL')) {
				Alert.alert(t('callError'), t('phoneCallNotSupported'), [
					{ text: t('ok') },
				]);
			}
		});
	};

	const handlePayment = async (guide) => {
		try {
			if (!guide.total_amount || guide.total_amount <= 0) {
				throw new Error(t('invalidAmount'));
			}
			const response = await axiosInstance.post('/payment/checkout/session/', {
				amount: guide.total_amount,
				currency: 'sar',
				transactions_id: guide.id,
			});
			const { checkout_url } = response.data;
			console.log('checkout_url', checkout_url);
			setCheckoutUrl(checkout_url);
		} catch (error) {
			console.error('Payment error:', error);
			Alert.alert(
				t('error'),
				error.response?.data?.error || t('somethingWentWrong')
			);
		}
	};

	const getStatusText = () => {
		switch (guide.status.toLowerCase()) {
			case 'ongoing':
				return t('ongoing');
			case 'completed':
				return t('completed');
			case 'booked':
				return t('booked');
			case 'payment':
				return t('payment');
			case 'pending':
				return t('pending');
			default:
				return guide.status;
		}
	};

	const formatDate = (dateString) => {
		if (!dateString) return t('unknownDate');
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return t('invalidDate');
		const options = { day: '2-digit', month: 'short' };
		return date.toLocaleDateString('en-US', options);
	};

	return (
		<TouchableOpacity
			onPress={() =>
				navigation.navigate('ViewGuideProfile', {
					guideId: guide.guide.id,
				})
			}
			style={[styles.card, { backgroundColor: theme.background }]}>
			<Image source={{ uri: guide.guide.image }} style={styles.image} />
			<View style={styles.details}>
				<View style={styles.header}>
					<Text style={[styles.name, { color: theme.text }]}>
						{guide.guide.name}
					</Text>
					<MessengerIcon
						size={30}
						navigation={navigation}
						screen_name={'Chat'}
						reciver_id={guide.guide.user.id}
						name={guide.guide.name}
					/>
				</View>
				<View style={styles.locationContainer}>
					<Ionicons name="location-outline" size={15} color={theme.text} />
					<Text style={[styles.location, { color: theme.text }]}>
						{Array.isArray(guide.services)
							? guide.services
									.map((loc) => loc.location.location_name)
									.join(', ')
							: t('unknownLocation')}
					</Text>
				</View>
				{guide.status.toLowerCase() === 'ongoing' && (
					<Text style={[styles.status, { color: '#D32F2F' }]}>
						{t('statusLabel')}: {getStatusText()} (
						{formatDate(guide.trip_started_date)} -{' '}
						{formatDate(guide.trip_end_date)})
					</Text>
				)}
				{guide.status.toLowerCase() === 'complete' && (
					<Text style={[styles.status, { color: '#2E8B57' }]}>
						{t('statusLabel')}: {getStatusText()}
					</Text>
				)}
				{guide.status.toLowerCase() === 'pending' && (
					<Text style={[styles.status, { color: '#C9A038' }]}>
						{t('statusLabel')}: {getStatusText()} (
						{formatDate(guide.trip_started_date)} -{' '}
						{formatDate(guide.trip_end_date)})
					</Text>
				)}
				{guide.status.toLowerCase() === 'payment' && (
					<Text style={[styles.status, { color: '#385170' }]}>
						{t('statusLabel')}: {getStatusText()} (
						{formatDate(guide.trip_started_date)} -{' '}
						{formatDate(guide.trip_end_date)})
					</Text>
				)}
				<Text
					style={[styles.phone, { color: theme.text }]}
					onPress={handleCall}>
					<Ionicons name="call-outline" size={14} color={theme.text} />{' '}
					{guide.guide.phone_number}
				</Text>
				{guide.status.toLowerCase() === 'payment' && (
					<TouchableOpacity
						style={styles.paymentButton}
						onPress={() => handlePayment(guide)}>
						<Text style={styles.paymentText}>{t('paymentNow')}</Text>
					</TouchableOpacity>
				)}
			</View>
			{guide.status.toLowerCase() === 'complete' &&
				(guide.rated ? (
					<View style={styles.rateButton}>
						<Text style={{ color: 'white', fontSize: 10 }}>{t('rated')}</Text>
					</View>
				) : (
					<RatingModal guide={guide} fetchData={fetchData} />
				))}
		</TouchableOpacity>
	);
};

export default function YourGuidePage({ navigation }) {
	const { t } = useTranslation();
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [refreshing, setRefreshing] = useState(false);
	const [checkout_url, setCheckoutUrl] = useState(null);
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	useEffect(() => {
		fetchTransactions();
	}, []);

	const fetchTransactions = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await axiosInstance.get('/mainapp/transactions/user/');
			console.log('Fetched Transactions:', response.data);
			if (Array.isArray(response.data)) {
				setTransactions(response.data);
			} else {
				throw new Error('Unexpected API response format');
			}
		} catch (error) {
			console.error('Error fetching transactions:', error);
			setTransactions([]);
			setError(t('errorLoadingTransactions'));
		} finally {
			setLoading(false);
		}
	};

	const handleNavigationStateChange = (navState) => {
		console.log(navState);
		if (navState.url.includes('/api/payment/checkout/success/')) {
			setCheckoutUrl(null);
			navigation.navigate('YourGuidePage');
			fetchTransactions();
			Alert.alert('Success', 'Payment successfully done!');
		} else if (navState.url.includes('/api/payment/checkout/cancel/')) {
			setCheckoutUrl(null);
		}
	};

	if (checkout_url) {
		return (
			<SafeAreaView
				style={[styles.safeArea, { backgroundColor: theme.background }]}>
				<WebView
					key={checkout_url}
					source={{ uri: checkout_url }}
					onNavigationStateChange={handleNavigationStateChange}
					startInLoadingState
					renderLoading={() => (
						<ActivityIndicator size="large" color="#FFDC58" />
					)}
				/>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView
			style={[styles.safeAreaContainer, { backgroundColor: theme.background }]}>
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<View style={{ padding: 20 }}>
					<Text style={[styles.title, { color: theme.text }]}>
						{t('yourGuide')}
					</Text>
					<Text style={[styles.subtitle, { color: theme.text }]}>
						{t('yourHiringGuideList')}
					</Text>
					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={theme.text} />
							<Text style={[styles.loadingText, { color: theme.text }]}>
								{t('loading')}
							</Text>
						</View>
					) : error ? (
						<View style={styles.errorContainer}>
							<Text style={[styles.errorText, { color: theme.text }]}>
								{error}
							</Text>
							<TouchableOpacity
								onPress={fetchTransactions}
								style={styles.retryButton}>
								<Text style={styles.retryButtonText}>{t('retry')}</Text>
							</TouchableOpacity>
						</View>
					) : (
						<FlatList
							data={transactions}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => (
								<GuideCard
									guide={item}
									navigation={navigation}
									setCheckoutUrl={setCheckoutUrl}
									fetchData={fetchTransactions}
								/>
							)}
							ListEmptyComponent={
								<View style={styles.emptyContainer}>
									<Text style={[styles.emptyText, { color: theme.text }]}>
										{t('noGuides')}
									</Text>
								</View>
							}
						/>
					)}
				</View>
				<NavigationBar navigation={navigation} />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeAreaContainer: {
		flex: 1,
		backgroundColor: '#fff',
	},
	safeArea: {
		flex: 1,
		paddingBottom: 10,
		backgroundColor: 'white',
	},
	container: {
		flex: 1,
		backgroundColor: '#fff',

		paddingBottom: 30, // Space for NavigationBar
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 5,
	},
	subtitle: {
		fontSize: 14,
		color: '#666',
		marginBottom: 15,
	},
	card: {
		flexDirection: 'row',
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 10,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: '#ddd',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
		elevation: 3,
		alignItems: 'center',
	},
	image: {
		width: 75,
		height: 75,
		borderRadius: 10,
		marginRight: 10,
	},
	details: {
		flex: 1,
		position: 'relative',
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
	},
	location: {
		fontSize: 14,
		color: '#555',
		marginLeft: 5,
	},
	rateButton: {
		backgroundColor: '#C9383A',
		borderRadius: 5,
		paddingVertical: 6,
		paddingHorizontal: 12,
		position: 'absolute',
		bottom: 10,
		right: 13,
	},
	status: {
		fontSize: 14,
		fontWeight: 'bold',
		paddingVertical: 3,
	},
	phone: {
		fontSize: 14,
		color: '#666',
		paddingVertical: 3,
	},
	paymentButton: {
		backgroundColor: '#385170',
		borderRadius: 5,
		paddingVertical: 6,
		paddingHorizontal: 12,
		position: 'absolute',
		bottom: -4,
		right: 0,
	},
	paymentText: {
		fontSize: 12,
		color: '#fff',
		fontWeight: 'bold',
	},
	loadingContainer: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 50,
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: '#2E8B57',
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
});

// export default YourGuidePage;
