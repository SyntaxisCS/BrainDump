const React = require("react");

// Components
import { UserSignUpForm } from "../Components/userSignupForm/userSignupForm";
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/signUpPage.css";

export const SignUpPage = () => {
    const theme = useTheme();

    return (
        <div className={`signUpPage ${theme.theme}`}>
            <UserSignUpForm/>
        </div>
    )
}