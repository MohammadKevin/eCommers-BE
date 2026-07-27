const RAILWAY_URL = 'https://ecommers-be-production.up.railway.app';

async function registerUser(url, data) {
  try {
    const res = await fetch(`${RAILWAY_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      console.log(`✅ Success registering: ${data.email} (${data.fullName})`);
    } else {
      console.log(`⚠️ Status ${res.status} for ${data.email}: ${result.message || JSON.stringify(result)}`);
    }
  } catch (err) {
    console.error(`❌ Network error for ${data.email}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Seeding live accounts directly to Railway Backend API...\n');

  // 1. SUPER ADMIN
  await registerUser('/auth/register-admin', {
    email: 'admin@pasarindo.com',
    password: 'Password123!',
    fullName: 'Super Admin PasarIndo',
    phone: '081211110001',
    globalRole: 'SUPER_ADMIN',
    secretKey: 'secret-admin-key-2026',
  });

  // 2. FINANCE ADMIN
  await registerUser('/auth/register-admin', {
    email: 'finance@pasarindo.com',
    password: 'Password123!',
    fullName: 'Finance Admin PasarIndo',
    phone: '081211110002',
    globalRole: 'FINANCE_ADMIN',
    secretKey: 'secret-admin-key-2026',
  });

  // 3. OPERATIONS CS
  await registerUser('/auth/register-admin', {
    email: 'cs@pasarindo.com',
    password: 'Password123!',
    fullName: 'CS Dispute Admin PasarIndo',
    phone: '081211110003',
    globalRole: 'OPERATIONS_CS',
    secretKey: 'secret-admin-key-2026',
  });

  // 4. MARKETING ADMIN
  await registerUser('/auth/register-admin', {
    email: 'marketing@pasarindo.com',
    password: 'Password123!',
    fullName: 'Marketing Admin PasarIndo',
    phone: '081211110004',
    globalRole: 'MARKETING_ADMIN',
    secretKey: 'secret-admin-key-2026',
  });

  // 5. BUYER
  await registerUser('/auth/register', {
    email: 'buyer@pasarindo.com',
    password: 'Password123!',
    fullName: 'Kevin Ardiansyah (Pembeli)',
    phone: '081211110005',
  });

  // 6. SELLER OWNER
  await registerUser('/auth/register', {
    email: 'seller@pasarindo.com',
    password: 'Password123!',
    fullName: 'Aetheria Flagship Owner',
    phone: '081211110006',
  });

  // 7. DRIVER
  await registerUser('/auth/register', {
    email: 'driver@pasarindo.com',
    password: 'Password123!',
    fullName: 'Budi Santoso (Driver PasarIndo)',
    phone: '081211110007',
  });

  // 8. WAREHOUSE
  await registerUser('/auth/register', {
    email: 'gudang@pasarindo.com',
    password: 'Password123!',
    fullName: 'Agus Gudang (Staf Fulfillment)',
    phone: '081211110008',
  });

  // 9. AFFILIATE
  await registerUser('/auth/register', {
    email: 'affiliate@pasarindo.com',
    password: 'Password123!',
    fullName: 'Siti Rahma (Mitra Afiliasi)',
    phone: '081211110009',
  });

  console.log('\n🎉 Finished seeding live Railway accounts!');
}

main();
