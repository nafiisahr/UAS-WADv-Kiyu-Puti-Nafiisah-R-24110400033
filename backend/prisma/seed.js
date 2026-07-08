const { PrismaClient } = require("../src/generated/prisma");
const prisma = new PrismaClient(); 

async function main() {
  console.log("Membersihkan data lama...");
  // HAPUS DATA LAMA TERLEBIH DAHULU AGAR TIDAK DUPLIKAT/BENTROK
  await prisma.ticket.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Mereset auto-increment ID ke angka 1...");
  try {
    // Query khusus PostgreSQL menggunakan nama sequence PascalCase bawaan Prisma
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Ticket_id_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "Tenant_id_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "User_id_seq" RESTART WITH 1;`);
    console.log("✅ Reset ID berhasil!");
  } catch (error) {
    // Fallback jika PostgreSQL di sistemmu otomatis mengubah urutan ke lowercase
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "ticket_id_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "tenant_id_seq" RESTART WITH 1;`);
    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "user_id_seq" RESTART WITH 1;`);
    console.log("✅ Reset ID berhasil (skema lowercase fallback)!");
  }

  console.log("Memulai proses seeding data baru...");

  // 1. SEED DATA USER & ADMIN (Menggunakan password biasa sesuai route /login)
  const userAdmin = await prisma.user.create({
    data: {
      name: "Admin Utama Kiyu",
      email: "admin@kiyu.com",
      password: "rahasiaadmin123", 
      role: "tenant_admin",
    },
  });
  console.log(`✅ Admin Akun berhasil dibuat: ${userAdmin.email} (ID: ${userAdmin.id})`);

  const userBiasa = await prisma.user.create({
    data: {
      name: "Lira Jasmine",
      email: "lira@gmail.com",
      password: "password123",
      role: "user",
    },
  });
  console.log(`✅ User Akun berhasil dibuat: ${userBiasa.email} (ID: ${userBiasa.id})`);

  // 2. SEED DATA TENANT
  const tenants = [
    {
      name: "Nasi Bakar Tenily",
      location: "Food Court, Lantai 1 - Lapak 05",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmsQvrqnlodnm8wcqQ8_cFcP59HSGyMsT76hfagX89eOBNCo69LTGmScwv3oa7qqAjbggxLAc0wC4AX8gtFrr9p7OMgHbLjdms9_SUhGi8SnIZ-vmxlGFWMfdD9S3XAAAia8kJ69TC3LDuxYa-IFNhqEwoEMd_UbqbIQsv-tVLRvtlAShDVH4_ShIbx97S9Co4rxhEepiYyfnQePwAqNRPq1E9IsizcoV3mtoyQLZRmEGuRRXyl2O8Qw",
      currentNumber: 0,
      estimatedTime: 8,
    },
    {
      name: "Klinik Pratama Sehat Sentosa",
      location: "Gedung Medika, Lantai G - Ruang 101",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxZTEAmkka_rLyeooUNHAgaWwHv-J5kDS01D4Ayti9baHZjNmbnvc3KZl6tiOEul_QyIBzPXmRiwWYwWDdlvdfULJxH8Xa1QhuYTjefXtKUn-SukLA81Rz0qz7oGkEk4me87M9kafWuIQQyLWOTgSPB2gbyND6HFGEW_BFjKXA4Blk7DzyVq_iQ83gBMY5jnPE51t4X_46BJrOuuFWoMnNW-TRzISH4U6Sy0n-j16ijlxc55kxIXxdnQ",
      currentNumber: 0,
      estimatedTime: 15,
    },
    {
      name: "Kopi Suasana Senja",
      location: "Area Lobby Utama - Dekat Pintu Barat",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=500",
      currentNumber: 0,
      estimatedTime: 4,
    },
    {
      name: "Ramen Ichiraku",
      location: "Food Court, Lantai 1 - Lapak 12",
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=500",
      currentNumber: 0,
      estimatedTime: 10,
    },
    {
      name: "Klinik Gigi Dental Care",
      location: "Gedung Medika, Lantai 2 - Ruang 204",
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=500",
      currentNumber: 0,
      estimatedTime: 20,
    },
    {
      name: "Brew & Bite Cafe",
      location: "Gedung Utara, Lantai Rooftop",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=500",
      currentNumber: 0,
      estimatedTime: 5,
    },
  ];

  for (const tenant of tenants) {
    const createdTenant = await prisma.tenant.create({
      data: tenant,
    });
    console.log(`✅ Tenant berhasil dibuat: ${createdTenant.name} (ID: ${createdTenant.id})`);
  }

  console.log("Proses seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Gagal melakukan seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });