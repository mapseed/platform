import React from "react";

type SubmitButtonModuleProps = {
  moduleId: number;
  content: string;
};

const SubmitButtonModule = (props: SubmitButtonModuleProps) => {
  return <button type="submit">SUBMIT</button>;
};

export default SubmitButtonModule;
