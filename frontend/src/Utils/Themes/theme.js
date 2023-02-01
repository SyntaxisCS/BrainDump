const React = require("react");
import Cookies from "universal-cookie";

const ThemeContext = React.createContext(null);
const cookies = new Cookies();

export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = React.useState(""); // default = light (light = ""(nothing))

    const changeTheme = (newTheme) => {
        switch(newTheme) {
            case "light":
                setTheme("");
                cookies.remove("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa");
                cookies.set("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa", "light");
            break;

            case "dark":
                setTheme("darkTheme");
                cookies.remove("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa");
                cookies.set("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa", "dark");
            break;

            // add cases if more themes are added
            case "abyss":
                setTheme("abyssTheme");
                cookies.remove("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa");
                cookies.set("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa", "abyss");
            break;

            default: // set default to light theme
                setTheme("");
                break;
        }
    };

    React.useEffect(() => {
        let savedTheme = cookies.get("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa");
        if (savedTheme) {
            changeTheme(savedTheme);
        } else {
            changeTheme("light");
        }
    },[]);

    return (
        <ThemeContext.Provider value={{theme, changeTheme}}>
            {children}
        </ThemeContext.Provider>
    )
};

export const useTheme = () => {
    return React.useContext(ThemeContext);
};