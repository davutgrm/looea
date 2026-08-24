import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const HASH_ROUNDS = 10;
const hash = (pw: string) => bcrypt.hash(pw, HASH_ROUNDS);

const WEEKDAY_HOURS = { open: "09:00", close: "19:00" };

type CategorySeed = {
  name: string;
  group: "SAC" | "GUZELLIK" | "TIRNAK" | "OZEL";
  serves: "MEN" | "WOMEN" | "UNISEX";
};

const CATEGORIES: CategorySeed[] = [
  // Saç
  { name: "Kadın Kuaförü", group: "SAC", serves: "WOMEN" },
  { name: "Erkek Berber", group: "SAC", serves: "MEN" },
  { name: "Unisex Kuaför", group: "SAC", serves: "UNISEX" },
  { name: "Saç Kesimi", group: "SAC", serves: "UNISEX" },
  { name: "Saç Boyama", group: "SAC", serves: "WOMEN" },
  { name: "Balayage", group: "SAC", serves: "WOMEN" },
  { name: "Ombre", group: "SAC", serves: "WOMEN" },
  { name: "Blonde", group: "SAC", serves: "WOMEN" },
  { name: "Keratin", group: "SAC", serves: "WOMEN" },
  { name: "Fön", group: "SAC", serves: "WOMEN" },
  { name: "Saç Bakımı", group: "SAC", serves: "UNISEX" },
  { name: "Saç Uzatma", group: "SAC", serves: "WOMEN" },
  // Güzellik
  { name: "Güzellik Salonu", group: "GUZELLIK", serves: "WOMEN" },
  { name: "Cilt Bakımı", group: "GUZELLIK", serves: "UNISEX" },
  { name: "Kaş", group: "GUZELLIK", serves: "WOMEN" },
  { name: "Kirpik", group: "GUZELLIK", serves: "WOMEN" },
  { name: "Makyaj", group: "GUZELLIK", serves: "WOMEN" },
  // Tırnak
  { name: "Nail Salon", group: "TIRNAK", serves: "WOMEN" },
  { name: "Manikür", group: "TIRNAK", serves: "WOMEN" },
  { name: "Pedikür", group: "TIRNAK", serves: "WOMEN" },
  { name: "Jel Tırnak", group: "TIRNAK", serves: "WOMEN" },
  { name: "Protez Tırnak", group: "TIRNAK", serves: "WOMEN" },
  // Özel
  { name: "Gelin Saçı", group: "OZEL", serves: "WOMEN" },
  { name: "Gelin Makyajı", group: "OZEL", serves: "WOMEN" },
  { name: "Özel Gün", group: "OZEL", serves: "WOMEN" },
  { name: "Erkek Bakımı", group: "OZEL", serves: "MEN" },
];

const PLANS = [
  {
    name: "Kuafi Pro",
    slug: "kuafi-pro",
    price: 499,
    features: ["Sınırsız randevu", "Komisyon yok", "Taahhüt yok", "İlk ay ücretsiz"],
  },
];

function slug(input: string) {
  return input
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function dateAt(daysFromToday: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysFromToday);
  return d;
}

const REVIEW_NAMES = [
  "Elif Yılmaz", "Zeynep Kaya", "Ayşe Demir", "Fatma Şahin", "Merve Çelik",
  "Buse Aydın", "Ece Arslan", "Deniz Yıldız", "Cem Öztürk", "Kerem Aksoy",
];

const REVIEW_COMMENTS = [
  "Harika bir deneyimdi, kesinlikle tekrar geleceğim!",
  "Çok profesyonel ve ilgili bir ekip. Sonuçtan çok memnun kaldım.",
  "Randevu sistemi çok pratik, beklemeden içeri alındım.",
  "Saçım tam istediğim gibi oldu, teşekkürler.",
  "Ortam çok temiz ve şık, fiyat/performans gayet iyi.",
  "Personel çok güler yüzlü, kendimi rahat hissettim.",
  "Sonuç beklentimin üzerindeydi, herkese tavsiye ederim.",
  "Zamanında başladı, hiç gecikme olmadı.",
];

