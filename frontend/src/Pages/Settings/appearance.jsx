const React = require("react");
import { useTheme } from "../../Utils/Themes/theme";
import "../Styles/appearance.css";

// Components
import { SideBar } from "../../Components/Settings/sideBar/sideBar";
import { ThemeSelector } from "../../Components/Settings/appearanceThemeSelector/themeSelector";

export const AppearanceSettings = () => {
    const theme = useTheme();

    return (
        <div className={`appearanceSettings ${theme.theme}`}>
            <SideBar/>
            <ThemeSelector/>
        </div>
    )
}