import { PrismaClient, GlobalRole, StoreRole, UserTier } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding for PasarIndo Multi-Role Accounts...');

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 1. SUPER ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@pasarindo.com' },
    update: {},
    create: {
      email: 'admin@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'Super Admin PasarIndo',
      phone: '081211110001',
      globalRole: GlobalRole.SUPER_ADMIN,
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // 2. FINANCE ADMIN
  const financeAdmin = await prisma.user.upsert({
    where: { email: 'finance@pasarindo.com' },
    update: {},
    create: {
      email: 'finance@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'Finance Admin PasarIndo',
      phone: '081211110002',
      globalRole: GlobalRole.FINANCE_ADMIN,
    },
  });
  console.log('✅ Finance Admin created:', financeAdmin.email);

  // 3. OPERATIONS CS ADMIN
  const csAdmin = await prisma.user.upsert({
    where: { email: 'cs@pasarindo.com' },
    update: {},
    create: {
      email: 'cs@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'CS Dispute Admin PasarIndo',
      phone: '081211110003',
      globalRole: GlobalRole.OPERATIONS_CS,
    },
  });
  console.log('✅ Operations CS Admin created:', csAdmin.email);

  // 4. MARKETING ADMIN
  const marketingAdmin = await prisma.user.upsert({
    where: { email: 'marketing@pasarindo.com' },
    update: {},
    create: {
      email: 'marketing@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'Marketing Admin PasarIndo',
      phone: '081211110004',
      globalRole: GlobalRole.MARKETING_ADMIN,
    },
  });
  console.log('✅ Marketing Admin created:', marketingAdmin.email);

  // 5. BUYER / CUSTOMER
  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@pasarindo.com' },
    update: {},
    create: {
      email: 'buyer@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'Kevin Ardiansyah (Pembeli)',
      phone: '081211110005',
      globalRole: GlobalRole.USER,
      tier: UserTier.GOLD,
    },
  });
  console.log('✅ Buyer User created:', buyerUser.email);

  // Add default address for buyer
  const existingAddress = await prisma.address.findFirst({ where: { userId: buyerUser.id } });
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: buyerUser.id,
        label: 'Rumah Utama',
        recipient: 'Kevin Ardiansyah',
        phone: '081211110005',
        fullAddress: 'Jl. Sudirman No. 45, RT 02 / RW 05, Kebayoran Baru',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12190',
        isPrimary: true,
      },
    });
  }

  // 6. STORE OWNER & STORE
  const sellerOwner = await prisma.user.upsert({
    where: { email: 'seller@pasarindo.com' },
    update: {},
    create: {
      email: 'seller@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'Aetheria Flagship Owner',
      phone: '081211110006',
      globalRole: GlobalRole.USER,
    },
  });
  console.log('✅ Seller Owner created:', sellerOwner.email);

  let store = await prisma.store.findUnique({ where: { slug: 'aetheria-tech-official' } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: 'Aetheria Tech Flagship',
        slug: 'aetheria-tech-official',
        description: 'Toko Resmi Gadget & Aksesoris Premium Original Garansi Resmi.',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        postalCode: '12190',
        isOfficial: true,
        isActive: true,
        members: {
          create: {
            userId: sellerOwner.id,
            role: StoreRole.OWNER,
          },
        },
      },
    });
    console.log('✅ Store created:', store.name);
  }

  // 7. DRIVER INTERNAL
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@pasarindo.com' },
    update: {},
    create: {
      email: 'driver@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'Budi Santoso (Driver PasarIndo)',
      phone: '081211110007',
      globalRole: GlobalRole.USER,
      driverProfile: {
        create: {
          vehicleType: 'Motor Vario 160',
          licensePlate: 'B 4589 PAS',
          isAvailable: true,
        },
      },
    },
  });
  console.log('✅ Driver User created:', driverUser.email);

  // 8. WAREHOUSE STAFF
  const warehouseUser = await prisma.user.upsert({
    where: { email: 'gudang@pasarindo.com' },
    update: {},
    create: {
      email: 'gudang@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'Agus Gudang (Staf Fulfillment)',
      phone: '081211110008',
      globalRole: GlobalRole.USER,
      warehouseStaff: {
        create: {
          warehouseCode: 'WH-JKT-CENTRAL-01',
        },
      },
    },
  });
  console.log('✅ Warehouse Staff created:', warehouseUser.email);

  // 9. AFFILIATE USER
  const affiliateUser = await prisma.user.upsert({
    where: { email: 'affiliate@pasarindo.com' },
    update: {},
    create: {
      email: 'affiliate@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'Siti Rahma (Mitra Afiliasi)',
      phone: '081211110009',
      globalRole: GlobalRole.USER,
      isAffiliate: true,
      affiliateData: {
        create: {
          referralCode: 'PASARINDO-SITI2026',
          totalCommission: 750000.00,
        },
      },
    },
  });
  console.log('✅ Affiliate User created:', affiliateUser.email);

  console.log('\n🎉 ALL ROLE ACCOUNTS SEEDED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
