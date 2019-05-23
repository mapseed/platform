/** @jsx jsx */
import React, { useEffect, useState } from "react";
import { css, jsx } from "@emotion/core";
import PropTypes from "prop-types";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { connect } from "react-redux";

import mapseedApiClient from "../../client/mapseed-api-client";
import { placeSelector, placePropType } from "../../state/ducks/places";
import KittitasFirewiseReport from "../organisms/kittitas-firewise-report";
import {
  datasetsConfigSelector,
  datasetsConfigPropType,
} from "../../state/ducks/datasets-config";

const statePropTypes = {
  datasetsConfig: datasetsConfigPropType,
  placeSelector: PropTypes.func.isRequired,
};
interface OwnProps {
  params: {
    datasetClientSlug: string;
    placeId: string;
  };
}
type StateProps = PropTypes.InferProps<typeof statePropTypes>;
type Props = StateProps & RouteComponentProps<{}> & OwnProps;

const reports = {
  kittitasFirewiseReport: KittitasFirewiseReport,
};

const ReportTemplate = (props: Props) => {
  const [place, updatePlace] = useState(null);
  const datasetConfig = props.datasetsConfig.find(
    config => config.clientSlug === props.params.datasetClientSlug,
  );

  let Report;
  if (datasetConfig.templateName === "kittitasFirewiseReport") {
    Report = KittitasFirewiseReport;
  }

  async function fetchPlace() {
    const response = await mapseedApiClient.place.getPlace({
      datasetUrl: datasetConfig.url,
      clientSlug: props.params.datasetClientSlug,
      datasetSlug: datasetConfig.slug,
      placeId: parseInt(props.params.placeId),
      placeParams: {
        include_submissions: true,
        include_tags: true,
      },
      // TODO: Handle private data?
      includePrivate: false,
    });

    if (response) {
      updatePlace(response);
    }
  }

  useEffect(
    () => {
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

export default connect<StateProps, OwnProps>(mapStateToProps)(
  withRouter(ReportTemplate),
);
