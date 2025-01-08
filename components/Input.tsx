import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import React, { ForwardedRef } from "react";
import { theme } from "@/constants/theme";
import { hp } from "@/helpers/common";

interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle; // Additional styles for the container
  icon?: React.ReactNode; // Optional icon to render
  inputRef?: ForwardedRef<TextInput>; // Ref for the TextInput
}

const Input: React.FC<InputProps> = (props) => {
  const { containerStyle, icon, inputRef, ...textInputProps } = props;
  return (
    <View style={[styles.container, containerStyle && containerStyle]}>
      {icon && icon}
      <TextInput
        style={{ flex: 1 }}
        placeholderTextColor={theme.colors.textLight}
        ref={inputRef && inputRef}
        {...props}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: hp(7.2),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
    paddingHorizontal: 18,
    gap: 12,
  },
});
