import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { fetchNotifications } from "@/services/notificationService";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import NotificationItem from "@/components/NotificationItem";

const Notifications = () => {
  const [notification, setNotification] = useState<any>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    let res = await fetchNotifications(user?.id!);
    console.log("notifications : ", res);
    if (res.success) {
      setNotification(res.data);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Notifications" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
        >
          {notification.map((item:any) => {
            return (
              <NotificationItem item={item} key={item?.id} router={router} />
            );
          })}
          {
            notification.length == 0 && (
              <Text style={styles.noData}>No notification yet.</Text>
            )
          }
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
  },
});
