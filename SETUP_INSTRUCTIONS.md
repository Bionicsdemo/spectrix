# BioQL Website - Sistema de Facturación y Alta de Usuarios

## Arquitectura del Sistema

```
┌─────────────────────┐
│  bioql_website      │  →  GitHub → Vercel (Frontend)
│  (Puerto 3000)      │
└──────────┬──────────┘
           │
           │ HTTP Request
           ↓
┌─────────────────────┐
│  ngrok tunnel       │  →  Túnel HTTPS público
│  (Puerto 4040)      │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Flask Server       │  →  Autenticación + Billing
│  (Puerto 5001)      │      SQLite + Stripe
└─────────────────────┘
```

## Componentes

### 1. Frontend (bioql_website)
- **signup.html**: Formulario de registro con Stripe.js
- **Vercel**: Hosting y dominio
- **GitHub**: Control de versiones

### 2. Backend (Server_bioql/auth_server)
- **bioql_auth_server.py**: API Flask en puerto 5001
- **SQLite**: Base de datos de usuarios y billing
- **Stripe**: Procesamiento de pagos

### 3. Túnel (ngrok)
- Expone servidor local puerto 5001 a internet
- URL pública HTTPS temporal

## Configuración Paso a Paso

### Paso 1: Configurar EmailJS

1. Ve a https://www.emailjs.com/
2. Crea una cuenta gratuita
3. Crea un servicio de email (Gmail, etc.)
4. Crea una plantilla con estos campos:

```
Subject: Your BioQL API Key - Welcome!

Hello {{to_name}},

Welcome to BioQL! Your account has been created successfully.

Your API Key:
{{api_key}}

User ID: {{user_id}}
Stripe Customer ID: {{stripe_customer_id}}

Getting Started:
1. Install: pip install bioql
2. Set your API key: export BIOQL_API_KEY={{api_key}}
3. Run your first quantum computation!

Example:
from bioql import quantum

result = quantum(
    "dock aspirin to COX-1",
    backend='simulator',
    api_key='{{api_key}}',
    shots=1024
)

Documentation: https://your-domain.com/docs

Billing:
- Pay-per-shot pricing
- Automatic invoicing every $3,000
- View usage: https://your-domain.com/billing

Questions? Reply to this email.

Best regards,
BioQL Team
```

5. Copia los valores:
   - **Public Key**: Tu clave pública
   - **Service ID**: ID del servicio de email
   - **Template ID**: ID de la plantilla

### Paso 2: Iniciar el Servidor Backend

```bash
cd /Users/heinzjungbluth/Desktop/Server_bioql
./START_BIOQL_SERVER.sh
```

Este script automáticamente:
- ✅ Inicia Flask en puerto 5001
- ✅ Inicia ngrok y obtiene URL pública
- ✅ Actualiza Modal con la nueva URL
- ✅ Configura Stripe con keys LIVE

**Salida esperada:**
```
════════════════════════════════════════════════════════════════════════════
🚀 BioQL Auth & Billing Server - PRODUCTION v3.0
════════════════════════════════════════════════════════════════════════════

✅ Stripe Configuration (LIVE MODE):
   Secret Key: sk_live_51SG9nS8N85...
   Invoice Threshold: $3000

✅ Ngrok tunnel active:
   Public URL: https://abc123.ngrok-free.app
   Dashboard: http://localhost:4040

📊 SERVER RUNNING
════════════════════════════════════════════════════════════════════════════

🌐 Endpoints:
   Local:  http://localhost:5001
   Public: https://abc123.ngrok-free.app

📋 API Endpoints:
   POST https://abc123.ngrok-free.app/auth/register
   GET  https://abc123.ngrok-free.app/health
```

