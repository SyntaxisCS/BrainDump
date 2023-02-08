const React = require("react");
const axios = require("axios");

// Components
const {useNavigate} = require("react-router-dom");
import {useTheme} from "../../../Utils/Themes/theme";
import { checkPassword } from "../../../Utils/passwordChecker";
import "./forgotPasswordChange.css";

export const ForgotPasswordChange = (props) => {
    const token = props.token;
    const theme = useTheme();
    const navigate = useNavigate();

    // States
    const [formState, setFormState] = React.useState({password:"",passwordConfirm:""});
    const [formError, setFormError] = React.useState("");
    const [formSucceed, setFormSucceed] = React.useState("");

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

        checkInputs(formState.password, formState.passwordConfirm);
    };


    const checkInputs = (password, passwordConfirm) => {
        if (password && passwordConfirm) {
            if (password === passwordConfirm) {
                if (checkPassword(password)) {
                    apiCall(password);
                } else {
                    setFormError("Passwords must be 8+ characters, have 1 number, 1 lowercase, 1 capital and may contain special characters. They may not contain spaces.");
                }
            } else {
                setFormError("Passwords do not match");
            }
        } else {
            setFormError("Please fill out the required fields");
        }
    };

    const apiCall = (password) => {
        let callBody = {
            token: token,
            password: password
        };

        axios.post("http://localhost:9802/users/forgotpassword", callBody, {
            header: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setFormSucceed(response.data);
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 400) {
                setFormError(errResponse.data.error);
            } else if (errResponse.status === 500) {
                if (errResponse.data.error === "Token has expired") {
                    setFormError(errResponse.data.error);
                    navigate("/forgotpassword");
                } else if (errResponse.data.error === "Token does not exist") {
                    setFormError(errResponse.data.error);
                    navigate("/forgotpassword");
                }
            } else {
                setFormError(errResponse.data.error);
            }
        });
    };

    return (
        <form className={`forgotPasswordChangeForm ${theme.theme}`}>
            <label htmlFor="password">Password</label>
            <input type="password" name="password" placeholder="password" onChange={handleInputChange}/>

            <label htmlFor="passwordConfirm">Password Confirm</label>
            <input type="password" name="passwordConfirm" placeholder="password confirm" onChange={handleInputChange}/>

            <button type="submit" onClick={handleSubmit}>Send</button>

            {formSucceed != "" ? <p className="formSucceed">{formSucceed}</p> : <p className="formSucceed hidden">formSucceed</p>}
            {formError != "" ? <p className="formError">{formError}</p> : <p className="formError hidden">formError</p>}
        </form>
    );
};