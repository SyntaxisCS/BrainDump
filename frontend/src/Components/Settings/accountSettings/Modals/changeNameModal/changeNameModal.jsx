const React = require("react");
const axios = require("axios");

// Components
import { useTheme } from "../../../../../Utils/Themes/theme";
import { dispatchEvent } from "../../../../../Utils/Events/eventManager";
import { useNotif } from "../../../../../Utils/Notification/notification";
import "./changeNameModal.css";

export const ChangeNameModal = ({isOpen, onClose}) => {
    const theme = useTheme();
    const notif = useNotif();

    // States
    const [formState, setFormState] = React.useState("");
    const [formError, setFormError] = React.useState("");

    // Methods
    const handleInputChange = (event) => {
        let newEdit = {...formState};
        let target = event.target;

        newEdit = target.value;

        setFormState(newEdit);
    };

    const handleSubmit = (event) => {
        console.info("Sending info");
        event.preventDefault();

        checkInputs(formState);
    };

    // Form Submit
    const checkInputs = (name) => {
        if (name != "") {
            if (name.length >= 2 && name.length <= 36) {
                // sanitize
                let pattern = /[^A-Za-z .',-]/;
                let newName = name.replace(pattern, "");

                // Api Call
                apiCall(newName);
            } else {
                // Names must be between 2 and 36 characters
                setFormError("Names must be between 2 and 36 characters long");
            }
        } else {
            // please enter your new name
            setFormError("Please enter your new name");
        }
    };

    const apiCall = (name) => {
        let callBody = {
            name: name,
        };

        axios.post("http://localhost:9802/users/changename", callBody, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            // nameChange event
            dispatchEvent("nameChange");

            // close modal after 3 seconds
            setTimeout(() => {
                onClose();
            }, 500);
        }, err => {
            let errResponse = err.response;

            if (errResponse.status === 400) { // change
            } else {
                console.error(err);
                // Other server error
                setFormError("There was a server error! Please try again later");
            }
        });
    };

    return (
        <div className={`changeNameModal ${isOpen ? "show" : "hidden"} ${theme.theme}`}>
            <button className="closeButton" onClick={onClose}><i className='bx bx-x'/></button>
            <div className="center">
                <h1>Change your name</h1>
                <p>Enter your new name for your account</p>
            </div>

            <form className="form" onSubmit={handleSubmit}>
                <input type="text" name="name" placeholder="New Name" onChange={handleInputChange}/>
                <button className="submitButton" type="submit">Done</button>

                {formError === "" ? <p className="errorText hidden">error</p> : <p className="errorText">{formError}</p>}
            </form>
        </div>
    );
}