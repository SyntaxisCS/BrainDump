const React = require("react");
const axios = require("axios");

// Components
const {useNavigate} = require("react-router-dom");
import { useTheme } from "../../Utils/Themes/theme";
import "./verifyEmail.css";

export const VerifyEmailComponent = (props) => {
    const theme = useTheme();
    const token = props.token;
    const navigate = useNavigate();

    // States
    const [statusState, setStatusState] = React.useState(true);
    const [statusMessage, setStatusMessage] = React.useState("");
    
    const changeStatus = (change) => {
        if (change === "good") {
            setStatusState(true);
            setStatusMessage("Your email has been verified! You may now close this page!");
        } else if (change === "bad") {
            setStatusState(false);
            setStatusMessage("Unfortunately we could not verify your email. This is not a problem with you, it was us who dropped the ball. We are trying our best to fix this problem. Please try again later");
        } else if (change === "done") {
            setStatusState(true);
            setStatusMessage("Your email has already been verified once before! You may close this page!");
        } else {
            setStatusState(false);
            setStatusMessage("Unknown status");
        }
    };

    const apiCall = (token) => {
        let callBody = {
            token: token
        };

        axios.post("http://localhost:9802/users/verifyemail", callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            changeStatus("good");
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 400) {
                if (errResponse.data.error === "You have already verified your email!") {
                    changeStatus("done");
                } else if (errResponse.data.error === "Token has expired") {
                    changeStatus("bad");
                } else if (errResponse.data.error === "Token does not exist") {
                    navigate("/");
                }
            } else {
                changeStatus("bad");
            }
        });
    };

    React.useEffect(() => {
        apiCall(token);
    }, []);

    return (
        <div className={`verifyEmail ${theme.theme}`}>
            <h1 className={`status ${statusState ? "good" : "bad"}`}><i className={`bx ${statusState ? "bx-check-circle" : "bx-x-circle"}`}/></h1>
            <p className="statusMessage">{statusMessage}</p>
        </div>
    );
};