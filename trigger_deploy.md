# 🚀 Cómo Deployar los Cambios a spectrixrd.com

## ✅ Los cambios YA están en GitHub (commit e1c6056)

El sitio spectrixrd.com está hosteado en **Vercel** con auto-deployment desde GitHub.

## 🔄 Opciones para que aparezcan los cambios:

### Opción 1: Esperar Auto-Deploy (1-2 minutos)
Vercel debería detectar automáticamente el push y deployar. Espera 1-2 minutos y refresca el navegador con **Ctrl+Shift+R** (o **Cmd+Shift+R** en Mac) para limpiar caché.

### Opción 2: Forzar Deploy Manual en Vercel
1. Ve a: https://vercel.com/dashboard
2. Busca el proyecto **spectrix** o **bioql-website**
3. Click en **"Deployments"**
4. Click en **"Redeploy"** en el último deployment
5. Espera 30-60 segundos
6. Visita https://spectrixrd.com y refresca con **Cmd+Shift+R**

### Opción 3: Trigger Deploy con Commit Vacío
```bash
cd /Users/heinzjungbluth/Desktop/Spectrix_BioQL/bioql_website

git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main
```

Esto fuerza a Vercel a hacer un nuevo deploy.

### Opción 4: Limpiar Caché del Navegador
A veces el navegador cachea el CSS y HTML. Para ver los cambios:

**Chrome/Edge:**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

**Safari:**
- `Cmd + Option + E` (limpiar caché)
- Luego `Cmd + R` (recargar)

**Firefox:**
- `Ctrl + Shift + R` (Mac: `Cmd + Shift + R`)

## 🔍 Verificar Deployment en Vercel

1. Ve a: https://vercel.com/dashboard
2. Click en el proyecto
3. En la pestaña **"Deployments"** verifica:
   - ✅ Estado: **"Ready"**
   - ✅ Commit: `e1c6056` (feat: Agregar Quantum Docking...)
   - ✅ Branch: **main**

## 📋 Cambios que deberías ver:

Una vez desplegado, en https://spectrixrd.com verás:

**Navegación (8 links):**
1. Workflows
2. BioQL Lab Notebook
3. Quantum Graphs ⚛️
4. **Quantum Docking 🧬** ← NUEVO
5. Docs
6. Agent
7. Blog
8. Quillow 🛡️

**Spacing mejorado:**
- Desktop (>1280px): Gap de 1.5rem
- Medium (1024-1280px): Gap de 1rem, fuente más compacta
- Mobile (<768px): Menú hamburguesa

## ⚠️ Si sigue sin aparecer después de 5 minutos:

Verifica en Vercel Dashboard:
1. ¿El deployment está en "Ready"?
2. ¿El commit es el correcto (e1c6056)?
3. ¿Hay errores en el build?

Si hay problemas, avísame y revisamos los logs de Vercel.
