import React, { useState, useRef } from 'react';
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	TextInput,
	StyleSheet,
	Animated,
	Easing,
	Image,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../component/axiosInstance';

export default function RatingModal({ guide, fetchData }) {
	const translateY = useRef(new Animated.Value(500)).current;
	const [modalVisible, setModalVisible] = useState(false);
	const { t } = useTranslation();

	const [overallRating, setOverallRating] = useState(0);
	const [ratings, setRatings] = useState({
		personalized_tours: 0,
		navigation_assistance: 0,
		local_knowledge: 0,
		translation_services: 0,
		safety_and_security: 0,
	});
	const [comment, setComment] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const openModal = () => {
		setModalVisible(true);
		Animated.timing(translateY, {
			toValue: 0,
			duration: 300,
			easing: Easing.out(Easing.ease),
			useNativeDriver: true,
		}).start();
	};

	const closeModal = () => {
		Animated.timing(translateY, {
			toValue: 500,
			duration: 300,
			easing: Easing.in(Easing.ease),
			useNativeDriver: true,
		}).start(() => setModalVisible(false));
	};

	const handleOverallRating = (value) => {
		setOverallRating(value);
	};

	const handleRating = (category, value) => {
		setRatings((prevRatings) => ({
			...prevRatings,
			[category]: value,
		}));
	};

	const handleSubmit = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			const data = {
				guide_id: guide.guide.user.id,
				overall_rating: overallRating,
				personalized_tours: ratings.personalized_tours,
				navigation_assistance: ratings.navigation_assistance,
				local_knowledge: ratings.local_knowledge,
				translation_services: ratings.translation_services,
				safety_and_security: ratings.safety_and_security,
				comment: comment,
				transaction_id: guide.id,
			};

			const response = await axiosInstance.post(
				'/mainapp/submit-rating/',
				data
			);
			Alert.alert(t('success'), response.data.message || t('ratingSubmitted'));
			closeModal();

			// Reset form
			setOverallRating(0);
			setRatings({
				personalized_tours: 0,
				navigation_assistance: 0,
				local_knowledge: 0,
				translation_services: 0,
				safety_and_security: 0,
			});
			setComment('');
		} catch (error) {
			console.error('Error submitting rating:', error);
			Alert.alert(
				t('error'),
				error.response?.data?.error || t('somethingWentWrong')
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const ratingCategories = [
		{ label: t('personalizedTours'), key: 'personalized_tours' },
		{ label: t('navigationAssistance'), key: 'navigation_assistance' },
		{ label: t('localKnowledge'), key: 'local_knowledge' },
		{ label: t('translationServices'), key: 'translation_services' },
		{ label: t('safetyAndSecurity'), key: 'safety_and_security' },
	];

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.rateButton} onPress={openModal}>
				<Text style={styles.rateText}>{t('rateNow')}</Text>
			</TouchableOpacity>

			<Modal visible={modalVisible} transparent animationType="none">
				<View style={styles.overlay}>
					<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : undefined}
						style={{ flex: 1 }}>
						<ScrollView
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: 'flex-end',
							}}
							keyboardShouldPersistTaps="handled">
							<Animated.View
								style={[styles.modalContent, { transform: [{ translateY }] }]}>
								<TouchableOpacity
									style={styles.closeButton}
									onPress={closeModal}>
									<Ionicons name="close" size={24} color="#000" />
								</TouchableOpacity>

								<View style={styles.profileContainer}>
									{guide.guide.image ? (
										<Image
											source={{ uri: guide.guide.image }}
											style={styles.image}
										/>
									) : (
										<Ionicons
											name="person-circle-outline"
											size={80}
											color="#555"
										/>
									)}
									<Text style={styles.title}>
										{t('howWasYourTripWith', {
											name: guide?.guide.name || 'Fahad',
										})}
									</Text>
									<Text style={styles.subtitle}>
										{Array.isArray(guide.services)
											? guide.services
													.map((loc) => loc.location.location_name)
													.join(', ')
											: t('unknownLocation')}
									</Text>
								</View>

								<View style={styles.overallRatingContainer}>
									<Text style={styles.overallRatingText}>
										{t('overallRating')}
									</Text>
									<View style={styles.stars}>
										{[...Array(5)].map((_, starIndex) => {
											const starValue = starIndex + 1;
											return (
												<TouchableOpacity
													key={starIndex}
													onPress={() => handleOverallRating(starValue)}>
													<Ionicons
														name={
															starValue <= overallRating
																? 'star'
																: 'star-outline'
														}
														size={30}
														color="#FFD700"
													/>
												</TouchableOpacity>
											);
										})}
									</View>
								</View>

								<View style={styles.ratingContainer}>
									<Text style={styles.serviceRatingTitle}>
										{t('serviceRatings')}
									</Text>
									{ratingCategories.map((category, index) => (
										<View key={index} style={styles.ratingRow}>
											<Text style={styles.ratingText}>{category.label}</Text>
											<View style={styles.stars}>
												{[...Array(5)].map((_, starIndex) => {
													const starValue = starIndex + 1;
													return (
														<TouchableOpacity
															key={starIndex}
															onPress={() =>
																handleRating(category.key, starValue)
															}>
															<Ionicons
																name={
																	starValue <= ratings[category.key]
																		? 'star'
																		: 'star-outline'
																}
																size={20}
																color="#FFD700"
															/>
														</TouchableOpacity>
													);
												})}
											</View>
										</View>
									))}
								</View>

								<TextInput
									style={styles.input}
									placeholder={t('addComment')}
									multiline
									value={comment}
									onChangeText={setComment}
								/>

								<TouchableOpacity
									style={[
										styles.submitButton,
										(overallRating === 0 || isSubmitting) &&
											styles.submitButtonDisabled,
									]}
									onPress={handleSubmit}
									disabled={overallRating === 0 || isSubmitting}>
									{isSubmitting ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.submitButtonText}>{t('submit')}</Text>
									)}
								</TouchableOpacity>
							</Animated.View>
						</ScrollView>
					</KeyboardAvoidingView>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	// ... your existing styles remain unchanged ...
	container: {},
	rateButton: {
		backgroundColor: '#C9383A',
		borderRadius: 5,
		paddingVertical: 6,
		paddingHorizontal: 12,
		position: 'absolute',
		bottom: -46,
		right: -3,
	},
	rateText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
	overlay: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalContent: {
		backgroundColor: '#fff',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: -2 },
		shadowRadius: 4,
		elevation: 5,
	},
	image: {
		width: 75,
		height: 75,
		borderRadius: 37,
		marginBottom: 10,
	},
	closeButton: { position: 'absolute', top: 10, right: 10 },
	profileContainer: { alignItems: 'center', marginBottom: 10 },
	title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
	subtitle: {
		fontSize: 14,
		color: 'gray',
		textAlign: 'center',
		marginVertical: 5,
	},
	overallRatingContainer: {
		alignItems: 'center',
		marginBottom: 15,
	},
	overallRatingText: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 5,
	},
	ratingContainer: { width: '100%', marginBottom: 10 },
	serviceRatingTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 10,
		textAlign: 'center',
	},
	ratingRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	ratingText: { fontSize: 14, color: '#333' },
	stars: { flexDirection: 'row' },
	input: {
		width: '100%',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 10,
		marginBottom: 10,
		textAlignVertical: 'top',
	},
	submitButton: {
		backgroundColor: '#C9A038',
		paddingVertical: 12,
		borderRadius: 8,
		width: '100%',
		alignItems: 'center',
	},
	submitButtonDisabled: {
		backgroundColor: '#a0a0a0',
	},
	submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
