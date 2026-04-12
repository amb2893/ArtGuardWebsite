"use client";

import { REVIEW_TAG_OPTIONS } from "@/lib/reviewTags";

interface Props {
  selectedTags: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  idPrefix?: string;
}

export default function ReviewTagSelector({
  selectedTags,
  onChange,
  disabled = false,
  idPrefix = "review-tag",
}: Props) {
  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
      return;
    }

    onChange([...selectedTags, tag]);
  }

  return (
    <details className="rating-review-tags-picker">
      <summary className="rating-review-tags-summary">
        Tags {selectedTags.length > 0 ? `(${selectedTags.length} selected)` : "(optional)"}
      </summary>
      <div className="rating-review-tags-grid">
        {REVIEW_TAG_OPTIONS.map((tag) => {
          const checked = selectedTags.includes(tag);
          const inputId = `${idPrefix}-${tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

          return (
            <label key={tag} className={`rating-tag-option ${checked ? "rating-tag-option-active" : ""}`} htmlFor={inputId}>
              <input
                id={inputId}
                type="checkbox"
                checked={checked}
                onChange={() => toggleTag(tag)}
                disabled={disabled}
              />
              <span>{tag}</span>
            </label>
          );
        })}
      </div>
    </details>
  );
}
