import React from "react";
import { Text, View } from "react-native";

const formatDate = (dateString) => {
  const date = new Date(dateString);

  // Format 1: MM/DD/YY
  const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const dd = String(date.getDate()).padStart(2, "0");
  const yy = String(date.getFullYear()).slice(-2); // Last 2 digits of the year

  const formattedDate = `${mm}/${dd}/${yy}`;

  // Format 2: Day of the week
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" }); // e.g., "Fri"

  return { formattedDate, dayOfWeek };
};

const DateDisplay = ({ dateString }) => {
  const { formattedDate, dayOfWeek } = formatDate(dateString);

  return (
    <View className="flex flex-row items-center gap-2 ">
      <Text className="text-[8px]">{formattedDate}</Text>
      <Text className="text-[8px]">({dayOfWeek})</Text>
    </View>
  );
};

export default DateDisplay;
