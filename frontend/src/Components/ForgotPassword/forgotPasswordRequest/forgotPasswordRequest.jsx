const React = require("react");
const axios = require("axios");
const validator = require("validator");


// Utils
import { useTheme } from "../../../Utils/Themes/theme";

// Components
import "./forgotPasswordRequest.css";

export const ForgotPasswordRequest = () => {
    const theme = useTheme();

    // States
    const [formState, setFormState] = React.useState({email:""});
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

        checkInputs(formState.email);
    };

    const checkInputs = (email) => {
        if (validator.isEmail(email)) {
            apiCall(email);
        } else {
            setFormError("Please enter a valid email");
        }
    };

    const apiCall = (email) => {
        let callBody = {
            email: email
        };
        
        axios.post("http://localhost:9802/users/generateforgotpasswordlink", callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setFormSucceed("We sent your link! Please check your email. If you do not see it check your spam and if it is not there try again later");
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 401) {
                // placeholder
            } else {
                setFormError(errResponse.data.error);
            }
        });
    };

    return (
        <form className={`forgotPasswordRequestForm ${theme.theme}`} onSubmit={handleSubmit}>
            <label htmlFor="email">email</label>
            <input type="text" name="email" placeholder="email@provider.com" onChange={handleInputChange}/>
            <button className="submitButton" type="submit">Send</button>

            {formSucceed != "" ? <p className="formSucceed">{formSucceed}</p> : <p className="formSucceed hidden">formSucceed</p>}
            {formError != "" ? <p className="formError">{formError}</p> : <p className="formError hidden">formError</p>}
        </form>
    );
};