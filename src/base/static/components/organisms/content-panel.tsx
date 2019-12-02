/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import { CloseButton } from "../atoms/buttons";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import CustomPage from "./custom-page";
import MultiDatasetMenu from "./multi-dataset-menu";
const PlaceDetail = React.lazy(() => import("./place-detail"));
const NewPlaceForm = React.lazy(() => import("./new-place-form"));

import { layoutSelector, Layout } from "../../state/ducks/ui";
import { LoadingBar } from "../atoms/imagery";
import { datasetsWithCreatePlacesAbilitySelector } from "../../state/ducks/user";

type OwnProps = {
  placeId: string;
  url: string;
  currentLanguageCode: string;
  defaultLanguageCode: string;
  mapContainerRef: React.RefObject<HTMLElement>;
};

type ContentPanelProps = {
  layout: Layout;
  pageSlug: string;
} & OwnProps;

const getContentPanelComponent = ({
  url,
  placeId,
  pageSlug,
  datasetsWithCreatePlacesAbility,
}) => {
  if (pageSlug) {
    return "CustomPage";
  } else if (url === "/new" && datasetsWithCreatePlacesAbility.length > 1) {
    return "MultiDatasetMenu";
  } else if (url === "/new" && datasetsWithCreatePlacesAbility.length === 1) {
    return "InputForm";
  } else if (placeId) {
    return "PlaceDetail";
  } else {
    return null;
  }
};

const ContentPanel = ({
  mapContainerRef,
  placeId,
  //responseId,
  url,
  pageSlug,
  currentLanguageCode,
  // formId,
  defaultLanguageCode,
}: ContentPanelProps) => {
  const contentPanelOuterContainerRef: React.RefObject<HTMLElement> = React.createRef();
  const contentPanelInnerContainerRef: React.RefObject<HTMLDivElement> = React.createRef();
  const history = useHistory();
  const layout = useSelector(layoutSelector);
  const datasetsWithCreatePlacesAbility = useSelector(
    datasetsWithCreatePlacesAbilitySelector,
  );
  const component = getContentPanelComponent({
    url,
    placeId,
    pageSlug,
    datasetsWithCreatePlacesAbility,
  });

  return (
    <section
      css={{
        position: "relative",
        flex: 2,
        backgroundColor: "#fff",
        boxSizing: "border-box",
        boxShadow:
          layout === "desktop"
            ? "-4px 0 3px rgba(0,0,0,0.1)"
            : "0 -4px 3px rgba(0,0,0,0.1)",
        zIndex: 15,
      }}
      ref={contentPanelOuterContainerRef}
    >
      <CloseButton
        css={{
          position: "absolute",
          top: layout === "desktop" ? "10px" : "-33px",
          left: layout === "desktop" ? "-33px" : "10px",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: layout === "desktop" ? 0 : "8px",
          borderBottomLeftRadius: layout === "desktop" ? "8px" : 0,
          backgroundColor: "#fff",
          outline: "none",
          border: "none",
          fontSize: layout === "desktop" ? "24px" : "16px",
          color: "#ff5e99",
          boxShadow:
            layout === "desktop"
              ? "-4px 4px 3px rgba(0,0,0,0.1)"
              : "4px -4px 3px rgba(0,0,0,0.1)",
          padding:
            layout === "desktop" ? "9px 10px 8px 10px" : "10px 16px 10px 16px",

          "&:hover": {
            color: "#cd2c67",
            cursor: "pointer",
          },
        }}
        layout={layout}
        onClick={evt => {
          evt.preventDefault();
          history.push("/");
        }}
      />
      <div
        css={{
          width: "100%",
          height: "100%",
          overflow: layout === "desktop" ? "auto" : "visible",
          padding: "15px", // TODO
          boxSizing: "border-box",
          scrollbarWidth: "none",
        }}
        ref={contentPanelInnerContainerRef}
      >
        {component === "CustomPage" && (
          <CustomPage
            currentLanguageCode={currentLanguageCode}
            defaultLanguageCode={defaultLanguageCode}
            layout={layout}
            pageSlug={pageSlug}
          />
        )}
        {component === "PlaceDetail" && (
          <React.Suspense fallback={<LoadingBar />}>
            <PlaceDetail
              contentPanelInnerContainerRef={contentPanelInnerContainerRef}
              mapContainerRef={mapContainerRef}
              isGeocodingBarEnabled={false}
              placeId={placeId}
            />
          </React.Suspense>
        )}
        {component === "MultiDatasetMenu" && <MultiDatasetMenu />}
        {component === "InputForm" && (
          <React.Suspense fallback={<LoadingBar />}>
            <NewPlaceForm
              contentPanelInnerContainerRef={contentPanelInnerContainerRef}
            />
          </React.Suspense>
        )}
      </div>
    </section>
  );
};

export default ContentPanel;
