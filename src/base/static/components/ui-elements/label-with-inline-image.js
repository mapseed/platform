import React, { Component } from "react";
import PropTypes from "prop-types";
import cx from "bem-classnames";

const baseClass = "label-with-inline-image";

class LabelWithInlineImage extends Component {

	render() {
		let imageContainerClass = {
					name: baseClass + "__image-container",
					modifiers: ["imageAlignment"]
				},
				labelContainerClass = baseClass + "__label-container",
				labelTextClass = baseClass + "__label-text";

		return (
			<label className={baseClass}
						 htmlFor={this.props.inputId}>
				<span className={cx(imageContainerClass, { imageAlignment: this.props.imageAlignment || "left"})}>
					<img src={this.props.imageSrc} />
				</span>
				<span className={labelContainerClass}>{this.props.labelText}</span>
			</label>
		);
	}
};

LabelWithInlineImage.propTypes = {
	imageSrc: PropTypes.string.isRequired,
	labelText: PropTypes.string.isRequired,
	inputId: PropTypes.string.isRequired
};

export { LabelWithInlineImage };
