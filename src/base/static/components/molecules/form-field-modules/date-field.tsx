import React from "react";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withTranslation, WithTranslation } from "react-i18next";
import { FieldProps as FormikFieldProps } from "formik";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { DatePickerView } from "@material-ui/pickers/DatePicker/DatePicker";

import { MapseedDateFieldModule } from "../../../state/ducks/forms";
import { FieldPrompt } from "../../atoms/typography";
import { CheckboxInput } from "../../atoms/input";

type DateFieldModuleProps = {
  mapseedField: MapseedDateFieldModule;
  setFieldValue: (key: string, date: any) => void;
} & FormikFieldProps &
  WithTranslation;

const moment = new MomentUtils();

// HACK: We use a far-future date to represent the notion of an "ongoing"
// date selection.
const ONGOING_DATE = moment.parse("9999-12-31", "YYYY-MM-DD");

const getDatepickerViews = formFormat =>
  (["year", "date", "month"] as DatePickerView[]).filter(view =>
    // Align the DatePicker's views with the passed date format string
    // (i.e. `YYYY MM`)
    formFormat.toLowerCase().includes(view[0]),
  );

const DateField = ({
  field: { name, value, onBlur, onChange },
  mapseedField: {
    key,
    placeholder,
    id,
    prompt,
    formFormat,
    labelFormat,
    includeOngoing,
    ongoingLabel,
  },
  t,
  setFieldValue,
}: DateFieldModuleProps) => {
  const [ongoingDate, setOngoingDate] = React.useState(
    moment.format(ONGOING_DATE, formFormat),
  );
  const [datepickerViews, setDatepickerViews] = React.useState(
    getDatepickerViews(formFormat),
  );

  return (
    <React.Fragment>
      {prompt && <FieldPrompt>{prompt}</FieldPrompt>}
      {includeOngoing && (
        <FormControlLabel
          label={t(`dateFieldOngoingLabel${id}`, ongoingLabel || "Ongoing")}
          control={
            <Switch
              onChange={evt => {
                setFieldValue(key, evt.target.checked ? ongoingDate : "");
              }}
              checked={value === ongoingDate}
            />
          }
        />
      )}
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DatePicker
          disabled={value === ongoingDate}
          views={datepickerViews}
          placeholder={t(
            `dateFieldPlaceholder${id}`,
            placeholder || "Click here to select a date",
          )}
          format={formFormat}
          value={value === ongoingDate || value === "" ? null : value}
          onChange={date => {
            setFieldValue(key, date);
          }}
        />
      </MuiPickersUtilsProvider>
    </React.Fragment>
  );
};

export default withTranslation("DateField")(DateField);
