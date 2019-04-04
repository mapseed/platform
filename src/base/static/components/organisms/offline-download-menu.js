import React, { Fragment, useState } from "react";
import { Link, RegularText } from "../atoms/typography";
import { CloseButton } from "../atoms/buttons";
import { Button } from "../atoms/buttons";
import { getTilePaths } from "../../utils/geo";
import LinearProgress from "@material-ui/core/LinearProgress";
import {
  ModalWrapper,
  ModalHeading,
  ModalTitle,
  ModalBody,
  ModalFooter,
  modalStyles,
} from "../atoms/layout";
import {
  mapLayerConfigsPropType,
  offlineConfigPropType,
} from "../../state/ducks/map-config";

import Modal from "react-modal";
Modal.setAppElement("#site-wrap");

const fetchOfflineData = (
  offlineBoundingBox,
  mapLayerConfigs,
  setPercentDownloaded,
  setPhase,
) => {
  const { southWest, northEast } = offlineBoundingBox;

  const tilePaths = getTilePaths(southWest, northEast);
  const urlsToFetch = tilePaths
    .reduce(
      (urls, { zoom, lat, lng }) =>
        urls.concat(
          mapLayerConfigs
            .filter(
              layer =>
                layer.type &&
                ["raster-tile", "vector-tile"].includes(layer.type),
            )
            .map(mapTileLayerConfig => {
              return mapTileLayerConfig.url
                .replace("{z}", zoom)
                .replace("{x}", lng)
                .replace("{y}", lat);
            }),
        ),
      [],
    )
    .concat(
      mapLayerConfigs
        .filter(layer => layer.type && layer.type === "json")
        .map(mapLayerConfig => mapLayerConfig.source),
    )
    .concat([
      "/static/css/images/marker-arrow-overlay.png",
      "/static/css/images/marker-plus.png",
      "/static/css/images/marker-shadow.png",
      "/static/css/images/markers/spritesheet.json",
      "/static/css/images/markers/spritesheet.png",
      "/static/css/images/rolling-hills-cropped.jpg",
    ]);

  let fetchedRequests = 0;
  let totalRequests = urlsToFetch.length;
  urlsToFetch.forEach(url => {
    fetch(url).finally(() => {
      fetchedRequests++;
      setPercentDownloaded(parseInt((fetchedRequests / totalRequests) * 100));
      if (fetchedRequests >= totalRequests) {
        setPhase("downloaded");
      }
    });
  });
};

const OfflineDownloadMenu = props => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(() => false);

  // one of "prompt", "downloading", or "finished"
  const [phase, setPhase] = useState("prompt");
  const [percentDownloaded, setPercentDownloaded] = useState(0);
  return (
    <Fragment>
      <Link onClick={() => setIsModalOpen(() => true)}>
        {"Download app for offline use"}
      </Link>
      <Modal
        style={modalStyles}
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="offline download menu"
      >
        <ModalWrapper>
          <Fragment>
            <ModalHeading>
              <ModalTitle>{"Offline Menu"}</ModalTitle>
              <CloseButton onClick={closeModal} />
            </ModalHeading>
            {phase === "prompt" && (
              <Fragment>
                <ModalBody>
                  <RegularText textAlign="center">
                    {`Downloading the offline app may take a minute. Are you ready to download?`}
                  </RegularText>
                </ModalBody>
                <ModalFooter>
                  <Button
                    size={"full-width"}
                    color={"primary"}
                    onClick={() => {
                      fetchOfflineData(
                        props.offlineBoundingBox,
                        props.mapLayerConfigs,
                        setPercentDownloaded,
                        setPhase,
                      );
                      setPhase("downloading");
                    }}
                  >
                    {"Ok"}
                  </Button>
                </ModalFooter>
              </Fragment>
            )}
            {phase === "downloading" && (
              <ModalBody>
                <RegularText textAlign="center">{`Downloading the Mapseed app...`}</RegularText>
                <LinearProgress
                  style={{ marginTop: "8px", marginBottom: "8px" }}
                  value={percentDownloaded}
                  variant={"determinate"}
                />
                <RegularText textAlign="center">{`${percentDownloaded}%`}</RegularText>
              </ModalBody>
            )}
            {phase === "downloaded" && (
              <Fragment>
                <ModalBody>
                  <RegularText textAlign="center">{`Mapseed has been downloaded! Click 'ok' below to restart Mapseed and have the offline mode take effect.`}</RegularText>
                </ModalBody>
                <ModalFooter>
                  <Button
                    size={"full-width"}
                    color={"primary"}
                    onClick={() => {
                      setPhase("prompt");
                      setIsModalOpen(() => false);
                      window.location.reload();
                    }}
                  >
                    {"OK"}
                  </Button>
                </ModalFooter>
              </Fragment>
            )}
          </Fragment>
        </ModalWrapper>
      </Modal>
    </Fragment>
  );
};

OfflineDownloadMenu.propTypes = {
  mapLayerConfigs: mapLayerConfigsPropType.isRequired,
  offlineBoundingBox: offlineConfigPropType.isRequired,
};

export default OfflineDownloadMenu;
