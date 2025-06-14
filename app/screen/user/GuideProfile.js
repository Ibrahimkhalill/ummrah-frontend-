import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Alert,
	ActivityIndicator,
	Platform,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import ReviewCarousel from './ReviewCarousel';
import BackButton from '../component/BackButton';
import {
	SafeAreaView,
	useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import MessengerIcon from '../component/MessengerIcon';
import axiosInstance from '../component/axiosInstance';
import RatingProgeress from '../component/RatingProgeress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../component/hook/ThemeContext';

export default function GuideProfile({ navigation, route }) {
	const {
		guideId,
		adults,
		children,
		start_date,
		end_date,
		guide_data,
		location_ids,
	} = route.params;
	const { t } = useTranslation();
	const [guide, setGuide] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const { theme, isDarkMode } = useTheme();
	const insets = useSafeAreaInsets(); // Get safe area insets

	useEffect(() => {
		const fetchGuideProfile = async () => {
			setIsLoading(true);
			try {
				const response = await axiosInstance.get(`/mainapp/guides/${guideId}/`);
				setGuide(response.data);
				console.log(response.data);
				await AsyncStorage.removeItem('loginNavigation');
			} catch (error) {
				console.error('Error fetching guide profile:', error);
				Alert.alert(t('error'), t('failedToFetchGuide'));
			} finally {
				setIsLoading(false);
			}
		};

		if (guideId) {
			fetchGuideProfile();
		}
	}, [guideId]);

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
			padding: 16,
		},
		centeredContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: theme.background,
		},
		header: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			position: 'relative',
		},
		profileContainer: {
			alignItems: 'center',
			marginBottom: 20,
		},
		profileImage: {
			width: 100,
			height: 100,
			borderRadius: 50,
			marginBottom: 10,
			borderWidth: 2,
			borderColor: '#dddd',
		},
		name: {
			fontSize: 20,
			fontWeight: 'bold',
			color: theme.text,
		},
		starRating: {
			flexDirection: 'row',
			alignItems: 'center',
			marginVertical: 5,
		},
		stats: {
			fontSize: 14,
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : 'gray'),
		},
		bio: {
			textAlign: 'center',
			fontSize: 14,
			color: theme.text,
			marginBottom: 20,
		},
		section: {
			marginBottom: 20,
		},
		sectionTitle: {
			fontSize: 18,
			fontWeight: 'bold',
			marginBottom: 10,
			color: theme.text,
		},
		verifiedItem: {
			flexDirection: 'row',
			alignItems: 'center',
			fontSize: 14,
			marginBottom: 5,
			color: theme.text,
		},
		ratingText: {
			fontSize: 18,
			fontWeight: 'bold',
			marginBottom: 10,
			color: theme.text,
		},
		ratingBar: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginBottom: 10,
		},
		bookButton: {
			backgroundColor: '#E53935',
			paddingVertical: 14,
			borderRadius: 8,
			alignItems: 'center',

			paddingHorizontal: 10,
		},
		supportButton: {
			paddingVertical: 5,
			borderRadius: 8,
			height: 30,
			backgroundColor: 'green',
			paddingHorizontal: 10,
		},
		bookButtonText: {
			color: '#fff',
			fontSize: 14,
			fontWeight: 'bold',
		},
	});

	if (isLoading) {
		return (
			<SafeAreaView style={themeStyles.centeredContainer}>
				<View
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					<ActivityIndicator size="large" color={theme.text} />
				</View>
			</SafeAreaView>
		);
	}

	if (!guide) {
		return (
			<SafeAreaView style={themeStyles.centeredContainer}>
				<Text style={{ color: theme.text }}>{t('guideNotFound')}</Text>
			</SafeAreaView>
		);
	}

	const ratingCategories = [
		{ label: t('personalizedTours'), key: 'personalized_tours' },
		{ label: t('navigationAssistance'), key: 'navigation_assistance' },
		{ label: t('localKnowledge'), key: 'local_knowledge' },
		{ label: t('translationServices'), key: 'translation_services' },
		{ label: t('safetyAndSecurity'), key: 'safety_and_security' },
	];

	return (
		<SafeAreaView
			style={{
				flex: 1,
				position: 'relative',
				backgroundColor: theme.background,
			}}>
			<ScrollView
				style={themeStyles.container}
				contentContainerStyle={{
					paddingBottom: insets.bottom + 100, // Enough space for buttons and safe area
				}}>
				{/* Back & Messenger Buttons */}
				<View style={themeStyles.header}>
					<BackButton navigation={navigation} />
					<MessengerIcon
						navigation={navigation}
						screen_name={'Chat'}
						reciver_id={guide.user_id}
						name={guide.name}
					/>
					<TouchableOpacity
						style={{
							position: 'absolute',
							right: 50,
							top: 10,
							flexDirection: 'row',
							gap: 2,
						}}
						onPress={() => navigation.navigate('Calender', { guide })}>
						<FontAwesome name="calendar" size={20} color={theme.text} />
					</TouchableOpacity>
				</View>

				{/* Profile Section */}
				<View style={themeStyles.profileContainer}>
					<Image
						source={{
							uri:
								guide.image ||
								'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
						}}
						style={themeStyles.profileImage}
					/>
					<Text style={themeStyles.name}>
						{t('guideName', { name: guide.name || 'Unknown Guide' })}
					</Text>

					{/* Star Rating */}
					<View style={themeStyles.starRating}>
						{[...Array(5)].map((_, index) => (
							<Ionicons
								key={index}
								name={
									index < Math.floor(guide.average_rating)
										? 'star'
										: 'star-outline'
								}
								size={16}
								color="#FFC107"
							/>
						))}
						<Text style={{ marginLeft: 5, color: theme.text }}>
							{guide.average_rating || 0.0}
						</Text>
					</View>

					<Text style={themeStyles.stats}>
						{t('tripStats', { trips: guide.reviews || 0, date: guide.joined })}
					</Text>
				</View>

				{/* Bio */}
				<Text style={themeStyles.bio}>{guide.about_us}</Text>

				{/* Verified Info */}
				<View style={themeStyles.section}>
					<Text style={themeStyles.sectionTitle}>{t('verifiedInfo')}</Text>
					<VerifiedInfoItem text={t('approvedToGuide')} />
					<VerifiedInfoItem text={t('phoneNumberVerified')} />
					<VerifiedInfoItem text={t('emailVerified')} />
				</View>

				{/* Ratings & Reviews */}
				<View style={themeStyles.section}>
					<View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
						<Text style={themeStyles.sectionTitle}>
							{t('ratingsAndReviews')}
						</Text>
						<Text style={themeStyles.ratingText}>{guide.average_rating}/5</Text>
					</View>

					{ratingCategories.map((key, index) => (
						<View style={themeStyles.ratingBar} key={index}>
							<Text style={{ color: theme.text }}>{t(key.label)}</Text>
							<RatingProgeress
								progress={(guide.rating_details?.[key.key] || 0) / 5.0}
							/>
						</View>
					))}
				</View>

				{/* Review Section */}
				<View>
					<ReviewCarousel
						reviews={guide.rating}
						name={guide.user}
						image={guide.image}
					/>
				</View>
			</ScrollView>

			{/* Buttons */}
			<View
				style={{
					flexDirection: 'row',
					width: '100%',
					justifyContent: 'space-between',
					paddingHorizontal: 20,
					paddingVertical: 20,
				}}>
				<TouchableOpacity
					style={themeStyles.supportButton}
					onPress={() => navigation.navigate('HelpSupport')}>
					<Text style={{ color: isDarkMode ? theme.text : '#fff' }}>
						{t('Help')}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={themeStyles.bookButton}
					onPress={() =>
						navigation.navigate('BookingSummary', {
							start_date,
							end_date,
							location_ids,
							adults,
							children,
							guide: guide_data,
						})
					}>
					<Text style={themeStyles.bookButtonText}>{t('bookNow')}</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

// Verified Info Component
const VerifiedInfoItem = ({ text }) => {
	const { theme } = useTheme();
	return (
		<Text style={[styles.verifiedItem, { color: theme.text }]}>
			<Ionicons name="checkmark-circle" size={16} color="green" /> {text}
		</Text>
	);
};

const styles = StyleSheet.create({
	verifiedItem: {
		flexDirection: 'row',
		alignItems: 'center',
		fontSize: 14,
		marginBottom: 5,
	},
});
