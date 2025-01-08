import { supabase } from "@/lib/supabase";
import { uploadFile } from "./imageService";
import * as ImagePicker from "expo-image-picker";

export const createOrUpdatePost = async (post: any) => {
    try {
        if (post.file && typeof post.file == 'object') {
            let isImage = post?.file?.type == 'image';
            let folderName = isImage ? 'postImages' : 'postVideos';
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
            if (fileResult.success) {
                post.file = fileResult.data;
            } else {
                return fileResult;
            }
        }

        const { data, error } = await supabase
            .from('posts')
            .upsert(post)
            .select()
            .single();

        if (error) {
            console.log("createPost error : ", error);
            return { success: false, msg: 'Could not create your post.' }
        } else {
            return { success: true, data: data ,msg:"success"}
        }

    } catch (error) {
        console.log("createPost error : ", error);
        return { success: false, msg: 'Could not create your post.' }
    }
}