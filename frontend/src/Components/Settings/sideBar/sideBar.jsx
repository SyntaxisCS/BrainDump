const React = require("react");
const {useNavigate, NavLink} = require("react-router-dom");
import { useTheme } from "../../../Utils/Themes/theme";
import "./sideBar.css";

export const SideBar = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleBackButton = () => {
        navigate("/");
    };
    
    return (
        <div className={`sideBar ${theme.theme}`}>
            <ul className="navLinks">
                <li>
                    <NavLink to="/settings/account" className={({isActive}) => (isActive ? `active ${theme.theme}` : `none ${theme.theme}`)}>
                        <i className='bx bx-user'/>
                        <span className={`linksName ${theme.theme}`}>Account Settings</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings/appearance" className={({isActive}) => (isActive ? `active ${theme.theme}` : `none ${theme.theme}`)}>
                        <i className='bx bx-palette'/>
                        <span className={`linksName ${theme.theme}`}>Appearance</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/settings/about" className={({isActive}) => (isActive ? `active ${theme.theme}` : `none ${theme.theme}`)}>
                        <i className='bx bx-palette'/>
                        <span className={`linksName ${theme.theme}`}>About</span>
                    </NavLink>
                </li>
                <li className={`returnBtn ${theme.theme}`} onClick={handleBackButton}>
                    <a>
                        <i className='bx bx-arrow-back'/>
                        <span className={`linksName ${theme.theme}`}>Back</span>
                    </a>
                </li>
            </ul>
        </div>
    )
}