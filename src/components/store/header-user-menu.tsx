"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type Props = {
  userName: string | null | undefined;
  role: string;
};

export function HeaderUserMenu({ userName, role }: Props) {
  return (
    <>
      <Link
        href={role === "ADMIN" ? "/admin" : "/conta"}
        className="hidden rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 sm:inline-flex"
      >
        {role === "ADMIN" ? "Painel Admin" : "Minha Conta"}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="hidden rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-red-400 hover:text-red-600 sm:inline-flex"
      >
        Sair ({userName ?? role})
      </button>
    </>
  );
}
