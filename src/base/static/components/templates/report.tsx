/** @jsx jsx */
import React, { useEffect, useState } from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";
import qs from "qs";

import mapseedApiClient from "../../client/mapseed-api-client";
import { placeSelector, placePropType } from "../../state/ducks/places";
import { updateCurrentTemplate } from "../../state/ducks/ui";
import KittitasFirewiseReport from "../organisms/reports/kittitas-firewise/report";
import {
  datasetsConfigSelector,
  datasetsConfigPropType,
} from "../../state/ducks/datasets-config";

const statePropTypes = {
  datasetsConfig: datasetsConfigPropType,
  placeSelector: PropTypes.func.isRequired,
};
const dispatchPropTypes = {
  updateCurrentTemplate: PropTypes.func.isRequired,
};
interface OwnProps {
  params: {
    datasetClientSlug: string;
    placeId: string;
  };
}
type StateProps = PropTypes.InferProps<typeof statePropTypes>;
type DispatchProps = PropTypes.InferProps<typeof dispatchPropTypes>;
type Props = StateProps & DispatchProps & RouteComponentProps<{}> & OwnProps;

const reports = {
  kittitasFirewiseReport: KittitasFirewiseReport,
};

const ReportTemplate = (props: Props) => {
  const [place, updatePlace] = useState(null);
  const datasetConfig = props.datasetsConfig.find(
    config => config.clientSlug === props.params.datasetClientSlug,
  );

  let Report;
  if (
    datasetConfig.report &&
    datasetConfig.report.templateName === "kittitasFirewiseReport"
  ) {
    Report = KittitasFirewiseReport;
  }

  async function fetchPlace() {
    let includePrivate = false;
    let jwtToken = null;
    const params = qs.parse(window.location.search.slice(1));
    if ("token" in params) {
      includePrivate = true;
      jwtToken = params["token"];
    }

    const response = await mapseedApiClient.place.getPlace({
      datasetUrl: datasetConfig.url,
      clientSlug: props.params.datasetClientSlug,
      datasetSlug: datasetConfig.slug,
      placeId: parseInt(props.params.placeId),
      placeParams: {
        include_submissions: true,
        include_tags: true,
      },
      includePrivate,
      jwtToken,
    });

    if (response) {
      updatePlace(response);
    }
  }

  useEffect(
    () => {
      props.updateCurrentTemplate("report");
      fetchPlace();
    },
    [parseInt(props.params.placeId)],
  );

  return place && Report ? <Report place={place} /> : null;
};

type MapseedReduxState = any;

const mapStateToProps = (state: MapseedReduxState): StateProps => ({
  datasetsConfig: datasetsConfigSelector(state),
  placeSelector: placeId => placeSelector(state, placeId),
});

const mapDispatchToProps = (
  dispatch: any,
  ownProps: OwnProps,
): DispatchProps => ({
  updateCurrentTemplate: templateName =>
    dispatch(updateCurrentTemplate(templateName)),
});

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(ReportTemplate));
