export const REVIEW_TAG_OPTIONS = [
  "TOS Update",
  "Privacy Policy Change",
  "Community Guidelines Update",
  "Content Policy Revision",
  "Monetization Policy Change",
  "Enforcement Shift (Stricter)",
  "Enforcement Shift (Looser)",
  "Shadowban Reports",
  "Account Suspension Policy",
  "Appeal Process Review",
  "Proof of Training Data Disclosure",
  "No Training on User Data",
  "Opt-Out of AI Training Available",
  "AI Training Consent Required",
  "Synthetic Data Usage",
  "Model Update / Version Change",
  "AI Output Labeling Present",
  "AI Output Not Disclosed",
  "Human vs AI Content Labeling",
  "Dataset Transparency Score",
  "Artist Credit Required",
  "Artist Credit Missing",
  "Copyright Claimed",
  "DMCA Takedown History",
  "Licensed Content Only",
  "User-Owned Content Allowed",
  "AI Art Allowed",
  "AI Art Restricted",
  "Style Imitation Policy",
  "Training on User Art Allowed",
  "Training on User Art Prohibited",
  "Data Sold to Third Parties",
  "No Data Selling Claimed",
  "End-to-End Encryption",
  "Data Retention Policy (Short)",
  "Data Retention Policy (Long)",
  "User Data Deletion Available",
  "Account Deletion Difficult",
  "Tracking Cookies Used",
  "Minimal Data Collection",
  "Cross-Site Tracking",
  "Automated Moderation Heavy",
  "Human Moderation Present",
  "Over-Moderation Reported",
  "Under-Moderation Reported",
  "Bias in Moderation Alleged",
  "Transparent Enforcement Logs",
  "Lack of Transparency in Enforcement",
  "Content Removal Speed (Fast)",
  "Content Removal Speed (Slow)",
  "Ads Heavy",
  "Ads Light",
  "Personalized Ads",
  "No Ads Option",
  "Paid Subscription Required",
  "Freemium Model",
  "Paywalled Content",
  "Creator Revenue Sharing",
  "Revenue Transparency",
  "Trustworthy Platform",
  "Controversial Policy History",
  "Frequent Policy Changes",
  "User-Friendly Policies",
  "Developer Friendly",
  "API Access Restricted",
  "Open Platform",
  "Walled Garden",
  "Account Lockout Issues",
] as const;

export type ReviewTag = (typeof REVIEW_TAG_OPTIONS)[number];

const REVIEW_TAG_SET = new Set<string>(REVIEW_TAG_OPTIONS);

export function normalizeReviewTags(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const item of input) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed || !REVIEW_TAG_SET.has(trimmed) || seen.has(trimmed)) continue;
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
}
