import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "../../../lib/auth";
import { isAdmin } from "../../../lib/db";
import NewArticleForm from "./NewArticleForm";

export default async function NewArticlePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  const user = verifyToken(token);
  if (!user) redirect("/login");

  if (!(await isAdmin(user.id))) redirect("/");

  return <NewArticleForm />;
}