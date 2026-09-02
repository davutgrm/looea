"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="tr">
      <body>
        <div style={{ display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "sans-serif", textAlign: "center" }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Looea</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Bir şeyler ters gitti.</h1>
            <p style={{ color: "#666", marginBottom: 24 }}>Beklenmedik bir hata oluştu. Lütfen tekrar dene.</p>
            <button
              type="button"
              onClick={reset}
              style={{ borderRadius: 999, background: "#a21cdb", color: "#fff", padding: "10px 24px", fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              Tekrar dene
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
