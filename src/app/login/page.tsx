import LoginClient from "./login_client";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string | string[] };
}) {
  const nextPath = typeof searchParams?.next === "string" ? searchParams.next : "/app";
  return <LoginClient nextPath={nextPath} />;
}
