import React from "react";
import Paper from "@material-ui/core/Paper";

type FieldPaperProps = {
  children: React.ReactNode;
  isWithValidationError: boolean;
  raised: boolean;
};

const FieldPaper = ({
  children,
  isWithValidationError,
  raised,
}: FieldPaperProps) => {
  return (
    <Paper
      elevation={raised ? 1 : 0}
      style={{
        background: raised ? "initial" : "none",
        backgroundColor: isWithValidationError
          ? "#f9d7d9"
          : raised
          ? "rgb(239,239,239)"
          : "unset",
        padding: "16px",
        marginBottom: "16px",
      }}
      square={true}
    >
      {children}
    </Paper>
  );
};

export default FieldPaper;
