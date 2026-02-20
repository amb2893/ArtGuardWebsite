export type PasswordIssue =
  | "too_short"
  | "no_upper"
  | "no_lower"
  | "no_number"
  | "no_symbol";

export function getPasswordIssues(pw: string): PasswordIssue[] {
  const issues: PasswordIssue[] = [];

  if (pw.length < 8) issues.push("too_short");
  if (!/[a-z]/.test(pw)) issues.push("no_lower");
  if (!/[A-Z]/.test(pw)) issues.push("no_upper");
  if (!/[0-9]/.test(pw)) issues.push("no_number");
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push("no_symbol");

  return issues;
}

export function passwordIsStrong(pw: string) {
  return getPasswordIssues(pw).length === 0;
}

export function passwordIssueMessage(issue: PasswordIssue) {
  switch (issue) {
    case "too_short":
      return "At least 8 characters";
    case "no_lower":
      return "At least one lowercase letter";
    case "no_upper":
      return "At least one uppercase letter";
    case "no_number":
      return "At least one number";
    case "no_symbol":
      return "At least one symbol";
  }
}