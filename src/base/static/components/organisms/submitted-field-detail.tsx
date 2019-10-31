import React from "react";
import Typography from "@material-ui/core/Typography";

import CoverImage from "../molecules/cover-image";
import { Place } from "../../state/ducks/places";
import { FormModule } from "../../state/ducks/forms";

const ListSubmittedField = value => {
  value = Array.isArray(value) ? value : [value];

  return (
    <ul>
      {value.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
};

const TextSubmittedField = value => <Typography>{value}</Typography>;

const RichTextSubmittedField = value => (
  <div dangerouslySetInnerHTML={{ __html: value }} />
);

const NumberSubmittedField = value => <Typography>{value}</Typography>; // TODO

const getSubmittedFieldComponent = (type, variant) => {
  if (type === "radiofield" && variant === "RA") {
    return ListSubmittedField;
  } else if (type === "radiofield" && variant === "CH") {
    return ListSubmittedField;
  } else if (type === "richtext") {
    return RichTextSubmittedField;
  } else {
    return TextSubmittedField;
  }
};

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
      {formModules.map(({ label, key, type, variant }) => {
        if (!place[key]) {
          return null;
        }

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
