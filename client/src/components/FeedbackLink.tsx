import React from 'react';
import packageJson from "../../package.json";

const FeedbackLink = () => {
    const url = `https://docs.google.com/forms/d/e/1FAIpQLSdtXkj0IUjKbfGD8tZ0MKRpjTKOjBi4cbfCxwmRiDe1ZRG11Q/viewform?usp=pp_url&entry.1073143569=${window.location}&entry.1453252368=${packageJson.version}`;

    return <a href={url} target="_blank">Send feedback</a>;
};

export default FeedbackLink;
