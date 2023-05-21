import React, { useState } from "react";
import UniversalForm, { FieldConfig } from "./UniversalInput";

const App: React.FC = () => {
  const fields: FieldConfig[] = [
    {
      id: "first_name",
      type: "inputText",
      label: "First Name",
      defaultValue: "Some first name",
    },
    {
      id: "last_name",
      type: "inputText",
      label: "Last Name",
    },
    {
      id: "last_name2",
      type: "inputText",
      label: "Last Name",
      required: true,
    },
    {
      id: "email",
      type: "inputEmail",
      label: "Email",
      required: true,
    },
    {
      id: "email2",
      type: "inputEmail",
      label: "Email",
    },
    {
      id: "password",
      type: "inputPassword",
      label: "Password",
      required: true,
    },
    {
      id: "password2",
      type: "inputPassword",
      label: "Password",
    },
  ];

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isReadyForSubmit, setIsReadyForSubmit] = useState(false);

  const handleFieldsChange = (
    values: Record<string, string>,
    isReady: boolean
  ) => {
    setFormValues(values);
    setIsReadyForSubmit(isReady);
  };

  const handleSubmit = () => {
    console.log(formValues);
  };

  return (
    <div className="App">
      <UniversalForm fields={fields} onFieldsChange={handleFieldsChange} />
      <button onClick={handleSubmit} disabled={!isReadyForSubmit}>
        Submit
      </button>
    </div>
  );
};

export default App;
