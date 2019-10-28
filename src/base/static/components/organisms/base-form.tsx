/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import {
  Formik,
  Field,
  Form as FormikForm,
  FormikValues,
  connect as formikConnect,
} from "formik";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import { useSelector, useDispatch } from "react-redux";

import HTMLModule from "../molecules/form-field-modules/html-module";
import TextField from "../molecules/form-field-modules/text-field";
import FileField from "../molecules/form-field-modules/file-field";
import AddressField from "../molecules/form-field-modules/address-field";
import NumberField from "../molecules/form-field-modules/number-field";
import DateField from "../molecules/form-field-modules/date-field";
import TextareaField from "../molecules/form-field-modules/textarea-field";
import RadioField from "../molecules/form-field-modules/radio-field";
import GroupModule from "../molecules/form-field-modules/group-module";
import SubmitButtonModule from "../molecules/form-field-modules/submit-button-module";
import SkipStageModule from "../molecules/form-field-modules/skip-stage-module";
import FieldPaper from "../molecules/field-paper";
import FormStageControlBar from "../molecules/form-stage-control-bar";
import { layoutSelector, Layout } from "../../state/ducks/ui";
import {
  FormModule,
  updateFormModuleVisibilities,
  MapseedForm,
} from "../../state/ducks/forms";
import { isFormField } from "../../utils/place-utils";
import { LoadingBar } from "../atoms/imagery";

// TODO:
//  - admin-only fields (??)

type BaseFormProps = {
  form: MapseedForm;
  onSubmit: (values: FormikValues) => void;
  onChangeStage: (newStage: number) => void;
  initialValues: FormikValues;
  isSubmitting: boolean;
};

const UnknownModule = () => null;

const MODULES = {
  htmlmodule: HTMLModule,
  textfield: TextField,
  submitbuttonmodule: SubmitButtonModule,
  filefield: FileField,
  skipstagemodule: SkipStageModule,
  addressfield: AddressField,
  radiofield: RadioField,
  numberfield: NumberField,
  datefield: DateField,
  textareafield: TextareaField,
  groupmodule: GroupModule,
  unknownmodule: UnknownModule,
};

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// TODO: i18n for validation messages.
const getValidator = (isRequired, variant) => {
  if (isRequired && variant === "EM") {
    return value => {
      if (!value) {
        return "This is a required field";
      } else if (value && !value.match(EMAIL_REGEX)) {
        return "Please enter a valid email address";
      }
    };
  } else if (isRequired) {
    return value => {
      if (!value) {
        return "This is a required field";
      }
    };
  } else if (variant === "EM") {
    return value => {
      if (!value.match(EMAIL_REGEX)) {
        return "Please enter a valid email address";
      }
    };
  } else {
    return () => undefined;
  }
};

const MapseedFormModule = ({
  name,
  idx,
  variant,
  fieldError,
  type,
  isRequired,
  formModule,
  isValid,
  onClickSkipStage,
  onAddAttachment,
  setFieldValue,
}) => {
  const ModuleType = MODULES[type];

  return isFormField(type) ? (
    <React.Fragment>
      <FormControl
        fullWidth={true}
        margin={idx === 0 ? "none" : "normal"}
        variant="outlined"
      >
        <Field
          id={name}
          name={name}
          validate={getValidator(isRequired, variant)}
          component={ModuleType}
          mapseedField={formModule}
          setFieldValue={setFieldValue}
        />
      </FormControl>
      {Boolean(fieldError) && (
        <Typography
          css={css`
            margin-left: 12px;
            margin-top: 4px;
            font-style: italic;
          `}
          variant="caption"
          align="left"
          color="error"
        >
          {fieldError}
        </Typography>
      )}
    </React.Fragment>
  ) : (
    <ModuleType
      mapseedModule={formModule}
      onClickSkipStage={onClickSkipStage}
      onAddAttachment={onAddAttachment}
      isValid={isValid}
    />
  );
};

