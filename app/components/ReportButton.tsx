"use client";

import { useState } from "react";

type ContentType =
  | "user"
  | "article"
  | "article_comment"
  | "forum_post"
  | "forum_comment"
  | "review";

const TYPE_LABELS: Record<ContentType, string> = {
  user: "User",
  article: "Article",
  article_comment: "Comment",
  forum_post: "Post",
  forum_comment: "Comment",
  review: "Review",
};

interface ReportButtonProps {
  contentType: ContentType;
  contentId: number;
  authorId?: number;
  authorUsername?: string;
  label?: string;
}

async function submitReport(contentType: string, contentId: number, reason: string) {
  const res = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, contentId, reason }),
    credentials: "same-origin",
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json?.error || "Failed to submit report.");
  }
}

export default function ReportButton({
  contentType,
  contentId,
  authorId,
  authorUsername,
  label,
}: ReportButtonProps) {
  const isUserReport = contentType === "user";
  const canReportAuthor = !isUserReport && authorId != null;

  const [open, setOpen] = useState(false);
  const [reportContent, setReportContent] = useState(true);
  const [reportAuthor, setReportAuthor] = useState(false);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function close() {
    setOpen(false);
    setStatus("idle");
    setReason("");
    setErrorMsg("");
    setReportContent(true);
    setReportAuthor(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isUserReport && !reportContent && !reportAuthor) {
      setErrorMsg("Select at least one thing to report.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      if (isUserReport) {
        await submitReport("user", contentId, reason);
      } else {
        const tasks: Promise<void>[] = [];
        if (reportContent) tasks.push(submitReport(contentType, contentId, reason));
        if (reportAuthor && authorId != null) tasks.push(submitReport("user", authorId, reason));
        await Promise.all(tasks);
      }
      setStatus("success");
      setReason("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit report. Please try again.");
      setStatus("error");
    }
  }

  const nothingSelected = !isUserReport && !reportContent && !reportAuthor;

  return (
    <>
      <button
        type="button"
        className="report-btn"
        onClick={() => setOpen(true)}
        aria-label={`Report this ${TYPE_LABELS[contentType]}`}
      >
        {label ?? "Report"}
      </button>

      {open && (
        <div className="report-modal-overlay" onClick={close} role="presentation">
          <div
            className="report-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
          >
            <h2 id="report-modal-title" className="report-modal-title">
              {isUserReport ? `Report User` : `Report ${TYPE_LABELS[contentType]}`}
            </h2>

            {status === "success" ? (
              <div>
                <p style={{ color: "var(--color-success)", fontWeight: 600, marginBottom: 20 }}>
                  Report submitted. Our team will review it — thank you.
                </p>
                <button type="button" className="btn-secondary" onClick={close}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="report-modal-form">
                {canReportAuthor && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>What would you like to report?</p>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={reportContent}
                        onChange={(e) => setReportContent(e.target.checked)}
                        style={{ width: "auto" }}
                      />
                      This {TYPE_LABELS[contentType]}
                    </label>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={reportAuthor}
                        onChange={(e) => setReportAuthor(e.target.checked)}
                        style={{ width: "auto" }}
                      />
                      The author{authorUsername ? ` (@${authorUsername})` : ""}
                    </label>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label htmlFor="report-reason" style={{ fontWeight: 600 }}>
                    Reason for reporting
                  </label>
                  <textarea
                    id="report-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the issue..."
                    rows={4}
                    required
                    minLength={5}
                    className="article-comment-textarea"
                    style={{ width: "100%" }}
                  />
                </div>

                {status === "error" && <p className="form-error">{errorMsg}</p>}
                {nothingSelected && <p className="form-error">Select at least one thing to report.</p>}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    className="btn-danger"
                    disabled={status === "loading" || reason.trim().length < 5 || nothingSelected}
                  >
                    {status === "loading" ? "Submitting..." : "Submit Report"}
                  </button>
                  <button
                    type="button"
                    className="article-comment-action-btn-secondary"
                    onClick={close}
                    disabled={status === "loading"}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
