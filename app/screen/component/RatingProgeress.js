import { StyleSheet, View} from "react-native";
const RatingProgeress = ({ progress }) => {
  return (
    
    <View style={styles.RatingContainer}>
      <View style={[styles.RatingFill, { width: `${progress * 100}%` }]} />
    </View>
  );
};

const styles= StyleSheet.create({
    RatingContainer: { height: 12, width: "50%", backgroundColor: "#ddd", borderRadius: 3, marginTop: 4,  },
    RatingFill: { height: 12, backgroundColor: "#FFC107", borderRadius: 5 },
})

export default RatingProgeress;