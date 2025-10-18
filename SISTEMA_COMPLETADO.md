# ✅ Sistema de Facturación y Alta de Usuarios - COMPLETADO

## 🎯 Objetivo Alcanzado

Se ha implementado un sistema completo de registro de usuarios con facturación automática usando Stripe y entrega de API keys por email.

## 🏗️ Arquitectura Implementada

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                        │
│  bioql_website/signup.html                                  │
│  - Formulario de registro                                   │
│  - Integración Stripe.js (tarjeta de crédito)              │
│  - Integración EmailJS (envío de API key)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS POST /auth/register
                     │ {name, email, payment_method_id}
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    TÚNEL PÚBLICO (ngrok)                     │
│  Puerto 4040 - Dashboard                                    │
│  Genera URL: https://xxxxx.ngrok-free.app                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Reenvía a localhost:5001
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Flask - Puerto 5001)                   │
│  Server_bioql/auth_server/bioql_auth_server.py              │
│  - Crea usuario en SQLite                                   │
│  - Genera API key única                                     │
│  - Crea cliente en Stripe                                   │
│  - Adjunta método de pago                                   │
│  - Crea suscripción con threshold $3000                     │
│  - Retorna API key al frontend                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─► SQLite (users.db)
                     │   └─ Almacena: usuarios, usage_logs, quotas
                     │
                     └─► Stripe API
                         └─ Crea: customer, payment_method, subscription
```

## 📁 Archivos Creados/Modificados

### Frontend (bioql_website/)

#### ✨ signup.html (NUEVO)
**446 líneas** - Página completa de registro
- Formulario con validación
- Integración Stripe Elements (tarjeta de crédito)
- Integración EmailJS (envío automático de emails)
- UI moderna con estados de loading
- Manejo de errores
- Pantalla de éxito con API key

**Features:**
- 💳 Stripe.js v3 para captura segura de tarjeta
- 📧 EmailJS para envío automático de credenciales
- 🎨 Diseño responsive con gradientes quantum
- ⚡ Estados de carga y validación en tiempo real
- ✅ Confirmación visual con API key mostrado

#### 📚 SETUP_INSTRUCTIONS.md (NUEVO)
**378 líneas** - Documentación completa
- Diagrama de arquitectura
- Instrucciones paso a paso para configurar EmailJS
- Comandos para iniciar el servidor
- Guía de testing con tarjetas de prueba
- Troubleshooting completo
- Referencia de API endpoints
- Comandos útiles para debugging

#### 🔧 index.html (MODIFICADO)
- Botón "Get Started" → "Sign Up"
- Link directo a signup.html

### Backend (Server_bioql/auth_server/)

#### 🔌 bioql_auth_server.py (MODIFICADO)

**Función: register_user() - Línea 523**
```python
# ANTES:
def register_user():
    email = request.json.get('email')
    name = request.json.get('name')
    # ... crear usuario

# AHORA:
def register_user():
    email = request.json.get('email')
    name = request.json.get('name')
    payment_method_id = request.json.get('payment_method_id')  # ← NUEVO
    # ... crear usuario
    # ... crear cliente Stripe con payment method adjunto
```

**Función: create_stripe_customer_for_user() - Línea 331**
```python
# ANTES:
def create_stripe_customer_for_user(user: Dict[str, Any]) -> Optional[str]:

# AHORA:
def create_stripe_customer_for_user(user: Dict[str, Any], payment_method_id: Optional[str] = None) -> Optional[str]:
    # ... crea cliente Stripe
    if payment_method_id:
        stripe.PaymentMethod.attach(payment_method_id, customer=stripe_customer_id)  # ← NUEVO
        stripe.Customer.modify(stripe_customer_id,
            invoice_settings={'default_payment_method': payment_method_id})  # ← NUEVO
