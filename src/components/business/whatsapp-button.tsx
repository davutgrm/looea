import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({
  phone,
  message,
  size = "xs",
}: {
  phone: string | null;
  message?: string;
  size?: "xs" | "sm";
}) {
  const link = phone ? buildWhatsAppLink(phone, message) : null;
  if (!link) return null;

  return (
    <Button asChild size={size} variant="outline" className="gap-1.5 text-emerald-700 dark:text-emerald-400">
      <a href={link} target="_blank" rel="noopener noreferrer">
        <MessageCircle /> WhatsApp&apos;ta Yaz
      </a>
    </Button>
  );
}
