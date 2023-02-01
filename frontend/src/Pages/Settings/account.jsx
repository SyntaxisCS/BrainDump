const React = require("react");
import { useTheme } from "../../Utils/Themes/theme";
import "../Styles/account.css";

// Components
import { SideBar } from "../../Components/Settings/sideBar/sideBar";
import { AccountSettingsPanel } from "../../Components/Settings/accountSettings/accountSettings";

export const AccountSettings = () => {
    const theme = useTheme();

    return (
        <div className={`accountSettings ${theme.theme}`}>
            <SideBar/>
            <AccountSettingsPanel/>
        </div>
    )
}