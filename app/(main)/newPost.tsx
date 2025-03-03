import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import { theme } from "@/constants/theme";
import { hp, wp } from "@/helpers/common";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/Avatar";
import RichTextEditor from "@/components/RichTextEditor";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "@/assets/icons";
import Button from "@/components/Button";
import * as ImagePicker from "expo-image-picker";
import { getSupabaseFileUrl } from "@/services/imageService";
import { Audio, ResizeMode, Video } from "expo-av";
import { createOrUpdatePost } from "@/services/postService";
import { RichEditor } from "react-native-pell-rich-editor";
import { PostProps } from "./home";
import { supabaseUrl } from "@/constants";

const NewPost = () => {
  const { data } = useLocalSearchParams<{ data: string }>();
  console.log("newPost post : ", data);
  let post: PostProps | null = null;
  if (data != undefined) {
    post = JSON.parse(data);
  }

  console.log("editPost : ", post);

  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef<RichEditor | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<null | ImagePicker.ImagePickerAsset>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (post && post.id) {
      bodyRef.current = post.body;
      // if (typeof post.file === "string") {
      //   setFile({
      //     uri: post.file,
      //     width: 100,
      //     height: 100,
      //   });
      // } else {
      //   setFile(post.file);
      // }
      setFileUrl(post.file);
      setTimeout(() => {
        editorRef?.current?.setContentHTML(post.body);
      }, 300);
    }
  }, []);

  const onPick = async (isImage: boolean) => {
    
    let mediaConfig: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };

    if (!isImage) {
      mediaConfig = {
        mediaTypes: ["videos"],
        allowsEditing: true,
      };
    }

    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    if (!result.canceled) {
      setFileUrl(null);
      setFile(result.assets[0]);
    }
  };

  const isLocalFile = (file: ImagePicker.ImagePickerAsset) => {
    if (!file) return null;
    if (typeof file == "object") return true;

    return false;
  };

  const getFileType = (file: ImagePicker.ImagePickerAsset) => {
    if (!file) {
      return null;
    }
    if (isLocalFile(file)) {
      return file.type;
    }

    // check image of video for remote file
    if (file.uri && file.uri.includes("postImages")) {
      return "image";
    }
    return "video";
  };

  const getFileUri = (file: ImagePicker.ImagePickerAsset) => {
    if (!file) {
      return null;
    }

    if (isLocalFile(file)) {
      return file.uri;
    }

    return getSupabaseFileUrl(file.toString())?.uri;
  };

  const getSupaFile = (fileUrl: string) => {
    return `${supabaseUrl}/storage/v1/object/public/uploads/${fileUrl}`;
  };

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert("Post", "please select an image or add body.");
      return;
    }

    // let data = {
    //   file,
    //   body: bodyRef.current,
    //   userId: user?.id,
    // };

    let data = {}

    if (post && post.id) {
      //if we pass fileUrl then it will not update post because column name is 'file'
      
      if(fileUrl) {
        const file = fileUrl
        data = {
          file,
          body: bodyRef.current,
          userId: user?.id,
          id: post.id,
        };
        
      } else {
        data = {
          file,
          body: bodyRef.current,
          userId: user?.id,
          id: post.id,
        };
      }
      
      
    } else {
      data = {
        file,
        body: bodyRef.current,
        userId: user?.id,
      };
    }

    //create post
    setLoading(true);
    let res = await createOrUpdatePost(data);
    setLoading(false);
    console.log("post res : ", res);

    if (res.success) {
      setFile(null);
      bodyRef.current = "";
      editorRef?.current?.setContentHTML("");
      router.back();
    } else {
      Alert.alert("Post", res.msg);
    }

    // console.log("body : ", bodyRef.current);
    // console.log("file : ", file);
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title={post && post.id ? "Update Post" : "Create Post"} />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          {/* avatar */}
          <View style={styles.header}>
            <Avatar
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.xl}
            />

            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{user && user.name}</Text>
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>

          <View style={styles.textEditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body) => (bodyRef.current = body)}
            />
          </View>

          {file && (
            <View style={styles.file}>
              {getFileType(file) == "video" ? (
                <Video
                  style={{ flex: 1 }}
                  source={{ uri: getFileUri(file)!! }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file)!! }}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                />
              )}
              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Icon name="delete" height={20} color="white" />
              </Pressable>
            </View>
          )}

          {fileUrl && (
            <View style={styles.file}>
              {fileUrl.includes("postImages") ? (
                <Image
                  source={{
                    uri: getSupaFile(fileUrl),
                  }}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                />
              ) : (
                <Video
                  style={{ flex: 1 }}
                  source={{
                    uri: getSupaFile(fileUrl),
                  }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              )}
              <Pressable
                style={styles.closeIcon}
                onPress={() => setFileUrl(null)}
              >
                <Icon name="delete" height={20} color="white" />
              </Pressable>
            </View>
          )}

          <View style={styles.media}>
            <Text style={styles.addImageText}>Add to your post</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icon name="image" size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Icon name="video" size={33} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <Button
          buttonStyle={{ height: hp(7.2) }}
          title={post && post.id ? "Update" : "Post"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "red",
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  title: {
    // marginBottom: 10,
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {
    // marginTop:10
  },
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semiBold,
    color: theme.colors.text,
  },
  imageIcon: {
    // backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.md,
    // padding: 6,
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  video: {},
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "rgba(255,0,0,0.6)",
    // shadowColor: theme.colors.textLight,
    // shadowOffset: { width: 0, height: 3 },
    // shadowOpacity:0.6,
    // shadowRadius:8
  },
});
