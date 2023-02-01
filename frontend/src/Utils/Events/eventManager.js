import { Events } from "./events";

export const dispatchEvent = (event, payload) => {
    if (event) {
        if (!payload) {
            Events.emit(event);
        } else {
            Events.emit(event, payload);
        }
    }
};