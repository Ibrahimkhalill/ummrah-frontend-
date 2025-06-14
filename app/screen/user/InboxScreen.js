import React, { useState, useEffect, useRef } from 'react';
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	FlatList,
	Image,
	ActivityIndicator,
	TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavigationBar from '../component/NavigationBar';
import axiosInstance from '../component/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

export default function InboxScreen({ navigation }) {
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [chats, setChats] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [loading, setLoading] = useState(false);
	const ws = useRef(null);
	const [count, setCount] = useState();
	const { t } = useTranslation();

	useFocusEffect(
		React.useCallback(() => {
			fetchChats();
			fetchChatCountUnread();
			setupWebSocket();
		}, [])
	);
	const fetchChatCountUnread = async () => {
		try {
			const response = await axiosInstance.get('/chat/count/unread/');
			const data = response.data;

			console.log('guideId', data);
			setCount(data.total_unread);
		} catch (error) {
			console.error('❌ Error fetching unread count:', error.message);
		}
	};

	const fetchChats = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get('/chat/user-chat-list/');
			if (response.status === 200) {
				console.log('✅ Chat List Fetched 33:', response.data);
				setChats(response.data);
			} else {
				console.error('❌ Error fetching chat list:', response.data.error);
			}
		} catch (error) {
			console.error('❌ Error fetching chat list:', error.message);
		} finally {
			setLoading(false);
		}
	};

	const setupWebSocket = async () => {
		try {
			let senderId = await AsyncStorage.getItem('sender_id');

			if (!senderId) {
				console.error('❌ Sender ID not found');
				return;
			}

			console.log('🔗 Connecting WebSocket...');
			ws.current = new WebSocket(
				`wss://nusukey.duckdns.org/ws/chat-list/?user_id=${senderId}`
			);

			ws.current.onopen = () => {
				console.log('✅ WebSocket Connected');
			};

			ws.current.onmessage = (event) => {
				const data = JSON.parse(event.data);
				console.log('📩 WebSocket Message Received:', data);

				if (data.type === 'new_message_notification') {
					console.log('🔔 New message detected! Refreshing chat list...');
					fetchChats(); // Refresh chat list when a new message arrives
					fetchChatCountUnread();
				}
			};

			ws.current.onerror = (error) => {
				console.error('❌ WebSocket Error:', error.message);
			};

			ws.current.onclose = () => {
				console.log('⚠️ WebSocket Disconnected');
			};
		} catch (error) {
			console.error('❌ Error setting up WebSocket:', error);
		}
	};

	const filteredChats = chats.filter((chat) =>
		chat.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const renderItem = ({ item }) => {
		const firstLetter = item.name ? item.name.charAt(0).toUpperCase() : '?'; // Get first letter

		return (
			<TouchableOpacity
				style={[
					styles.chatItem,
					{ borderBottomColor: isDarkMode ? '#444' : '#eee' },
				]}
				onPress={() =>
					navigation.navigate('Chat', {
						chatId: item.chat_id,
						name: item.name,
						reciver_id: item.user_id,
					})
				}>
				{item.image ? (
					<Image source={{ uri: item.image }} style={styles.avatar} />
				) : (
					<View style={styles.avatarPlaceholder}>
						<Text style={styles.avatarText}>{firstLetter}</Text>
					</View>
				)}
				<View style={styles.chatContent}>
					<View style={styles.nameTime}>
						<Text style={[styles.name, { color: theme.text }]}>
							{item.name}
						</Text>
						<Text style={[styles.time, { color: theme.text }]}>
							{new Date(item.timestamp).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
								hour12: true,
							})}
						</Text>
					</View>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}>
						<Text
							style={[styles.message, { color: theme.text }]}
							numberOfLines={1}>
							{item.last_message}
						</Text>
						{item.count > 0 && (
							<View style={styles.badge}>
								<Text style={styles.badgeText}>
									{item.count > 99 ? '99+' : item.count}{' '}
									{/* Show "99+" if count exceeds 99 */}
								</Text>
							</View>
						)}
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={{ flex: 1 }}>
				<View style={styles.searchContainer}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<Ionicons name="arrow-back-outline" size={30} color="#C9A038" />
					</TouchableOpacity>
					<TextInput
						style={[
							styles.searchBar,
							{
								color: theme.text,
								backgroundColor: isDarkMode ? '#333' : '#fefae9',
								borderColor: isDarkMode ? '#444' : '#ddd',
							},
						]}
						placeholder={t('search')}
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholderTextColor={isDarkMode ? '#888' : '#666'}
					/>
				</View>

				{loading ? (
					<View
						style={{
							flexGrow: 1,
							justifyContent: 'center',
							alignItems: 'center',
						}}>
						<ActivityIndicator
							size="large"
							color="#C9A038"
							style={{ marginTop: 20 }}
						/>
					</View>
				) : (
					<FlatList
						data={filteredChats}
						renderItem={renderItem}
						keyExtractor={(item) => item.chat_id}
						style={styles.chatList}
						ListEmptyComponent={
							<Text style={[styles.emptyText, { color: theme.text }]}>
								No chats available.
							</Text>
						}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	searchContainer: {
		flexDirection: 'row',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
	},
	searchBar: {
		width: '90%',
		height: 40,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 20,
		margin: 10,
		paddingHorizontal: 15,
		backgroundColor: '#fefae9',
		fontSize: 16,
		color: '#000',
	},
	chatList: {
		flex: 1,
	},
	avatarText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: '600',
	},
	avatarPlaceholder: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 10,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#C9A038',
		borderColor: '#C9A038',
	},
	chatItem: {
		flexDirection: 'row',
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		alignItems: 'center',
	},
	badge: {
		backgroundColor: 'red', // Red background for the badge
		borderRadius: 10, // Circular badge
		width: 20, // Minimum width to ensure the badge is large enough
		height: 20, // Fixed height for the badge
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#fff', // White border for better contrast
	},
	badgeText: {
		color: '#fff', // White text color
		fontSize: 12, // Adjust font size based on badge size
		fontWeight: 'bold',
		textAlign: 'center',
	},
	avatar: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 10,
	},
	chatContent: {
		flex: 1,
	},
	nameTime: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 5,
	},
	name: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#000',
	},
	time: {
		fontSize: 12,
		color: '#666',
	},
	message: {
		fontSize: 14,
		color: '#333',
		maxWidth: '90%',
	},
	emptyText: {
		textAlign: 'center',
		color: '#666',
		fontSize: 16,
		marginTop: 20,
	},
});

// export default InboxScreen;