```

## 🔄 Flujo Completo Implementado

### 1. Usuario llena formulario (signup.html)
```javascript
// Usuario ingresa:
- Nombre completo
- Email
- Tarjeta de crédito (Stripe Elements)
- ✓ Acepta términos y condiciones
```

### 2. Frontend crea PaymentMethod con Stripe.js
```javascript
const {paymentMethod} = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: {name, email}
});
// Resultado: pm_1234567890 (payment method ID)
```

### 3. Frontend envía datos al backend
```javascript
POST https://xxxxx.ngrok-free.app/auth/register
{
    "name": "Dr. Jane Smith",
    "email": "jane@university.edu",
    "payment_method_id": "pm_1234567890",
    "create_stripe_account": true
}
```

### 4. Backend procesa registro
```python
# 1. Crea usuario en SQLite
api_key = generate_api_key()  # "bioql_abc123..."
user_id = cursor.execute("INSERT INTO users ...").lastrowid

# 2. Crea cliente en Stripe
customer = stripe.Customer.create(email=email, name=name)

# 3. Adjunta método de pago
stripe.PaymentMethod.attach(payment_method_id, customer=customer.id)
stripe.Customer.modify(customer.id,
    invoice_settings={'default_payment_method': payment_method_id})

# 4. Crea suscripción con threshold $3000
subscription = stripe.Subscription.create(
    customer=customer.id,
    items=[{'price': usage_price_id}],
    billing_thresholds={'amount_gte': 300000}  # $3000 en centavos
)
```

### 5. Backend retorna API key
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "jane@university.edu",
    "api_key": "bioql_abc123...",
    "stripe_customer_id": "cus_abc123",
    "stripe_subscription_id": "sub_abc123"
  },
  "message": "User registered successfully - Stripe billing configured with $3000 invoice threshold"
}
```

### 6. Frontend envía email con EmailJS
```javascript
emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    to_name: "Dr. Jane Smith",
    to_email: "jane@university.edu",
    api_key: "bioql_abc123...",
    user_id: 1,
    stripe_customer_id: "cus_abc123"
});
```

### 7. Usuario recibe email
```
Subject: Your BioQL API Key - Welcome!

Hello Dr. Jane Smith,

Your API Key: bioql_abc123...

Getting Started:
pip install bioql

Example:
from bioql import quantum
result = quantum("dock aspirin to COX-1", api_key="bioql_abc123...")
```

### 8. Usuario puede usar BioQL inmediatamente
```python
import bioql
result = bioql.quantum(
    "dock aspirin to COX-1",
    backend='simulator',
    api_key='bioql_abc123...',
    shots=4096
)
```

## 💳 Integración Stripe Completada

### Configuración Actual
- ✅ **Modo**: LIVE (producción)
- ✅ **Secret Key**: sk_live_51SG9nS8N85z8U7al...
- ✅ **Publishable Key**: pk_live_51SG9nS8N85z8U7al...
- ✅ **Webhook Secret**: whsec_FWfw9QSSHIGm1DOVc8...
- ✅ **Invoice Threshold**: $3,000 USD

### Funcionalidad Implementada
1. ✅ Creación automática de clientes (Customer)
2. ✅ Adjuntar métodos de pago (PaymentMethod)
3. ✅ Configurar pago por defecto
4. ✅ Crear suscripciones con billing thresholds
5. ✅ Reportar uso en tiempo real
6. ✅ Invoicing automático cada $3,000

### Pricing Configurado
```
Simulators:
- IonQ Ideal: $0.01/shot
- AWS SV1: $0.01/shot
- AWS TN1: $0.02/shot

Quantum Hardware:
- IBM Torino (133q): $3.00/shot
- IBM Brisbane (127q): $3.00/shot
- IonQ Forte (36q): $3.00/shot
- IonQ QPU (36q): $2.00/shot
- QuEra Aquila (256q): $5.00/shot

Free Tier:
- 100 shots/month (simulators)
- 100 LLM calls/month
```

## 📧 Integración EmailJS

### Configuración Necesaria (Pendiente)
Para que el email funcione, debes configurar en signup.html:

