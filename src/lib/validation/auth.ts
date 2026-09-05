import { z } from "zod";
import { text, optionalText, optionalPhoneField, emailField, passwordField, latitudeField, longitudeField, cityField, districtField, refineCityDistrict } from "@/lib/validation/common";
import { businessTypeEnum } from "@/lib/validation/enums";

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const registerCustomerSchema = z.object({
  name: text(2, 100, "İsim en az 2 karakter olmalı"),
  email: emailField,
  phone: optionalPhoneField,
  password: passwordField,
});

export const registerBusinessSchema = z
  .object({
    ownerName: text(2, 100, "İsim en az 2 karakter olmalı"),
    ownerPhone: optionalPhoneField,
    email: emailField,
    password: passwordField,
    businessName: text(2, 150, "İşletme adı en az 2 karakter olmalı"),
    businessType: businessTypeEnum,
    city: cityField,
    district: districtField,
    address: text(5, 300, "Adres en az 5 karakter olmalı"),
    latitude: latitudeField,
    longitude: longitudeField,
    referralSource: optionalText(200),
  })
  .superRefine((v, ctx) => refineCityDistrict(v.city, v.district, ctx));
