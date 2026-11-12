import { proxyUser } from "@/lib/userBackend";
export async function PUT(request: Request) { return proxyUser("/api/v1/users/me", { method: "PUT", body: await request.text() }); }
