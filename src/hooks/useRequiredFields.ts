"use client";

import { useState, useCallback } from "react";

type Errors<T> = Partial<Record<keyof T, string>>;

export function useRequiredFields<T extends Record<string, unknown>>() {
  const [errors, setErrors] = useState<Errors<T>>({});

  const validate = useCallback(
    (
      values: T,
      requiredFields: (keyof T)[] = [],
      arrayFields: (keyof T)[] = [] // ← tambahan: validasi minimal 1 item
    ) => {
      const newErrors: Errors<T> = {};
      const cleanedData: Partial<T> = {};

      // Clean and validate all fields
      Object.keys(values).forEach((key) => {
        const field = key as keyof T;
        const value = values[field];

        // Skip null or empty string values
        if (value != null && String(value).trim() !== "") {
          cleanedData[field] = value;
        }
      });

      // Validasi field wajib biasa
      requiredFields.forEach((field) => {
        const value = values[field];
        if (value == null || String(value).trim() === "") {
          newErrors[field] = `${String(field)} wajib diisi.`;
        }
      });

      // Validasi field array minimal satu item
      arrayFields.forEach((field) => {
        const value = values[field];
        if (!Array.isArray(value) || value.length === 0) {
          newErrors[field] = `${String(field)} minimal harus memiliki 1 item.`;
        }
      });

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;

      return {
        isValid: isValid,
        data: cleanedData as T,
        errors: newErrors,
      };
    },
    []
  );

  return { errors, validate, setErrors };
}
