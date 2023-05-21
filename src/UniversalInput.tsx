import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ZodError, z } from "zod";
import styles from "./UniversalInput.module.scss";

export interface FieldConfig {
  id: string;
  type: "inputText" | "inputEmail" | "inputPassword";
  label: string;
  defaultValue?: string;
  required?: boolean;
}

interface UniversalFormProps {
  fields: FieldConfig[];
  onFieldsChange: (values: Record<string, string>, isReady: boolean) => void;
}

const createSchema = (field: FieldConfig): z.ZodSchema<string> => {
  switch (field.type) {
    case "inputText":
      return field.required
        ? z.string().nonempty({ message: "Empty field" })
        : z.string();
    case "inputEmail":
      return field.required
        ? z
            .string()
            .email({ message: "Invalid email" })
            .nonempty({ message: "Empty field" })
        : z.string().email({ message: "Invalid email" });
    case "inputPassword":
      return field.required
        ? z
            .string()
            .min(8, { message: "Must be at least 8 characters" })
            .nonempty({ message: "Empty field" })
        : z.string().min(8, { message: "Must be at least 8 characters" });
    default:
      throw new Error("Invalid field type");
  }
};

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
    const allRequiredFieldsFilled = fields
      .filter((field) => field.required)
      .every(
        (field) =>
          values[field.id] !== undefined &&
          values[field.id] !== "" &&
          !errors[field.id]
      );

    onFieldsChange(values, allRequiredFieldsFilled);
  }, [values, fields, onFieldsChange, errors]);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const handleChange = (id: string, field: FieldConfig, value: string) => {
    setEditingField(id);
    if (timeoutId) clearTimeout(timeoutId);

    setTimeoutId(
      window.setTimeout(() => {
        setEditingField(null);
      }, 700)
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
