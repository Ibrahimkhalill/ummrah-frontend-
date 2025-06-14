import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../component/hook/ThemeContext';
import Navbar from '../component/Navbar';

export default function TermsAndCondition({ navigation }) {
	const { t } = useTranslation(); // i18next hook for language translations
	const { theme } = useTheme(); // Access theme from the context

	return (
		<SafeAreaView
			style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={styles.container}>
				<Navbar navigation={navigation} label={t('terms_of_use.title')} />
				<ScrollView
					style={styles.contentContainer}
					showsVerticalScrollIndicator={false}>
					<Text style={[styles.contentText, { color: theme.text }]}>
						{t('terms_of_use.last_updated')}
					</Text>
					<Text style={[styles.contentText, { color: theme.text }]}>
						{t('terms_of_use.intro')}
					</Text>

					{t('terms_of_use.sections', { returnObjects: true }).map(
						(section, index) => (
							<View key={index}>
								<Text style={[styles.listItem, { color: theme.text }]}>
									<Text style={[styles.boldText, { color: theme.text }]}>
										{section.title}
									</Text>
									{'\n'}
									{section.content.map((item, i) => (
										<Text
											key={i}
											style={[styles.listItem, { color: theme.text }]}>
											{item}
											{'\n'}
										</Text>
									))}
								</Text>
							</View>
						)
					)}

					<Text style={[styles.contentText, { color: theme.text }]}>
						{t('terms_of_use.footer')}
					</Text>
				</ScrollView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, paddingHorizontal: 10 },
	contentContainer: { flex: 1, marginTop: 50 },
	contentText: { fontSize: 14, color: '#333', marginBottom: 10 },
	listItem: { fontSize: 14, color: '#333', marginBottom: 10, lineHeight: 20 },
	boldText: { fontWeight: 'bold' },
});
