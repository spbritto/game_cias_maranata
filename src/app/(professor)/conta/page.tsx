import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Starfield } from "@/components/jogador/starfield";
import { ChangePasswordForm } from "@/components/professor/change-password-form";
import { getCurrentTeacher } from "@/lib/auth";

export const metadata: Metadata = { title: "Minha conta" };

export default function ContaPage() {
  return (
    <>
      <Starfield />
      <main className="mx-auto w-full max-w-sm px-5 py-10">
        <Link
          href="/painel"
          className="inline-flex min-h-touch items-center gap-2 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Painel
        </Link>

        <h1 className="mt-4 text-3xl font-semibold text-ink">Minha conta</h1>

        {/* getCurrentTeacher() lê a sessão: sob Suspense, para o cabeçalho
            estático acima não ficar preso ao request. */}
        <Suspense fallback={<InfoSkeleton />}>
          <AccountInfo />
        </Suspense>

        <section className="mt-8 flex flex-col gap-5 border-t border-line pt-8">
          <div>
            <h2 className="text-lg font-semibold text-ink">Alterar senha</h2>
            <p className="mt-1 text-sm text-ink-subtle">
              Você continua conectado neste aparelho depois de trocar.
            </p>
          </div>
          <ChangePasswordForm />
        </section>
      </main>
    </>
  );
}

async function AccountInfo() {
  const teacher = await getCurrentTeacher();
  return (
    <p className="mt-2 text-sm text-ink-muted">
      {teacher.name} · {teacher.email}
    </p>
  );
}

function InfoSkeleton() {
  return (
    <div className="mt-2 h-4 w-48 animate-pulse rounded-pill bg-night-800" />
  );
}
