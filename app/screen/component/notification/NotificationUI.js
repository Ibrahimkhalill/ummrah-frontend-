import React from "react";
import { View, Text, Button } from "react-native";
import useNotificationService from "./NotificationService";

async function sendPushNotification(expoPushToken, body) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Surgery Follow Up Reminder",
    body: body,
    data: { someData: "goes here" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

// export default function NotificationUI() {
//   const { expoPushToken, notification } = useNotificationService();

//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
//       <Text>Your Expo push token:</Text>
//       <Text>{expoPushToken ? expoPushToken : 'Fetching token...'}</Text>
//       <View style={{ alignItems: 'center', justifyContent: 'center' }}>
//         <Text>Title: {notification?.request?.content?.title || 'No notification yet'}</Text>
//         <Text>Body: {notification?.request?.content?.body || 'No notification yet'}</Text>
//         <Text>Data: {notification?.request?.content?.data ? JSON.stringify(notification.request.content.data) : 'No data yet'}</Text>
//       </View>
//       <Button
//         title="Send Test Notification"
//         onPress={() => {
//           if (expoPushToken) {
//             sendPushNotification(expoPushToken);
//           } else {
//             alert('Push token not available yet.');
//           }
//         }}
//       />
//     </View>
//   );
// }

export default sendPushNotification;
