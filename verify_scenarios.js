/**
 * Verificador integral de escenarios E2E contra la API de Simple Stock Flow
 * Ejecuta pruebas de integración vía HTTP puro para validar invariantes y casos de error.
 */

const API_URL = process.env.API_URL || 'http://localhost:8000';

async function runScenarios() {
  console.log(`\n======================================================`);
  console.log(`🚀 Iniciando Verificación de Escenarios E2E en ${API_URL}`);
  console.log(`======================================================\n`);

  // 1. Login
  console.log('[Escenario 1] Autenticación de Administrador (E-01)...');
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'Admin12345!' })
  });
  if (!loginRes.ok) throw new Error(`Fallo autenticación: ${loginRes.status}`);
  const { token, user } = await loginRes.json();
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  console.log(`✓ Admin autenticado: ID ${user.id} (${user.role})\n`);

  // 2. Catálogo
  console.log('[Escenario 2] Consulta de Catálogo y Paginación (E-03)...');
  const catRes = await fetch(`${API_URL}/api/products?page=1&pageSize=10`, { headers: authHeaders });
  const catalog = await catRes.json();
  if (!catalog.items || catalog.items.length === 0) throw new Error('El catálogo está vacío');
  console.log(`✓ Catálogo obtenido: ${catalog.items.length} productos, Total: ${catalog.total}, Páginas: ${catalog.totalPages}\n`);

  const targetProduct = catalog.items[0];
  const initialStock = targetProduct.stock;
  console.log(`  -> Producto de prueba: "${targetProduct.name}" (Stock actual: ${initialStock})\n`);

  // 3. Regla 422: Intento de compra con stock insuficiente (RN-01)
  console.log('[Escenario 3] Validación de Invariante de Dominio: Sobreventa (422 Unprocessable Entity)...');
  const overRes = await fetch(`${API_URL}/api/sales`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      items: [{ productId: targetProduct.id, quantity: initialStock + 999 }]
    })
  });
  if (overRes.status === 422) {
    const prob = await overRes.json();
    console.log(`✓ Dominio protegió el stock con 422: "${prob.detail}"\n`);
  } else {
    throw new Error(`Se esperaba status 422 pero se recibió ${overRes.status}`);
  }

  // 4. Regla 400: Error de validación de formato (Cantidad <= 0)
  console.log('[Escenario 4] Validación de Formato de Request: Cantidad Inválida (400 Bad Request)...');
  const badRes = await fetch(`${API_URL}/api/sales`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      items: [{ productId: targetProduct.id, quantity: -5 }]
    })
  });
  if (badRes.status === 400 || badRes.status === 422) {
    const err = await badRes.json();
    console.log(`✓ API rechazó payload inválido con código ${badRes.status}: "${err.detail}"\n`);
  } else {
    throw new Error(`Se esperaba status 400/422 pero se recibió ${badRes.status}`);
  }

  // 5. Compra legítima y decremento de stock
  console.log('[Escenario 5] Ejecución de Venta Atómica y Descuento de Stock (E-10)...');
  const saleRes = await fetch(`${API_URL}/api/sales`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      items: [{ productId: targetProduct.id, quantity: 1 }]
    })
  });
  if (!saleRes.ok) throw new Error(`Fallo al registrar venta: ${saleRes.status}`);
  const sale = await saleRes.json();
  console.log(`✓ Venta registrada exitosamente! ID: ${sale.id} - Total: $${sale.total} ${sale.currency}`);

  // Verificar que el stock bajó exactamente en 1
  const verifyProdRes = await fetch(`${API_URL}/api/products/${targetProduct.id}`, { headers: authHeaders });
  const updatedProduct = await verifyProdRes.json();
  if (updatedProduct.stock !== initialStock - 1) {
    throw new Error(`Inconsistencia en stock: esperado ${initialStock - 1}, actual ${updatedProduct.stock}`);
  }
  console.log(`✓ Stock auditado y decrementado con precisión: ${initialStock} -> ${updatedProduct.stock}\n`);

  // 6. Reporte de ventas
  console.log('[Escenario 6] Generación de Reporte de Ventas Agregado (E-13)...');
  const reportRes = await fetch(`${API_URL}/api/reports/sales?from=2026-01-01&to=2026-12-31`, { headers: authHeaders });
  if (!reportRes.ok) throw new Error(`Fallo reporte: ${reportRes.status}`);
  const report = await reportRes.json();
  console.log(`✓ Reporte generado para rango 2026:`);
  console.log(`  -> Monto Total Acumulado: $${report.totalAmount} ${report.currency}`);
  console.log(`  -> Líneas de Producto Reportadas: ${report.items.length}\n`);

  console.log(`======================================================`);
  console.log(`🎉 TODOS LOS ESCENARIOS E2E PASARON SATISFACTORIAMENTE`);
  console.log(`======================================================\n`);
}

runScenarios().catch(err => {
  console.error('\n❌ ERROR EN VERIFICACIÓN DE ESCENARIOS:', err.message);
  process.exit(1);
});
