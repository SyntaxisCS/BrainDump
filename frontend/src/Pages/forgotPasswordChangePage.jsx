const React = require("react");
const ReactRouter = require("react-router-dom");

// Components
import { ForgotPasswordChange } from "../Components/ForgotPassword/forgotPasswordChange/forgotPasswordChange";
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/forgotPasswordChangePage.css";

export const ForgotPasswordChangePage = () => {
    const theme = useTheme();

    const {token} = ReactRouter.useParams();

    return (
        <div className={`forgotPasswordChange ${theme.theme}`}>
            <ForgotPasswordChange token={token}/>
        </div>
    );
};