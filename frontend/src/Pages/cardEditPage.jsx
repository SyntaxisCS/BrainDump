const React = require("react");
const ReactRouter = require("react-router-dom");
const {useNavigate} = require("react-router-dom");

// Components
import { useTheme } from "../Utils/Themes/theme";
import { Notification } from "../Components/Notification/notification";
import { CardEditTemplate } from "../Components/CardEdit/cardEdit";
import "./Styles/cardEditPage.css";

export const CardEditPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const { id } = ReactRouter.useParams();

    const handleBackClick = () => {
        navigate("/");
    };

    return (
        <div className={`cardEditPage ${theme.theme}`}>
            <Notification/>
            <button className={`backButton ${theme.theme}`} onClick={handleBackClick}><i className='bx bx-arrow-back' ></i></button>
            <CardEditTemplate id={id}/>
        </div>
    );
};