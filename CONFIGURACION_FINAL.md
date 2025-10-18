# 🚀 Configuración Final - Últimos 2 Pasos

## ✅ Ya Configurado

- ✅ **Dominio**: www.spectrixrd.com
- ✅ **Service ID**: service_vh3hbgr
- ✅ **Template ID**: template_5rnk5dp
- ✅ **Template HTML**: Actualizado con dominio correcto
- ✅ **Stripe Keys**: Configuradas en LIVE mode

---

## ⏳ Pendiente (2 pasos - 5 minutos)

### Paso 1: Obtener Public Key de EmailJS (2 min)

1. Ve a: https://dashboard.emailjs.com/admin/account
2. En la sección **"API Keys"**, copia tu **Public Key**
   - Se ve algo así: `user_abc123xyz` o `Uoq5AonGyDGvl5kvE`

3. Actualiza `signup.html` línea 326:
   ```javascript
   EMAILJS_PUBLIC_KEY: 'TU_PUBLIC_KEY_AQUI', // ← Pegar aquí
   ```

### Paso 2: Obtener ngrok URL del servidor (3 min)

1. Abre una nueva terminal y ejecuta:
   ```bash
   cd /Users/heinzjungbluth/Desktop/Server_bioql
   ./START_BIOQL_SERVER.sh
   ```

2. Copia la URL de ngrok que aparece (algo como `https://abc123.ngrok-free.app`)

3. Actualiza `signup.html` línea 325:
   ```javascript
   BIOQL_SERVER_URL: 'https://abc123.ngrok-free.app', // ← Pegar URL de ngrok
   ```

---

## 📤 Subir a GitHub (1 minuto)

Una vez actualizados los 2 valores en signup.html:

```bash
cd /Users/heinzjungbluth/Desktop/bioql_website

git add signup.html EMAIL_TEMPLATE.html CONFIGURACION_FINAL.md

git commit -m "Configure EmailJS and update domain to spectrixrd.com

- Set Service ID: service_vh3hbgr
- Set Template ID: template_5rnk5dp
- Updated email template with www.spectrixrd.com domain
- Added final configuration instructions

Ready to deploy!"

git push origin main
```

Vercel automáticamente desplegará en www.spectrixrd.com

---

## 🧪 Probar el Sistema (2 minutos)

1. Ve a: **https://www.spectrixrd.com/signup.html**

2. Llena el formulario:
   - **Nombre**: Test User
   - **Email**: tu-email-real@gmail.com (para recibir el email)
   - **Tarjeta**: `4242 4242 4242 4242` (tarjeta de prueba Stripe)
   - **Fecha**: `12/34`
   - **CVC**: `123`
   - **ZIP**: `12345`

3. ✓ Acepta términos y condiciones

4. Click en **"Create Account & Get API Key"**

5. **Verifica**:
   - ✅ Mensaje de éxito en la página
   - ✅ API key mostrado: `bioql_abc123...`
   - ✅ Email recibido en tu bandeja con diseño quantum 🎨
   - ✅ Email contiene tu API key

6. **Revisa los logs del servidor**:
   ```bash
   tail -f /tmp/bioql_billing_live.log
   ```

   Deberías ver:
   ```
   ✅ User registered: email=tu-email@gmail.com
   ✅ Stripe customer created: cus_abc123
   ✅ Payment method pm_abc123 attached
   ```

7. **Verifica en Stripe Dashboard**:
   - Ve a: https://dashboard.stripe.com/customers
   - Deberías ver el nuevo cliente creado

---

## 📧 Cómo se ve el Email

El usuario recibirá un email profesional con:

- 🎨 Diseño moderno con gradientes quantum (azul/morado)
- 🔑 Su API key destacado en un código box
- 👤 User ID y Stripe Customer ID
- 🚀 Instrucciones de instalación paso a paso
- 💻 Ejemplo de código con syntax highlighting
- 💳 Información de billing
- 📚 Links a docs (www.spectrixrd.com/docs)

**Vista previa**: Abre `EMAIL_TEMPLATE.html` en tu navegador para ver cómo se ve

---

## 🎯 Resumen de Valores Finales

```javascript
const CONFIG = {
    STRIPE_PUBLISHABLE_KEY: 'pk_live_51SG9nS8N85z8U7al...', // ✅ Configurado
    BIOQL_SERVER_URL: 'https://??????.ngrok-free.app',     // ⏳ Paso 2
    EMAILJS_PUBLIC_KEY: '?????????????',                    // ⏳ Paso 1
    EMAILJS_SERVICE_ID: 'service_vh3hbgr',                  // ✅ Configurado
    EMAILJS_TEMPLATE_ID: 'template_5rnk5dp'                 // ✅ Configurado
};
```

---

## ⚠️ Importante

### ngrok URL cambia cada vez
La URL de ngrok expira cada 2 horas en el plan gratuito. Cada vez que reinicies el servidor:

1. Obtendrás una nueva URL (ej: `https://xyz789.ngrok-free.app`)
2. Debes actualizar `signup.html` línea 325
3. Hacer commit y push a GitHub
4. Esperar ~1 minuto para que Vercel despliegue

**Solución permanente**: Usar ngrok paid ($8/mes) para URL fija, o desplegar el backend en un servidor real (Heroku, Railway, etc.)

### Modo LIVE Stripe
El sistema está en modo **producción**. Usa SOLO tarjetas de prueba en desarrollo:
- ✅ `4242 4242 4242 4242` - Exitosa
- ✅ `4000 0000 0000 0002` - Declinada
- ❌ NO uses tarjetas reales hasta estar en producción

---

## 📊 Estado Actual

```
┌────────────────────────────────────────┐
│  Sistema de Registro y Billing        │
│  Estado: 90% Completo                  │
└────────────────────────────────────────┘

✅ Frontend (signup.html)           100%
✅ Backend (Flask + Stripe)         100%
✅ Base de datos (SQLite)           100%
✅ Email template (HTML)            100%
✅ EmailJS Service ID               100%
✅ EmailJS Template ID              100%
⏳ EmailJS Public Key                 0%
⏳ ngrok URL actualizada               0%

Próximo: Completar Paso 1 y Paso 2 (5 min)
```

---

## 🎉 Una vez Completado

Tu sistema estará 100% funcional y podrás:

1. ✅ Recibir registros de usuarios en www.spectrixrd.com/signup.html
2. ✅ Procesar pagos con tarjetas de crédito (Stripe)
3. ✅ Generar API keys automáticamente
4. ✅ Enviar emails de bienvenida con credenciales
5. ✅ Facturar automáticamente cada $3,000 USD
6. ✅ Almacenar todo en SQLite
7. ✅ Ver clientes en Stripe Dashboard

**¡Solo faltan 5 minutos!** 🚀

---

## 📞 Si necesitas ayuda

- 📖 Ver: `SETUP_INSTRUCTIONS.md` para guía completa
- 📖 Ver: `SISTEMA_COMPLETADO.md` para documentación técnica
- 📧 Email: heinz@jungbluth.solutions
