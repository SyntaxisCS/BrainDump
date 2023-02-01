const React = require("react");
import {Navigate} from "react-router-dom";
import { useAuth } from "./auth";

export const RequireAuth = ({children}) => {
    const auth = useAuth();

    if (auth.user) {
        return children;
    } else {
        return <Navigate to="/login"/>
    }
};