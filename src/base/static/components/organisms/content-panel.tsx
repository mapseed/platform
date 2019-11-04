/** @jsx jsx */
import * as React from "react";
import { jsx } from "@emotion/core";
import { CloseButton } from "../atoms/buttons";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";

import CustomPage from "./custom-page";
const PlaceDetail = React.lazy(() => import("./place-detail"));
const NewPlaceForm = React.lazy(() => import("./new-place-form"));
import constants from "../../constants";

import {
  contentPanelComponentSelector,
  layoutSelector,
  pageSlugSelector,
  Layout,
  rightSidebarVisibilitySelector,
} from "../../state/ducks/ui";
import { focusedPlaceSelector, Place } from "../../state/ducks/places";
import { pageSelector } from "../../state/ducks/pages-config";
import { LoadingBar } from "../atoms/imagery";
import { PlaceForm } from "../../state/ducks/forms";

const getLeftOffset = (isRightSidebarVisible, layout) => {
  switch (layout) {
    case "desktop":
      return isRightSidebarVisible ? "45%" : "60%";
    case "mobile":
      return 0;
  }
};

type OwnProps = {
  addPlaceButtonHeight: number;
  currentLanguageCode: string;
  defaultLanguageCode: string;
  mapContainerRef: React.RefObject<HTMLElement>;
};

type Props = {
  contentPanelComponent: string;
  focusedPlace: Place;
  isRightSidebarVisible: boolean;
  layout: Layout;
  pageSelector: Function;
  pageSlug: string;
} & OwnProps &
  RouteComponentProps<{}>;

const ContentPanel = (props: Props) => {
  const contentPanelOuterContainerRef: React.RefObject<
    HTMLElement
  > = React.createRef();
  const contentPanelInnerContainerRef: React.RefObject<
    HTMLDivElement
  > = React.createRef();

  return (
    <section
      css={{
        position: "absolute",
        top:
          props.layout === "desktop" ? `${constants.HEADER_HEIGHT}px` : "60%",
        width: props.layout === "desktop" ? "40%" : "100%",
        left: getLeftOffset(props.isRightSidebarVisible, props.layout),
        height:
          props.layout === "desktop"
            ? `calc(100% - ${constants.HEADER_HEIGHT}px)`
            : "unset",
        backgroundColor: "#fff",
        boxSizing: "border-box",
        boxShadow:
          props.layout === "desktop"
            ? "-4px 0 3px rgba(0,0,0,0.1)"
            : "0 -4px 3px rgba(0,0,0,0.1)",
        zIndex: 15,
      }}
      ref={contentPanelOuterContainerRef}
    >
      <CloseButton
        css={{
          position: "absolute",
          top: props.layout === "desktop" ? "10px" : "-33px",
          left: props.layout === "desktop" ? "-33px" : "10px",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: props.layout === "desktop" ? 0 : "8px",
          borderBottomLeftRadius: props.layout === "desktop" ? "8px" : 0,
          backgroundColor: "#fff",
          outline: "none",
          border: "none",
          fontSize: props.layout === "desktop" ? "24px" : "16px",
          color: "#ff5e99",
          boxShadow:
            props.layout === "desktop"
              ? "-4px 4px 3px rgba(0,0,0,0.1)"
              : "4px -4px 3px rgba(0,0,0,0.1)",
          padding:
            props.layout === "desktop"
              ? "9px 10px 8px 10px"
              : "10px 16px 10px 16px",

          "&:hover": {
            color: "#cd2c67",
            cursor: "pointer",
          },
        }}
        layout={props.layout}
        onClick={evt => {
          evt.preventDefault();
          props.history.push("/");
        }}
      />
      <div
        css={{
          width: "100%",
          height: "100%",
          overflow: props.layout === "desktop" ? "auto" : "visible",
          padding: `15px 15px ${
            props.layout === "desktop" ? 15 : 15 + props.addPlaceButtonHeight
          }px 15px`,
          boxSizing: "border-box",
          scrollbarWidth: "none",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23adacb0' fill-opacity='0.23'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
        ref={contentPanelInnerContainerRef}
      >
        {props.contentPanelComponent === "CustomPage" && (
          <CustomPage
            currentLanguageCode={props.currentLanguageCode}
            defaultLanguageCode={props.defaultLanguageCode}
            layout={props.layout}
            pageSlug={props.pageSlug}
          />
        )}
        {props.contentPanelComponent === "PlaceDetail" && props.focusedPlace && (
          <React.Suspense fallback={<LoadingBar />}>
            <PlaceDetail
              contentPanelInnerContainerRef={contentPanelInnerContainerRef}
              mapContainerRef={props.mapContainerRef}
              isGeocodingBarEnabled={false}
            />
          </React.Suspense>
        )}
        {props.contentPanelComponent === "InputForm" && (
          <React.Suspense fallback={<LoadingBar />}>
            <NewPlaceForm />
            {/* <FormCategoryMenuWrapper
              contentPanelInnerContainerRef={contentPanelInnerContainerRef}
              layout={props.layout}
            /> */}
          </React.Suspense>
        )}
      </div>
    </section>
  );
};

const mapStateToProps = (state: any) => ({
  contentPanelComponent: contentPanelComponentSelector(state),
  focusedPlace: focusedPlaceSelector(state),
  isRightSidebarVisible: rightSidebarVisibilitySelector(state),
  layout: layoutSelector(state),
  pageSelector: (slug, lang) => pageSelector({ state, slug, lang }),
  pageSlug: pageSlugSelector(state),
});

export default withRouter(connect(mapStateToProps)(ContentPanel));
