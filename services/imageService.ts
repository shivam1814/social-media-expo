import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer'
import { supabase } from "@/lib/supabase";
import { supabaseUrl } from '@/constants';

export const getUserImageSrc = (imagePath: string | undefined) => {
    if (imagePath) {
        return getSupabaseFileUrl(imagePath)
    } else {
        return require("../assets/images/defaultUser.png")
    }
}

export const getSupabaseFileUrl = (filePath: string) => {
    if (filePath) {
        return { uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}` }
    }
    return null;
}

export const uploadFile = async (folderName: string, fileUri: string, isImage = false) => {

    try {
        let fileName = getFilePath(folderName, isImage);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64
        });
        let imageData = decode(fileBase64);
        const { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(fileName, imageData, {
                cacheControl: '3600',
                upsert: false,
                contentType: isImage ? 'image/*' : 'video/*',
            })

        if (error) {
            console.log("file upload error : ", error);
            return { success: false, msg: "could not upload media" }
        }

        console.log("data upload image : ", data);

        return { success: true, data: data.path }
    } catch (error) {
        console.log("file upload error : ", error);
        return { success: false, msg: "could not upload media" }
    }

}

export const downloadFile = async (url: string) => {
    try {
        const { uri } = await FileSystem.downloadAsync(url, getLocalFilePath(url));
        return uri;
    } catch (error) {
        return null;
    }
}

export const getLocalFilePath = (filePath: string) => {
    let fileName = filePath.split('/').pop();
    return `${FileSystem.documentDirectory}${fileName}`
}

export const getFilePath = (folderName: string, isImage: boolean): string => {
    return `/${folderName}/${(new Date()).getTime()}${isImage ? '.png' : '.mp4'}`
}