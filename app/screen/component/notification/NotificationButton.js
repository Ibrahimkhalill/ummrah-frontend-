import { useAuth } from '../../authentication/Auth';
import { useTheme } from '../hook/ThemeContext';

const { View, Text, TouchableOpacity, StyleSheet } = require('react-native');
const { Ionicons } = require('@expo/vector-icons');

const NotificationButton = ({ unreadCount = 0, navigation }) => {
	const { token, role } = useAuth();
	const { theme } = useTheme();

	const handleNavigation = () => {
		if (token) {
			navigation.navigate('Notification');
		} else {
			if (role === 'guide') {
				navigation.navigate('GuideLogin');
				return;
			}
			navigation.navigate('UserLogin');
		}
	};
	return (
		<TouchableOpacity
			style={styles.container}
			onPress={() => handleNavigation()}>
			<Ionicons name="notifications" size={28} color={theme.text} />
			{unreadCount > 0 && (
				<View style={styles.badge}>
					<Text style={styles.badgeText}>
						{unreadCount > 99 ? '99+' : unreadCount}
					</Text>
				</View>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'relative',
		padding: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	badge: {
		position: 'absolute',
		top: 5,
		right: 5,
		backgroundColor: '#FF3B30',
		borderRadius: 10,
		minWidth: 20,
		height: 20,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: '#fff',
	},
	badgeText: {
		color: '#fff',
		fontSize: 12,
		fontWeight: 'bold',
		textAlign: 'center',
	},
});

export default NotificationButton;
