import { Dimensions } from "react-native";

const {
    width:devicewidth,
    height:deviceHeight
} = Dimensions.get('window');

export const hp = (percentage:any) => {
    return (percentage*deviceHeight)/100;
}

export const wp = (percentage:any) => {
    return (percentage*devicewidth)/100;
}

export const stringHtmlTags = (html:string) => {
    return html.replace(/<[^>]*>?/gm, '');
}