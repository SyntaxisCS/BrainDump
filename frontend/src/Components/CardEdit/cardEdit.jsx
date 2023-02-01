const React = require("react");
const axios = require("axios");
const ReactRouter = require("react-router-dom");
const {useNavigate} = require("react-router-dom");

// Components
import { useTheme } from "../../Utils/Themes/theme";
import { useNotif } from "../../Utils/Notification/notification";
import { dispatchEvent } from "../../Utils/Events/eventManager";
import "./cardEdit.css";

export const CardEditTemplate = (props) => {
    // Super States
    const theme = useTheme();
    const notif = useNotif();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    
    // States
    const id = props.id;
    const [boxState, setBoxState] = React.useState("");
    const [currentNote, setCurrentNote] = React.useState(null);
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
    };

    const handleSave = () => {
        // Other stuff?
        noteUpdateApiCall();
    };

    const handleDelete = () => {
        noteDeleteApiCall();
    };

    // Api Calls
    const noteUpdateApiCall = () => {
        if (boxState != "" && boxState.length >= 1) {
            let callBody = {
                content: boxState
            };

            axios.post(`http://localhost:9802/notes/${currentNote.id}`, callBody, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            }).then(response => {
                dispatchEvent("updatedNote");

                notif.addNotification({type: "updated", message: "Your note has been updated!"});
            }, err => {
                let errResponse = err.response;

                // check status codes
                if (errResponse) {
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

    const noteDeleteApiCall = () => {
        axios.delete(`http://localhost:9802/notes/${currentNote.id}`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            dispatchEvent("deletedNote");

            notif.addNotification({type: "deleted", message: "Your note has been deleted"});

            // Redirect back to home page
            navigate("/");
        }, err => {
            let errResponse = err.response;

            // check status codes
            if (errResponse) {
                if (errResponse.status === 500) {
                    notif.addNotification({type: "error", message: "Your note could not be deleted. Please try again later"});
                    console.warn("Could not delete note");
                }
            } else {
                notif.addNotification({type: "error", message: "Your note could not be deleted. Please try again later"});
            }
        });
    };

    // Page functionality
    const makeRingRed = () => {
        let rChars = remaining.char;
        let calc = rChars / maxCharacters;

        if (calc <= 0.20) {
            return true;
        } else {
            return false;
        }
    };

    // Page load
    const getNote = (id) => {
        if (id) {
            axios.get(`http://localhost:9802/notes/${id}`, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true
            }).then(response => {
                if (response.status === 204) {
                    console.warn("No note found");
                    setLoading(false);
                } else {
                    setCurrentNote(response.data.note);

                    // Update Ring
                    let rEdit = {...remaining};
                    let rChars = maxCharacters - response.data.note.content.length;
                    let rPerc = rChars / 255 * 360; // degrees
            
                    rEdit.char = rChars;
                    rEdit.percentage = rPerc;
                    setRemaining(rEdit);

                    setLoading(false);
                }
            }, err => {
                console.warn(err);
            });
        } else {
            console.warn("No id found");
        }
    };

    React.useEffect(() => {
        getNote(id);
    },[]);

    return (
        <div className={`cardEditTemplate ${theme.theme}`}>
            {!loading ?
                <div className={`textBoxContainer ${theme.theme}`}>
                    
                    <textarea className={`textBoxInput ${theme.theme}`} placeholder="Delete note?" maxLength={255} rows="5" onChange={handleInputChange}>{currentNote ? currentNote.content : "Content could not be found"}</textarea> 
                    <div className={`remaining ${theme.theme}`}>
                        <div className={`circleProgress ${theme.theme}`} style={{background: `conic-gradient(#${makeRingRed() ? "FFA2C0" : "0049c6"}, ${remaining.percentage}deg, #fff 0deg`}}></div> {/*Make ring red if remaining characters are getting low*/}
                        <p className={`characters ${theme.theme}`} style={{color: `#${makeRingRed() ? "FFA2C0":"888888"}`}}>{remaining.char}</p> {/*Change color of text if ring turns red*/}
                        <button className={`saveButton ${theme.theme}`} onClick={handleSave}><i className='bx bx-save'></i></button>
                        <button className={`deleteButton ${theme.theme}`} onClick={handleDelete}><i className='bx bx-trash-alt'></i></button>
                    </div>
                
                </div>     
            : ""} 
        </div>
    );
};