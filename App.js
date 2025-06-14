import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect, useState, createContext, useContext } from 'react';
import {
	StyleSheet,
	Platform,
	View,
	Text,
	Image,
	ActivityIndicator,
} from 'react-native';
import SplashScreen from './app/screen/SplashScreen';
import UserLogin from './app/screen/authentication/UserLogin';
import { AuthProvider, useAuth } from './app/screen/authentication/Auth';
import * as Notifications from 'expo-notifications';
import UserSignup from './app/screen/authentication/UserSignup';
import ForgetPassWord from './app/screen/authentication/ForgetPassword';
import OTP from './app/screen/authentication/OTP';
import ResetPassWord from './app/screen/authentication/ResetPassword';
import UserHome from './app/screen/user/UserHome';
import ForgetPasswordOtp from './app/screen/authentication/ForgetPasswordOtp';
import { I18nextProvider } from 'react-i18next';
import i18n from './app/screen/component/language/i18n';
import GuideLogin from './app/screen/authentication/guide/GuideLogin';
import GuideSignUp from './app/screen/authentication/guide/GuideSignUp';
import GuideForgetPassword from './app/screen/authentication/guide/GuideForgetPassword';
import HistoricalArticle from './app/screen/user/HistoricalArticle';
import PlaceSelection from './app/screen/user/PlaceSelection';
import BookingCalendar from './app/screen/user/BookingCalendar';
import GuideSearchPage from './app/screen/user/GuideSearchPage';
import GuideProfile from './app/screen/user/GuideProfile';
import BookingSummary from './app/screen/user/BookingSummary';
import YourGuidePage from './app/screen/user/YourGuidePage';
import Profile from './app/screen/user/Profile';
import Settings from './app/screen/user/Settings';
import HelpSupport from './app/screen/user/HelpSupport';
import PrivacyPolicy from './app/screen/user/PrivacyPolicy';
import TermsAndCondition from './app/screen/user/TermsAndCondition';
import UmrahGuide from './app/screen/user/UmrahGuide';
import WelcomeScreen from './app/screen/WelcomeScreen';
import GuideHome from './app/screen/guide/GuideHome';
import GuideSettings from './app/screen/guide/GuideSettings';
import LocationList from './app/screen/guide/Location';
import GuideOwnProfile from './app/screen/guide/GuideOwnProfile';
import Calender from './app/screen/component/Calender';
import InboxScreen from './app/screen/user/InboxScreen';
import GuideForgetPasswordOtp from './app/screen/authentication/guide/GuideForgetPasswordOtp';
import GuideResetPassword from './app/screen/authentication/guide/GuideResetPassword';
import UmmrahBlogs from './app/screen/user/UmmrahBlogs';
import GuideCalendar from './app/screen/component/guide/GuideCalendar';
import useNotificationService from './app/screen/component/notification/NotificationService';
import {
	ThemeProvider,
	useTheme,
} from './app/screen/component/hook/ThemeContext';
import ViewGuideProfile from './app/screen/user/ViewProfileGuide';
import NotificationScreen from './app/screen/component/notification/NotificationScreen';
import Chat from './app/screen/user/Chat';
import NetInfo from '@react-native-community/netinfo';

// Create a Network Context to share network status
const NetworkContext = createContext({ isConnected: null });

export const useNetwork = () => useContext(NetworkContext);

const Stack = createNativeStackNavigator();

// New component for "No Internet" screen
function NoInternetScreen() {
	const { theme, isDarkMode } = useTheme();
	return (
		<View
			style={[
				styles.noInternetContainer,
				{ backgroundColor: theme.background },
			]}>
			<Image
				source={require('./app/assets/no-internet.jpg')}
				style={styles.noInternetImage}
				resizeMode="contain"
			/>
			<Text style={[styles.noInternetText, { color: theme.text }]}>
				{i18n.t('no_internet_connection')}
			</Text>
			<Text style={[styles.noInternetSubText, { color: theme.text }]}>
				{i18n.t('please_check_your_connection')}
			</Text>
		</View>
	);
}

