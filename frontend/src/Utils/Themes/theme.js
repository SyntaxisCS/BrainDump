const React = require("react");
import Cookies from "universal-cookie";

// Export for PureComponent compatibility
export const ThemeContext = React.createContext(null);
const cookies = new Cookies();

export class ThemeProvider extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            theme: "",
        };

        this.changeTheme = this.changeTheme.bind(this);
    }

    componentDidMount() {
        let savedTheme = cookies.get("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa");
        if (savedTheme) {
            this.changeTheme(savedTheme);
        } else {
            this.changeTheme("abyss");
        }
    }

    changeTheme (newTheme) {
        switch (newTheme) {
            case "light":
                this.setState({ theme: "" });
                cookies.remove("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa");
                cookies.set("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa", "light");
                break;

            case "dark":
                this.setState({ theme: "darkTheme" });
                cookies.remove("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa");
                cookies.set("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa", "dark");
                break;

            // add cases if more themes are added
            case "abyss":
                this.setState({ theme: "abyssTheme" });
                cookies.remove("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa");
                cookies.set("$2a$12$ISGZk0Tm4PHs629z12WG9uySa9/1oohRRRgbuEzTVY9q5T6CzFVpa", "abyss");
                break;

            default: // set default to light theme
                this.setState({ theme: "darkTheme" });
                break;
        }
    }

    render() {
        return (
            <ThemeContext.Provider value={{theme: this.state.theme, changeTheme: this.changeTheme}}>
                {this.props.children}
            </ThemeContext.Provider>
        )
    }
}

export const useTheme = () => {
    return React.useContext(ThemeContext);
};