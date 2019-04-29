/** @jsx jsx */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { css, jsx } from "@emotion/core";
import { withTheme } from "emotion-theming";

import InputFormCategoryButton from "./input-form-category-button";
import { SmallTitle, RegularText } from "../atoms/typography";
import { HorizontalRule } from "../atoms/layout";

import { hasGroupAbilitiesInDatasets } from "../../state/ducks/user";
import { hasAnonAbilitiesInDataset } from "../../state/ducks/datasets-config";
import {
  placeConfigSelector,
  placeConfigPropType,
} from "../../state/ducks/place-config";

const CategoryHeader = withTheme(props => (
  <div
    css={css`
      margin-bottom: ${props.isCollapsed ? 0 : "16px"};
      height: ${props.isCollapsed ? 0 : "initial"};
      overflow: ${props.isCollapsed ? "hidden" : "initial"};
      transition: all 0.5s;
      transition-timing-function: ease;
    `}
  >
    <HorizontalRule spacing="small" />
    <SmallTitle
      css={css`
        margin-left: 16px;
        color: #555;
        display: block;
      `}
    >
      {props.header}
    </SmallTitle>
    <RegularText
      css={css`
        margin-left: 16px;
        color: #555;
        font-style: italic;
        display: block;
      `}
    >
      {props.description}
    </RegularText>
  </div>
));

class InputFormCategorySelector extends Component {
  state = {
    isCollapsed: false,
  };

  setCategory(categoryName) {
    this.setState({
      isCollapsed: true,
    });
    this.props.onCategoryChange(categoryName);
  }

  render() {
    const datasetSlugs = new Set();

    return (
      <>
        {this.props.visibleCategoryConfigs.map((config, formCategoryIndex) => {
          const isSelected = this.props.selectedCategory === config.category;

          let isWithFormCategoryHeader = false;
          if (
            !datasetSlugs.has(config.datasetSlug) &&
            this.props.placeConfig.formCategoryHeaders[config.datasetSlug]
          ) {
            isWithFormCategoryHeader = true;
            datasetSlugs.add(config.datasetSlug);
          }

          // NOTE: These permissions checks do not allow for the possibility
          // of controlling category visibility on a group-by-group basis,
          // though we may want to add that feature at some point.
          return (
            (this.props.hasAnonAbilitiesInDataset({
              abilities: ["create"],
              submissionSet: "places",
              datasetSlug: config.datasetSlug,
            }) ||
              this.props.hasGroupAbilitiesInDatasets({
                abilities: ["create"],
                submissionSet: "places",
                datasetSlugs: [config.datasetSlug],
              })) && (
              <div
                key={config.category}
                css={css`
                  margin: 0;
                `}
              >
                {isWithFormCategoryHeader && (
                  <CategoryHeader
                    isCollapsed={this.state.isCollapsed}
                    header={
                      this.props.placeConfig.formCategoryHeaders[
                        config.datasetSlug
                      ].header
                    }
                    description={
                      this.props.placeConfig.formCategoryHeaders[
                        config.datasetSlug
                      ].description
                    }
                  />
                )}
                <InputFormCategoryButton
                  formCategoryIndex={formCategoryIndex}
                  isSelected={isSelected}
                  isCategoryMenuCollapsed={this.state.isCollapsed}
                  isSingleCategory={
                    this.props.visibleCategoryConfigs.length === 1
                  }
                  categoryName={config.category}
                  onCategoryChange={evt => {
                    this.setCategory(evt.target.value, false);
                  }}
                  onExpandCategories={() =>
                    this.setState({ isCollapsed: false })
                  }
                />
              </div>
            )
          );
        })}
      </>
    );
  }
}

InputFormCategorySelector.propTypes = {
  hasAnonAbilitiesInDataset: PropTypes.func.isRequired,
  hasGroupAbilitiesInDatasets: PropTypes.func.isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  placeConfig: placeConfigPropType.isRequired,
  selectedCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  visibleCategoryConfigs: PropTypes.array.isRequired,
};

const mapStateToProps = state => ({
  hasGroupAbilitiesInDatasets: ({ abilities, submissionSet, datasetSlugs }) =>
    hasGroupAbilitiesInDatasets({
      state,
      abilities,
      submissionSet,
      datasetSlugs,
    }),
  hasAnonAbilitiesInDataset: ({ abilities, submissionSet, datasetSlug }) =>
    hasAnonAbilitiesInDataset({ state, abilities, submissionSet, datasetSlug }),
  placeConfig: placeConfigSelector(state),
});

export default connect(mapStateToProps)(InputFormCategorySelector);
