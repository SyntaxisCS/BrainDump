const React = require("react");
const axios = require("axios");
const validator = require("validator");

// Utils
const {useAuth} = require("../../Utils/Authentication/auth");
const {useNavigate} = require("react-router-dom");
import { checkPassword } from "../../Utils/passwordChecker";
import { useTheme } from "../../Utils/Themes/theme";
import "./userLoginForm.css";

export const UserLoginForm = () => {
    const auth = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();

    // States
    const [loginState, setLoginState] = React.useState({email:"",password:""});
    const [passwordType, setPasswordType] = React.useState({inputType:"password",eye:true});
    const [formError, setFormError] = React.useState("");

    const handleInputChange = (event) => {
        let newEdit = {...loginState};
        let target = event.target;
        
        newEdit[target.name] = target.value;

        setLoginState(newEdit);
    };

    const handlePasswordType = () => {
        if (passwordType.inputType === "password") {
            let newEdit = {...passwordType};
            newEdit.inputType = "text";
            newEdit.eye = false;
            setPasswordType(newEdit);
        } else {
            let newEdit = {...passwordType};
            newEdit.inputType = "password";
            newEdit.eye = true;
            setPasswordType(newEdit);
        }
    };

    const handleSubmit = (event) => {
        console.info(`Logging in...`);
        event.preventDefault();
        // prepare inputs

        checkInputs(loginState.email, loginState.password);
    };

    const handleLogin = (user) => {
        auth.login(user);
        navigate("/");
    };

    const signUpClick = () => {
        navigate("/signup");
    };

    const forgotPasswordClick = () => {
        navigate("/forgotpassword");
    };

    // validation and cleansing inputs
    const checkInputs = (email, password) => {
        if (email != "" && password != "") {

            // Email
            if (validator.isEmail(email)) {

                // apiCall
                apiCall(email, validator.trim(password));

            } else {
                setFormError("Please enter a valid email");
            }

        } else {
            setFormError("Please fill out all the required fields");
        }
    };

    const apiCall = (email, password) => {
        let callBody = {
            email: email,
            password: password
        };

        axios.post("http://localhost:9802/users/login", callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            // Clear any form errors
            setFormError("");

            handleLogin(response.data);
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 401) {
                // Password is incorrect
                setFormError("Password is incorrect");
            } else if (errResponse.status === 500) {
                // User does not exist
                setFormError("That account does not exist");
            } else {
                console.error(err);
                // Other server error
                setFormError("Error during login. Please try again later");
            }
        });
    };

    return (
        <form className={`userLoginForm ${theme.theme}`} onSubmit={handleSubmit}>
            <div className={`header ${theme.theme}`}>
                <h1>Login</h1>
            </div>

            <label htmlFor="email">Email</label>
            <input type="text" name="email" placeholder="email@provider.com" onChange={handleInputChange} />
        
            <label htmlFor="password">Password</label>
            <div className={`passwordInput ${theme.theme}`}>
                <input type={passwordType.inputType} name="password" placeholder="Stronk password!" onChange={handleInputChange} />
                <i className={`bx ${passwordType.eye ? "bx-hide" : "bx-show-alt"}`} onClick={handlePasswordType}></i>
            </div>

            <p className={`forgotText ${theme.theme}`} onClick={forgotPasswordClick}>Forgot Password?</p>

            {formError === "" ? <p className="errorText hidden">error</p> : <p className="errorText">{formError}</p>}

            <button type="submit">Login</button>

            <div className={`signUpText ${theme.theme}`}>
                <p>New User? <a onClick={signUpClick}>Signup</a></p>
            </div>
        </form>
    )
};