/** @jsx jsx */
import * as React from "react";
import { jsx, css } from "@emotion/core";
import { withTranslation, WithTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import {
  Formik,
  FormikConfig,
  Field,
  Form as FormikForm,
  FormikValues,
  connect as formikConnect,
} from "formik";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import StarIcon from "@material-ui/icons/Star";

import HTMLModule from "../molecules/form-field-modules/html-module";
import TextField from "../molecules/form-field-modules/text-field";
import FileField from "../molecules/form-field-modules/file-field";
import AddressField from "../molecules/form-field-modules/address-field";
import NumberField from "../molecules/form-field-modules/number-field";
import DateField from "../molecules/form-field-modules/date-field";
import TextareaField from "../molecules/form-field-modules/textarea-field";
import RadioField from "../molecules/form-field-modules/radio-field";
import SubmitButtonModule from "../molecules/form-field-modules/submit-button-module";
import SkipStageModule from "../molecules/form-field-modules/skip-stage-module";
import FieldPaper from "../molecules/field-paper";
import FormStageControlBar from "../molecules/form-stage-control-bar";
import { layoutSelector, Layout } from "../../state/ducks/ui";
import {
  FormModule,
  updateFormModuleVisibilities,
  MapseedForm,
  MapseedAttachment,
} from "../../state/ducks/forms";
import { isFormField } from "../../utils/place-utils";
import { isMapDraggedOrZoomedByUser as isMapDraggedOrZoomedByUserSelector } from "../../state/ducks/map";
import { LoadingBar } from "../atoms/imagery";

// TODO:
//  - admin-only fields (??)

type BaseFormProps = {
  attachments?: MapseedAttachment[]; // Forms may or may not support attachment adding.
  setAttachments: (attachments: MapseedAttachment[]) => void;
  form: MapseedForm;
  onSubmit: (values: FormikValues) => void;
  onChangeStage: (newStage: number) => void;
  initialValues: FormikValues;
  handleChange?: (event: React.FormEvent<HTMLFormElement>) => void;
  onValidationError: () => void;
  isTriggeringSubmit?: boolean; // Used for triggering a form submission from outside Formik's children.
} & WithTranslation;

const UnknownModule = () => null;

const BACKEND_MODULES = {
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
  unknownmodule: UnknownModule,
};

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/i;

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
  } else if (variant === "PH") {
    return value => {
      if (!value.match(PHONE_REGEX)) {
        return "Please enter a valid phone number";
      }
    };
  } else {
    // NOTE: An `undefined` response from a field's validator indicates a
    // successful validation.
    return () => undefined;
  }
};

const DRAG_MAP_ERROR = "__DRAG_MAP_ERROR__";
const getErrorInfo = error => {
  if (error === DRAG_MAP_ERROR) {
    return {
      i18nextKey: "dragMapErrorMsg",
      msg: "Please drag and zoom the map to set a location for your submission",
    };
  } else {
    return {
      i18nextKey: "fieldErrorMsg",
      msg: "Please complete the field(s) highlighted below",
    };
  }
};

