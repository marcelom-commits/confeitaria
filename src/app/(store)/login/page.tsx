import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf6] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-700">
          area do cliente
        </p>
        <h1 className="mt-4 font-serif text-4xl text-stone-900">Entrar</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Login por e-mail e senha com Auth.js e usuarios persistidos no banco.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}