const MAX_TEXT_LENGTH = parseInt(
  import.meta.env.VITE_MAX_TEXT_LENGTH || '5000',
  10
);

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateDocumentationText(text: string): ValidationResult {
  const trimmedText = text.trim();

  if (trimmedText.length === 0 || trimmedText.length < 8) {
    return {
      isValid: false,
      errorMessage: 'Bitte beschreibe kurz, was du für den Bewohner gemacht hast.',
    };
  }

  if (trimmedText.length > MAX_TEXT_LENGTH) {
    console.warn(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
  }

  return {
    isValid: true,
  };
}

export function validatePatientName(name: string): ValidationResult {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Bitte gib einen Bewohnernamen ein.',
    };
  }

  return {
    isValid: true,
  };
}
