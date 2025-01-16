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
            return { success: true, data: data, msg: "success" }
        }

    } catch (error) {
        console.log("createPost error : ", error);
        return { success: false, msg: 'Could not create your post.' }
    }
}

export const fetchPost = async (limit = 10) => {
    try {

        const { data, error } = await supabase
            .from('posts')
            .select('* , user : users (id,name,image) , postLikes (*)')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.log("fetchPost error : ", error);
            return { success: false, msg: 'Could not fetch posts.' }
        }

        return { success: true, data: data }

    } catch (error) {
        console.log("fetchPost error : ", error);
        return { success: false, msg: 'Could not fetch posts.' }
    }
}

export const fetchPostDetails = async (postId:string) => {
    try {

        const { data, error } = await supabase
            .from('posts')
            .select('* , user : users (id,name,image) , postLikes (*)')
            .eq('id',postId)
            .single();

        if (error) {
            console.log("fetchPostDetail error : ", error);
            return { success: false, msg: 'Could not fetch post.' }
        }

        return { success: true, data: data }

    } catch (error) {
        console.log("fetchPostDetail error : ", error);
        return { success: false, msg: 'Could not fetch post.' }
    }
}


export const createPostLike = async (postLike: any) => {
    try {

        const { data, error } = await supabase
            .from("postLikes")
            .insert(postLike)
            .select()
            .single();

        if (error) {
            console.log("post like error : ", error);
            return { success: false, msg: 'Could not like the post.' }
        }

        return { success: true, data: data }

    } catch (error) {
        console.log("post like error : ", error);
        return { success: false, msg: 'Could not like the post.' }
    }
}


export const removePostLike = async (postId: number, userId: string | undefined) => {
    try {

        const { error } = await supabase
            .from("postLikes")
            .delete()
            .eq('userId',userId)
            .eq('postId',postId)

        if (error) {
            console.log("postLike error : ", error);
            return { success: false, msg: 'Could not remove the post like.' }
        }

        return { success: true, msg: "remove post like." }

    } catch (error) {
        console.log("postLike error : ", error);
        return { success: false, msg: 'Could not remove the post like.' }
    }
}

export const createComment = async (comment: any) => {
    try {

        const { data, error } = await supabase
            .from("comments")
            .insert(comment)
            .select()
            .single();

        if (error) {
            console.log("comment error : ", error);
            return { success: false, msg: 'Could not create your comment.' }
        }

        return { success: true, data: data }

    } catch (error) {
        console.log("comment error : ", error);
        return { success: false, msg: 'Could not create your comment.' }
    }
}