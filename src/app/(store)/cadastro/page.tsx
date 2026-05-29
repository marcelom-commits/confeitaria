import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar Conta",
  description: "Crie sua conta na Doce Encanto e tenha acesso a pedidos, endereços e muito mais.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf6] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
          novo cadastro
        </p>
        <h1 className="mt-4 font-serif text-4xl text-stone-900">Criar conta</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Cadastro por e-mail e senha com criação automática do perfil do cliente.
        </p>
        <RegisterForm />
      </div>
    </main>
  );
}