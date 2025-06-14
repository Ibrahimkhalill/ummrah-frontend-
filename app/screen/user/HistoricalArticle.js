import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../component/BackButton';
import axiosInstance from '../component/axiosInstance';
import { useTranslation } from 'react-i18next';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function HistoricalArticle({ navigation, route }) {
	const { blogId } = route.params;
	const [blog, setBlog] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation();
	const { width } = useWindowDimensions();
	const { theme, isDarkMode } = useTheme(); // Use theme from context

	useEffect(() => {
		const fetchBlog = async () => {
			setIsLoading(true);
			try {
				const response = await axiosInstance.get(`/mainapp/blogs/${blogId}/`);
				setBlog(response.data);
			} catch (error) {
				console.error('Error fetching blog:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchBlog();
	}, [blogId]);

	// Dynamic styles based on theme
	const themeStyles = StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.background,
			paddingHorizontal: 20,
			paddingVertical: 10,
		},
		header: {
			fontSize: 24,
			fontWeight: 'bold',
			textAlign: 'center',
			marginBottom: 20,
			color: theme.text,
		},
		paragraph: {
			fontSize: 14,
			color: theme.text,
		},
		loadingContainer: {
			justifyContent: 'center',
			alignItems: 'center',
			flex: 1,
			width: '100%',
		},
	});
	if (isLoading) {
		console.log('Rendering ActivityIndicator');
		return (
			<View style={themeStyles.container}>
				<View style={themeStyles.loadingContainer}>
					<ActivityIndicator
						size="large"
						color={isDarkMode ? theme.text : '#2D6A4F'}
					/>
				</View>
			</View>
		);
	}

	if (!blog) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
				<ScrollView style={themeStyles.container}>
					<BackButton navigation={navigation} />
					<Text style={themeStyles.header}>{t('blogNotFound')}</Text>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<ScrollView style={themeStyles.container}>
				<BackButton navigation={navigation} />
				<Text style={themeStyles.header}>
					{blog.title || t('untitledBlog')}
				</Text>
				<RenderHtml
					contentWidth={width - 40}
					source={{
						html: blog.description || '<p>No description available.</p>',
					}}
					baseStyle={themeStyles.paragraph}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}
