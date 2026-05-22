import Link from "next/link";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { HeaderUserMenu } from "./header-user-menu";

const navigation = [
  { href: "/#categorias", label: "Categorias" },
  { href: "/#destaques", label: "Destaques" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/admin", label: "Operacao" },
];

async function getCartItemCount(): Promise<number> {
  try {
    const cookieStore = await cookies();
    const cartToken = cookieStore.get("cart_token")?.value;
    if (!cartToken) return 0;

    const cart = await prisma.cart.findUnique({
      where: { cartToken },
      select: { _count: { select: { items: true } } },
    });
    return cart?._count.items ?? 0;
  } catch {
    return 0;
  }
}

export async function Header() {
  const session = await auth();
  const cartCount = await getCartItemCount();

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-lg font-bold text-rose-700">
            DE
          </div>
          <div>
            <p className="font-serif text-xl text-stone-900">Doce Encanto</p>
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
              confeitaria artesanal
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigation
            .filter((item) => item.href !== "/admin" || session?.user?.role === "ADMIN")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-stone-600 transition hover:text-rose-700"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <HeaderUserMenu
              userName={session.user.name}
              role={session.user.role ?? "CUSTOMER"}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 sm:inline-flex"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="hidden rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-rose-600 hover:text-rose-700 sm:inline-flex"
              >
                Cadastrar
              </Link>
            </>
          )}
          <Link
            href="/carrinho"
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            Carrinho
            {cartCount > 0 ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
