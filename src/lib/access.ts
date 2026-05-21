import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

export async function requireUserApi() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ ok: false, message: "Nao autorizado." }, { status: 401 }) };
  }
  return { session };
}

export async function requireAdminApi() {
  const userResult = await requireUserApi();
  if ("error" in userResult) return userResult;
  if (userResult.session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ ok: false, message: "Acesso negado." }, { status: 403 }) };
  }
  return userResult;
}
