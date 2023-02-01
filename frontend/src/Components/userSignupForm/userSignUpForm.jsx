const React = require("react");
const axios = require("axios");
const validator = require("validator");

// Utils
const {useAuth} = require("../../Utils/Authentication/auth");
const {useNavigate} = require("react-router-dom");
import { useTheme } from "../../Utils/Themes/theme";
import { checkPassword } from "../../Utils/passwordChecker";
import "./userSignUpForm.css";

export const UserSignUpForm = () => {
    const auth = useAuth();
    const theme= useTheme();
    const navigate = useNavigate();

    const [signUpState, setSignUpState] = React.useState({name: "", email: "", password: ""});
    const [passwordType, setPasswordType] = React.useState({inputType:"password",eye:true});
    const [formError, setFormError] = React.useState("");

    const handleInputChange = (event) => {
        let newEdit = {...signUpState};
        let target = event.target;

        newEdit[target.name] = target.value;

        setSignUpState(newEdit);
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
        console.info(`Contacting server...`);
        event.preventDefault();
        // Prepare inputs

        checkInputs(signUpState);
    };

    const checkInputs = (state) => {
        let name = state.name;
        let email = validator.trim(state.email);
        let password = validator.trim(state.password);


        if (name != "" && email != "" && password != "") {
            // Check email
            if (validator.isEmail(email)) {
                
                // Check password
                if (checkPassword(password)) {

                    // Make api call
                    let apiForm = {
                        name: name,
                        email: email,
                        password: password
                    };
                    setFormError("");
                    apiCall(apiForm);

                } else {
                    setFormError("Passwords must be 8+ characters, have 1 number, 1 lowercase, 1 capital and may contain special characters. They may not contain spaces.");
                }

            } else {
                setFormError("Please enter a valid email");
            }
        } else {
            setFormError("Please fill out all required fields");
        }
    };

    const handleLogin = (user) => {
        auth.login(user);
        navigate("/");
    };

    const loginClick = () => {
        navigate("/login");
    };

    const apiCall = (x) => {
        let callBody = {
            name: x.name,
            email: x.email,
            password: x.password
        };

        axios.post("http://localhost:9802/users/create", callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            // User created, now login
            
            let login = {
                email: response.data.email,
                password: callBody.password
            };

            axios.post("http://localhost:9802/users/login", login, {
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
                    setFormError("Error during login to your new account. Please try again later");
                } else if (errResponse.status === 500) {
                    // User does not exist
                    setFormError("Error during login to your new account. Please try again later");
                } else {
                    // Some other server error
                    setFormError("Error during login to your new account. Please try again later");
                }
            });

        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 500) {
                // Could not create user!
                setFormError("Error during creation of your new account. Please try again later");
            } else {
                setFormError("Error during creation of your new account. Please try again later");
            }
        });
    };

    return (
        <form className={`userSignUpForm ${theme.theme}`} onSubmit={handleSubmit}>
            <div className={`header ${theme.theme}`}>
                <h1>Sign up</h1>
            </div>

            <label htmlFor="name">Name</label>
            <input type="text" name="name" placeholder="first last" onChange={handleInputChange} />

            <label htmlFor="email">Email</label>
            <input type="text" name="email" placeholder="email@provider.com" onChange={handleInputChange} />
        
            <label htmlFor="password">Password</label>
            <div className={`passwordInput ${theme.theme}`}>
                <input type={passwordType.inputType} name="password" placeholder="Stronk password!" onChange={handleInputChange} />
                <i className={`bx ${passwordType.eye ? "bx-hide" : "bx-show-alt"}`} onClick={handlePasswordType}></i>
            </div>

            {formError === "" ? <p className="errorText hidden">error</p> : <p className="errorText">{formError}</p>}

            <p className="errorText"></p>

            <button type="submit">Sign up</button>

            <div className={`loginText ${theme.theme}`}>
                <p>Existing user? <a onClick={loginClick}>Login</a></p>
            </div>
        </form>
    );
};