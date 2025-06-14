import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	StyleSheet,
	Dimensions,
	TouchableOpacity,
	ScrollView,
	Animated,
	ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import axiosInstance from './axiosInstance';
import { useTheme } from '../component/hook/ThemeContext';

const screenWidth = Dimensions.get('window').width;
const spacing = 8;
const itemHeight = 170;

export default function CustomCarousel({ label, value, navigation }) {
	const scrollRef = useRef(null);
	const scrollX = useRef(new Animated.Value(0)).current;
	const [currentIndex, setCurrentIndex] = useState(0);
	const [blogs, setBlogs] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme();

	const itemWidth = screenWidth * 0.33 - spacing;

	// Fetch blogs and filter by location.name
	useEffect(() => {
		const fetchBlogs = async () => {
			console.log('Loading started');
			setIsLoading(true);
			try {
				const response = await axiosInstance.get('/mainapp/blogs/');
				const filteredBlogs = response.data.filter(
					(blog) => blog.location?.name.toLowerCase() === value.toLowerCase()
				);
				setBlogs(filteredBlogs);
				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching blogs:', error);
			}
		};

		fetchBlogs();
	}, []);

	const handleScroll = useCallback(
		(event) => {
			const contentOffsetX = event.nativeEvent.contentOffset.x;
			const newIndex = Math.round(contentOffsetX / (itemWidth + spacing));
			setCurrentIndex(newIndex);
		},
		[itemWidth, spacing]
	);

	const goNext = () => {
		if (currentIndex < blogs.length - 3) {
			const newOffset = (currentIndex + 1) * (itemWidth + spacing);
			scrollRef.current.scrollTo({ x: newOffset, animated: true });
		}
	};

	const goPrev = () => {
		if (currentIndex > 0) {
			const newOffset = (currentIndex - 1) * (itemWidth + spacing);
			scrollRef.current.scrollTo({ x: newOffset, animated: true });
		}
	};

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			marginVertical: 15,
			alignItems: 'flex-start',
			paddingHorizontal: 20,
			backgroundColor: theme.background,
		},
		notFoundContainer: {
			marginVertical: 15,
			justifyContent: 'flex-start',
			alignItems: 'flex-start',
			paddingHorizontal: 20,
			width: '100%',
			backgroundColor: theme.background,
		},
		loadingContainer: {
			justifyContent: 'center',
			alignItems: 'center',
			height: itemHeight,
			width: '100%',
		},
		title: {
			fontSize: 22,
			fontWeight: 'bold',
			color: isDarkMode ? theme.text : '#2D6A4F',
			marginBottom: 15,
			textAlign: 'left',
		},
		carouselWrapper: {
			flexDirection: 'row',
			alignItems: 'center',
			position: 'relative',
			width: '100%',
		},
		navButton: {
			position: 'absolute',
			zIndex: 55,
			padding: 10,
			top: '50%',
			transform: [{ translateY: -20 }],
		},
		scrollContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 10,
			marginHorizontal: 30,
		},
		itemContainer: {
			alignItems: 'center',
			borderColor: isDarkMode ? theme.secondaryText : 'rgba(34, 34, 34, 0.27)',
			paddingVertical: 15,
			paddingHorizontal: 10,
			borderRadius: 12,
			width: screenWidth * 0.33 - spacing,
			height: itemHeight,
			marginHorizontal: spacing / 2,
			elevation: 4,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.3,
			shadowRadius: 5,
			borderWidth: 1,
			backgroundColor: theme.background,
			justifyContent: 'center',
		},
		image: {
			width: 90,
			height: 90,
			borderRadius: 50,
			marginBottom: 10,
			borderWidth: 2,
			borderColor: isDarkMode ? theme.secondaryText : '#ddd',
		},
		itemTitle: {
			fontSize: 12, // Fixed typo from 12 - 12
			fontWeight: 'bold',
			textAlign: 'center',
			color: theme.text,
			paddingHorizontal: 5,
			flexShrink: 1,
			maxWidth: '100%',
		},
	});

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					paddingLeft: 20,
					justifyContent: 'center',
					alignItems: 'start',
					width: '100%',
				}}>
				<Text style={themeStyles.title}>{t(label)}</Text>
				<View style={themeStyles.loadingContainer}>
					<ActivityIndicator
						size="large"
						color={isDarkMode ? theme.text : '#2D6A4F'}
					/>
				</View>
			</View>
		);
	}

	if (blogs.length === 0) {
		return (
			<View style={themeStyles.notFoundContainer}>
				<Text style={themeStyles.title}>{t(label)}</Text>
				<Text style={{ color: theme.text }}>{t('noBlogsFound')}</Text>
			</View>
		);
	}

	return (
		<View style={themeStyles.container}>
			<Text style={themeStyles.title}>{t(label)}</Text>

			<View style={themeStyles.carouselWrapper}>
				<TouchableOpacity
					style={[themeStyles.navButton, { left: -18 }]}
					onPress={goPrev}
					disabled={currentIndex === 0}>
					<Ionicons
						name="chevron-back-circle"
						size={30}
						color={currentIndex === 0 ? theme.secondaryText : '#2D6A4F'}
					/>
				</TouchableOpacity>

				<ScrollView
					ref={scrollRef}
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={themeStyles.scrollContainer}
					snapToInterval={itemWidth + spacing}
					decelerationRate="fast"
					onScroll={(event) => {
						scrollX.setValue(event.nativeEvent.contentOffset.x);
						handleScroll(event);
					}}
					scrollEventThrottle={16}>
					{blogs.map((item) => {
						const imageUrl = item.image
							? `${item.image}`
							: 'https://via.placeholder.com/90';

						return (
							<TouchableOpacity
								key={item.id}
								style={themeStyles.itemContainer}
								onPress={() =>
									navigation.navigate('HistoricalArticle', { blogId: item.id })
								}>
								<Image source={{ uri: imageUrl }} style={themeStyles.image} />
								<Text
									style={themeStyles.itemTitle}
									numberOfLines={2}
									ellipsizeMode="tail">
									{item.title || t('untitledBlog')}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>

				<TouchableOpacity
					style={[themeStyles.navButton, { right: -18 }]}
					onPress={goNext}
					disabled={currentIndex >= blogs.length - 3}>
					<Ionicons
						name="chevron-forward-circle"
						size={30}
						color={
							currentIndex >= blogs.length - 3 ? theme.secondaryText : '#2D6A4F'
						}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
}
