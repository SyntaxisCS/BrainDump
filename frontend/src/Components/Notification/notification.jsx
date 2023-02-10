const React = require("react");

// Components
import { useNotif } from "../../Utils/Notification/notification";
import { Events } from "../../Utils/Events/events";
import "./notification.css";

export const Notification = () => {
    const notifService = useNotif().notification;
    const [display, setDisplay] = React.useState(false);

    const handleDisplay = (time) => {
        if (!time) {
            time = 5000;
        }

        setDisplay(true);
        
        setTimeout(() => {
            setDisplay(false);
        }, time);
    };

    React.useEffect(() => {

        const notify = () => {
            handleDisplay();
        };

        Events.on("notify", notify);

        return () => {
            Events.removeListener("notify", notify);
        };
        
    }, []);

    return (
        <div className={`notification ${notifService.type} ${display ? "show" : "hidden"}`}>
            <h1>{notifService.title ? notifService.title : "None"}</h1>
            <p>{notifService.message ? notifService.message : "None"}</p>
        </div>
    );
};