const usePrevious = value => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });

  return ref.current;
};

const VisibilityTriggerEffect = formikConnect(
  // TODO: Figure out the correct typing to use here.
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  ({ formik: { values }, formModule: { key, options }, children }) => {
    const dispatch = useDispatch();
    const val = values[key];
    const prevVal = usePrevious(val);

    React.useEffect(() => {
      if (options && val !== prevVal) {
        const optionsConfig = options.find(({ value }) => value === val);
        if (optionsConfig && optionsConfig.groupVisibilityTriggers) {
          dispatch(
            updateFormModuleVisibilities(
              optionsConfig.groupVisibilityTriggers,
              true,
            ),
          );
        }
      }
    }, [val, dispatch, options, prevVal]);

    return children;
  },
);

// TODO: Save all form state to Redux on unmount, as a backup.
const BaseForm = ({
  form,
  onSubmit,
  initialValues,
  isSubmitting,
  onChangeStage,
}: BaseFormProps) => {
  const [currentStage, setCurrentStage] = React.useState<number>(0);
  const onClickAdvanceStage = React.useCallback(
    validateField => {
      Promise.all(
        form.stages[currentStage].modules
          .filter(({ type }) => isFormField(type))
          .map(({ key }) => validateField(key)),
      ).then(result => {
        if (!result.some(msg => typeof msg === "string")) {
          if (currentStage < form.stages.length - 1) {
            const newStage = currentStage + 1;
            setCurrentStage(newStage);
            onChangeStage(newStage);
          }
        }
      });
    },
    [currentStage, form, onChangeStage],
  );
  const onClickRetreatStage = React.useCallback(() => {
    if (currentStage > 0) {
      const newStage = currentStage - 1;
      setCurrentStage(newStage);
      onChangeStage(newStage);
    }
  }, [currentStage, onChangeStage]);
  const onClickSkipStage = stageId => setCurrentStage(stageId - 1);
  const layout: Layout = useSelector(layoutSelector);
  const onAddAttachment = React.useCallback(() => null, []);

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ setFieldValue, errors, validateField }) => {
        return (
          <div
            css={css`
              margin-bottom: ${form.stages.length > 1 ? "112px" : 0};
            `}
          >
            {isSubmitting && <LoadingBar />}
            <FormikForm>
              {form.stages[currentStage].modules.map(formModule => {
                const subModules =
                  formModule.type === "groupmodule"
                    ? (formModule.modules as FormModule[])
                    : [formModule];
                const isWithValidationError = subModules.some(({ key }) =>
                  Boolean(errors[key]),
                );

                return (
                  <FieldPaper
                    key={String(formModule.id)}
                    isWithValidationError={isWithValidationError}
                  >
                    {subModules
                      .filter(({ isVisible }) => isVisible)
                      .map((subModule: FormModule, idx) => {
                        const { key, variant, isRequired, type } = subModule;

                        return (
                          <VisibilityTriggerEffect
                            key={idx}
                            formModule={subModule}
                          >
                            <MapseedFormModule
                              idx={idx}
                              name={key}
                              variant={variant}
                              type={type}
                              isRequired={isRequired}
                              formModule={subModule}
                              fieldError={errors[key]}
                              isValid={Boolean(errors[key])}
                              onClickSkipStage={onClickSkipStage}
                              setFieldValue={setFieldValue}
                              onAddAttachment={onAddAttachment}
                            />
                          </VisibilityTriggerEffect>
                        );
                      })}
                  </FieldPaper>
                );
              })}
            </FormikForm>
            {form.stages.length > 0 && (
              <FormStageControlBar
                layout={layout}
                onClickAdvanceStage={() => onClickAdvanceStage(validateField)}
                onClickRetreatStage={onClickRetreatStage}
                currentStage={currentStage}
                numStages={form.stages.length}
              />
            )}
          </div>
        );
      }}
    />
  );
};

export default BaseForm;
