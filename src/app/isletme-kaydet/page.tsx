import type { Metadata } from "next";
import { ProOnboarding } from "@/components/pro-onboarding/pro-onboarding";

export const metadata: Metadata = {
  title: "İşletmeni Kaydet — Looea Pro",
  description:
    "Kuaför, berber ve güzellik salonun için Looea Pro hesabını birkaç adımda oluştur. İlk ay ücretsiz.",
};

export default function RegisterBusinessPage() {
  return <ProOnboarding />;
}
