# test-simple-stock-flow-tool

> **Prueba técnica · Ficha ADSO 3413974**  
> Herramienta cliente para sembrado de datos de demostración vía API REST.

---

### 1. Qué es esto
Es un cliente HTTP de utilidades que puebla automáticamente el catálogo de *Simple Stock Flow* con productos, vendedores y ventas de demostración. Por restricción de arquitectura innegociable, **nunca se conecta directamente a la base de datos MySQL**: realiza todas sus operaciones interactuando de forma legítima contra los endpoints de la API (`/api/auth/*`, `/api/products`, `/api/sales`).

### 2. Cómo se levanta
Asegúrate de que la API esté corriendo en `http://localhost:8000`. Luego ejecuta:
```bash
# Ejecutar el sembrador de datos
npm run seed
```
O indicando una URL personalizada:
```bash
API_URL=http://localhost:8000 node seed.js
```

### 3. Dónde están los datos
Este repositorio no almacena datos locales. Todos los datos sembrados se transmiten vía HTTP hacia la base de datos de la API de *Simple Stock Flow*.

### 4. Cómo se prueba
Ejecuta el script `npm run seed` contra una API activa y verifica en la terminal que imprima los checks verdes (`✓`) de autenticación, alta de productos y venta registrada.

### 5. Qué falta
La herramienta cubre completamente el sembrado de categorías, usuarios, productos y ventas de demostración según la especificación.