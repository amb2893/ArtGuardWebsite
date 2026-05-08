import { redirect } from "next/navigation";

export default function CaseHistoryRedirect() {
  redirect("/admin/reports?tab=closed");
}
