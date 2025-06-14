import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
	StyleSheet,
	View,
	Text,
	TextInput,
	FlatList,
	Image,
	TouchableOpacity,
	Alert,
	Platform,
	ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../component/axiosInstance';
import { KeyboardAvoidingView } from 'react-native';
import { useTheme } from '../component/hook/ThemeContext'; // Import ThemeContext

export default function Chat({ navigation, route }) {
	const { name, reciver_id } = route.params || {};
	const { theme, isDarkMode } = useTheme(); // Use theme from context
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState('');
	const [chatId, setChatId] = useState(null);
	const [loading, setLoading] = useState(false);
	const ws = useRef(null);
	const [sender_id, setSenderId] = useState(null);
	const receivedMessageIds = useRef(new Set());
	const flatListRef = useRef(null); // Properly define FlatList ref
	const maxRetries = 3; // Max retries for starting chat
	const retryDelay = 2000; // Delay between retries in ms
	console.log('chatId', chatId);

	// Scroll to bottom when messages update or component mounts
	useEffect(() => {
		if (messages.length > 0 && flatListRef.current) {
			flatListRef.current.scrollToEnd({ animated: true });
		}
	}, [messages]);

	const scrollToBottom = useCallback(() => {
		if (messages.length > 0 && flatListRef.current) {
			flatListRef.current.scrollToEnd({ animated: true });
		}
	}, [messages.length]);

	const FetchExistingChat = async (chat_id) => {
		try {
			const response = await axiosInstance.get(`/chat/history/${chat_id}/`);
			if (response.status === 200) {
				setMessages(response.data);
			} else {
				console.error('Error fetching chat history:', response.data.error);
			}
		} catch (error) {
			console.error('Error fetching chat history:', error.message);
		}
	};

	const startChat = async (retryCount = 0) => {
		try {
			setLoading(true);
			const response = await axiosInstance.post('/chat/start/', {
				receiver_id: reciver_id,
			});
			if (response.data) {
				const newChatId = response.data.chat_id;
				setChatId(newChatId);
				await FetchExistingChat(newChatId);
				return newChatId;
			}
		} catch (error) {
			console.error('Error starting chat:', error.message);
			if (retryCount < maxRetries) {
				console.log(`Retrying startChat (${retryCount + 1}/${maxRetries})...`);
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
				return startChat(retryCount + 1);
			} else {
				Alert.alert('Error', 'Failed to start chat. Please try again later.');
			}
		} finally {
			setLoading(false);
		}
		return null;
	};

	const handleSendMessage = async (message) => {
		if (!message.trim()) return;

		if (!chatId) {
			const newChatId = await startChat();
			if (!newChatId) return;
		}

		if (ws.current?.readyState === WebSocket.OPEN) {
			ws.current.send(
				JSON.stringify({
					message,
					sender_id: JSON.parse(sender_id),
					receiver_id: reciver_id,
					chat_id: chatId,
				})
			);
			setNewMessage('');
			scrollToBottom(); // Scroll to bottom after sending a message
		} else {
			Alert.alert('Error', 'WebSocket is not connected');
		}
	};

	const markMessagesAsRead = async (chatId, retryCount = 0) => {
		if (!chatId) {
			if (retryCount < maxRetries) {
				console.log(
					`Retrying markMessagesAsRead (${retryCount + 1}/${maxRetries})...`
				);
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
				const newChatId = await startChat();
				if (newChatId) {
					return markMessagesAsRead(newChatId, retryCount + 1);
				}
			}
			console.error('Cannot mark messages as read: chatId is null');
			return;
		}

		try {
			const response = await axiosInstance.post(`/chat/mark-read/${chatId}/`);
			console.log('Mark as read response:', response.data);
		} catch (error) {
			console.error(
				'Error marking messages as read:',
				error.response?.data || error.message
			);
			if (retryCount < maxRetries) {
				console.log(
					`Retrying markMessagesAsRead (${retryCount + 1}/${maxRetries})...`
				);
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
				return markMessagesAsRead(chatId, retryCount + 1);
			}
			Alert.alert(
				'Error',
				'Failed to mark messages as read. Please try again.'
			);
		}
	};

	useEffect(() => {
		if (chatId) {
			markMessagesAsRead(chatId);
		}
	}, [chatId]);

	useEffect(() => {
		const fetchSenderId = async () => {
			try {
				const id = await AsyncStorage.getItem('sender_id');
				if (id) {
					setSenderId(id);
				}
			} catch (error) {
				console.error('Error fetching sender_id:', error);
			}
		};
		fetchSenderId();
	}, []);

	useEffect(() => {
		const setupWebSocket = async (retryCount = 0) => {
			try {
				const storedSenderId = await AsyncStorage.getItem('sender_id');
				if (!storedSenderId) {
					console.error('No sender_id found in AsyncStorage');
					return;
				}

				setSenderId(storedSenderId);
				let currentChatId = chatId;

				if (!currentChatId) {
					const newChatId = await startChat();
					if (!newChatId) {
						if (retryCount < maxRetries) {
							console.log(
								`Retrying setupWebSocket (${retryCount + 1}/${maxRetries})...`
							);
							await new Promise((resolve) => setTimeout(resolve, retryDelay));
							return setupWebSocket(retryCount + 1);
						}
						Alert.alert(
							'Error',
							'Failed to initialize chat. Please try again.'
						);
						return;
					}
					currentChatId = newChatId;
				}

				ws.current = new WebSocket(
					`wss://nusukey.duckdns.org/ws/chat/${currentChatId}/`
				);

				ws.current.onopen = () => {
					console.log('✅ WebSocket Connected');
				};

				ws.current.onmessage = (event) => {
					const data = JSON.parse(event.data);
					if (!data.id || receivedMessageIds.current.has(data.id)) return;

					receivedMessageIds.current.add(data.id);
					markMessagesAsRead(currentChatId);
					setMessages((prevMessages) => [
						...prevMessages,
						{
							id: data.id,
							sender: data.sender,
							message: data.message,
							timestamp: data.timestamp,
							image: data.image || null,
						},
					]);
				};

				ws.current.onerror = (error) => {
					console.error('❌ WebSocket Error:', error.message);
				};

				ws.current.onclose = () => {
					console.log('⚠️ WebSocket Disconnected');
				};
			} catch (error) {
				console.error('❌ Error setting up WebSocket:', error);
				if (retryCount < maxRetries) {
					console.log(
						`Retrying setupWebSocket (${retryCount + 1}/${maxRetries})...`
					);
					await new Promise((resolve) => setTimeout(resolve, retryDelay));
					return setupWebSocket(retryCount + 1);
				}
				Alert.alert('Error', 'Failed to set up WebSocket. Please try again.');
			}
		};

		setupWebSocket();

		return () => {
			if (ws.current) {
				ws.current.close();
			}
		};
	}, [chatId]);

	const formate = (item) => {
		return item.sender == sender_id ? 'sender' : 'receiver';
	};

	const renderItem = ({ item }) => {
		const firstLetter = item.name ? item.name.charAt(0).toUpperCase() : '?';

		return (
			<View
				style={[
					styles.messageContainer,
					formate(item) === 'sender'
						? styles.senderContainer
						: styles.receiverContainer,
				]}>
				{formate(item) === 'receiver' &&
					(item.image ? (
						<Image source={{ uri: item.image }} style={styles.avatar} />
					) : (
						<View style={styles.avatarPlaceholder}>
							<Text style={styles.avatarText}>{firstLetter}</Text>
						</View>
					))}
				<View
					style={[
						styles.messageBubble,
						formate(item) === 'sender'
							? [
									styles.senderBubble,
									{ backgroundColor: isDarkMode ? '#2e7d32' : '#e8f5e9' },
							  ]
							: [
									styles.receiverBubble,
									{ backgroundColor: isDarkMode ? '#4b2e00' : '#fff8e1' },
							  ],
					]}>
					{item.message && (
						<Text style={[styles.messageText, { color: theme.text }]}>
							{item.message}
						</Text>
					)}
					<View
						style={{
							flexDirection: 'row',
							gap: 4,
							justifyContent: 'flex-end',
						}}>
						<Text style={[styles.messageTime, { color: theme.text }]}>
							{new Date(item.timestamp).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
							})}
						</Text>
						<Text style={[styles.messageTime, { color: theme.text }]}>
							{new Date(item.timestamp).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
								hour12: true,
							})}
						</Text>
					</View>
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.background }]}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}>
				<View
					style={[
						styles.header,
						{
							backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
							borderBottomColor: isDarkMode ? '#444' : '#eee',
						},
					]}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => navigation.goBack()}>
						<Ionicons name="arrow-back" size={24} color={theme.text} />
					</TouchableOpacity>
					<View style={{ alignItems: 'center' }}>
						<Text style={[styles.headerTitle, { color: theme.text }]}>
							{name}
						</Text>
					</View>
					<TouchableOpacity style={styles.searchButton}></TouchableOpacity>
				</View>

				<View style={{ flex: 1 }}>
					<FlatList
						ref={flatListRef}
						data={messages}
						renderItem={renderItem}
						keyExtractor={(item) => item.id}
						style={styles.chatList}
						contentContainerStyle={
							messages.length > 0 && !loading
								? styles.chatContent // Regular padding
								: { flexGrow: 1, justifyContent: 'center' } // For loading center
						}
						ListEmptyComponent={
							loading ? (
								<View
									style={{
										flex: 1,
										justifyContent: 'center',
										alignItems: 'center',
										width: '100%',
									}}>
									<ActivityIndicator size="large" color={theme.text} />
								</View>
							) : null
						}
						onContentSizeChange={() => scrollToBottom()}
						onLayout={() => scrollToBottom()}
					/>
				</View>

				<View
					style={[
						styles.inputContainer,
						{
							backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
							borderTopColor: isDarkMode ? '#444' : '#eee',
						},
					]}>
					<TextInput
						style={[
							styles.input,
							{
								color: theme.text,
								backgroundColor: isDarkMode ? '#444' : '#fff',
								borderColor: isDarkMode ? '#555' : '#ddd',
							},
						]}
						value={newMessage}
						onChangeText={setNewMessage}
						placeholder="Send a message"
						placeholderTextColor={isDarkMode ? '#888' : '#666'}
						editable={!loading}
					/>
					<TouchableOpacity
						style={styles.sendButton}
						onPress={() => handleSendMessage(newMessage)}
						disabled={loading}>
						<Ionicons name="send" size={24} color={loading ? '#ccc' : '#fff'} />
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	avatarText: {
		color: '#fff',
		fontSize: 18,
		fontWeight: 600,
	},
	avatarPlaceholder: {
		width: 35,
		height: 35,
		borderRadius: 17.5,
		marginRight: 10,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#C9A038',
		borderColor: '#C9A038',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
		backgroundColor: '#f5f5f5',
		justifyContent: 'space-between',
	},
	backButton: {
		padding: 5,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#000',
		textAlign: 'center',
	},
	headerSubtitle: {
		fontSize: 12,
		color: '#666',
	},
	searchButton: {
		padding: 5,
	},
	chatList: {
		flex: 1,
	},
	chatContent: {
		paddingVertical: 10,
		paddingHorizontal: 15,
	},
	messageContainer: {
		marginVertical: 5,
		alignItems: 'flex-end',
	},
	receiverContainer: {
		alignItems: 'flex-end',
		flexDirection: 'row',
	},
	senderContainer: {
		alignItems: 'flex-end',
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: 10,
	},
	messageBubble: {
		maxWidth: '70%',
		padding: 10,
		marginVertical: 2,
	},
	receiverBubble: {
		backgroundColor: '#fff8e1',
		borderWidth: 1,
		borderColor: '#ddd',
		marginLeft: 0,
		alignItems: 'flex-start',
		gap: 4,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 10,
		borderBottomRightRadius: 20,
	},
	senderBubble: {
		backgroundColor: '#e8f5e9',
		alignItems: 'flex-end',
		marginRight: 10,
		gap: 4,
		borderTopRightRadius: 20,
		borderTopLeftRadius: 10,
		borderBottomLeftRadius: 20,
	},
	messageDate: {
		fontSize: 10,
		color: '#666',
		marginBottom: 5,
	},
	messageText: {
		fontSize: 14,
		color: '#000',
	},
	messageTime: {
		fontSize: 10,
		color: '#666',
		textAlign: 'right',
		marginTop: 5,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		borderTopWidth: 1,
		borderTopColor: '#eee',
		backgroundColor: '#f5f5f5',
	},
	input: {
		flex: 1,
		height: 40,
		borderRadius: 20,
		paddingHorizontal: 15,
		backgroundColor: '#fff',
		marginHorizontal: 10,
		fontSize: 14,
		color: '#000',
		borderWidth: 1,
		borderColor: '#ddd',
	},
	sendButton: {
		backgroundColor: '#009688',
		padding: 10,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
