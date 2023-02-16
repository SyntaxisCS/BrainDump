const React = require("react");

// Components
import { useNotif } from "../../Utils/Notification/notification";
import { Events } from "../../Utils/Events/events";
import "./notification.css";

export const Notification = () => {
    const notifService = useNotif().notification;
    
    // States
    const [display, setDisplay] = React.useState(false);
    const [icon, setIcon] = React.useState("");

    const handleDisplay = (time) => {
        if (!time) {
            time = 5000;
        }

        setDisplay(true);
        
        setTimeout(() => {
            setDisplay(false);
        }, time);
    };

    const closeNotif = () => {
        setDisplay(false);
        useNotif().clearNotification();
    };

    const handleIcon = () => {

        switch(notifService.type) {
            case "created":
                setIcon("bx-check");
            break;

            case "error":
                setIcon("bx-error-circle");
            break;

            case "good":
                setIcon("bx-check-double");
            break;

            default:
                setIcon("bx-x");
            break;
        }

    };

    React.useEffect(() => {

        const notify = () => {
            handleIcon();
            handleDisplay();
        };

        Events.on("notify", notify);

        return () => {
            Events.removeListener("notify", notify);
        };
        
    }, []);

    return (
        <div className={`notification ${notifService.type} ${display ? "show" : "hidden"}`}>
            <div className="icon">
              <div className="iconContainer">
                <i className={`bx ${icon != "" ? icon : "bx-x"}`}/>
              </div>
            </div>
            <div className="text">
              <h1>{notifService.title ? notifService.title : "None"}</h1>
              <p>{notifService.message ? notifService.message : "None"}</p>
            </div>

            <div className="closeButton">
              <i className='bx bx-x' onClick={closeNotif}/>
            </div>
        </div>
    );
};