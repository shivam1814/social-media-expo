import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import Icon from "@/assets/icons";
import { useRouter } from "expo-router";
import Avatar from "@/components/Avatar";
import { fetchPost } from "@/services/postService";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";
import { getUserData } from "@/services/userService";

// function isAuthUserData(user: UserType | null): user is authUserData {
//   return !!user && "image" in user;
// }

export interface postLike {
  created_at?: string;
  id?: number;
  postId: number;
  userId: string;
}

interface comments {
  count: number;
}

export interface PostProps {
  body: string;
  comments: comments[];
  created_at: string;
  file: string;
  id: number;
  postLikes: postLike[];
  user: {
    id: string;
    image: string;
    name: string;
  };
  userId: string;
}

var limit = 0;

const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<PostProps[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const handlePostEvent = async (payLoad: any) => {
    // console.log("postPayLoad : ", payLoad);
    if (payLoad.eventType == "INSERT" && payLoad?.new?.id) {
      let newPost = { ...payLoad.new };
      let res = await getUserData(newPost?.userId);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      newPost.user = res.success ? res.data : {};
      setPost((prevPost) => [newPost, ...prevPost]);
    }
    if (payLoad.eventType == "DELETE" && payLoad?.old?.id) {
      setPost((prevPosts) => {
        let updatedPost = prevPosts.filter(
          (post) => post.id != payLoad?.old?.id
        );
        return updatedPost;
      });
    }
    if (payLoad.eventType == "UPDATE" && payLoad?.new?.id) {
      setPost((prevPost) => {
        let updatedPost = prevPost.map((post) => {
          if (post.id == payLoad?.new?.id) {
            post.body = payLoad?.new?.body;
            post.file = payLoad?.new?.file;
          }
          return post;
        });
        return updatedPost;
      });
    }
  };

  const handleUpdateCommentCount = async (cmtPayLoad: any) => {
    console.log("cmtPayLoad : ", cmtPayLoad);
    console.log("cmtPayLoad new : ", cmtPayLoad.new);
    //need to implement

    // if (cmtPayLoad.eventType == "DELETE" && cmtPayLoad?.new?.id) {
    //   setPost((prevPost) => {
    //     let updatedPost = { ...prevPost! };
    //     updatedPost.filter((c) => c.id == )
    //     updatedPost.comments = updatedPost.comments?.filter(
    //       (c) => c.id != comment.id
    //     );
    //     return updatedPost;
    //   });
    // }
  };

  const handleNewNotification = async (payLoad: any) => {
    console.log("got new notification : ", payLoad);
    if (payLoad.eventType == "INSERT" && payLoad.new.id) {
      setNotificationCount((preCount) => preCount + 1);
    }
  };

  useEffect(() => {
    let postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();

    let notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user?.id}`,
        },
        handleNewNotification
      )
      .subscribe();

    // getPost();

    // let cmtChannel = supabase
    //   .channel("homePostComment")
    //   .on(
    //     "postgres_changes",
    //     {
    //       event: "*",
    //       schema: "public",
    //       table: "comments",
    //     },
    //     handleUpdateCommentCount
    //   )
    //   .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notificationChannel);
      // supabase.removeChannel(cmtChannel);
    };
  }, []);

  const getPost = async () => {
    //call api here

    if (!hasMore) return null;

    limit = limit + 10;

    console.log("post fetched : ", limit);
    let res = await fetchPost(limit);
    console.log("postFecth response : ", res);
    if (res.success) {
      if (post.length == res.data?.length) {
        setHasMore(false);
      }
      setPost(res.data as []);
    }
  };

  // console.log("user : ", user);

  // const onLogout = async () => {
  //   // setAuth(null);
  //   const { error } = await supabase.auth.signOut();
  //   if (error) {
  //     Alert.alert("Sign out", "Erro sign out!");
  //   }
  // };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>LinkUp</Text>
          <View style={styles.icons}>
            <Pressable
              onPress={() => {
                setNotificationCount(0);
                router.push("/notifications");
              }}
            >
              <Icon
                name="heart"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{notificationCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => router.push("/newPost")}>
              <Icon
                name="plus"
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("/profile")}>
              <Avatar
                uri={user?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </View>
        </View>

        {/* posts */}
        <FlatList
          data={post}
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
      </View>
      {/* <Button title="log out" onPress={onLogout} /> */}
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },
  pillText: {
    color: "white",
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});
