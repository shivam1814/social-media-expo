import { supabase } from "@/lib/supabase";

export const getUserData = async (userId: string | undefined) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select()
            .eq('id', userId)
            .single();
        if (error) {
            return { success: false, msg: error?.message }
        }
        return { success: true, data }
    } catch (error) {
        let msg = ""
        if (error instanceof Error) {
            console.log("error occured : ", error);
            msg = error.message
        }
        return { success: false, msg: msg }
    }
}

export const updateUser = async (userId: string | undefined, data:any) => {
    try {
        const { error } = await supabase
            .from('users')
            .update(data)
            .eq('id', userId);

        if (error) {
            return { success: false, msg: error?.message }
        }
        return { success: true, data }
    } catch (error) {
        let msg = ""
        if (error instanceof Error) {
            console.log("error occured : ", error);
            msg = error.message
        }
        return { success: false, msg: msg }
    }
}