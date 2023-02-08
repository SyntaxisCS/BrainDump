const React = require("react");
const ReactRouter = require("react-router-dom");

// Components
import { VerifyEmailComponent } from "../Components/VerifyEmail/verifyEmail";
import { useTheme } from "../Utils/Themes/theme";
import "./Styles/verifyEmailPage.css";

export const VerifyEmailPage = () => {
    const theme = useTheme();

    const {token} = ReactRouter.useParams();

    return (
        <div className={`verifyEmailPage ${theme.theme}`}>
            <VerifyEmailComponent token={token}/>
        </div>
    )
}