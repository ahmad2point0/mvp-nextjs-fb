export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

export const PASSWORD_REQUIREMENTS = [
  `${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} characters`,
  "At least one uppercase letter (A–Z)",
  "At least one lowercase letter (a–z)",
  "At least one number (0–9)",
  "At least one special character (!@#$%^&* etc.)",
];

const UPPERCASE = /[A-Z]/;
const LOWERCASE = /[a-z]/;
const NUMBER = /\d/;
const SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (password.length > PASSWORD_MAX_LENGTH)
    return `Password must be no more than ${PASSWORD_MAX_LENGTH} characters`;
  if (!UPPERCASE.test(password))
    return "Password must contain at least one uppercase letter";
  if (!LOWERCASE.test(password))
    return "Password must contain at least one lowercase letter";
  if (!NUMBER.test(password))
    return "Password must contain at least one number";
  if (!SPECIAL.test(password))
    return "Password must contain at least one special character (!@#$%^&*...)";
  return null;
}