// New component for initial loading screen
function LoadingScreen() {
	const { theme } = useTheme();
	return (
		<View
			style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
			<ActivityIndicator size="large" color={theme.text} />
		</View>
	);
}

// New component to handle StatusBar with theme
function ThemedStatusBar() {
	const { isDarkMode } = useTheme();
	return (
		<StatusBar
			style={isDarkMode ? 'light' : 'dark'}
			backgroundColor={isDarkMode ? '#1a1a1a' : 'white'}
		/>
	);
}

function AdminDrawer() {
	return (
		<Stack.Navigator
			initialRouteName="UserHome"
			screenOptions={{
				headerShown: false,
			}}>
			<Stack.Screen name="GuideHome" component={GuideHome} />
			<Stack.Screen name="InboxScreen" component={InboxScreen} />
			<Stack.Screen name="GuideCalendar" component={GuideCalendar} />
			<Stack.Screen name="Chat" component={Chat} />
			<Stack.Screen name="GuideSettings" component={GuideSettings} />
			<Stack.Screen name="LocationList" component={LocationList} />
			<Stack.Screen name="GuideOwnProfile" component={GuideOwnProfile} />
			<Stack.Screen name="HelpSupport" component={HelpSupport} />
			<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
			<Stack.Screen name="TermsAndCondition" component={TermsAndCondition} />
		</Stack.Navigator>
	);
}

function UserStack() {
	return (
		<Stack.Navigator
			initialRouteName="GuideHome"
			screenOptions={{
				headerShown: false,
			}}>
			<Stack.Screen name="UserHome" component={UserHome} />
			<Stack.Screen name="HistoricalArticle" component={HistoricalArticle} />
			<Stack.Screen name="PlaceSelection" component={PlaceSelection} />
			<Stack.Screen name="BookingCalendar" component={BookingCalendar} />
			<Stack.Screen name="GuideSearchPage" component={GuideSearchPage} />
			<Stack.Screen name="GuideProfile" component={GuideProfile} />
			<Stack.Screen name="BookingSummary" component={BookingSummary} />
			<Stack.Screen name="YourGuidePage" component={YourGuidePage} />
			<Stack.Screen name="Chat" component={Chat} />
			<Stack.Screen name="Profile" component={Profile} />
			<Stack.Screen name="Settings" component={Settings} />
			<Stack.Screen name="HelpSupport" component={HelpSupport} />
			<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
			<Stack.Screen name="Calender" component={Calender} />
			<Stack.Screen name="TermsAndCondition" component={TermsAndCondition} />
			<Stack.Screen name="UmrahGuide" component={UmrahGuide} />
			<Stack.Screen name="InboxScreen" component={InboxScreen} />
			<Stack.Screen name="UmmrahBlogs" component={UmmrahBlogs} />
			<Stack.Screen name="ViewGuideProfile" component={ViewGuideProfile} />
			<Stack.Screen name="Notification" component={NotificationScreen} />
		</Stack.Navigator>
	);
}

