import React from "react";
import UniversalInput, { Field } from "./UniversalInput";

const App: React.FC = () => {
  const config: Field[] = [
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
      id: "email",
      type: "inputEmail",
      label: "Email",
      required: true,
    },
    {
      id: "password",
      type: "inputPassword",
      label: "Password",
      required: true,
    },
  ];

  const onFieldsChange = (e: { [key: string]: string }) => {
    console.log(e);
  };

  return (
    <div className="App">
      <UniversalInput fields={config} onFieldsChange={onFieldsChange} />
    </div>
  );
};

export default App;