async function main() {
  console.log("Seeding Kuafi database...");

  // --- wipe (dev only) ---
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.review.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.serviceStaff.deleteMany(),
    prisma.service.deleteMany(),
    prisma.portfolioImage.deleteMany(),
    prisma.staffTimeOff.deleteMany(),
    prisma.staffSchedule.deleteMany(),
    prisma.businessStaff.deleteMany(),
    prisma.businessHours.deleteMany(),
    prisma.businessLocation.deleteMany(),
    prisma.business.deleteMany(),
    prisma.category.deleteMany(),
    prisma.subscriptionPlan.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // --- subscription plans ---
  const plans = await Promise.all(
    PLANS.map((p) =>
      prisma.subscriptionPlan.create({
        data: {
          name: p.name,
          slug: p.slug,
          price: p.price,
          features: JSON.stringify(p.features),
        },
      }),
    ),
  );
  const planBySlug = Object.fromEntries(plans.map((p) => [p.slug, p]));

  // --- categories ---
  const categories = await Promise.all(
    CATEGORIES.map((c, i) =>
      prisma.category.create({
        data: { name: c.name, slug: slug(c.name), group: c.group, serves: c.serves, order: i },
      }),
    ),
  );
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  // --- admin ---
  await prisma.user.create({
    data: {
      name: "Kuafi Admin",
      email: "admin@kuafi.app",
      passwordHash: await hash("Admin123!"),
      role: "ADMIN",
    },
  });

  // --- demo customer + filler reviewers ---
  // Pre-existing demo accounts skip onboarding (it's only for freshly registered customers).
  const customer = await prisma.user.create({
    data: {
      name: "Selin Aydın",
      email: "musteri@kuafi.app",
      phone: "+90 532 000 00 00",
      passwordHash: await hash("Customer123!"),
      role: "CUSTOMER",
      segment: "FEMALE",
      onboardingCompleted: true,
    },
  });

  const maleCustomer = await prisma.user.create({
    data: {
      name: "Kerem Yıldız",
      email: "musteri-erkek@kuafi.app",
      phone: "+90 532 000 00 01",
      passwordHash: await hash("Customer123!"),
      role: "CUSTOMER",
      segment: "MALE",
      onboardingCompleted: true,
    },
  });

  const fillerCustomers = await Promise.all(
    REVIEW_NAMES.map((name, i) =>
      prisma.user.create({
        data: {
          name,
          email: `musteri${i + 1}@kuafi.app`,
          passwordHash: "seed-only-no-login",
          role: "CUSTOMER",
          onboardingCompleted: true,
        },
      }),
    ),
  );

  type BusinessSeed = {
    ownerEmail: string;
    name: string;
    type: "WOMEN_SALON" | "MEN_BARBER" | "BEAUTY_SALON" | "NAIL_SALON";
    serves: "MEN" | "WOMEN" | "UNISEX";
    description: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
    coverImageUrl: string;
    logoUrl: string;
    verified: boolean;
    planSlug: string;
    staff: { name: string; title: string; avatarUrl: string }[];
    services: { name: string; category: string; duration: number; price: number; staffIdx: number[] }[];
    portfolio: { url: string; category?: string }[];
  };

  const businesses: BusinessSeed[] = [
    {
      ownerEmail: "studiox@kuafi.app",
      name: "Studio X",
      type: "WOMEN_SALON",
      serves: "WOMEN",
      description:
        "Kadıköy'ün merkezinde, balayage ve renklendirme konusunda uzmanlaşmış butik kuaför salonu.",
      address: "Caferağa Mah. Moda Cad. No:24, Kadıköy",
      city: "İstanbul",
      lat: 40.9903,
      lng: 29.0275,
      coverImageUrl: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=70",
      logoUrl: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=200&q=70",
      verified: true,
      planSlug: "kuafi-pro",
      staff: [
        { name: "Ayşe Kurt", title: "Hair Stylist", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=70" },
        { name: "Naz Erdem", title: "Colorist", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=70" },
      ],
      services: [
        { name: "Saç Kesimi", category: "Saç Kesimi", duration: 45, price: 35, staffIdx: [0, 1] },
        { name: "Balayage", category: "Balayage", duration: 150, price: 120, staffIdx: [1] },
        { name: "Ombre", category: "Ombre", duration: 150, price: 110, staffIdx: [1] },
        { name: "Keratin Bakımı", category: "Keratin", duration: 120, price: 90, staffIdx: [0] },
        { name: "Fön", category: "Fön", duration: 30, price: 20, staffIdx: [0, 1] },
      ],
      portfolio: [
        { url: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?auto=format&fit=crop&w=800&q=70", category: "Balayage" },
        { url: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=800&q=70", category: "Saç Boyama" },
        { url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=70" },
        { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=70" },
      ],
    },
    {
      ownerEmail: "hairlab@kuafi.app",
      name: "Hair Lab",
      type: "MEN_BARBER",
      serves: "MEN",
      description: "Beşiktaş'ta klasik ve modern erkek tıraş teknikleri bir arada.",
      address: "Sinanpaşa Mah. Beşiktaş Cad. No:11, Beşiktaş",
      city: "İstanbul",
      lat: 41.0422,
      lng: 29.0061,
      coverImageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=70",
      logoUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=200&q=70",
      verified: true,
      planSlug: "kuafi-pro",
      staff: [
        { name: "Mehmet Can", title: "Barber", avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=70" },
        { name: "Burak Şen", title: "Barber", avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=300&q=70" },
      ],
      services: [
        { name: "Saç Kesimi", category: "Saç Kesimi", duration: 30, price: 25, staffIdx: [0, 1] },
        { name: "Sakal Tıraşı", category: "Erkek Bakımı", duration: 20, price: 15, staffIdx: [0, 1] },
        { name: "Saç + Sakal", category: "Erkek Bakımı", duration: 45, price: 35, staffIdx: [0, 1] },
        { name: "Cilt Bakımı", category: "Cilt Bakımı", duration: 30, price: 30, staffIdx: [1] },
      ],
      portfolio: [
        { url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=70" },
        { url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=70" },
        { url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=70" },
      ],
    },
    {
      ownerEmail: "hairroom@kuafi.app",
      name: "The Hair Room",
      type: "BEAUTY_SALON",
      serves: "WOMEN",
      description: "Şişli'de cilt bakımı, kaş-kirpik ve makyaj hizmetlerinde uzman güzellik salonu.",
      address: "Halaskargazi Cad. No:88, Şişli",
      city: "İstanbul",
      lat: 41.0602,
      lng: 28.9877,
      coverImageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=70",
      logoUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=70",
      verified: false,
      planSlug: "kuafi-pro",
      staff: [
        { name: "Deniz Kara", title: "Beauty Specialist", avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=70" },
        { name: "Gizem Toprak", title: "Makeup Artist", avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=70" },
      ],
      services: [
        { name: "Cilt Bakımı", category: "Cilt Bakımı", duration: 60, price: 70, staffIdx: [0] },
        { name: "Kaş Alımı", category: "Kaş", duration: 20, price: 18, staffIdx: [0, 1] },
        { name: "Kirpik Lifting", category: "Kirpik", duration: 45, price: 40, staffIdx: [0] },
        { name: "Makyaj", category: "Makyaj", duration: 60, price: 60, staffIdx: [1] },
        { name: "Gelin Makyajı", category: "Gelin Makyajı", duration: 90, price: 150, staffIdx: [1] },
      ],
      portfolio: [
        { url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=70" },
        { url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=70" },
        { url: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=70" },
      ],
    },
    {
      ownerEmail: "monohair@kuafi.app",
      name: "Mono Hair Studio",
      type: "NAIL_SALON",
      serves: "WOMEN",
      description: "Üsküdar'da jel tırnak ve protez tırnak konusunda deneyimli nail stüdyosu.",
      address: "Mimar Sinan Mah. Hakimiyet-i Milliye Cad. No:5, Üsküdar",
      city: "İstanbul",
      lat: 41.0226,
      lng: 29.0159,
      coverImageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=70",
      logoUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=200&q=70",
      verified: true,
      planSlug: "kuafi-pro",
      staff: [
        { name: "Selin Acar", title: "Nail Artist", avatarUrl: "https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?auto=format&fit=crop&w=300&q=70" },
      ],
      services: [
        { name: "Manikür", category: "Manikür", duration: 40, price: 25, staffIdx: [0] },
        { name: "Pedikür", category: "Pedikür", duration: 50, price: 30, staffIdx: [0] },
        { name: "Jel Tırnak", category: "Jel Tırnak", duration: 60, price: 45, staffIdx: [0] },
        { name: "Protez Tırnak", category: "Protez Tırnak", duration: 90, price: 65, staffIdx: [0] },
      ],
      portfolio: [
        { url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b8?auto=format&fit=crop&w=800&q=70" },
        { url: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=800&q=70" },
      ],
    },
    {
      ownerEmail: "ustabasi@kuafi.app",
      name: "Ustabaşı Berber",
      type: "MEN_BARBER",
      serves: "MEN",
      description: "Beyoğlu'nda üç kuşaktır süren usta-çırak geleneğiyle klasik ustura tıraşı ve modern erkek kesimleri bir arada.",
      address: "Asmalımescit Mah. İstiklal Cad. No:142, Beyoğlu",
      city: "İstanbul",
      lat: 41.0328,
      lng: 28.9773,
      coverImageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=70",
      logoUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=200&q=70",
      verified: true,
      planSlug: "kuafi-pro",
      staff: [
        { name: "Hakan Yıldırım", title: "Usta Berber", avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=70" },
        { name: "Onur Kaplan", title: "Berber", avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=300&q=70" },
      ],
      services: [
        { name: "Saç Kesimi", category: "Saç Kesimi", duration: 30, price: 28, staffIdx: [0, 1] },
        { name: "Klasik Ustura Tıraş", category: "Erkek Berber", duration: 25, price: 22, staffIdx: [0] },
        { name: "Sakal Tıraşı", category: "Erkek Bakımı", duration: 20, price: 18, staffIdx: [0, 1] },
        { name: "Saç + Sakal", category: "Erkek Bakımı", duration: 45, price: 40, staffIdx: [0] },
      ],
      portfolio: [
        { url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=70" },
        { url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=70" },
      ],
    },
  ];

  for (const b of businesses) {
    const owner = await prisma.user.create({
      data: {
        name: `${b.name} Sahibi`,
        email: b.ownerEmail,
        passwordHash: await hash("Business123!"),
        role: "BUSINESS_OWNER",
      },
    });

    const business = await prisma.business.create({
      data: {
        ownerId: owner.id,
        name: b.name,
        slug: slug(b.name),
        type: b.type,
        serves: b.serves,
        description: b.description,
        coverImageUrl: b.coverImageUrl,
        logoUrl: b.logoUrl,
        phone: "+90 212 000 00 00",
        email: b.ownerEmail,
        instagram: `https://instagram.com/${slug(b.name)}`,
        verified: b.verified,
        active: true,
        location: {
          create: {
            address: b.address,
            city: b.city,
            country: "Türkiye",
            latitude: b.lat,
            longitude: b.lng,
          },
        },
        hours: {
          create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
            dayOfWeek,
            openTime: dayOfWeek === 0 ? null : WEEKDAY_HOURS.open,
            closeTime: dayOfWeek === 0 ? null : WEEKDAY_HOURS.close,
            isClosed: dayOfWeek === 0,
          })),
        },
        subscription: {
          create: {
            planId: planBySlug[b.planSlug].id,
            status: "ACTIVE",
            currentPeriodEnd: dateAt(30),
          },
        },
      },
    });

    const staffRecords = await Promise.all(
      b.staff.map((s) =>
        prisma.businessStaff.create({
          data: {
            businessId: business.id,
            name: s.name,
            title: s.title,
            avatarUrl: s.avatarUrl,
            schedules: {
              create: [1, 2, 3, 4, 5, 6].flatMap((dayOfWeek) => [
                { dayOfWeek, startTime: "09:00", endTime: "13:00" },
                { dayOfWeek, startTime: "14:00", endTime: "19:00" },
              ]),
            },
          },
        }),
      ),
    );

    const serviceRecords = await Promise.all(
      b.services.map((s) =>
        prisma.service.create({
          data: {
            businessId: business.id,
            categoryId: catByName[s.category].id,
            name: s.name,
            durationMinutes: s.duration,
            price: s.price,
            staff: {
              create: s.staffIdx.map((idx) => ({ staffId: staffRecords[idx].id })),
            },
          },
        }),
      ),
    );

    await Promise.all(
      b.portfolio.map((p, i) =>
        prisma.portfolioImage.create({
          data: {
            businessId: business.id,
            imageUrl: p.url,
            order: i,
            categoryId: p.category ? catByName[p.category]?.id : undefined,
          },
        }),
      ),
    );

    // --- filler reviews (completed appointments) ---
    const reviewCount = 5 + Math.floor(Math.random() * 5);
    let ratingSum = 0;
    for (let i = 0; i < reviewCount; i++) {
      const reviewer = fillerCustomers[i % fillerCustomers.length];
      const service = serviceRecords[i % serviceRecords.length];
      const staff = staffRecords[i % staffRecords.length];
      const rating = 4 + (Math.random() > 0.25 ? 1 : 0); // mostly 4-5
      ratingSum += rating;
      const appt = await prisma.appointment.create({
        data: {
          businessId: business.id,
          customerId: reviewer.id,
          serviceId: service.id,
          staffId: staff.id,
          date: dateAt(-(10 + i * 4)),
          startTime: "14:00",
          endTime: "15:00",
          price: service.price,
          status: "COMPLETED",
        },
      });
      await prisma.review.create({
        data: {
          businessId: business.id,
          customerId: reviewer.id,
          appointmentId: appt.id,
          rating,
          comment: REVIEW_COMMENTS[(i + b.name.length) % REVIEW_COMMENTS.length],
        },
      });
    }
    await prisma.business.update({
      where: { id: business.id },
      data: { ratingAvg: Math.round((ratingSum / reviewCount) * 10) / 10, ratingCount: reviewCount },
    });

    // --- demo customer appointments per business ---
    if (b.name === "Studio X") {
      const service = serviceRecords[1]; // Balayage
      await prisma.appointment.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          serviceId: service.id,
          staffId: staffRecords[1].id,
          date: dateAt(1),
          startTime: "16:30",
          endTime: "19:00",
          price: service.price,
          status: "CONFIRMED",
        },
      });
      const pastService = serviceRecords[0];
      const pastAppt = await prisma.appointment.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          serviceId: pastService.id,
          staffId: staffRecords[0].id,
          date: dateAt(-20),
          startTime: "11:00",
          endTime: "11:45",
          price: pastService.price,
          status: "COMPLETED",
        },
      });
      await prisma.review.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          appointmentId: pastAppt.id,
          rating: 5,
          comment: "Ayşe hanım harika bir kesim yaptı, çok memnun kaldım!",
        },
      });
      await prisma.favorite.create({ data: { customerId: customer.id, businessId: business.id } });
    }

    if (b.name === "Hair Lab") {
      const service = serviceRecords[2];
      await prisma.appointment.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          serviceId: service.id,
          staffId: staffRecords[0].id,
          date: dateAt(3),
          startTime: "10:00",
          endTime: "10:45",
          price: service.price,
          status: "PENDING",
        },
      });
    }

    if (b.name === "The Hair Room") {
      const service = serviceRecords[0];
      const pastAppt = await prisma.appointment.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          serviceId: service.id,
          staffId: staffRecords[0].id,
          date: dateAt(-10),
          startTime: "13:00",
          endTime: "14:00",
          price: service.price,
          status: "COMPLETED",
        },
      });
      await prisma.review.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          appointmentId: pastAppt.id,
          rating: 4,
          comment: "Cilt bakımı çok rahatlatıcıydı, teşekkürler.",
        },
      });
      await prisma.favorite.create({ data: { customerId: customer.id, businessId: business.id } });
    }

    if (b.name === "Mono Hair Studio") {
      const service = serviceRecords[2];
      await prisma.appointment.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          serviceId: service.id,
          staffId: staffRecords[0].id,
          date: dateAt(-5),
          startTime: "15:00",
          endTime: "16:00",
          price: service.price,
          status: "CANCELLED",
        },
      });
    }
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        type: "APPOINTMENT_CONFIRMED",
        title: "Randevunuz onaylandı",
        body: "Studio X - Balayage randevunuz onaylandı.",
      },
      {
        userId: customer.id,
        type: "APPOINTMENT_REMINDER",
        title: "Yaklaşan randevunuz var",
        body: "Yarın saat 16:30'da Studio X'te randevunuz var.",
      },
    ],
  });

  console.log("Seed complete.");
  console.log("");
  console.log("Demo hesaplar:");
  console.log("  Admin:     admin@kuafi.app / Admin123!");
  console.log("  İşletme:   studiox@kuafi.app / Business123! (Studio X)");
  console.log("             hairlab@kuafi.app / Business123! (Hair Lab)");
  console.log("             hairroom@kuafi.app / Business123! (The Hair Room)");
  console.log("             monohair@kuafi.app / Business123! (Mono Hair Studio)");
  console.log("             ustabasi@kuafi.app / Business123! (Ustabaşı Berber)");
  console.log(`  Müşteri:   musteri@kuafi.app / Customer123! (${customer.name}, Kadın segmenti)`);
  console.log(`             musteri-erkek@kuafi.app / Customer123! (${maleCustomer.name}, Erkek segmenti)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