function AuthStack() {
	return (
		<Stack.Navigator
			screenOptions={{ headerShown: false }}
			initialRouteName="SplashScreen">
			<Stack.Screen name="SplashScreen" component={SplashScreen} />
			<Stack.Screen name="WELCOME" component={WelcomeScreen} />
			<Stack.Screen name="UserLogin" component={UserLogin} />
			<Stack.Screen name="GuideLogin" component={GuideLogin} />
			<Stack.Screen name="UserSignup" component={UserSignup} />
			<Stack.Screen name="GuideSignUp" component={GuideSignUp} />
			<Stack.Screen name="ForgetPassword" component={ForgetPassWord} />
			<Stack.Screen
				name="GuideForgetPassword"
				component={GuideForgetPassword}
			/>
			<Stack.Screen name="OTP" component={OTP} />
			<Stack.Screen name="ForgetPasswordOtp" component={ForgetPasswordOtp} />
			<Stack.Screen name="ResetPassword" component={ResetPassWord} />
			<Stack.Screen
				name="GuideForgetPasswordOtp"
				component={GuideForgetPasswordOtp}
			/>
			<Stack.Screen name="GuideResetPassword" component={GuideResetPassword} />
			<Stack.Screen name="UserHome" component={UserHome} />
			<Stack.Screen name="Calender" component={Calender} />
			<Stack.Screen name="HistoricalArticle" component={HistoricalArticle} />
			<Stack.Screen name="PlaceSelection" component={PlaceSelection} />
			<Stack.Screen name="BookingCalendar" component={BookingCalendar} />
			<Stack.Screen name="GuideSearchPage" component={GuideSearchPage} />
			<Stack.Screen name="InboxScreen" component={InboxScreen} />
			<Stack.Screen name="GuideProfile" component={GuideProfile} />
			<Stack.Screen name="BookingSummary" component={BookingSummary} />
			<Stack.Screen name="YourGuidePage" component={YourGuidePage} />
			<Stack.Screen name="UmmrahBlogs" component={UmmrahBlogs} />
			<Stack.Screen name="Settings" component={Settings} />
			<Stack.Screen name="HelpSupport" component={HelpSupport} />
			<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
			<Stack.Screen name="TermsAndCondition" component={TermsAndCondition} />
			<Stack.Screen name="UmrahGuide" component={UmrahGuide} />
		</Stack.Navigator>
	);
}

function AppContent() {
	const { isLoggedIn, role } = useAuth();
	const { expoPushToken, notification } = useNotificationService();
	const { isConnected } = useNetwork();

	useEffect(() => {
		const notificationListener = Notifications.addNotificationReceivedListener(
			() => {
				console.log('Push notification received');
			}
		);
		return () => {
			if (notificationListener) {
				Notifications.removeNotificationSubscription(notificationListener);
			}
		};
	}, [expoPushToken]);

	if (isLoggedIn) {
		return role === 'guide' ? <AdminDrawer /> : <UserStack />;
	} else {
		return <AuthStack />;
	}
}

export default function App() {
	const [isConnected, setIsConnected] = useState(null);
	const [isCheckingNetwork, setIsCheckingNetwork] = useState(true);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state) => {
			const connected = state.isConnected && state.isInternetReachable;
			setIsConnected(connected);
			if (!connected) {
				console.log('No internet connection');
			} else {
				console.log('Internet connection restored');
			}
		});

		NetInfo.fetch().then((state) => {
			setIsConnected(state.isConnected && state.isInternetReachable);
			setIsCheckingNetwork(false);
		});

		return () => unsubscribe();
	}, []);
	{
		
	}
	return (
		<I18nextProvider i18n={i18n}>
			<ThemeProvider>
				<AuthProvider>
					<SafeAreaProvider>
						<NetworkContext.Provider value={{ isConnected }}>
							{isCheckingNetwork || isConnected === null ? (
								<LoadingScreen />
							) : (
								<>
									<NavigationContainer>
										<AppContent />
										<ThemedStatusBar />
									</NavigationContainer>

								</>
							)}
						</NetworkContext.Provider>
					</SafeAreaProvider>
				</AuthProvider>
			</ThemeProvider>
		</I18nextProvider>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
		backgroundColor: Platform.OS === 'white' ? StatusBar.currentHeight : 0,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 16,
		marginTop: 10,
	},
	noInternetContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	noInternetImage: {
		width: 150,
		height: 150,
		marginBottom: 20,
	},
	noInternetText: {
		fontSize: 24,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 10,
	},
	noInternetSubText: {
		fontSize: 16,
		textAlign: 'center',
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(0, 0, 0, 0.8)',
	},
});
