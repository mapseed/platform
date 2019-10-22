import React from "react";
import Button from "@material-ui/core/Button";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { withStyles, WithStyles } from "@material-ui/core/styles";
import { withTranslation, WithTranslation } from "react-i18next";

import { MapseedSkipStageModule } from "../../../state/ducks/forms";

type SkipStageModuleProps = {
  mapseedModule: MapseedSkipStageModule;
  onClickSkipStage: (stageId: number) => void;
} & WithTranslation &
  WithStyles;

const SkipStageModule = ({
  mapseedModule: { id, stageId, label },
  t,
  classes,
  onClickSkipStage,
}: SkipStageModuleProps) => {
  return (
    <Button
      className={classes.label}
      type="button"
      variant="contained"
      color="primary"
      size="medium"
      endIcon={<ArrowForwardIcon />}
      onClick={() => onClickSkipStage(stageId)}
    >
      {t(`skipStageModuleLabel${id}`, label)}
    </Button>
  );
};

// https://material-ui.com/guides/typescript/#usage-of-withstyles
export default withStyles({
  label: { textAlign: "right", lineHeight: "1.2rem" },
})(withTranslation("SkipStageModule")(SkipStageModule));
