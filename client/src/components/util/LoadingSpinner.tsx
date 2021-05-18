import React from "react";
import { Loader } from "semantic-ui-react";

interface LoadingSpinnerProps {
  active?: boolean;
  content?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ active, content }) => (
  <Loader active={active} inline="centered" content={content || "Please wait..."} />
);

export default LoadingSpinner;
