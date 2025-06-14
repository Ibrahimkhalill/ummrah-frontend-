import React, { useRef, useState } from 'react';
import {
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../component/hook/ThemeContext';
import moment from 'moment';

const { width } = Dimensions.get('window');

const ReviewCarousel = ({ reviews }) => {
	const flatListRef = useRef(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const { theme, isDarkMode } = useTheme();

	const cardWidth = width * 0.78 + 60; // item width + marginHorizontal * 2

	const handleScroll = (index) => {
		if (flatListRef.current && index >= 0 && index < reviews.length) {
			flatListRef.current.scrollToIndex({ index, animated: true });
			setCurrentIndex(index);
		}
	};

	const getItemLayout = (data, index) => ({
		length: cardWidth,
		offset: cardWidth * index,
		index,
	});

	const themeStyles = StyleSheet.create({
		carouselContainer: {
			position: 'relative',
			paddingVertical: 20,
		},
		centeredContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			padding: 20,
		},
		reviewCard: {
			width: width * 0.78,
			backgroundColor: theme.background,
			borderRadius: 10,
			padding: 16,
			marginHorizontal: 30,
			shadowColor: '#000',
			shadowOpacity: 0.1,
			shadowOffset: { width: 0, height: 2 },
			shadowRadius: 4,
			elevation: 3,
			borderWidth: 1,
			borderColor: isDarkMode
				? theme.secondaryText || '#b3b3b3'
				: 'rgba(34, 34, 34, 0.1)',
		},
		reviewHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			marginBottom: 10,
		},
		reviewerImage: {
			width: 40,
			height: 40,
			borderRadius: 20,
			marginRight: 10,
		},
		reviewerName: {
			fontSize: 16,
			fontWeight: 'bold',
			color: theme.text,
		},
		reviewDate: {
			fontSize: 12,
			color: theme.secondaryText || (isDarkMode ? '#b3b3b3' : 'gray'),
		},
		reviewText: {
			fontSize: 14,
			color: theme.text,
			marginBottom: 10,
		},
		ratingContainer: {
			flexDirection: 'row',
		},
		navButtonLeft: {
			position: 'absolute',
			left: -8,
			top: '70%',
			transform: [{ translateY: -20 }],
			backgroundColor: isDarkMode
				? 'rgba(255, 255, 255, 0.2)'
				: 'rgba(121, 121, 128, 0.29)',
			padding: 5,
			borderRadius: 20,
			shadowColor: '#000',
			shadowOpacity: 0.1,
			shadowOffset: { width: 0, height: 2 },
			shadowRadius: 4,
			elevation: 3,
			opacity: currentIndex === 0 ? 0.5 : 1,
		},
		navButtonRight: {
			position: 'absolute',
			right: -3,
			top: '70%',
			transform: [{ translateY: -20 }],
			backgroundColor: isDarkMode
				? 'rgba(255, 255, 255, 0.2)'
				: 'rgba(121, 121, 128, 0.29)',
			padding: 5,
			borderRadius: 20,
			shadowColor: '#000',
			shadowOpacity: 0.1,
			shadowOffset: { width: 0, height: 2 },
			shadowRadius: 4,
			elevation: 3,
			opacity: currentIndex === reviews.length - 1 ? 0.5 : 1,
		},
	});

	return reviews.length === 0 ? (
		<View style={themeStyles.centeredContainer}>
			<Text style={{ color: theme.text }}>No reviews available</Text>
		</View>
	) : (
		<View style={themeStyles.carouselContainer}>
			<FlatList
				ref={flatListRef}
				data={reviews}
				keyExtractor={(item) => item.id.toString()}
				horizontal
				pagingEnabled={false}
				showsHorizontalScrollIndicator={false}
				initialNumToRender={3}
				getItemLayout={getItemLayout}
				onScrollToIndexFailed={(info) => {
					console.warn('Scroll to index failed:', info);
					setTimeout(() => {
						flatListRef.current?.scrollToIndex({
							index: info.index,
							animated: true,
						});
					}, 100);
				}}
				renderItem={({ item }) => (
					<View style={themeStyles.reviewCard}>
						<View style={themeStyles.reviewHeader}>
							<Image
								source={{
									uri: item.user.image || 'https://via.placeholder.com/40',
								}}
								style={themeStyles.reviewerImage}
							/>
							<View>
								<View
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										flex: 1,
										width: '100%',
										justifyContent: 'space-between',
										paddingRight: 40,
									}}>
									<View
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											gap: 10,
										}}>
										<Text style={themeStyles.reviewerName}>
											{item.user.name}
										</Text>
										<Text style={themeStyles.reviewDate}>
											{moment(item.created_at).format('DD MMM')}
										</Text>
									</View>
									<View style={themeStyles.ratingContainer}>
										{[...Array(5)].map((_, index) => (
											<Ionicons
												key={index}
												name={
													index < Math.floor(item.rating)
														? 'star'
														: 'star-outline'
												}
												size={12}
												color="#FFC107"
											/>
										))}
									</View>
								</View>
							</View>
						</View>
						<Text style={themeStyles.reviewText}>{item.comment}</Text>
					</View>
				)}
			/>

			{/* Left Button */}
			<TouchableOpacity
				style={themeStyles.navButtonLeft}
				onPress={() => handleScroll(currentIndex - 1)}
				disabled={currentIndex === 0}>
				<Ionicons name="chevron-back-outline" size={20} color={theme.text} />
			</TouchableOpacity>

			{/* Right Button */}
			<TouchableOpacity
				style={themeStyles.navButtonRight}
				onPress={() => handleScroll(currentIndex + 1)}
				disabled={currentIndex === reviews.length - 1}>
				<Ionicons name="chevron-forward-outline" size={20} color={theme.text} />
			</TouchableOpacity>
		</View>
	);
};

export default ReviewCarousel;
