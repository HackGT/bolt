import React from 'react';
import {Loader} from "semantic-ui-react";

type LoaderProps = {
	active?: boolean,
	content?: string
}

function LoadingSpinner({active, content}: LoaderProps) {
	if (!content) {
		content = "Please wait..."
	}

	return (
		<Loader active={active} inline="centered" content={content} />
	);
}

export default LoadingSpinner;
