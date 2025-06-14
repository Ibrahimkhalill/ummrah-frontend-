import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	FlatList,
} from 'react-native';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function GuideSection({ navigation }) {
	const [selectedCategory, setSelectedCategory] = useState('Mecca');
	const { t } = useTranslation();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	const categories = [t('mecca'), t('medina'), t('umrah')];

	const images = [
		require('../../assets/image-1.jpg'),
		require('../../assets/image-2.jpg'),
		require('../../assets/image-3.jpg'),
		require('../../assets/makkah.jpg'),
		require('../../assets/image.jpg'),
		require('../../assets/makkah.jpg'),
	];

	// useEffect(() => {
	// 	if (selectedCategory === t('umrah')) {
	// 		navigation.navigate('UmrahGuide');
	// 	}
	// }, [selectedCategory, t]);

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			backgroundColor: isDarkMode ? '#2a2a2a' : '#F9F3E4', // Darker shade for dark mode
			padding: 20,
			borderRadius: 10,
			marginHorizontal: 20,
			alignItems: 'center',
		},
		imageGrid: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'space-between',
			width: '100%',
		},
		image: {
			width: '32%',
			height: 70,
			borderRadius: 10,
			marginBottom: 10,
			borderWidth: 1,
			borderColor: isDarkMode ? theme.secondaryText : '#ddd', // Border for visibility
		},
		infoContainer: {
			alignItems: 'center',
			marginTop: 10,
		},
		infoText: {
			fontSize: 18,
			fontWeight: 'bold',
			textAlign: 'center',
			marginBottom: 5,
			color: theme.text,
		},
		search: {
			fontSize: 13,
			fontWeight: 'bold',
			color: '#fff',
		},
		infoSubtext: {
			fontSize: 14,
			textAlign: 'center',
			color: theme.secondaryText,
			marginBottom: 10,
		},
		categoryButtons: {
			flexDirection: 'row',
			marginTop: 10,
		},
		categoryButton: {
			padding: 8,
			marginHorizontal: 5,
			borderWidth: 1,
			borderRadius: 8,
			borderColor: '#C9A038',
		},
		selectedCategory: {
			backgroundColor: '#C9A038',
		},
		categoryText: {
			color: '#C9A038',
			fontWeight: 'bold',
		},
		selectedCategoryText: {
			color: '#fff',
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
	});

	return (
		<View style={themeStyles.container}>
			{/* Image Grid */}
			<View style={themeStyles.imageGrid}>
				{images.map((img, index) => (
					<Image key={index} source={img} style={themeStyles.image} />
				))}
			</View>

			{/* Info Section */}
			<View style={themeStyles.infoContainer}>
				<Text style={themeStyles.infoText}>{t('info_text')}</Text>
				<Text style={themeStyles.infoSubtext}>{t('info_subText')}</Text>

				{/* Category Selection */}
			</View>
			<TouchableOpacity
				style={themeStyles.searchContainer}
				onPress={() => navigation.navigate('PlaceSelection')}>
				<Text style={[themeStyles.search]}>{t('start_search')}</Text>
			</TouchableOpacity>
		</View>
	);
}
