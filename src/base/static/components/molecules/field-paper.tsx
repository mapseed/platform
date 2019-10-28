import React from "react";
import Paper from "@material-ui/core/Paper";

type FieldPaperProps = {
  children: React.ReactNode;
  isWithValidationError: boolean;
};

const FieldPaper = ({ children, isWithValidationError }: FieldPaperProps) => {
  return (
    <Paper
      style={{
        backgroundColor: isWithValidationError ? "#f9d7d9" : "rgb(239,239,239)",
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