```javascript
const CONFIG = {
    EMAILJS_PUBLIC_KEY: 'YOUR_PUBLIC_KEY',      // ← Configurar
    EMAILJS_SERVICE_ID: 'YOUR_SERVICE_ID',      // ← Configurar
    EMAILJS_TEMPLATE_ID: 'YOUR_TEMPLATE_ID'     // ← Configurar
};
```

### Pasos para Configurar EmailJS
1. Crear cuenta en https://www.emailjs.com/
2. Conectar servicio de email (Gmail, etc.)
3. Crear plantilla con variables: `{{to_name}}`, `{{api_key}}`, etc.
4. Copiar Public Key, Service ID, Template ID
5. Actualizar signup.html con estos valores

**Plantilla sugerida incluida en SETUP_INSTRUCTIONS.md**

## 🗄️ Base de Datos SQLite

### Tablas Creadas

#### users
```sql
id                    INTEGER PRIMARY KEY
email                 TEXT UNIQUE NOT NULL
name                  TEXT NOT NULL
api_key               TEXT UNIQUE NOT NULL
tier                  TEXT DEFAULT 'free'
balance               REAL DEFAULT 10.0
stripe_customer_id    TEXT UNIQUE
stripe_subscription_id TEXT
stripe_setup_complete BOOLEAN DEFAULT FALSE
created_at            TIMESTAMP
last_used             TIMESTAMP
```

#### usage_logs
```sql
id                INTEGER PRIMARY KEY
user_id           INTEGER NOT NULL
api_key           TEXT NOT NULL
usage_type        TEXT NOT NULL
shots             INTEGER DEFAULT 0
backend           TEXT
cost              REAL NOT NULL
stripe_reported   BOOLEAN DEFAULT FALSE
stripe_event_id   TEXT
timestamp         TIMESTAMP
```

#### monthly_quotas
```sql
id                    INTEGER PRIMARY KEY
user_id               INTEGER NOT NULL
month                 TEXT NOT NULL
shots_used            INTEGER DEFAULT 0
inferences_used       INTEGER DEFAULT 0
total_cost            REAL DEFAULT 0.0
stripe_reported_amount REAL DEFAULT 0.0
```

#### stripe_invoices
```sql
id                  INTEGER PRIMARY KEY
user_id             INTEGER NOT NULL
stripe_invoice_id   TEXT UNIQUE NOT NULL
stripe_customer_id  TEXT NOT NULL
amount_usd          REAL NOT NULL
status              TEXT NOT NULL
invoice_pdf         TEXT
created_at          TIMESTAMP
paid_at             TIMESTAMP
```

## 🚀 Cómo Iniciar el Sistema

### 1. Iniciar Backend
```bash
cd /Users/heinzjungbluth/Desktop/Server_bioql
./START_BIOQL_SERVER.sh
```

**Salida esperada:**
```
🚀 BioQL Auth & Billing Server - PRODUCTION v3.0
✅ Stripe Configuration (LIVE MODE)
✅ Ngrok tunnel active: https://abc123.ngrok-free.app
📊 SERVER RUNNING
```

**Copia la URL de ngrok**: `https://abc123.ngrok-free.app`

### 2. Configurar Frontend
Edita `signup.html` línea ~365:
```javascript
const CONFIG = {
    BIOQL_SERVER_URL: 'https://abc123.ngrok-free.app',  // ← Pega URL de ngrok
    EMAILJS_PUBLIC_KEY: 'tu_public_key',                 // ← De EmailJS
    EMAILJS_SERVICE_ID: 'tu_service_id',                 // ← De EmailJS
    EMAILJS_TEMPLATE_ID: 'tu_template_id'                // ← De EmailJS
};
```

### 3. Subir a GitHub/Vercel
```bash
cd /Users/heinzjungbluth/Desktop/bioql_website
git push origin main
```

Vercel automáticamente despliega en: `https://tu-dominio.vercel.app`

