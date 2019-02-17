import React, { Fragment, useState } from "react";
import styled from "react-emotion";
import { Link, RegularTitle, RegularText } from "../atoms/typography";
import { CloseButton } from "../molecules/buttons";
import { Button } from "../atoms/buttons";
import { getTilePaths } from "../../utils/geo";
import {
  mapLayerConfigsPropType,
  offlineConfigPropType,
} from "../../state/ducks/map-config";

import Modal from "react-modal";
Modal.setAppElement("#main");

const modalStyles = {
  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    borderRadius: "8px",
    outline: "none",
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.65)",
    wordWrap: "break-word",
    maxWidth: "95%",
    maxHeight: "95%",
    width: "360px",
  },
  overlay: {
    position: "fixed",
    top: "0px",
    left: "0px",
    right: "0px",
    bottom: "0px",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 99,
  },
};

const OfflineMenuWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
});

const OfflineMenuHeading = styled("div")({
  display: "flex",
});
const OfflineMenuTitle = styled(RegularTitle)({
  textAlign: "center",
  marginLeft: "auto",
  marginRight: "auto",
});

const fetchOfflineData = (offlineBoundingBox, mapTileLayerConfigs) => {
  const { southWest, northEast } = offlineBoundingBox;

  const tilePaths = getTilePaths(southWest, northEast);
  tilePaths.forEach(({ zoom, lat, lng }) => {
    mapTileLayerConfigs.forEach(mapTileLayerConfig => {
      const newUrl = mapTileLayerConfig.url
        .replace("{z}", zoom)
        .replace("{x}", lng)
        .replace("{y}", lat);
      console.log("fetching newUrl:", newUrl);
      fetch(newUrl);
    });
  });
};

const OfflineDownloadMenu = props => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const closeModal = () => setIsModalOpen(() => false);

  const [isDownloading, setIsDownloading] = useState(false);
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
        <OfflineMenuWrapper>
          <Fragment>
            <OfflineMenuHeading>
              <OfflineMenuTitle>{"Offline Menu"}</OfflineMenuTitle>
              <CloseButton onClick={closeModal} />
            </OfflineMenuHeading>
            {isDownloading ? (
              <RegularText>{`downloading... TODO: show progress`}</RegularText>
            ) : (
              <Fragment>
                <RegularText>
                  {`Downloading your offline data may take a few minutes. Are you ready to downlaod?`}
                </RegularText>
                <Button
                  onClick={() => {
                    setIsDownloading(() => true);
                    fetchOfflineData(
                      props.offlineBoundingBox,
                      props.mapTileLayerConfigs,
                    );
                  }}
                >
                  {"Ok"}
                </Button>
              </Fragment>
            )}
          </Fragment>
        </OfflineMenuWrapper>
      </Modal>
    </Fragment>
  );
};

OfflineDownloadMenu.propTypes = {
  mapTileLayerConfigs: mapLayerConfigsPropType,
  offlineBoundingBox: offlineConfigPropType,
};

export default OfflineDownloadMenu;
