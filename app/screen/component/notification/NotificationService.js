import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axiosInstance from '../axiosInstance';
import { useAuth } from '../../authentication/Auth';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

export default function useNotificationService() {
	const [expoPushToken, setExpoPushToken] = useState(null);
	const [notification, setNotification] = useState(null);
	const notificationListener = useRef();
	const responseListener = useRef();
	const { token } = useAuth();
	const navigation = useNavigation(); // Initialize navigation

	useEffect(() => {
		// Register for push notifications and send the token to the backend
		registerForPushNotificationsAsync(token)
			.then((token) => setExpoPushToken(token))
			.catch((error) =>
				console.log('Error registering for notifications:', error.message)
			);

		// Listener for incoming notifications
		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				setNotification(notification);
				// Handle navigation based on notification data
				handleNotificationNavigation(notification);
			});

		// Listener for responses to notifications (e.g., when user taps the notification)
		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log('Notification response:', response);
				// Handle navigation based on response data
				handleNotificationNavigation(response.notification);
			});

		// Cleanup listeners
		return () => {
			if (notificationListener.current) {
				Notifications.removeNotificationSubscription(
					notificationListener.current
				);
			}
			if (responseListener.current) {
				Notifications.removeNotificationSubscription(responseListener.current);
			}
		};
	}, [token]);

	// Function to handle navigation based on notification data
	const handleNotificationNavigation = (notification) => {
		const { data } = notification.request.content; // Extract data from notification
		if (data && data === 'Inboxscreen') {
			navigation.navigate('Inboxscreen'); // Navigate to Inboxscreen
		}
		// Add more conditions for other screens if needed
		// else if (data === 'OtherScreen') {
		//   navigation.navigate('OtherScreen');
		// }
	};

	return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync(authToken) {
	if (!Device.isDevice) {
		throw new Error('Must use a physical device for push notifications.');
	}

	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync('default', {
			name: 'default',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#FF231F7C',
			showBadge: true,
			allowWhileIdle: true,
			sound: 'default',
		});
	}

	const permissionOptions =
		Platform.OS === 'ios'
			? {
					ios: {
						allowAlert: true,
						allowBadge: true,
						allowSound: true,
					},
			  }
			: {};

	const { status: existingStatus } = await Notifications.getPermissionsAsync();

	let finalStatus = existingStatus;

	if (existingStatus !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync(
			permissionOptions
		);
		finalStatus = status;
	}

	if (finalStatus !== 'granted') {
		throw new Error('Permission not granted for push notifications.');
	}

	const projectId =
		Constants?.expoConfig?.extra?.eas?.projectId ??
		Constants?.easConfig?.projectId;

	if (!projectId) {
		throw new Error('Project ID not found.');
	}

	const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
		projectId,
	});

	console.log('Expo Push Token:', expoPushToken);

	await sendTokenToBackend(expoPushToken, authToken);

	return expoPushToken;
}

async function sendTokenToBackend(pushToken, authToken) {
	if (!pushToken || !authToken) {
		return;
	}
	try {
		const response = await axiosInstance.post(
			'/notification/save-expo-token/',
			{
				expo_token: pushToken,
			},
			{
				headers: {
					Authorization: `Bearer ${authToken}`,
				},
			}
		);

		if (response.status === 200) {
			console.log('Token successfully sent to backend!');
		} else {
			console.log('Failed to send token to backend:', response.data);
		}
	} catch (error) {
		if (error.response) {
			console.log('Backend error:', error.response.data);
		} else {
			console.log('Error sending token to backend:', error.message);
		}
	}
}
