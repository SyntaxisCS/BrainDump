const React = require("react");


// Components
const {useNavigate} = require("react-router-dom");
import { ForgotPasswordRequest } from "../Components/ForgotPassword/forgotPasswordRequest/forgotPasswordRequest";
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/forgotPasswordRequestPage.css";

export const ForgotPasswordRequestPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleSignUpClick = () => {
        navigate("/signup");
    };

    return (
        <div className={`forgotPasswordRequest ${theme.theme}`}>
            <h3>{"Enter the email associated with your account and we'll send you a link to reset your password"}</h3>
            <ForgotPasswordRequest/>
            <p className={`signUpText ${theme.theme}`}>Don't have an account? <a onClick={handleSignUpClick}>Sign Up</a></p>
        </div>
    );
};