import { StyleSheet } from "react-native";
import React from "react";
import Home from "./Home";
import { theme } from "@/constants/theme";
import ArrowLeft from "./ArrowLeft";
import Mail from "./Mail";
import Lock from "./Lock";
import User from "./User";
import Heart from "./Heart";
import Plus from "./Plus";
import Logout from "./Logout";
import PencilEdit from "./Edit";
import Camera from "./Camera";
import Call from "./Call";
import Location from "./Location";
import Image from "./Image";
import Video from "./Video";
import Delete from "./Delete";
import ThreeDots from "./ThreeDots";

const icons: Record<string, React.ComponentType<any>> = {
  home: Home,
  arrowLeft: ArrowLeft,
  mail: Mail,
  lock: Lock,
  user: User,
  heart: Heart,
  plus: Plus,
  logout: Logout,
  edit: PencilEdit,
  camera: Camera,
  call: Call,
  location: Location,
  image: Image,
  video:Video,
  delete:Delete,
  threeDotsHorizontal:ThreeDots
};

interface IconInterface {
  name: keyof typeof icons;
  height?: number;
  width?: number;
  strokeWidth?: number;
  size?: number;
  color?: string;
}

const Icon: React.FC<IconInterface> = ({
  name,
  height,
  width,
  strokeWidth,
  color = theme.colors.text,
  size = 26,
  ...props
}) => {
  const IconComponents = icons[name];

  return (
    <IconComponents
      height={height || 24}
      width={height || 24}
      strokeWidth={strokeWidth || 1.9}
      color={color}
      size={size || 26}
      {...props}
    />
  );
};

export default Icon;

const styles = StyleSheet.create({});
