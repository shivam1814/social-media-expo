import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createComment,
  fetchPostDetails,
  removeComment,
  removePost,
} from "@/services/postService";
import { hp, wp } from "@/helpers/common";
import { theme } from "@/constants/theme";
import PostCard from "@/components/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/Loading";
import Input from "@/components/Input";
import Icon from "@/assets/icons";
import { postLike, PostProps } from "./home";
import CommentItem from "@/components/CommentItem";
import { supabase } from "@/lib/supabase";
import { getUserData } from "@/services/userService";
import { createNotification } from "@/services/notificationService";
import { ItemProps } from "@/components/NotificationItem";

export interface comments {
  created_at: string;
  id: number;
  postId: number;
  text: string;
  user: {
    id: string;
    image: string;
    name: string;
  };
  userId: string;
}

interface PostDetailProps {
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

const PostDetail = () => {
  let { postID } = useLocalSearchParams<{ postID: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(true);
  const inputRef = useRef<TextInput>(null);
  const commentRef = useRef("");
  const [loading, setLoading] = useState(false);
  let commentId:string = "";

  const [post, setPost] = useState<PostDetailProps>();

  console.log("ggggggggg : ", postID);
  console.log("type of gggggg : ", typeof postID);

  let postData: ItemProps | null = null;
  if (postID.includes("commentId")) {
    if (postID != undefined) {
      postData = JSON.parse(postID);
      postID = postData?.postId!;
      commentId = postData?.commentId!;
    }
  }

  console.log("post details : ", post);
  console.log("post id : ", postID);

  const handleCommentEvent = async (payload: any) => {
    console.log("got new comment : ", payload.new);
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      setPost((prevPost) => {
        return {
          ...prevPost!,
          comments: [newComment, ...prevPost?.comments!],
        };
      });
    }
  };

  useEffect(() => {
    let commentsChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postID}`,
        },
        handleCommentEvent
      )
      .subscribe();

    getPostDetails();

    return () => {
      supabase.removeChannel(commentsChannel);
    };
  }, []);

  const getPostDetails = async () => {
    //fetch post detail here
    let res = await fetchPostDetails(postID);
    console.log("post fetched : ", res);

    if (res.success) {
      setPost(res.data);
    }
    setStartLoading(false);
  };

  const onNewComment = async () => {
    if (!commentRef.current) {
      return null;
    }

    let data = {
      userId: user?.id,
      postId: post?.id,
      text: commentRef.current,
    };

    //create comment
    setLoading(true);
    let res = await createComment(data);
    setLoading(false);
    if (res.success) {
      if (user?.id != post?.userId) {
        //send notification
        let notify = {
          senderId: user?.id,
          receiverId: post?.userId,
          title: "commented on post",
          data: JSON.stringify({ postId: post?.id, commentId: res?.data?.id }),
        };
        createNotification(notify);
      }
      inputRef?.current?.clear();
      commentRef.current = "";
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onDeleteComment = async (comment: comments) => {
    console.log("delete comment : ", comment);
    let res = await removeComment(comment?.id);
    if (res.success) {
      setPost((prevPost) => {
        let updatedPost = { ...prevPost! };
        updatedPost.comments = updatedPost.comments?.filter(
          (c) => c.id != comment.id
        );
        return updatedPost;
      });
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onDeletePost = async (item: PostProps) => {
    // console.log("delete post : ", item);
    let res = await removePost(post!.id);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Post", res.msg);
    }
  };

  const onEditPost = async (item: PostProps) => {
    console.log("edit post : ", item!);
    router.back();
    router.push({
      pathname: "/newPost",
      params: { data: JSON.stringify(item) },
    });
  };

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (!post) {
    return (
      <View
        style={[
          styles.center,
          { justifyContent: "flex-start", marginTop: 100 },
        ]}
      >
        <Text style={styles.notFound}>Post not found !</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <PostCard
          item={{ ...post!, comments: [{ count: post?.comments?.length! }] }}
          currentUser={user!}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeletePost}
          onEdit={onEditPost}
        />

        {/* comment input */}
        <View style={styles.inputContainer}>
          <Input
            inputRef={inputRef}
            placeholder="Type comment..."
            onChangeText={(value) => (commentRef.current = value)}
            placeholderTextColor={theme.colors.textLight}
            containerStyle={{
              flex: 1,
              height: hp(6.2),
              borderRadius: theme.radius.xl,
            }}
          />

          {loading ? (
            <View style={styles.loading}>
              <Loading size="small" />
            </View>
          ) : (
            <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
              <Icon name="send" color={theme.colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>

        {/* comments list */}
        <View style={{ marginVertical: 15, gap: 17 }}>
          {post?.comments?.map((comment) => (
            <CommentItem
              key={comment?.id.toString()}
              item={comment}
              onDelete={onDeleteComment}
              highlight= {comment.id.toString() == commentId}
              canDelete={user?.id == comment.userId || user?.id == post.userId}
            />
          ))}

          {post?.comments?.length == 0 && (
            <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
              Be first to comment!
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PostDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: wp(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(4),
  },
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },
});
