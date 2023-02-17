const React = require('react');

// Components
import "./aboutSettings.css";

export const AboutSettingsComp = () => {
    return (
        <div className="aboutSettings">
            <div className="panel">
                <h1>About BrainDump...</h1>
                <p>Created by </p><span>SyntaxisCS</span>
                <p>Version</p><span>0.19.3</span>
            </div>
        </div>
    )
};