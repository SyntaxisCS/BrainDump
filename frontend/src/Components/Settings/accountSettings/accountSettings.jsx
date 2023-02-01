const React = require("react");
const axios = require("axios");
const {useNavigate} = require("react-router-dom");

// Components
import { Events } from "../../../Utils/Events/events";
import { useTheme } from "../../../Utils/Themes/theme";
import { useAuth } from "../../../Utils/Authentication/auth";
import { ChangeNameModal } from "./Modals/changeNameModal/changeNameModal";
import { ChangeEmailModal } from "./Modals/changeEmailModal/changeEmailModal";
import { ChangePasswordModal } from "./Modals/changePasswordModal/changePasswordModal";
import "./accountSettings.css";

export const AccountSettingsPanel = () => {
    const theme = useTheme();
    const auth = useAuth();
    const navigate = useNavigate();

    // States
    const [userState, setUserState] = React.useState(null);

    // Modal States
    const [nameModal, setNameModal] = React.useState(false);
    const [emailModal, setEmailModal] = React.useState(false);
    const [passwordModal, setPasswordModal] = React.useState(false);

    // Name Modal Methods
    const handleOpenNameModal = () => {
        setNameModal(true);
    };

    const handleCloseNameModal = () => {
        setNameModal(false);
    };

    // Email Modal Methods
    const handleOpenEmailModal = () => {
        setEmailModal(true);
    };

    const handleCloseEmailModal = () => {
        setEmailModal(false);
    };

    // Password Modal Methods
    const handleOpenPasswordModal = () => {
        setPasswordModal(true);
    };

    const handleClosePasswordModal = () => {
        setPasswordModal(false);
    };

    // Methods
    const handleLogout = () => {
        auth.logout();
        navigate("/login");
    };

    const handleAccountDeletion = () => {
        deleteUser();
    };

    // Api calls
    const getUser = () => {
        axios.get(`http://localhost:9802/users/${auth.user.uuid}`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            setUserState(response.data.user);
        }, err => {
            console.error(err);
            setUserState(null);
        });
    };

    const deleteUser = () => {
        axios.delete(`http://localhost:9802/users/delete`, {
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true
        }).then(response => {
            auth.logout();
            navigate("/signup");
        }, err => {
            console.error(err);
        });
    };

    // On page load
    React.useEffect(() => {
        getUser();

        // Events
        Events.on("nameChange", () => {
            getUser();
        });
    }, []);

    return (
        <div className={`accountSettingsPanel ${theme.theme}`}>
            <h1 className={`title ${theme.theme}`}>Account Settings</h1>
            <p className={`subTitle ${theme.theme}`}>Change your account information</p>

            <div className={`panel ${theme.theme}`}>
                <div className={`fieldList ${theme.theme}`}>
                    {/*Name*/}
                    <div className="field">
                        <div className="innerField">
                            <h3>Name</h3>
                            <span>{userState ? userState.name : "Could not get name"}</span>

                            {/*Change Name Modal*/}
                            <ChangeNameModal isOpen={nameModal} onClose={handleCloseNameModal}/>
                        </div>
                        <span><button className="editButton" onClick={handleOpenNameModal}>Edit</button></span>
                    </div>
                    {/*Email*/}
                    <div className="field">
                         <div className="innerField">
                            <h3>Email</h3>
                            <span>{userState ? userState.email : "Could not get email"}</span>

                            {/*Change Email Modal*/}
                            <ChangeEmailModal isOpen={emailModal} onClose={handleCloseEmailModal}/>
                        </div>
                        <span><button className="editButton" onClick={handleOpenEmailModal}>Edit</button></span>
                    </div>
                    {/*Password*/}
                    <div className="field">
                        <div className="innerField">
                            <h3>Password</h3>
                            <span>********</span>

                            {/*Change Password Modal*/}
                            <ChangePasswordModal isOpen={passwordModal} onClose={handleClosePasswordModal}/>
                        </div>
                        <span><button className="editButton" onClick={handleOpenPasswordModal}>Edit</button></span>
                    </div>
                    <button className="logOutBtn" onClick={handleLogout}>Log out</button>
                </div>

                {/*
                    Name
                    Email
                    Password
                    Send all data button?
                    Delete button 
                    Send data and delete button in seperate "danger zone" panel?
                */}
            </div>

            <div className={`dangerZonePanel ${theme.theme}`}>
                <h3>Download Account Data</h3>
                <p>Get sent an email with a zip file containing all information related to your account including account information and decrypted notes. Notes are encrypted using your password so while you can see your own notes we have no way of decrypting your notes server-side</p>
                <button className="downloadDataBtn">Send</button>

                <h3>Delete Account</h3>
                <p>Immediately delete your account. Once you click "delete" our servers will immediately start processing the deletion of your account. This is an irreversable account and cannot be stopped once started. Be careful.</p>
                <button className="deleteBtn" onClick={handleAccountDeletion}>Delete</button>
            </div>
        </div>
    )
};