const React = require("react");

// Components
import { AboutSettingsComp } from "../../Components/Settings/aboutSettings/aboutSettings";
import { SideBar } from "../../Components/Settings/sideBar/sideBar";
import { useTheme } from "../../Utils/Themes/theme";
import "../Styles/about.css";

export const AboutPage = () => {
    const theme = useTheme();

    return (
        <div className={`aboutSettingsPage ${theme.theme}`}>
            <SideBar/>
            <AboutSettingsComp/>
        </div>
    )
};