const React = require("react");

// Components
import { useTheme } from "../../../../../Utils/Themes/theme";
import "./changeEmailModal.css";

export const ChangeEmailModal = ({isOpen, onClose}) => {
    const theme = useTheme();

    // Methods
    const apiCall = (name) => {
        let callBody = {
            name: name,
        };

        // api call to backend and then close modal
    };

    return (
        <div className={`changeEmailModal ${isOpen ? "show" : "hidden"} ${theme.theme}`}>
            <button className="closeButton" onClick={onClose}><i className='bx bx-x'/></button>
            <div className="center">
                <h1>We've sent you an email!</h1>
                <p>Please check your old email for the link we sent to change your email! If you don't see it be sure to grab your torches and go into the dangerous place known as your spam folder</p>
            </div>
        </div>
    );
}