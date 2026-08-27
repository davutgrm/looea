"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TR_PROVINCES, matchProvince } from "@/lib/turkey-locations";
import { updateBusinessLocation } from "@/lib/actions/business";

const formSchema = z.object({
  address: z.string().min(2, "Adres gerekli"),
  city: z.string().min(1, "İl gerekli"),
  district: z.string().min(1, "İlçe gerekli"),
  postalCode: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export function LocationForm({ initialValues }: { initialValues: FormValues }) {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: initialValues });
  const [provinceSlug, setProvinceSlug] = useState(() => matchProvince(initialValues.city)?.slug ?? "");
  const province = useMemo(() => TR_PROVINCES.find((p) => p.slug === provinceSlug), [provinceSlug]);

  async function onSubmit(values: FormValues) {
    const result = await updateBusinessLocation(values);
    if (result.success) {
      toast.success("Konum bilgileri güncellendi");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konum</CardTitle>
        <CardDescription>Müşterilerin işletmenizi haritada bulabilmesi için adres bilgileri.</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location-address">Adres</Label>
            <Input id="location-address" {...form.register("address")} />
            {form.formState.errors.address && (
              <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location-city">İl</Label>
              <Controller
                control={form.control}
                name="city"
                render={({ field }) => (
                  <Select
                    value={provinceSlug}
                    onValueChange={(nextSlug) => {
                      setProvinceSlug(nextSlug);
                      const next = TR_PROVINCES.find((p) => p.slug === nextSlug);
                      field.onChange(next?.name ?? "");
                      form.setValue("district", "");
                    }}
                  >
                    <SelectTrigger id="location-city" className="w-full">
                      <SelectValue placeholder="İl seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {TR_PROVINCES.map((p) => (
                        <SelectItem key={p.slug} value={p.slug}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.city && (
                <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location-district">İlçe</Label>
              <Controller
                control={form.control}
                name="district"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!province}>
                    <SelectTrigger id="location-district" className="w-full">
                      <SelectValue placeholder={province ? "İlçe seçin" : "Önce il seçin"} />
                    </SelectTrigger>
                    <SelectContent>
                      {province?.districts.map((d) => (
                        <SelectItem key={d.slug} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.district && (
                <p className="text-xs text-destructive">{form.formState.errors.district.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:max-w-[calc(50%-0.375rem)]">
            <Label htmlFor="location-postal">Posta Kodu</Label>
            <Input id="location-postal" {...form.register("postalCode")} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location-lat">Enlem (Latitude)</Label>
              <Input
                id="location-lat"
                type="number"
                step="0.000001"
                {...form.register("latitude", { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location-lng">Boylam (Longitude)</Label>
              <Input
                id="location-lng"
                type="number"
                step="0.000001"
                {...form.register("longitude", { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>
            Kaydet
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
