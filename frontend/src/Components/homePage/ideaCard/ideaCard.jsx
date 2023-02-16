const React = require("react");

// Components
import { ThemeContext, useTheme } from "../../../Utils/Themes/theme";
import {convertTime} from "../../../Utils/timeConvert";
import "./ideaCard.css";

export class IdeaCard extends React.PureComponent {
    static contextType = ThemeContext;

    constructor(props) {
        super(props);
        this.state = {
            date: ""
        };
    }

    setDate(date) {
        this.setState({date});
    }

    componentDidMount() {
        if (this.props.date) {
            const time = convertTime(this.props.date);
            this.setDate(time);
        }
    }

    render() {
        const {theme} = this.context;

        return (
            <div className={`ideaCard ${theme}`}>
                <p className="date">{this.state.date != "" ? this.state.date : ""}</p>
                <p className="content">{this.props.text ? this.props.text : "Server Error"}</p>
            </div>
        )
    }
}