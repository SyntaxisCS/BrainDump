const React = require("react");

import axios from "axios";
import { checkPassword } from "../../../../../Utils/passwordChecker";
// Components
import { useTheme } from "../../../../../Utils/Themes/theme";
import "./changePasswordModal.css";

export const ChangePasswordModal = ({isOpen, onClose}) => {
    const theme = useTheme();

    // States
    const [formState, setFormState] = React.useState({oldPassword:"",newPassword:"",newPasswordConfirm:""});
    const [formError, setFormError] = React.useState("");

    // Methods
    const handleInputChange = (event) => {
        let newEdit = {...formState};
        let target = event.target;

        newEdit[target.name] = target.value;

        setFormState(newEdit);
    };

    const handleSubmit = (event) => {
        console.info("Sending...");
        event.preventDefault();

        checkInputs(formState.oldPassword, formState.newPassword, formState.newPasswordConfirm);
    };

    const checkInputs = (oldPassword, newPassword, newPasswordConfirm) => {
        // Fields filled in
        if (oldPassword != "" && newPassword != "" && newPasswordConfirm != "") {
            // old password and new password equal check
            if (oldPassword === newPassword) {

                // check if password and password confirm are the same
                if (newPassword === newPasswordConfirm) {

                    // Check password
                    if (checkPassword(newPassword)) {

                        // Make api call
                        setFormError("");
                        apiCall(oldPassword, newPassword);

                    } else {
                        setFormError("Passwords must be 8+ characters, have 1 number, 1 lowercase, 1 capital and may contain special characters. They may not contain spaces.");
                    }

                } else {
                    setFormError("New passwords do not match");
                }
            } else {
                setFormError("Old and new passwords cannot match");
            }
        } else {
            setFormError("Please fill out all inputs");
        }
    };

    const apiCall = (oldPassword, newPassword) => {
        let callBody = {
            oldPassword: oldPassword,
            newPassword: newPassword
        };

        axios.post("http://localhost:9802/users/changepassword", callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setFormError("");
            setTimeout(() => {
                onClose();
            }, 500);
        }, err => {
            let errReponse = err.response;

            if (errReponse.status === 400) {
                setFormError(errReponse.data.error);
            } else {
                setFormError("Could not change password. Please try again later");
            }
        });
    };

    return (
        <div className={`changePasswordModal ${isOpen ? "show" : "hidden"} ${theme.theme}`}>
            <button className="closeButton" onClick={onClose}><i className="bx bx-x"/></button>
            <form className="center" onSubmit={handleSubmit}>
                <div className="header">
                    <h1>Change your password</h1>
                    <p>Enter your current password and a new password</p>
                </div>

                <div className="fields">
                    <label htmlFor="oldPassword">Current Password</label>
                    <input type="password" name="oldPassword" onChange={handleInputChange}/>

                    <label htmlFor="newPassword">New Password</label>
                    <input type="password" name="newPassowrd" onChange={handleInputChange}/>

                    <label htmlFor="newPasswordConfirm">Confirm New Password</label>
                    <input type="password" name="newPasswordConfirm" onChange={handleInputChange}/>
                </div>

                <div className="buttonFooter">
                    {formError === "" ? <p className="errorText hidden">error</p> : <p className="errorText">{formError}</p>}
                    <button className="submitButton" type="submit">Done</button>
                </div>
            </form>
        </div>
    );
};