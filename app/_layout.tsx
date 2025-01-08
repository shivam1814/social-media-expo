import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { getUserData } from "@/services/userService";

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("session user : ", session?.user?.id);

      if (session) {
        //set auth
        //move to home screen
        setAuth(session?.user);
        updateUserData(session?.user, session?.user.email);
        router.replace("/home");
      } else {
        //set auth null
        //move to welcome screen
        setAuth(null);
        router.replace("/welcome");
      }
    });
  }, []);

  const updateUserData = async (
    user: User | null,
    email: string | undefined
  ) => {
    let res = await getUserData(user?.id);
    console.log("got user data : ", res);
    if (res.success) {
      setUserData({ ...res.data, email });
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default _layout;

const styles = StyleSheet.create({});
