import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import GuideSection from '../component/GuideSection';
import { SafeAreaView } from 'react-native-safe-area-context';
import MultiImageCarousel from '../component/MultiImageCarousel';
import NavigationBar from '../component/NavigationBar';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import axiosInstance from '../component/axiosInstance';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext;
import UmrahGuide from './UmrahGuide';

export default function UserHome({ navigation }) {
	const [count, setCount] = useState(0); // Fixed initial count value
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	const fetchChatCountUnread = async () => {
		try {
			const response = await axiosInstance.get('/chat/count/unread/');
			const data = response.data;
			console.log('guideId', data);
			setCount(data.total_unread);
		} catch (error) {
			setError('Failed to load profile. Please try again.');
		}
	};

	useEffect(() => {
		const notificationListener = Notifications.addNotificationReceivedListener(
			() => {
				console.log('Push notification received');
				fetchChatCountUnread();
			}
		);
		return () => {
			if (notificationListener) {
				Notifications.removeNotificationSubscription(notificationListener);
			}
		};
	}, []);

	useEffect(() => {
		fetchChatCountUnread();
	}, []);

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
		},
		title: {
			fontSize: 18,
			fontWeight: 'bold',
			marginHorizontal: 20,
			marginTop: 20,
			color: theme.text,
		},
		search: {
			fontSize: 16,
			fontWeight: 'bold',

			color: '#fff',
		},
		subtitle: {
			fontSize: 16,
			color: theme.secondaryText,
			marginHorizontal: 20,
			marginBottom: 10,
		},
		searchContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: isDarkMode ? '#C9A038' : '#C9A038',
			justifyContent: 'center',
			marginHorizontal: 20,
			borderRadius: 6,
			paddingHorizontal: 10,
			paddingVertical: 8,
			marginBottom: 20,
			height: 40,
			marginTop: 10,
		},
		searchIcon: {
			marginRight: 10,
			color: theme.secondaryText,
		},
		searchInput: {
			flex: 1,
			fontSize: 16,
			color: theme.text,
		},
		carouselContainer: {
			alignItems: 'center',
			marginVertical: 20,
			paddingBottom: 40,
		},
	});

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<View style={themeStyles.container}>
				<ScrollView showsVerticalScrollIndicator={false}>
					{/* Title */}
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}>
						<View>
							<Text style={themeStyles.title}>{t('makkahHajjUmrahGuide')}</Text>
							<Text style={themeStyles.subtitle}>{t('findYourGuide')}</Text>
						</View>
						{/* <View style={{ marginBottom: 10, marginRight: 8 }}>
							<NotificationButton navigation={navigation} unreadCount={count} />
						</View> */}
					</View>

					<GuideSection navigation={navigation} />

					<View style={themeStyles.carouselContainer}>
						<MultiImageCarousel
							label={t('madina')}
							value={'Madina'}
							navigation={navigation}
						/>
						<MultiImageCarousel
							label={t('macca')}
							value={'Mecca'}
							navigation={navigation}
						/>
						<UmrahGuide label={t('ummrah')} navigation={navigation} />
					</View>
				</ScrollView>
				<NavigationBar navigation={navigation} count={count} />
			</View>
		</SafeAreaView>
	);
}
