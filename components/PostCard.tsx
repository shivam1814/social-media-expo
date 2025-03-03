import {
  Alert,
  Share,
  ShareContent,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { postLike, PostProps } from "@/app/(main)/home";
import { authUserData } from "@/contexts/AuthContext";
import { theme } from "@/constants/theme";
import Avatar from "./Avatar";
import { hp, stringHtmlTags, wp } from "@/helpers/common";
import moment from "moment";
import Icon from "@/assets/icons";
import { RenderHTML } from "react-native-render-html";
import HTMLView from "react-native-htmlview";
import { Image } from "expo-image";
import { downloadFile, getSupabaseFileUrl } from "@/services/imageService";
import { ResizeMode, Video } from "expo-av";
import { createPostLike, removePostLike } from "@/services/postService";
import Loading from "./Loading";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

interface PostCardProps {
  item: PostProps;
  currentUser: authUserData;
  router: any;
  hasShadow?: boolean;
  showMoreIcon?: boolean;
  showDelete?: boolean;
  onDelete?: (item:PostProps) => void;
  onEdit?: (item:PostProps) => void;
}

const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = (item:PostProps) => {},
  onEdit = (item:PostProps) => {},
}: PostCardProps) => {
  console.log("post item : ", item);

  const shadowStyle = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  };

  const [likes, setLikes] = useState<postLike[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikes(item?.postLikes);
  }, []);

  const openPostDetails = () => {
    if (!showMoreIcon) return null;
    router.push({ pathname: "postDetail", params: { postID: item?.id } });
  };

  const onLike = async () => {
    if (isLiked) {
      //remove like

      let updateLikes = likes.filter((like) => like.userId != currentUser?.id);

      setLikes([...updateLikes]);
      let res = await removePostLike(item?.id, currentUser?.id);
      console.log("removePostLike res : ", res);

      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    } else {
      //craete like
      let data: postLike = {
        userId: currentUser?.id,
        postId: item?.id,
      };
      setLikes([...likes, data]);
      let res = await createPostLike(data);
      console.log("addPostLike res : ", res);

      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    }
  };

  const onShare = async () => {
    // let content: ShareContent = {
    //   message: stringHtmlTags(item?.body),
    // };

    // Sharing.isAvailableAsync()

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("Sharing is not available on this platform");
      return;
    }

    if (item?.file) {
      setLoading(true);
      let fileUrl = await downloadFile(getSupabaseFileUrl(item?.file)?.uri!!);
      setLoading(false);
      console.log("fileUrl", fileUrl);
      Sharing.shareAsync(fileUrl!!);
    } else {
      let content: ShareContent = {
        message: stringHtmlTags(item?.body),
      };

      Share.share(content);

      // Sharing.shareAsync("",{
      //   dialogTitle:"file is synced",
      // })
    }
  };

  const handlePostDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this post?", [
            {
              text: "Cancel",
              onPress: () => console.log("modal cancel"),
              style: "cancel",
            },
            {
              text: "Delete",
              onPress: () => onDelete(item),
              style: "destructive",
            },
          ]);
  }

  // console.log("post item comments : ", item?.comments);

  const createdAt = moment(item?.created_at).format("MMM D");

  const isLiked = likes.filter((like) => like.userId == currentUser?.id)[0]
    ? true
    : false;

  return (
    <View style={[styles.container, hasShadow && shadowStyle]}>
      <View style={styles.header}>
        {/* user info and post time */}
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user.image}
            rounded={theme.radius.md}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.userName}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </View>

        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon
              name="threeDotsHorizontal"
              size={hp(3.4)}
              strokeWidth={3}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}

        {showDelete && currentUser.id == item?.userId && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon name="edit" height={hp(2.4)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Icon name="delete" height={hp(2.5)} color={theme.colors.roseLight} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* post body & media */}

      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body && (
            // <RenderHTML contentWidth={wp(100)} source={{ html: item?.body }} />
            <HTMLView value={item?.body} />
          )}
        </View>
        {/* post image */}
        {item?.file && item?.file?.includes("postImages") && (
          <Image
            source={getSupabaseFileUrl(item?.file)}
            transition={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}

        {/* post video */}
        {item?.file && item?.file?.includes("postVideos") && (
          <Video
            style={[styles.postMedia, { height: hp(30) }]}
            source={getSupabaseFileUrl(item?.file)!!}
            useNativeControls
            resizeMode={ResizeMode.COVER}
            isLooping
          />
        )}
      </View>

      {/* like, comment and share */}
      <View style={styles.footer}>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name="heart"
              height={24}
              fill={isLiked ? theme.colors.rose : "transparent"}
              color={isLiked ? theme.colors.rose : theme.colors.textLight}
            />
          </TouchableOpacity>
          <Text style={styles.count}>{likes?.length}</Text>
        </View>
        <View style={styles.footerButton}>
          <TouchableOpacity onPress={openPostDetails}>
            <Icon name="comment" height={24} color={theme.colors.textLight} />
          </TouchableOpacity>
          <Text style={styles.count}>{item?.comments[0]?.count}</Text>
        </View>
        <View style={styles.footerButton}>
          {loading ? (
            <Loading size="small" />
          ) : (
            <TouchableOpacity onPress={onShare}>
              <Icon name="share" height={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
    // marginBottom:10
  },
  postMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
});
