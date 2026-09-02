"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeOnboarding } from "@/lib/actions/customer";
import { getStoredGuestSegment } from "@/lib/guest-segment";
import { OnboardingShell } from "./onboarding-shell";
import { SegmentStep } from "./steps/segment-step";
import { BirthDateStep, isValidBirthDate, type BirthDateValue } from "./steps/birth-date-step";
import { CityStep } from "./steps/city-step";
import { PhoneStep, isValidPhone } from "./steps/phone-step";
import { StyleStep, type StyleOption } from "./steps/style-step";
import { PhotoStep } from "./steps/photo-step";

const TOTAL_STEPS = 6;

type Segment = "MALE" | "FEMALE";

type FormState = {
  segment: Segment | null;
  birthDate: BirthDateValue;
  city: string;
  phone: string;
  interests: string[];
  avatarDataUrl: string | null;
};

const INITIAL_STATE: FormState = {
  segment: null,
  birthDate: { day: "", month: "", year: "" },
  city: "",
  phone: "",
  interests: [],
  avatarDataUrl: null,
};

export function OnboardingWizard({
  categories,
}: {
  categories: { id: string; name: string; serves: "MEN" | "WOMEN" | "UNISEX" }[];
}) {
  const router = useRouter();
  const [resolved, setResolved] = useState(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormState>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  // A guest who already picked a segment on /kesfet or /ara (stored in localStorage)
  // shouldn't be asked again — prefill it and skip straight to step 2.
  useEffect(() => {
    const stored = getStoredGuestSegment();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR/render
      setData((d) => ({ ...d, segment: stored }));
      setStep(2);
    }
    setResolved(true);
  }, []);

  const styleOptions: StyleOption[] = categories
    .filter((c) => c.serves === "UNISEX" || c.serves === (data.segment === "MALE" ? "MEN" : "WOMEN"))
    .map((c) => ({ id: c.id, name: c.name }));

  function finish(avatarUrl: string | undefined) {
    startTransition(async () => {
      const { day, month, year } = data.birthDate;
      const birthDateIso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

      const result = await completeOnboarding({
        segment: data.segment!,
        birthDate: birthDateIso,
        city: data.city,
        phone: `+90${data.phone}`,
        interests: data.interests,
        avatarUrl,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Looea'ya hoş geldin! Artık kuaför aramaya hazırsın.");
      router.push("/kesfet");
      router.refresh();
    });
  }

  function goNext() {
    if (step === TOTAL_STEPS) {
      finish(data.avatarDataUrl ?? undefined);
      return;
    }
    setStep((s) => s + 1);
  }

  const nav = {
    step,
    totalSteps: TOTAL_STEPS,
    onBack: step > 1 ? () => setStep((s) => s - 1) : undefined,
  };

  if (!resolved) return null;

  if (step === 1) {
    return (
      <OnboardingShell
        {...nav}
        title="Hangi hizmetleri arıyorsun?"
        subtitle="Sana en uygun işletmeleri gösterebilmemiz için."
        canContinue={!!data.segment}
        onContinue={goNext}
        hideFooter
      >
        <SegmentStep
          value={data.segment}
          onSelect={(segment) => {
            setData((d) => ({ ...d, segment }));
            setStep(2);
          }}
        />
      </OnboardingShell>
    );
  }

  if (step === 2) {
    return (
      <OnboardingShell
        {...nav}
        title="Doğum tarihin ne zaman?"
        subtitle="Sana özel kampanyaları ve doğum günü sürprizlerini kaçırma."
        canContinue={isValidBirthDate(data.birthDate)}
        onContinue={goNext}
      >
        <BirthDateStep value={data.birthDate} onChange={(birthDate) => setData((d) => ({ ...d, birthDate }))} />
      </OnboardingShell>
    );
  }

  if (step === 3) {
    return (
      <OnboardingShell
        {...nav}
        title="Nerede yaşıyorsun?"
        subtitle="En yakın kuaförleri bulmak için."
        canContinue={!!data.city}
        onContinue={goNext}
      >
        <CityStep value={data.city} onChange={(city) => setData((d) => ({ ...d, city }))} />
      </OnboardingShell>
    );
  }

  if (step === 4) {
    return (
      <OnboardingShell
        {...nav}
        title="Telefon numaran nedir?"
        subtitle="Randevu onayların için."
        canContinue={isValidPhone(data.phone)}
        onContinue={goNext}
      >
        <PhoneStep value={data.phone} onChange={(phone) => setData((d) => ({ ...d, phone }))} />
      </OnboardingShell>
    );
  }

  if (step === 5) {
    return (
      <OnboardingShell
        {...nav}
        title="Hangi tarzlar ilgini çekiyor?"
        subtitle="Sana daha uygun kuaförleri önerelim."
        canContinue={data.interests.length > 0}
        onContinue={goNext}
      >
        <StyleStep options={styleOptions} value={data.interests} onChange={(interests) => setData((d) => ({ ...d, interests }))} />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell
      {...nav}
      title="Profil fotoğrafı ekle"
      subtitle="Kuaförler seni daha kolay tanısın — istersen sonra da ekleyebilirsin."
      canContinue={!!data.avatarDataUrl}
      onContinue={goNext}
      continuePending={isPending}
      skipLabel="Bu adımı atla"
      onSkip={() => finish(undefined)}
    >
      <PhotoStep value={data.avatarDataUrl} onChange={(avatarDataUrl) => setData((d) => ({ ...d, avatarDataUrl }))} />
    </OnboardingShell>
  );
}
