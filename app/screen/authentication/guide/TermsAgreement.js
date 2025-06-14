import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TermsAgreement({
	navigation,
	isChecked,
	setIsChecked,
}) {
	return (
		<View style={styles.container}>
			{/* Checkbox & Terms Text */}
			<View style={styles.termsContainer}>
				<TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
					<Ionicons
						name={isChecked ? 'checkbox-outline' : 'square-outline'}
						size={24}
						color={isChecked ? '#C9A038' : '#777'}
					/>
				</TouchableOpacity>

				<Text style={styles.termsText}>
					I understood the{' '}
					<Text
						style={styles.linkText}
						onPress={() => navigation.navigate('TermsAndCondition')}>
						Terms &
					</Text>{' '}
					<Text
						style={styles.linkText}
						onPress={() => navigation.navigate('PrivacyPolicy')}>
						Privacy Policy
					</Text>
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '100%',
		padding: 10,
		justifyContent: 'flex-start',
	},
	termsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8, // Adds space between checkbox & text
	},
	termsText: {
		fontSize: 14,
		color: '#333',
	},
	linkText: {
		color: '#C9A038',
		fontWeight: 'bold',
	},
});
