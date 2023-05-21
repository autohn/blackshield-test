import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ZodError, z } from "zod";
import styles from "./UniversalForm.module.scss";

export interface FieldConfig {
  id: string;
  type: "inputText" | "inputEmail" | "inputPassword";
  label: string;
  defaultValue?: string;
  required?: boolean;
}

export interface OnFieldsChangeParams {
  values: Record<string, string>;
  isReady: boolean;
}

interface UniversalFormProps {
  fields: FieldConfig[];
  onFieldsChange: ({ values, isReady }: OnFieldsChangeParams) => void;
}

const createFieldValidation = (field: FieldConfig): z.ZodSchema<string> => {
  let schema = z.string().max(100);
  if (field.required) schema = schema.nonempty({ message: "Required" });

  switch (field.type) {
    case "inputEmail":
      schema = schema.email({ message: "Invalid email" });
      break;
    case "inputPassword":
      schema = schema.min(8, { message: "Must be at least 8 characters" });
      break;
  }
  return schema;
};

//main form component
const UniversalForm: React.FC<UniversalFormProps> = ({
  fields,
  onFieldsChange,
}) => {
  const defaultValues = useMemo(() => {
    return fields.reduce<Record<string, string>>((acc, field) => {
      if (field.defaultValue) acc[field.id] = field.defaultValue;
      return acc;
    }, {});
  }, [fields]);

  const [values, setValues] = useState<Record<string, string>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  useEffect(() => {
    const isReady = fields.every((field) => {
      const fieldValue = values[field.id] || "";
      const error = errors[field.id];
      return !field.required || (fieldValue !== "" && !error);
    });

    onFieldsChange({ values, isReady });
  }, [values, fields, onFieldsChange, errors]);

  const handleChange = (id: string, field: FieldConfig, value: string) => {
    setEditingField(id); //don't throw error while user is typing
    if (timeoutId) clearTimeout(timeoutId);

    setTimeoutId(
      window.setTimeout(() => {
        setEditingField(null);
      }, 500)
    );

    const schema = createFieldValidation(field);
    try {
      schema.parse(value);
      setErrors((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      const error = err as ZodError;
      setErrors((prev) => ({ ...prev, [id]: error.errors[0].message }));
    }

    setValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <form className={styles.universalForm}>
      {fields.map((field) => (
        <InputField
          key={field.id}
          {...field}
          value={values[field.id] || ""}
          error={editingField !== field.id ? errors[field.id] : undefined}
          onChange={(value) => handleChange(field.id, field, value)}
        />
      ))}
    </form>
  );
};

//auxiliary form component for simplicity and optimisation
const InputField: React.FC<
  FieldConfig & {
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }
> = React.memo(({ id, label, type, required, value, onChange, error }) => {
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <div className={styles.inputElement}>
      <label htmlFor={id}>
        {label}
        {required && "*"}
      </label>
      <input
        type={type.replace("input", "")}
        id={id}
        value={value}
        required={required}
        onChange={handleInputChange}
        placeholder="Enter value"
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
});

export default UniversalForm;
