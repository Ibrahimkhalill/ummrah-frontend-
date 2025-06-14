import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	ScrollView,
	StyleSheet,
	ActivityIndicator,
	Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../component/BackButton';
import axiosInstance from '../component/axiosInstance'; // Adjust path
import { useTranslation } from 'react-i18next';
import RenderHtml from 'react-native-render-html'; // For rendering HTML content
import { useWindowDimensions } from 'react-native';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function UmmrahBlogs({ navigation, route }) {
	const { blogId } = route.params; // Get blogId from navigation params
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [blog, setBlog] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const { t } = useTranslation();
	const { width } = useWindowDimensions(); // For responsive HTML rendering

	// Fetch blog data when component mounts or blogId changes
	useEffect(() => {
		const fetchBlog = async () => {
			setIsLoading(true);
			try {
				const response = await axiosInstance.get(`/mainapp/ummrah/${blogId}/`);
				setBlog(response.data);
				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching blog:', error);
				// Optionally show an error message
			}
		};

		fetchBlog();
	}, [blogId]);

	if (isLoading) {
		console.log('Rendering ActivityIndicator');
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
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
				<ScrollView
					style={[styles.container, { backgroundColor: theme.background }]}>
					<BackButton navigation={navigation} />
					<Text style={[styles.header, { color: theme.text }]}>
						{t('blogNotFound')}
					</Text>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<ScrollView
				style={[styles.container, { backgroundColor: theme.background }]}>
				<BackButton navigation={navigation} />
				{/* Dynamic Title */}
				<Text style={[styles.header, { color: theme.text }]}>
					{blog.title || t('untitledBlog')}
				</Text>

				{/* Dynamic Description (HTML) */}
				<RenderHtml
					contentWidth={width - 40} // Adjust for padding (20 on each side)
					source={{
						html: blog.description || '<p>No description available.</p>',
					}}
					tagsStyles={{
						p: {
							color: theme.text, // Specifically set <p> tag text color to theme.text
						},
						// Add more tags if needed, e.g., h1, h2, etc.
						h1: { color: theme.text },
						h2: { color: theme.text },
						// Optionally override other tags as needed
					}}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginVertical: 20,
		color: '#333',
	},
	loadingContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
		width: '100%',
	},
	paragraph: {
		fontSize: 14,
		color: '#000',
	},
});
