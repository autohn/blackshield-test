import React, { useState } from "react";

export interface Field {
  id: string;
  type: "inputText" | "inputEmail" | "inputPassword";
  label: string;
  defaultValue?: string;
  required?: boolean;
}

interface FormProps {
  fields: Field[];
  onFieldsChange: (values: { [key: string]: string }) => void;
}

const Form: React.FC<FormProps> = ({ fields, onFieldsChange }) => {
  const [values, setValues] = useState<{ [key: string]: string }>(
    fields.reduce<{ [key: string]: string }>((prev, field) => {
      if (field.defaultValue) {
        prev[field.id] = field.defaultValue;
      }
      return prev;
    }, {})
  );

  const handleChange = (id: string, value: string) => {
    setValues({
      ...values,
      [id]: value,
    });
    onFieldsChange({
      ...values,
      [id]: value,
    });
  };

  return (
    <form>
      {fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id}>{field.label}</label>
          <input
            type={field.type.replace("input", "")}
            id={field.id}
            value={values[field.id] || ""}
            required={field.required}
            onChange={(e) => handleChange(field.id, e.target.value)}
          />
        </div>
      ))}
    </form>
  );
};

export default Form;
