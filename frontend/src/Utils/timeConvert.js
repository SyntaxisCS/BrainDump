import TimeAgo from "javascript-time-ago";

// English
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

// Create formatter (English)
const timeAgo = new TimeAgo('en-US');

export const convertTime = (date) => {
    if (date) {
        let dateOb = new Date(date);
        let string = timeAgo.format(dateOb, "round");

        return string;
    } else {
        return "";
    }
};