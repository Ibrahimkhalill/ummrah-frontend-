import React from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hook/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../BackButton';

// Sample notification data
const notifications = [
	{
		id: '1',
		title: 'New Message',
		message: 'You have a new message from John Doe.',
		time: '10:30 AM',
		read: false,
	},
	{
		id: '2',
		title: 'Order Update',
		message: 'Your order #1234 has been shipped.',
		time: 'Yesterday',
		read: true,
	},
	{
		id: '3',
		title: 'Reminder',
		message: 'Meeting with team at 2:00 PM today.',
		time: '2 hours ago',
		read: false,
	},
	{
		id: '4',
		title: 'Promotion',
		message: 'Get 20% off on your next purchase!',
		time: '3 days ago',
		read: true,
	},
];

// Notification Card Component
const NotificationCard = ({ item }) => {
	const { theme } = useTheme();

	return (
		<TouchableOpacity
			style={[
				styles.card,
				{ backgroundColor: theme.background },
				!item.read && styles.unreadCard,
			]}>
			<View style={styles.cardContent}>
				<View
					style={[
						styles.iconContainer,
						{ backgroundColor: theme.secondaryText + '22' }, // Subtle transparency
					]}>
					<Ionicons
						name={
							item.title === 'New Message'
								? 'chatbubble'
								: item.title === 'Order Update'
								? 'cart'
								: 'bell'
						}
						size={24}
						color={item.read ? theme.secondaryText : '#007AFF'}
					/>
				</View>
				<View style={styles.textContainer}>
					<Text
						style={[
							styles.title,
							{ color: theme.text },
							!item.read && styles.unreadTitle,
						]}>
						{item.title}
					</Text>
					<Text
						style={[styles.message, { color: theme.secondaryText }]}
						numberOfLines={2}>
						{item.message}
					</Text>
					<Text style={[styles.time, { color: theme.secondaryText }]}>
						{item.time}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

// Main Notification Screen
const NotificationScreen = ({ navigation }) => {
	const { theme } = useTheme();

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
			<View style={[styles.container, { backgroundColor: theme.background }]}>
				<View style={styles.header}>
					<BackButton navigation={navigation} />
					<Text style={[styles.headerTitle, { color: theme.text }]}>
						Notifications
					</Text>
					<TouchableOpacity>
						{/* <Ionicons
							name="ellipsis-horizontal"
							size={24}
							color={theme.secondaryText}
						/> */}
					</TouchableOpacity>
				</View>
				<FlatList
					data={notifications}
					renderItem={({ item }) => <NotificationCard item={item} />}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContainer}
					showsVerticalScrollIndicator={false}
				/>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 15,
		marginVertical: 10,
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: 'bold',
	},
	listContainer: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	card: {
		borderRadius: 15,
		marginBottom: 15,
		padding: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 3,
	},
	unreadCard: {
		borderLeftWidth: 4,
		borderLeftColor: '#007AFF',
	},
	cardContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 15,
	},
	textContainer: {
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 5,
	},
	unreadTitle: {
		color: '#007AFF',
		fontWeight: '700',
	},
	message: {
		fontSize: 14,
		marginBottom: 5,
	},
	time: {
		fontSize: 12,
	},
});

export default NotificationScreen;
