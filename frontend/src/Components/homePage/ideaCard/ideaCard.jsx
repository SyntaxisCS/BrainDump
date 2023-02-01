const React = require("react");

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import {convertTime} from "../../../Utils/timeConvert";
import "./ideaCard.css";

export const IdeaCard = (props) => {
    const theme = useTheme();

    // States
    const [date, setDate] = React.useState("");

    React.useEffect(() => {
        if (props.date) {
            const time = convertTime(props.date);
            setDate(time);
        }
    }, []);

    return (
        <div className={`ideaCard ${theme.theme}`}>
            <p className="date">{date != "" ? date : ""}</p>
            <p className="content">{props.text ? props.text : "Server Error"}</p>
        </div>
    );
};