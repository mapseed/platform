import React, { Component } from "react";
import ReactQuill from "react-quill";

const baseClass = "mapseed-rich-textarea-field";

class RichTextareaField extends Component {
	render() {
		return (
			<ReactQuill 
				className={baseClass}
			</ReactQuill>
		);
	}
};

export { RichTextareaField };
