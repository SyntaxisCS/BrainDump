const React = require("react");
const axios = require("axios");

const AuthContext = React.createContext(null);

export const AuthProvider = ({children}) => {
    const [loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState(null);

    const login = (userObject) => {
        setUser(userObject);
    };

    const logout = () => {
        axios.delete("http://localhost:9802/users/logout", {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setUser(null);
        }, err => {
            console.error("Could not log out user");
        });
    };

    React.useEffect(() => {
        axios.get("http://localhost:9802/users/authenticate", {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            if (response.status === 200) {
                setUser(response.data);
                setLoading(false);
            } else {
                setLoading(false);
            }
        }, err => {
            // Nothing
            console.log(err);
            setLoading(false);
        });
    });

    return (
        <AuthContext.Provider value={{user, login, logout}}>
            {!loading && children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    return React.useContext(AuthContext);
};