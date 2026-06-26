import Link from "next/link";

interface AuthErrorPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

const COPY = {
  title: "Oturum açma şu anda hazır değil",
  body: "Google OAuth ayarında sunucu taraflı bir sorun var. Sohbeti anonim olarak kullanmaya devam edebilirsin; kayıtlı sohbetler için OAuth anahtarı yenilenmeli.",
  action: "Lab'e dön",
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
        <Link className="orkhon-btn orkhon-btn--primary" href="https://lab.umutkorkmaz.net/orkhon/">
          {COPY.action}
        </Link>
      </section>
    </main>
  );
}
