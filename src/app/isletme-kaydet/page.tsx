import type { Metadata } from "next";
import { ProOnboarding } from "@/components/pro-onboarding/pro-onboarding";

export const metadata: Metadata = {
  title: "İşletmeni Kaydet — Kuafi Pro",
  description:
    "Kuaför, berber ve güzellik salonun için Kuafi Pro hesabını birkaç adımda oluştur. İlk ay ücretsiz.",
};

export default function RegisterBusinessPage() {
  return <ProOnboarding />;
}