**IMPORTANTE**: Copia la URL pública de ngrok (https://abc123.ngrok-free.app)

### Paso 3: Configurar signup.html

Edita `/Users/heinzjungbluth/Desktop/bioql_website/signup.html`:

```javascript
const CONFIG = {
    STRIPE_PUBLISHABLE_KEY: 'pk_live_51SG9nS8N85z8U7algbG3PoqbZc5kCC1ECveDawmt8jtTdfLCN1Z0U8uKCjfVvHYADp5qvXe28zZMhW8AbIuTty7F006eI727wu',
    BIOQL_SERVER_URL: 'https://TU-URL-NGROK-AQUI.ngrok-free.app',  // <-- CAMBIA ESTO
    EMAILJS_PUBLIC_KEY: 'TU-PUBLIC-KEY',     // <-- CAMBIA ESTO
    EMAILJS_SERVICE_ID: 'TU-SERVICE-ID',     // <-- CAMBIA ESTO
    EMAILJS_TEMPLATE_ID: 'TU-TEMPLATE-ID'    // <-- CAMBIA ESTO
};
```

### Paso 4: Subir a GitHub y Vercel

```bash
cd /Users/heinzjungbluth/Desktop/bioql_website

# Commit cambios
git add signup.html index.html SETUP_INSTRUCTIONS.md
git commit -m "Add complete billing and user signup system

- Created signup.html with Stripe integration
- Updated bioql_auth_server.py to accept payment_method_id
- Added EmailJS integration for API key delivery
- Updated navigation with Sign Up button

Complete flow:
1. User fills form with credit card (Stripe.js)
2. POST to /auth/register creates user + Stripe customer
3. EmailJS sends API key to user's email
4. User can start using BioQL immediately"

# Push a GitHub
git push origin main
```

Vercel automáticamente desplegará los cambios.

### Paso 5: Probar el Flujo Completo

1. **Abre el sitio**: https://tu-dominio.vercel.app/signup.html

2. **Llena el formulario**:
   - Nombre: Test User
   - Email: tu-email@gmail.com
   - Tarjeta de prueba Stripe: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
   - ZIP: Cualquier código

3. **Acepta términos** y clic en "Create Account & Get API Key"

4. **Verifica el flujo**:
   - ✅ Mensaje de éxito en la página
   - ✅ API key mostrado en pantalla
   - ✅ Email recibido con API key
   - ✅ Usuario en base de datos SQLite
   - ✅ Cliente creado en Stripe Dashboard

5. **Revisa logs del servidor**:
```bash
tail -f /tmp/bioql_billing_live.log
```

Deberías ver:
```
✅ User registered: id=1, email=tu-email@gmail.com
✅ Stripe customer created: cus_abc123
✅ Payment method pm_abc123 attached to customer cus_abc123
✅ Stripe subscription created: sub_abc123
```

## Endpoints Disponibles

### POST /auth/register
Registra un nuevo usuario con Stripe.

**Request:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane@university.edu",
  "payment_method_id": "pm_1234567890",
  "create_stripe_account": true
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "jane@university.edu",
    "name": "Dr. Jane Smith",
    "api_key": "bioql_abc123...",
    "tier": "free",
    "balance": 10.0,
    "stripe_customer_id": "cus_abc123",
    "stripe_subscription_id": "sub_abc123"
  },
  "stripe_customer_created": true,
  "stripe_subscription_created": true,
  "invoice_threshold_usd": 3000,
  "message": "User registered successfully - Stripe billing configured with $3000 invoice threshold"
}
```

### GET /health
Verifica que el servidor esté funcionando.

**Response:**
```json
{
  "status": "healthy",
  "stripe_enabled": true,
  "database": "connected"
}
```

### POST /billing/record-usage
Registra uso de quantum shots.

**Request:**
```json
{
  "api_key": "bioql_abc123...",
  "shots": 4096,
  "backend": "ibm_quantum",
  "usage_type": "quantum"
}
```

## Base de Datos

### Tabla: users
```sql
id                    INTEGER PRIMARY KEY
email                 TEXT UNIQUE
name                  TEXT
api_key               TEXT UNIQUE
tier                  TEXT DEFAULT 'free'
balance               REAL DEFAULT 10.0
stripe_customer_id    TEXT UNIQUE
stripe_subscription_id TEXT
created_at            TIMESTAMP
```

### Tabla: usage_logs
```sql
id                INTEGER PRIMARY KEY
user_id           INTEGER
api_key           TEXT
usage_type        TEXT
shots             INTEGER
backend           TEXT
cost              REAL
stripe_reported   BOOLEAN
timestamp         TIMESTAMP
```

## Pricing

### Simulators
- IonQ Ideal Simulator: $0.01/shot
- AWS SV1 Simulator: $0.01/shot
- AWS TN1 Simulator: $0.02/shot

### Quantum Hardware
- IBM Torino (133q): $3.00/shot
- IBM Brisbane (127q): $3.00/shot
- IonQ Forte (36q): $3.00/shot
- IonQ QPU (36q): $2.00/shot
- QuEra Aquila (256q): $5.00/shot

### Free Tier
- 100 shots/month on simulators
- 100 LLM agent calls/month

## Troubleshooting

### Error: "Could not connect to server"
- Verifica que el servidor esté corriendo: `ps aux | grep python | grep bioql_auth_server`
- Verifica ngrok: `curl http://localhost:4040/api/tunnels`
- Revisa los logs: `tail -f /tmp/bioql_billing_live.log`

### Error: "Stripe payment failed"
- Verifica keys de Stripe en START_BIOQL_SERVER.sh
- Usa tarjeta de prueba: 4242 4242 4242 4242
- Revisa Stripe Dashboard: https://dashboard.stripe.com

### Email no llega
- Verifica configuración EmailJS en signup.html
- Revisa consola del navegador (F12) para errores
- Verifica cuenta EmailJS: https://dashboard.emailjs.com

### ngrok URL expira
- ngrok free expira cada 2 horas
- Reinicia servidor: `./START_BIOQL_SERVER.sh`
- Actualiza signup.html con nueva URL
- O usa ngrok paid para URL fija

## Comandos Útiles

```bash
# Iniciar servidor
cd /Users/heinzjungbluth/Desktop/Server_bioql
./START_BIOQL_SERVER.sh

# Ver logs en tiempo real
tail -f /tmp/bioql_billing_live.log

# Ver ngrok dashboard
open http://localhost:4040

# Ver usuarios en DB
sqlite3 /Users/heinzjungbluth/Desktop/Server_bioql/auth_server/users.db "SELECT * FROM users;"

# Test endpoint
curl http://localhost:5001/health

# Detener servidor
pkill -f bioql_auth_server
pkill -f ngrok
```

## Seguridad

⚠️ **IMPORTANTE**:
- Las keys de Stripe están en LIVE MODE
- Solo usa tarjetas de prueba en desarrollo
- No compartas el archivo START_BIOQL_SERVER.sh (contiene secrets)
- Usa HTTPS (ngrok o Vercel) para producción
- Las API keys son sensibles - envíalas solo por email

## Soporte

- Documentación: https://tu-dominio.vercel.app/docs
- Email: soporte@spectrixrd.com
- GitHub Issues: https://github.com/Bionicsdemo/spectrix/issues
