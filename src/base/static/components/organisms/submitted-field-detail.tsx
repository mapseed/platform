import React from "react";
import Typography from "@material-ui/core/Typography";

import CoverImage from "../molecules/cover-image";
import { Place } from "../../state/ducks/places";
import { FormModule } from "../../state/ducks/forms";
import { getSubmittedFieldComponent } from "../../utils/place-utils";

const SubmittedFieldSummary = ({
  place,
  formModules,
}: {
  place: Place;
  formModules: FormModule[];
}) => {
  return (
    <div>
      {place.attachments
        .filter(({ type }) => type === "CO")
        .map(({ file }) => (
          <CoverImage key={file} imageUrl={file} />
        ))}
      {formModules
        .filter(({ key }) => !!place[key])
        .map(({ label, key, type, variant }) => {
          const SubmittedFieldComponent = getSubmittedFieldComponent(
            type,
            variant,
          );

          return (
            <React.Fragment key={key}>
              {label && <Typography>{label}</Typography>}
              <SubmittedFieldComponent value={place[key]} />
            </React.Fragment>
          );
        })}
    </div>
  );
};

export default SubmittedFieldSummary;