const ValidationErrors = ({ errors, t }) => {
  return (
    <div
      css={css`
        background-color: #fff2f3;
        border-radius: 4px;
        border: 2px solid #ffdadc;
        padding: 8px;
        margin-bottom: 24px;
      `}
    >
      <Typography
        variant="body2"
        style={{
          color: "#444",
        }}
      >
        {t(
          "validationErrorsHeader",
          "Your submission is looking good, but we need a little more information before we can continue:",
        )}
      </Typography>
      <List>
        {Object.values(errors).map((error, i) => {
          const { i18nextKey, msg } = getErrorInfo(error);

          return (
            <ListItem key={i}>
              <ListItemIcon
                style={{
                  minWidth: "unset",
                  paddingRight: "8px",
                }}
              >
                <StarIcon
                  style={{
                    color: "#aaa",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                style={{
                  color: "#666",
                  fontStyle: "italic",
                }}
                primary={t(i18nextKey, msg)}
                primaryTypographyProps={{
                  variant: "body1",
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
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
  attachments,
  setAttachments,
  setFieldValue,
}) => {
  const BackendModule = BACKEND_MODULES[type];

  // NOTE: A `form field` is a form control which ultimately produces a value
  // that will be managed by Formik. A `form module` is a component which
  // produces a form side effect, such as skipping a stage, adding an
  // attachment, etc. This is different from the terminology used on the
  // backend, where all form components are `modules`.  We make that distinction
  // here.
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
          component={BackendModule}
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
    <BackendModule
      mapseedModule={formModule}
      onClickSkipStage={onClickSkipStage}
      isValid={isValid}
      attachments={attachments}
      setAttachments={setAttachments}
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
    const currentVal = values[key];
    const previousVal = usePrevious(currentVal);

    React.useEffect(() => {
      // We're making the assumption that visibility triggers will only exist
      // on field controls with `options` (dropdowns, radios, checkboxes).
      if (options && currentVal !== previousVal) {
        const { groupVisibilityTriggers, value: triggerValue } =
          options.find(({ groupVisibilityTriggers }) =>
            Boolean(groupVisibilityTriggers),
          ) || {};

        if (groupVisibilityTriggers) {
          dispatch(
            updateFormModuleVisibilities(
              groupVisibilityTriggers,
              triggerValue === currentVal,
            ),
          );
        }
      }
    }, [dispatch, options, previousVal, currentVal]);

    return children;
  },
);

const isRaisedModule = type =>
  !["submitbuttonmodule", "skipstagemodule"].includes(type);

// TODO: Save all form state to Redux on unmount, as a backup.
const BaseForm = ({
  form,
  isTriggeringSubmit = false,
  onSubmit,
  initialValues,
  onChangeStage,
  attachments,
  setAttachments,
  handleChange,
  onValidationError,
  t,
}: BaseFormProps) => {
  const layout: Layout = useSelector(layoutSelector);
  const [currentStage, setCurrentStage] = React.useState<number>(0);
  const isMapDraggedOrZoomedByUser = useSelector(
    isMapDraggedOrZoomedByUserSelector,
  );
  const validateAdditional = React.useCallback(() => {
    const additionalErrors = {};

    if (
      form.stages[currentStage].validateGeometry &&
      !isMapDraggedOrZoomedByUser
    ) {
      additionalErrors[DRAG_MAP_ERROR] = DRAG_MAP_ERROR;
    }

    return additionalErrors;
  }, [currentStage, isMapDraggedOrZoomedByUser]);
  const onClickAdvanceStage = React.useCallback(
    validateField => {
      // TODO: This validation routine produces a slight but noticeable lag
      // when advancing stages, due I think to Formik's internal use of
      // `dispatch`. Can we speed this up somehow?
      Promise.all(
        form.stages[currentStage].modules
          // TODO: Maybe the duck should provide a way of selecting all
          // modules, including nested modules inside groups?
          .reduce(
            (modules, module) => {
              return modules.concat(
                module.type === "groupmodule"
                  ? (module.modules as FormModule[])
                  : module,
              );
            },
            [] as FormModule[],
          )
          .filter(({ type, isVisible }) => isVisible && isFormField(type))
          .map(({ key }) => {
            return validateField(key);
          }),
      ).then(errorResult => {
        // The presence of at least one error message in `errorResult`
        // indicates that the validator encountered error(s).
        const isWithErrors = errorResult.some(msg => typeof msg === "string");

        if (!isWithErrors && currentStage < form.stages.length - 1) {
          const newStage = currentStage + 1;
          setCurrentStage(newStage);
          onChangeStage(newStage);
        }
      });
    },
    [currentStage, form, onChangeStage, isMapDraggedOrZoomedByUser, layout],
  );
  const onClickRetreatStage = React.useCallback(() => {
    if (currentStage > 0) {
      const newStage = currentStage - 1;
      setCurrentStage(newStage);
      onChangeStage(newStage);
    }
  }, [currentStage, onChangeStage]);
  const onClickSkipStage = stageId => {
    const newStage = stageId - 1;
    setCurrentStage(newStage);
    onChangeStage(newStage);
  };

  return (
    <React.Fragment>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        validate={validateAdditional}
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({
          setFieldValue,
          errors,
          validateField,
          isSubmitting,
          isValid,
          submitForm,
        }) => {
          React.useEffect(() => {
            !isValid && Object.keys(errors).length > 0 && onValidationError();
          }, [isValid, onValidationError, errors]);
          React.useEffect(() => {
            isTriggeringSubmit && submitForm();
          }, [isTriggeringSubmit, submitForm]);

          return (
            <div
              css={css`
                margin-bottom: ${form.stages.length > 1 ? "112px" : 0};
                opacity: ${isSubmitting ? 0.4 : 1};
              `}
            >
              {isSubmitting && <LoadingBar />}
              {!isValid && <ValidationErrors errors={errors} t={t} />}
              <FormikForm onChange={handleChange}>
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
                      raised={isRaisedModule(formModule.type)}
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
                                attachments={attachments}
                                setAttachments={setAttachments}
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
    </React.Fragment>
  );
};

export default withTranslation("BaseForm")(BaseForm);
