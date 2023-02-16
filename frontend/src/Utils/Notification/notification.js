const React = require("react");
const EventEmitter = require("events");

import { Events } from "../Events/events";

const NotifContext = React.createContext(null);

export const NotificationProvider = ({children}) => {
    const [notification, setNotification] = React.useState({title: null, message: null, type: null});
    /*
    let not = {
        type: "good",
        message: "message",
        time: 5000
    }*/

    const addNotification = (notificationObject) => {
        // Notification
        let notif = {...notification};

        switch(notificationObject.type) {
            case "created":
                notif.title = "Note Saved!";
            break;

            case "error":
                notif.title = "We are so sorry!";
            break;

            case "good":
                notif.title = "Success!";
            break;

            default:
                notif.title = "We are so sorry!";
            break;
        }

        notif.message = notificationObject.message;
        notif.type = notificationObject.type;

        // Set
        setNotification(notif);

        // Notify
        Events.emit("notify");
    };

    const clearNotification = () => {
        setNotification({message: null, type: null});
    } ;

    return (
        <NotifContext.Provider value={{notification, addNotification, clearNotification}}>
            {children}
        </NotifContext.Provider>
    )
};

export const useNotif = () => {
    return React.useContext(NotifContext);
}