import React from 'react';
import packageJson from "../../package.json";
// @ts-ignore
import SlackFeedback, { themes } from 'react-slack-feedback';

const FeedbackLink = () => {
    const url = `https://docs.google.com/forms/d/e/1FAIpQLSdtXkj0IUjKbfGD8tZ0MKRpjTKOjBi4cbfCxwmRiDe1ZRG11Q/viewform?usp=pp_url&entry.1073143569=${window.location}&entry.1453252368=${packageJson.version}`;
    // @ts-ignore
    function sendToServer(payload, success, error) {
      return fetch('/api/slack/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(success)
      .catch(error)
    }

    return <SlackFeedback
    channel="#bot-spam"
    theme={themes.dark}
    user="Slack Feedback"
    feedbackTypes={[{value: "bug", label: "Bug"}, {value: "feature_request", label: "Feature Request"}, {value: "question", label: "Question"}]}
    // @ts-ignore
    onSubmit={(payload, success, error) =>
      // @ts-ignore
      sendToServer(payload)
        .then(success)
        .catch(error)
     }
  />;
};

export default FeedbackLink;
