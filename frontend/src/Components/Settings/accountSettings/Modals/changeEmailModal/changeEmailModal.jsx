const React = require("react");
const axios = require("axios");

// Components
import { useTheme } from "../../../../../Utils/Themes/theme";
import "./changeEmailModal.css";

export const ChangeEmailModal = ({isOpen, onClose, title, message}) => {
    const theme = useTheme();

    return (
        <div className={`changeEmailModal ${isOpen ? "show" : "hidden"} ${theme.theme}`}>
            <button className="closeButton" onClick={onClose}><i className='bx bx-x'/></button>
            <div className="center">
                <h1>{title}</h1>
                <p>{message}</p>
            </div>
        </div>
    );
}