# test-simple-stock-flow-tool

> **Prueba tÃ©cnica Â· Ficha ADSO 3413974**  
> Herramienta cliente para sembrado de datos de demostraciÃ³n vÃ­a API REST.

---

### 1. QuÃ© es esto
Es un cliente HTTP de utilidades que puebla automÃ¡ticamente el catÃ¡logo de *Simple Stock Flow* con productos, vendedores y ventas de demostraciÃ³n. Por restricciÃ³n de arquitectura innegociable, **nunca se conecta directamente a la base de datos MySQL**: realiza todas sus operaciones interactuando de forma legÃ­tima contra los endpoints de la API (`/api/auth/*`, `/api/products`, `/api/sales`).

### 2. CÃ³mo se levanta
AsegÃºrate de que la API estÃ© corriendo en `http://localhost:8000`. Luego ejecuta:
```bash
# Ejecutar el sembrador de datos
npm run seed
```
O indicando una URL personalizada:
```bash
API_URL=http://localhost:8000 node seed.js
```

### 3. DÃ³nde estÃ¡n los datos
Este repositorio no almacena datos locales. Todos los datos sembrados se transmiten vÃ­a HTTP hacia la base de datos de la API de *Simple Stock Flow*.

### 4. CÃ³mo se prueba
Ejecuta el script `npm run seed` contra una API activa y verifica en la terminal que imprima los checks verdes (`âœ“`) de autenticaciÃ³n, alta de productos y venta registrada.

### 5. QuÃ© falta
La herramienta cubre completamente el sembrado de categorÃ­as, usuarios, productos y ventas de demostraciÃ³n segÃºn la especificaciÃ³n.