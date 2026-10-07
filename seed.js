/**
 * Sembrador de datos vía API REST (Cliente HTTP puro)
 * Cumple con la regla de arquitectura: NUNCA se conecta directamente a la base de datos MySQL.
 */

const API_URL = process.env.API_URL || 'http://localhost:8000';

async function main() {
  console.log(`=== Conectando a Simple Stock Flow API en ${API_URL} ===`);

  // 1. Iniciar sesión como administrador
  console.log('1. Autenticando como admin...');
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: process.env.ADMIN_PASSWORD || 'Admin12345!'
    })
  });

  if (!loginRes.ok) {
    throw new Error(`Fallo en login de admin: ${loginRes.status} ${await loginRes.text()}`);
  }

  const { token } = await loginRes.json();
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  console.log('✓ Token de admin obtenido.');

  // 2. Obtener categorías existentes
  console.log('2. Obteniendo categorías del sistema...');
  const catRes = await fetch(`${API_URL}/api/categories`, { headers: authHeaders });
  const categories = await catRes.json();
  console.log(`✓ ${categories.length} categorías disponibles.`);

  const bebidaCat = categories.find(c => c.name === 'Bebidas') || categories[0];
  const snackCat = categories.find(c => c.name === 'Snacks') || categories[0];

  // 3. Crear vendedor de demostración (E-02)
  console.log('3. Creando usuario vendedor de prueba...');
  try {
    const regRes = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        username: 'vendedor_demo',
        password: 'Password123!'
      })
    });
    if (regRes.status === 201) {
      console.log('✓ Vendedor "vendedor_demo" creado exitosamente.');
    } else {
      console.log('  (El vendedor ya existía o status:', regRes.status, ')');
    }
  } catch (err) {
    console.log('  (Vendedor ya registrado)');
  }

  // 4. Crear productos de prueba (E-05)
  console.log('4. Sembrando productos de prueba...');
  const demoProducts = [
    { name: 'Café Especial Huila 500g', price: 24000.0, initialStock: 30, categoryId: bebidaCat.id },
    { name: 'Té Verde Orgánico', price: 12500.0, initialStock: 50, categoryId: bebidaCat.id },
    { name: 'Galletas de Avena y Miel', price: 4500.0, initialStock: 80, categoryId: snackCat.id },
    { name: 'Papas Artesanales con Sal Marina', price: 6000.0, initialStock: 40, categoryId: snackCat.id },
  ];

  const createdProducts = [];
  for (const prod of demoProducts) {
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(prod)
    });
    if (res.ok) {
      const p = await res.json();
      createdProducts.push(p);
      console.log(`  + Creado: ${p.name} ($${p.price}) - Stock: ${p.stock}`);
    }
  }

  // 5. Registrar una venta de demostración (E-10)
  if (createdProducts.length >= 2) {
    console.log('5. Registrando venta inicial de demostración...');
    const saleRes = await fetch(`${API_URL}/api/sales`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: [
          { productId: createdProducts[0].id, quantity: 2 },
          { productId: createdProducts[1].id, quantity: 3 }
        ]
      })
    });

    if (saleRes.ok) {
      const sale = await saleRes.json();
      console.log(`✓ Venta registrada! ID: ${sale.id} - Total: $${sale.total} ${sale.currency}`);
    } else {
      console.error('Error registrando venta:', await saleRes.text());
    }
  }

  console.log('\n=== Sembrado de datos completado exitosamente vía API ===');
}

main().catch(err => {
  console.error('\n❌ Error durante el sembrado:', err.message);
  process.exit(1);
});