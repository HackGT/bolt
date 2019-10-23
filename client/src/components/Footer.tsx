import * as React from "react";
import FeedbackLink from "./FeedbackLink";
import packageJson from "../../package.json";

const Footer: React.FunctionComponent<{}> = (props) => {
    return (
        <footer style={{
            textAlign: "center",
            margin: "50px 0",
        }}>
            <p>Made with 🤖 by the HackGTeam - HackGT Hardware Checkout is powered by <a
                href="https://github.com/hackgt/bolt">Bolt</a> v{packageJson.version}</p>
        <FeedbackLink/>
        </footer>
    );
};

export default Footer;
