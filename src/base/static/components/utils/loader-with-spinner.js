import React, { Component } from "react";
import PropTypes from "prop-types";

import Spinner from "react-spinner";

import { translate } from "react-i18next";

import "./loader-with-spinner.scss";

class LoaderWithSpinner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      isWithError: false,
    };
  }

  componentWillMount() {
    Promise.all(this.props.promiseData)
      .then(() => {
        this.setState({
          isLoaded: true,
        });
      })
      .catch(() => {
        this.setState({
          isWithError: true,
        });
      });
  }

  render() {
    return this.state.isWithError ? (
      <p className="loader-with-spinner__error-msg">
        {this.props.t("errorMsg")}
      </p>
    ) : this.state.isLoaded ? (
      this.props.render(this.props)
    ) : (
      <Spinner />
    );
  }
}

LoaderWithSpinner.propTypes = {
  render: PropTypes.func.isRequired,
  promiseData: PropTypes.arrayOf(PropTypes.object).isRequired,
  t: PropTypes.func.isRequired,
};

export default translate("LoaderWithSpinner")(LoaderWithSpinner);
