import { proxyUser } from "@/lib/userBackend";

// The backend enforces SUPER_ADMIN access using the current client session.
export async function GET(request: Request) {
  return proxyUser(`/api/v1/admin/organisations${new URL(request.url).search}`);
}
