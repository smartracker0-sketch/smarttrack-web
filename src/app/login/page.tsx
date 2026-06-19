import LoginClient from "./login_client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const nextPath = typeof params?.next === "string" ? params.next : "/app";
  return <LoginClient nextPath={nextPath} />;
}
