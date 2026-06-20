import Link from "next/link";

interface AuthErrorPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

const COPY = {
  title: "Oturum acma su anda hazir degil",
  body: "Google OAuth ayarinda sunucu tarafli bir sorun var. Sohbeti anonim olarak kullanmaya devam edebilirsin; kayitli sohbetler icin OAuth anahtari yenilenmeli.",
  action: "Sohbete don",
} as const;

export default async function AuthErrorPage({
  searchParams,
}: AuthErrorPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const error = params?.error;

  return (
    <main className="orkhon-auth-error orkhon-container">
      <section className="orkhon-card orkhon-auth-error__card">
        <span className="orkhon-kicker">Auth</span>
        <h1>{COPY.title}</h1>
        <p>{COPY.body}</p>
        {error && (
          <p className="orkhon-auth-error__code">Kod: {error}</p>
        )}
        <Link className="orkhon-btn orkhon-btn--primary" href="/chat">
          {COPY.action}
        </Link>
      </section>
    </main>
  );
}
