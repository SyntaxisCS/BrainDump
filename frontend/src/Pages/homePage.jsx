const React = require("react");
const {useNavigate} = require("react-router-dom");

// Components
import { TextBox } from "../Components/homePage/textBox/textBox";
import { IdeaCard } from "../Components/homePage/ideaCard/ideaCard";
import { Notification } from "../Components/Notification/notification";
import { IdeaCardList } from "../Components/homePage/ideaCardList/ideaCardList";
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/homePage.css";

export const HomePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    // get saved notes

    const handleSettingsClick = () => {
        navigate("/settings/account");
    };

    return (
        <div className={`homePage ${theme.theme}`}>
            <Notification/>
            <h1 className={`title ${theme.theme}`}>BrainDump</h1>
            <button className={`settingsButton ${theme.theme}`} onClick={handleSettingsClick}><i className='bx bx-cog'/></button>
            <TextBox/>
            <IdeaCardList/>
        </div>
    );
};