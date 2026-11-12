import LoginClient from "./login_client";
export const metadata = {title:"Smart Tracker"};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const nextPath = typeof params?.next === "string" ? params.next : "/app/dashboard";
  return <LoginClient nextPath={nextPath} />;
}
