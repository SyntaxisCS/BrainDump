const React = require("react");

// Components
import { UserLoginForm } from "../Components/userLoginForm/userLoginForm";
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/loginPage.css";

export const LoginPage = () => {
    const theme = useTheme();

    return (
        <div className={`loginPage ${theme.theme}`}>
            <UserLoginForm/>
        </div>
    )
};