import { StyleSheet, View } from "react-native";
const ProgressBar = ({ progress }) => {
  return (

    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: { height: 12, width: "90%", backgroundColor: "#ddd", borderRadius: 3, marginTop: 4, },
  progressBarFill: { height: 12, backgroundColor: "#FFC107", borderRadius: 5 },
})

export default ProgressBar;