const React = require("react");
const ReactDOM = require("react-dom");
const {BrowserRouter, Routes, Route} = require("react-router-dom");

// Utils
import { AuthProvider } from "./Utils/Authentication/auth";
import { RequireAuth } from "./Utils/Authentication/requireAuth";
import { ThemeProvider } from "./Utils/Themes/theme";
import { NotificationProvider } from "./Utils/Notification/notification";
import "./index.css";
// Pages
import {HomePage} from "./Pages/homePage";
import {AccountSettings} from "./Pages/Settings/account";
import {AppearanceSettings} from "./Pages/Settings/appearance";
import {LoginPage} from "./Pages/LoginPage";
import {CardEditPage} from "./Pages/cardEditPage";
import {SignUpPage} from "./Pages/SignUpPage";
import { ForgotPasswordRequestPage } from "./Pages/ForgotPasswordRequestPage";
import { ForgotPasswordChangePage } from "./Pages/forgotPasswordChangePage";
import { VerifyEmailPage } from "./Pages/verifyEmailPage.jsx";

ReactDOM.render((
    <AuthProvider>
        <ThemeProvider>
            <NotificationProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<RequireAuth><HomePage/></RequireAuth>}/>
                        {<Route path="/n-:id" element={<RequireAuth><CardEditPage/></RequireAuth>}/>}

                        {/*Settings*/}
                        <Route path="/settings/account" element={<RequireAuth><AccountSettings/></RequireAuth>}/>
                        <Route path="/settings/appearance" element={<RequireAuth><AppearanceSettings/></RequireAuth>}/>

                        {/*Auth*/}
                        <Route path="/login" element={<LoginPage/>}/>
                        <Route path="/signup" element={<SignUpPage/>}/>

                        {/*Forgot Password*/}
                        <Route path="/forgotpassword" element={<ForgotPasswordRequestPage/>}/>
                        <Route path="/forgotpassword/:token" element={<ForgotPasswordChangePage/>}/>

                        {/*Verify Email*/}
                        <Route path="/verify/:token" element={<VerifyEmailPage/>}/>
                    </Routes>
                </BrowserRouter>
            </NotificationProvider>
        </ThemeProvider>
    </AuthProvider>
), document.getElementById("root"));