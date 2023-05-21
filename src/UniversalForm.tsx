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

//field validation settings
const createSchema = (field: FieldConfig): z.ZodSchema<string> => {
  switch (field.type) {
    case "inputText":
      return field.required
        ? z.string().max(100).nonempty({ message: "Empty field" })
        : z.string().max(100);
    case "inputEmail":
      return field.required
        ? z
            .string()
            .max(100)
            .email({ message: "Invalid email" })
            .nonempty({ message: "Empty field" })
        : z.string().max(100).email({ message: "Invalid email" });
    case "inputPassword":
      return field.required
        ? z
            .string()
            .max(100)
            .min(8, { message: "Must be at least 8 characters" })
            .nonempty({ message: "Empty field" })
        : z
            .string()
            .max(100)
            .min(8, { message: "Must be at least 8 characters" });
    default:
      throw new Error("Invalid field type");
  }
};

//main form component
const UniversalForm: React.FC<UniversalFormProps> = ({
  fields,
  onFieldsChange,
}) => {
  const defaultValues = useMemo(() => {
    return fields.reduce<{ [key: string]: string }>((prev, field) => {
      if (field.defaultValue) {
        prev[field.id] = field.defaultValue;
      }
      return prev;
    }, {});
  }, [fields]);

  const [values, setValues] = useState<{ [key: string]: string }>(
    defaultValues
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const isReady = fields
      .filter((field) => field.required)
      .every(
        (field) =>
          values[field.id] !== undefined &&
          values[field.id] !== "" &&
          !errors[field.id]
      );

    onFieldsChange({ values: values, isReady: isReady });
  }, [values, fields, onFieldsChange, errors]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const handleChange = (id: string, field: FieldConfig, value: string) => {
    setEditingField(id); //don't throw error while user is typing
    if (timeoutId) clearTimeout(timeoutId);

    setTimeoutId(
      window.setTimeout(() => {
        setEditingField(null);
      }, 500)
    );

    const schema = createSchema(field);
    try {
      schema.parse(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: "",
      }));
    } catch (err) {
      const validationError = err as ZodError;
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: validationError.errors[0].message,
      }));
    }
    setValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };

  return (
    <form className={styles.universalInput}>
      {fields.map((field) => (
        <Field
          key={field.id}
          {...field}
          value={values[field.id]}
          error={editingField !== field.id ? errors[field.id] : undefined}
          onChange={(value) => handleChange(field.id, field, value)}
        />
      ))}
    </form>
  );
};

//auxiliary form component for simplicity and optimisation
const Field: React.FC<
  FieldConfig & {
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }
> = React.memo(({ id, label, type, required, value, onChange, error }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className={styles.inputElement}>
      <label htmlFor={id}>{label + (required ? "*" : "")}</label>
      <input
        type={type.replace("input", "")}
        id={id}
        value={value || ""}
        required={required}
        onChange={handleChange}
        placeholder={"Enter value"}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
});

export default UniversalForm;
