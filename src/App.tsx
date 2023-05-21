import React, { useState } from "react";
import UniversalForm, {
  FieldConfig,
  OnFieldsChangeParams,
} from "./UniversalForm";
import styles from "./App.module.scss";

const App: React.FC = () => {
  const fields: FieldConfig[] = [
    {
      id: "first_name",
      type: "inputText",
      label: "First Name",
      defaultValue: "Some first name",
      required: true,
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

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isReadyForSubmit, setIsReadyForSubmit] = useState(false);

  const handleFieldsChange = ({ values, isReady }: OnFieldsChangeParams) => {
    setFormValues(values);
    setIsReadyForSubmit(isReady);
  };

  const handleSubmit = () => {
    console.log(formValues);
    alert(JSON.stringify(formValues));
  };

  return (
    <div className={"App " + styles.app}>
      <div className={styles.centeredOuterForm}>
        {/*         <div className={styles.logo}>💁🏻‍♀️</div> */}
        <img
          src="woman-tipping-hand.png"
          alt="woman-tipping-hand"
          width="100"
          height="100"
        ></img>
        <UniversalForm fields={fields} onFieldsChange={handleFieldsChange} />
        <button onClick={handleSubmit} disabled={!isReadyForSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default App;
