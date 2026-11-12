import { notFound } from "next/navigation";
import RecordsPage from "@/components/signature/RecordsPage";
import { pageAtPath } from "@/components/signature/navigation";
export default async function AdminSignaturePage({
  params,
}: {
  params: Promise<{ signature: string[] }>;
}) {
  const { signature } = await params;
  const path = "/admin/" + signature.join("/"),
    page = pageAtPath(path);
  if (!page || page.href !== path || !page.admin) notFound();
  return <RecordsPage id={page.id} />;
}
