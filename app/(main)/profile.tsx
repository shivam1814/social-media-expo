import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import Header from "@/components/Header";
import { hp, wp } from "@/helpers/common";
import Icon from "@/assets/icons";
import { theme } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import Avatar from "@/components/Avatar";
import { PostProps } from "./home";
import { fetchPost, fetchUserPost } from "@/services/postService";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";

var limit = 0;
const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<PostProps[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const onLogout = async () => {
    // setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign out", "Erro sign out!");
    }
  };

  const getPost = async () => {
    //call api here

    if (!hasMore) return null;

    limit = limit + 10;

    console.log("post fetched : ", limit);
    let res = await fetchUserPost(limit, user!.id);
    console.log("postFecth response : ", res);
    if (res.success) {
      if (post.length == res.data?.length) {
        setHasMore(false);
      }
      setPost(res.data as []);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => console.log("modal cancel"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <FlatList
        data={post}
        ListHeaderComponent={
          <UserHeader user={user} router={router} handleLogout={handleLogout} />
        }
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard item={item} currentUser={user!!} router={router} />
        )}
        onEndReached={() => {
          getPost();
          console.log("reach to end");
        }}
        ListFooterComponent={
          hasMore ? (
            <View style={{ marginVertical: post.length == 0 ? 200 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({
  user,
  router,
  handleLogout,
}: {
  user: any;
  router: any;
  handleLogout: () => void;
}) => {
  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title="Profile" showBackButton={true} mb={30} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" color={theme.colors.rose} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            <Pressable
              style={styles.editIcon}
              onPress={() => router.push("editProfile")}
            >
              <Icon name="edit" strokeWidth={2.5} size={20} />
            </Pressable>
          </View>

          {/* username and address */}
          <View style={{ alignItems: "center", gap: 14 }}>
            <Text style={styles.userName}>{user && user.name}</Text>
            <Text style={styles.infoText}>{user && user.address}</Text>
          </View>

          {/* email,phone, bio */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{user && user.email}</Text>
            </View>
          </View>

          {user && user.phoneNumber && (
            <View style={{ gap: 10 }}>
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{user && user.phoneNumber}</Text>
              </View>
            </View>
          )}

          {user && user.bio && <Text style={styles.infoText}>{user.bio}</Text>}
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20,
  },
  headerShape: {
    width: wp(100),
    height: hp(20),
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  logoutButton: {
    position: "absolute",
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  lifeStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
});
