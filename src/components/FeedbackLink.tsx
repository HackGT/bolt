import React from "react";
import SlackFeedback from "react-slack-feedback";

const FeedbackLink = () => {
  // @ts-ignore
  function sendToServer(payload, success, error) {
    return fetch("/api/slack/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.attachments[0]),
    })
      .then(success)
      .catch(error);
  }

  return (
    <SlackFeedback
      showChannel={false}
      showIcon={false}
      feedbackTypes={[
        { value: "Bug", label: "Bug" },
        { value: "Feature Request", label: "Feature Request" },
        { value: "Question", label: "Question" },
      ]}
      // @ts-ignore
      onSubmit={(payload, success, error) =>
        // @ts-ignore
        sendToServer(payload).then(success).catch(error)
      }
    />
  );
};

export default FeedbackLink;
