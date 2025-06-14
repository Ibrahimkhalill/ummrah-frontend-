import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
	Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReviewCarousel from './ReviewCarousel';
import BackButton from '../component/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import Support from '../../assets/support.svg';
import { useTranslation } from 'react-i18next';
import MessengerIcon from '../component/MessengerIcon';
import axiosInstance from '../component/axiosInstance';
import RatingProgeress from '../component/RatingProgeress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function ViewGuideProfile({ navigation, route }) {
	const { guideId } = route.params;
	const { t } = useTranslation();
	const [guide, setGuide] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const { theme, isDarkMode } = useTheme(); // Use theme from context

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
			paddingHorizontal: 16,
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
			position: 'absolute',
			bottom: 50,
			right: 20,
			paddingHorizontal: 10,
		},
		supportButton: {
			paddingVertical: 14,
			borderRadius: 8,
			alignItems: 'center',
			position: 'absolute',
			bottom: 50,
			left: 20,
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
				<View style={styles.loadingContainer}>
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
			<ScrollView style={themeStyles.container}>
				{/* Back & Messenger Buttons */}
				<View style={themeStyles.header}>
					<BackButton navigation={navigation} />
					<MessengerIcon
						navigation={navigation}
						screen_name={'Chat'}
						reciver_id={guide.user_id}
						name={guide.name}
					/>
				</View>

				{/* Profile Section */}
				<View style={themeStyles.profileContainer}>
					<Image
						source={{ uri: guide.image || 'https://via.placeholder.com/100' }}
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
						<Text style={themeStyles.ratingText}>
							{/* {t('ratingScore', {
													score: guide.average_rating || 0.0,
													count: guide.reviews || 0,
												})} */}
							{guide.average_rating}/5
						</Text>
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
				<View style={{ paddingBottom: 80 }}>
					<ReviewCarousel
						reviews={guide.rating}
						name={guide.user}
						image={guide.image}
					/>
				</View>
			</ScrollView>
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
