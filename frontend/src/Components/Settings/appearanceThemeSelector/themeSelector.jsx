const React = require("react");
import { useTheme } from "../../../Utils/Themes/theme";
import "./themeSelector.css";

// Assets
import lightImage from "../../../Assets/light.png";
import darkImage from "../../../Assets/dark.png";

export const ThemeSelector = () => {
    const theme = useTheme();
    const [activeCards, setActiveCards] = React.useState({card: "",card2: "", card3: ""});

    const handleFirstCardClick = () => {
        let newEdit = {...activeCards};
        newEdit.card = "active";
        newEdit.card2 = "";
        newEdit.card3 = "";
        setActiveCards(newEdit);
        theme.changeTheme("light");
    };

    const handleSecCardClick = () => {
        let newEdit = {...activeCards};
        newEdit.card = "";
        newEdit.card2 = "active";
        newEdit.card3 = "";
        setActiveCards(newEdit);
        theme.changeTheme("dark");
    };

    const handleThrCardClick = () => {
        let newEdit = {...activeCards};
        newEdit.card = "";
        newEdit.card2 = "";
        newEdit.card3 = "active";
        setActiveCards(newEdit);
        theme.changeTheme("abyss");
    };

    React.useEffect(() => {
        if (theme.theme === "") {
            let newEdit = {...activeCards};
            newEdit.card = "active";
            newEdit.card2 = "";
            setActiveCards(newEdit);
        } else if (theme.theme === "darkTheme") {
            let newEdit = {...activeCards};
            newEdit.card = "";
            newEdit.card2 = "active";
            setActiveCards(newEdit);
        } else if (theme.theme === "abyssTheme") {
            let newEdit = {...activeCards};
            newEdit.card = "";
            newEdit.card2 = "";
            newEdit.card3 = "active";
            setActiveCards(newEdit);
        } else { 
            let newEdit = {...activeCards};
            newEdit.card = "active";
            newEdit.card2 = "";
            newEdit.card3 = "";
            setActiveCards(newEdit);
        }
    }, []);

    return (
        <div className={`themeSelector ${theme.theme}`}>
            <h1 className={`title ${theme.theme}`}>Choose your theme</h1><br/>
            <div className={`themeCards ${theme.theme}`}>
                <div className={`card ${theme.theme} ${activeCards.card}`} onClick={handleFirstCardClick}>
                    <img src={lightImage}/>
                </div>
                <div className={`card ${theme.theme} ${activeCards.card2}`} style={{gridColumnStart: 2}} onClick={handleSecCardClick}>
                    <img src={darkImage}/>
                </div>
                <div className={`card ${theme.theme} ${activeCards.card3}`} style={{gridColumnStart: 3}} onClick={handleThrCardClick}>
                    <img src={darkImage}/>
                </div>
            </div>
        </div>
    );
};