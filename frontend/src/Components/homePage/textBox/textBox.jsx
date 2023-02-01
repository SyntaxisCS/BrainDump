const React = require("react");
const axios = require('axios');

// Components
import { useTheme } from "../../../Utils/Themes/theme";
import { useNotif } from "../../../Utils/Notification/notification";
import { dispatchEvent } from "../../../Utils/Events/eventManager";
import "./textBox.css";

export const TextBox = () => {
    const notif = useNotif();
    const theme = useTheme();
    const [saveTimer, setSaveTimer] = React.useState(null);
    const [boxState, setBoxState] = React.useState("");
    const [remaining, setRemaining] = React.useState({char: 255, percentage: 360}); // get this number based off user type
    const maxCharacters = 255;

    const handleInputChange = (event) => {
        let newEdit = {...boxState};
        let target = event.target;
        newEdit = target.value;

        setBoxState(newEdit);
        
        // change character remaining
        let rEdit = {...remaining};
        let rChars = maxCharacters - target.value.length;
        let rPerc = rChars / 255 * 360; // degrees

        rEdit.char = rChars;
        rEdit.percentage = rPerc;
        setRemaining(rEdit);

        // Set save timer
        const newSaveTimer = setTimeout(() => {
            autoSave();
        }, 1000 * 60 * 3.5); // 3.5 minutes

        setSaveTimer(newSaveTimer);
    };

    const handleSave = () => {
        if (boxState != "" && boxState.length >= 1) {
            let callBody = {
                content: boxState
            };
    
            axios.post("http://localhost:9802/notes/create", callBody, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            }).then(response => {
                // note creation event
                dispatchEvent("createdNote");
    
                // Send notification
                notif.addNotification({type: "created", message: "Your note has been saved!"});
            }, err => {
                let errResponse = err.response;
    
                // check status codes
                if (errResponse) {
                    console.log(err);
                    if (errResponse.status === 500) {
                        notif.addNotification({type: "error", message: "Your note could not be saved. Please try again later"});
                        console.warn("Could not save note!");
                    }
                } else {
                    notif.addNotification({type: "error", message: "Your note could not be saved. Please try again later"});
                }
            });
        }
    };

    const autoSave = () => {
        console.info("Autosaved note!");
        // handleSave();
    };

    const makeRingRed = () => {
        let rChars = remaining.char;
        let calc = rChars / maxCharacters;

        if (calc <= 0.20) {
            return true;
        } else {
            return false;
        }
    };

    // If user has text in new note ask to before closing tab
    const handleWindowClose = (e) => {
        if (boxState.length >= 1) {
            e.preventDefault();
            return e.returnValue = "You are currently creating a note, are you sure you want to leave?";
        }
    };

    React.useEffect(() => {
        window.addEventListener("beforeunload", handleWindowClose());
    }, []);

    return (
        <div className={`textBox ${theme.theme}`}>
            <div className={`textBoxContainer ${theme.theme}`}>
                <textarea className={`textBoxInput ${theme.theme}`} placeholder="Give your thoughts..." maxLength={255} rows="5" onChange={handleInputChange}></textarea>
                <div className={`remaining ${theme.theme}`}>
                    <div className={`circleProgress ${theme.theme}`} style={{background: `conic-gradient(#${makeRingRed() ? "FFA2C0" : "0049c6"}, ${remaining.percentage}deg, #fff 0deg`}}></div> {/*Make ring red if remaining characters are getting low*/}
                    <p className={`characters ${theme.theme}`} style={{color: `#${makeRingRed() ? "FFA2C0":"888888"}`}}>{remaining.char}</p> {/*Change color of text if ring turns red*/}
                    <button className={`saveButton ${theme.theme}`} onClick={handleSave}><i className='bx bx-save'></i></button>
                </div>
            </div>
        </div>
    );
};