const React = require("react");
const axios = require("axios");
const {Link} = require("react-router-dom");

// Components
import { IdeaCard } from "../ideaCard/ideaCard";
import { Events } from "../../../Utils/Events/events";
import "./ideaCardList.css";
import { useTheme } from "../../../Utils/Themes/theme";

export const IdeaCardList = () => {
    const theme = useTheme();
    const [notes, setNotes] = React.useState(null);

    const retrieveNotes = () => {
        axios.get("http://localhost:9802/notes/", {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            if (Array.isArray(response.data.notes.notes)) {
                setNotes(response.data.notes.notes);
            } else {
                setNotes(null);
            }
        }, err => {
            console.error(err);
            setNotes(null);
        });
    };

    React.useEffect(() => {
        // Initial note retrieval
        retrieveNotes();

        Events.on("createdNote", () => {
            retrieveNotes();
        });
    }, []);

    return (
        <div className={`ideaCardList ${theme.theme}`}>
            {notes ? notes.map(entry => (<Link to={`/n-${entry.id}`}><IdeaCard text={entry.content} date={entry.updated_date}/></Link>)) : <div style={{display:"none"}}></div>}
        </div>
    )
};