### 4. Probar
1. Ir a: `https://tu-dominio.vercel.app/signup.html`
2. Llenar formulario con tarjeta de prueba: `4242 4242 4242 4242`
3. Verificar:
   - ✅ Mensaje de éxito
   - ✅ API key mostrado
   - ✅ Email recibido
   - ✅ Usuario en SQLite
   - ✅ Cliente en Stripe Dashboard

## 📊 Endpoints API Disponibles

### POST /auth/register
Registra nuevo usuario con Stripe

### POST /auth/validate
Valida API key

### POST /billing/check-limits
Verifica límites antes de ejecución

### POST /billing/record-usage
Registra uso de shots quantum

### POST /billing/log-usage
Registra uso de LLM agent

### POST /webhooks/stripe
Recibe eventos de Stripe

### GET /billing/usage/:user_id
Obtiene uso actual

### GET /billing/invoices/:user_id
Obtiene historial de facturas

### GET /health
Health check del servidor

### GET /stats
Estadísticas del servidor

## ✅ Estado del Proyecto

### Completado
- ✅ Página de registro (signup.html)
- ✅ Integración Stripe.js
- ✅ Integración EmailJS (estructura)
- ✅ Backend endpoint /auth/register actualizado
- ✅ Función de adjuntar payment method
- ✅ Base de datos SQLite con todas las tablas
- ✅ Servidor Flask con todas las rutas
- ✅ Script de inicio automático (START_BIOQL_SERVER.sh)
- ✅ Documentación completa (SETUP_INSTRUCTIONS.md)
- ✅ Navigation bar actualizado
- ✅ Commit a GitHub

### Pendiente (Configuración del Usuario)
- ⏳ Configurar cuenta EmailJS
- ⏳ Crear plantilla de email en EmailJS
- ⏳ Actualizar CONFIG en signup.html con credenciales EmailJS
- ⏳ Actualizar BIOQL_SERVER_URL con ngrok URL actual
- ⏳ Testing end-to-end con email real

## 🧪 Testing

### Tarjetas de Prueba Stripe
```
Tarjeta exitosa:        4242 4242 4242 4242
Tarjeta declinada:      4000 0000 0000 0002
Requiere autenticación: 4000 0025 0000 3155

Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
ZIP: Cualquier código
```

### Verificar Logs
```bash
# Logs del servidor
tail -f /tmp/bioql_billing_live.log

# ngrok dashboard
open http://localhost:4040

# SQLite database
sqlite3 /Users/heinzjungbluth/Desktop/Server_bioql/auth_server/users.db "SELECT * FROM users;"
```

## 📝 Notas Importantes

1. **ngrok URL expira**: La URL gratuita de ngrok expira cada 2 horas. Reinicia el servidor para obtener nueva URL.

2. **Modo LIVE Stripe**: Está configurado en modo PRODUCCIÓN. Usa solo tarjetas de prueba en desarrollo.

3. **Secrets seguros**: Las keys de Stripe están en START_BIOQL_SERVER.sh. No compartir este archivo.

4. **Email delivery**: EmailJS tiene límite de 200 emails/mes en plan gratuito.

5. **Base de datos**: SQLite está en `Server_bioql/auth_server/users.db`. Hacer backup regularmente.

## 🎉 Resumen

Se ha implementado exitosamente un sistema completo de registro de usuarios con:

1. **Frontend**: Formulario moderno con Stripe Elements
2. **Backend**: API Flask con integración completa de Stripe
3. **Email**: Sistema de envío automático de API keys
4. **Base de datos**: Almacenamiento de usuarios y billing
5. **Documentación**: Guía completa de setup y uso

El usuario ahora puede:
- Registrarse con tarjeta de crédito
- Recibir API key por email automáticamente
- Empezar a usar BioQL inmediatamente
- Ser facturado automáticamente por uso
- Recibir invoices cada $3,000

**Sistema listo para producción** una vez configurado EmailJS! 🚀
