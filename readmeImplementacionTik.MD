# TikMark API - Endpoints y Flujo Frontend

## 📚 Tabla de Contenidos

- [Resumen de la API](#resumen-de-la-api)
- [Autenticación](#autenticación)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Flujo Completo del Usuario](#flujo-completo-del-usuario)
- [Propuesta de Frontend](#propuesta-de-frontend)
- [Ejemplos de Integración](#ejemplos-de-integración)

---

## Resumen de la API

**Base URL**: `http://localhost:3000/api`

**Autenticación**: JWT Bearer Token

**Total de Endpoints**: 35+

---

## Autenticación

### 🔐 Login y Registro

#### POST `/api/auth/login`
Iniciar sesión y obtener tokens de acceso.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/api/auth/refresh`
Refrescar el access token.

**Headers:**
```
Authorization: Bearer {refresh_token}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET `/api/auth/me`
Obtener información del usuario actual.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "role": "user",
  "tipoSuscripcion": "premium",
  "limiteBusquedasMes": 50,
  "busquedasUtilizadasMes": 12
}
```

---

## Endpoints Disponibles

### 👤 Usuarios (`/api/user`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/user` | Crear nuevo usuario | No |
| GET | `/api/user` | Listar usuarios (paginado) | Sí |
| GET | `/api/user/:id` | Obtener usuario por ID | Sí |
| GET | `/api/user/email/:email` | Obtener usuario por email | Sí |
| PUT | `/api/user/:id` | Actualizar usuario | Sí |
| PUT | `/api/user/:id/suscripcion` | Actualizar suscripción | Sí |
| PUT | `/api/user/:id/verificar-email` | Verificar email | Sí |
| PUT | `/api/user/:id/incrementar-busquedas` | Incrementar búsquedas | Sí |
| DELETE | `/api/user/:id` | Eliminar usuario | Sí |

---

### 🎯 Análisis de Competencia (`/api/competitor-analysis`)

#### 1️⃣ POST `/api/competitor-analysis/competitors`
Analizar perfiles de competidores.

**Request:**
```json
{
  "competitorProfiles": ["@competitor1", "@competitor2", "@competitor3"],
  "videosPerProfile": 50,
  "analyzeTop": 20,
  "filters": {
    "minViews": 5000,
    "minEngagementRate": 0.03
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "uuid-123",
  "summary": {
    "competitorsAnalyzed": 3,
    "totalVideos": 150,
    "analyzedVideos": 20,
    "processingTime": 45000
  },
  "insights": {
    "topProfiles": [
      {
        "username": "@competitor1",
        "avgEngagement": 0.052,
        "totalVideos": 50,
        "topTopic": "marketing digital"
      }
    ],
    "topTopics": [
      {
        "topic": "marketing digital",
        "frequency": 15,
        "avgEngagement": 0.048
      }
    ],
    "topHashtags": [
      {
        "hashtag": "#marketing",
        "usage": 25,
        "avgViews": 45000,
        "avgEngagement": 0.045
      }
    ],
    "durationAnalysis": {
      "optimal": { "min": 15, "max": 30, "median": 22 },
      "avgDuration": 23.5
    },
    "bestPractices": [
      "Videos entre 15-30 segundos tienen mejor engagement",
      "Subtítulos aumentan engagement en 25%"
    ],
    "trendingPatterns": [
      "Formato problema-solución es recurrente",
      "Videos educativos superan entretenimiento"
    ]
  },
  "suggestions": [
    {
      "title": "5 errores fatales en marketing digital",
      "description": "Crea un video educativo corto (20s) explicando errores comunes",
      "suggestedHashtags": ["#marketing", "#tips", "#emprendimiento"],
      "targetAudience": "Emprendedores y pequeños negocios",
      "estimatedEngagement": "high",
      "reasoning": "Similar a video top de @competitor1 con 50k views",
      "inspirationFrom": "@competitor1"
    }
  ]
}
```

#### 2️⃣ POST `/api/competitor-analysis/category`
Analizar categoría o hashtags.

**Request:**
```json
{
  "hashtags": ["#marketingdigital", "#emprendimiento"],
  "keywords": ["marketing digital", "redes sociales"],
  "numberOfVideos": 200,
  "analyzeTop": 30,
  "region": "MX",
  "filters": {
    "minViews": 10000,
    "minEngagementRate": 0.04
  }
}
```

**Response:** (Similar estructura al endpoint de competidores, pero incluye `topCreators`)

#### 3️⃣ POST `/api/competitor-analysis/trending`
Analizar videos trending por región.

**Request:**
```json
{
  "region": "US",
  "numberOfVideos": 100,
  "analyzeTop": 20
}
```

**Response:** (Similar estructura + `viralPatterns` y `emergingTrends`)

#### 4️⃣ POST `/api/competitor-analysis/comparative`
Análisis comparativo: tu perfil vs competencia.

**Request:**
```json
{
  "yourProfile": "@mi_usuario",
  "competitorProfiles": ["@competitor1", "@competitor2"],
  "videosPerProfile": 50
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "uuid-456",
  "comparison": {
    "yourProfile": {
      "avgEngagement": 0.035,
      "topTopics": ["motivación", "emprendimiento"],
      "strengths": [
        "Alto engagement en contenido motivacional",
        "Audiencia muy comprometida en comentarios"
      ]
    },
    "competitors": {
      "avgEngagement": 0.048,
      "topTopics": ["marketing", "estrategias", "herramientas"],
      "opportunities": [
        "Contenido más técnico y práctico",
        "Mayor uso de datos y estadísticas"
      ]
    },
    "recommendations": [
      "Combinar motivación con tips técnicos",
      "Reducir duración promedio a 18 segundos",
      "Incorporar hashtags #marketing y #estrategias"
    ]
  },
  "suggestions": [...]
}
```

#### 5️⃣ GET `/api/competitor-analysis/history`
Obtener historial de análisis.

**Query Parameters:**
- `type` (opcional): `competitor_profile | category | trending | comparative`
- `page` (opcional): número de página (default: 1)
- `limit` (opcional): resultados por página (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-123",
      "analysisType": "competitor_profile",
      "status": "completed",
      "parameters": {
        "profiles": ["@comp1", "@comp2"]
      },
      "scrapingMetadata": {
        "totalVideosScraped": 100,
        "videosAnalyzedWithAI": 20
      },
      "createdAt": "2025-01-15T10:00:00Z",
      "completedAt": "2025-01-15T10:05:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

#### 6️⃣ GET `/api/competitor-analysis/:id`
Obtener análisis específico con todos los detalles.

**Response:** (Retorna el análisis completo con videos, insights y sugerencias)

---

### 🎬 TikTok Scraping (`/api/tiktok`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/tiktok/scrape/hashtags` | Scrapear por hashtags |
| POST | `/api/tiktok/scrape/profiles` | Scrapear perfiles |
| POST | `/api/tiktok/scrape/search` | Buscar videos |
| POST | `/api/tiktok/scrape/videos` | Scrapear videos específicos |
| POST | `/api/tiktok/scrape/advanced` | Scraping avanzado con filtros |
| POST | `/api/tiktok/scrape/comments` | Obtener comentarios |
| POST | `/api/tiktok/scrape/sounds` | Obtener información de sonidos |
| GET | `/api/tiktok/trending` | Videos en tendencia |
| GET | `/api/tiktok/run/:runId/status` | Estado de ejecución |

---

### 📊 Análisis (`/api/analysis`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/analysis` | Crear análisis |
| GET | `/api/analysis` | Listar análisis (paginado) |
| GET | `/api/analysis/:id` | Obtener análisis específico |
| GET | `/api/analysis/stats` | Estadísticas de análisis |
| GET | `/api/analysis/search` | Buscar en resultados |
| GET | `/api/analysis/duplicates` | Análisis duplicados |
| GET | `/api/analysis/by-query-type/:type` | Por tipo de consulta |
| GET | `/api/analysis/date-range` | Por rango de fechas |
| PATCH | `/api/analysis/:id` | Actualizar análisis |
| PATCH | `/api/analysis/:id/status` | Actualizar estado |
| PATCH | `/api/analysis/:id/result` | Actualizar resultado |
| DELETE | `/api/analysis/:id` | Eliminar análisis |
| DELETE | `/api/analysis/bulk/multiple` | Eliminar múltiples |

---

### 🤖 Servicios de IA (`/api/ai-services`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/ai-services/video/analyze` | Analizar video con IA |
| GET | `/api/ai-services/video/cost-estimate` | Estimar costo |
| POST | `/api/ai-services/text/generate` | Generar texto con Gemini |
| POST | `/api/ai-services/text/generate-with-image` | Generar con imagen |
| POST | `/api/ai-services/text/conversation` | Conversación con historial |
| POST | `/api/ai-services/text/multiple-candidates` | Múltiples variaciones |
| POST | `/api/ai-services/text/count-tokens` | Contar tokens |
| GET | `/api/ai-services/models` | Modelos disponibles |
| GET | `/api/ai-services/models/check` | Verificar modelo |

---

## Flujo Completo del Usuario

### 🎯 Flujo Principal Recomendado

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE USUARIO                          │
└─────────────────────────────────────────────────────────────┘

1. REGISTRO / LOGIN
   └─> POST /api/user (registro)
   └─> POST /api/auth/login
   └─> Guardar access_token y refresh_token

2. DASHBOARD PRINCIPAL
   └─> GET /api/auth/me (info usuario)
   └─> GET /api/competitor-analysis/history?limit=5 (últimos análisis)
   └─> Mostrar métricas: búsquedas usadas, límites, etc.

3. OPCIONES DE ANÁLISIS (Usuario elige)
   │
   ├─> OPCIÓN A: Analizar Competidores
   │   └─> Input: 1-5 perfiles de TikTok (@username)
   │   └─> POST /api/competitor-analysis/competitors
   │   └─> Mostrar loading (2-5 min)
   │   └─> Mostrar resultados:
   │       ├─ Perfil ganador (mejor engagement)
   │       ├─ Top 5 temas
   │       ├─ Top 10 hashtags
   │       ├─ Mejores prácticas
   │       └─ 7-10 sugerencias de contenido
   │
   ├─> OPCIÓN B: Analizar Categoría/Hashtags
   │   └─> Input: Hashtags o keywords
   │   └─> POST /api/competitor-analysis/category
   │   └─> Mostrar resultados:
   │       ├─ Top creadores de la categoría
   │       ├─ Temas trending
   │       ├─ Hashtags más efectivos
   │       └─ Sugerencias de contenido
   │
   ├─> OPCIÓN C: Analizar Trending
   │   └─> Input: Región (US, MX, ES, etc.)
   │   └─> POST /api/competitor-analysis/trending
   │   └─> Mostrar:
   │       ├─ Tendencias emergentes
   │       ├─ Patrones virales
   │       ├─ Top hashtags trending
   │       └─ Ideas de contenido viral
   │
   └─> OPCIÓN D: Comparar con Competencia
       └─> Input: Tu perfil + competidores
       └─> POST /api/competitor-analysis/comparative
       └─> Mostrar:
           ├─ Tus fortalezas vs competencia
           ├─ Oportunidades de mejora
           ├─ Gaps de contenido
           └─> Recomendaciones personalizadas

4. VER RESULTADOS DETALLADOS
   └─> Guardar análisis en historial
   └─> Opción de exportar PDF/CSV
   └─> Marcar sugerencias como favoritas
   └─> Crear calendario de contenido

5. HISTORIAL Y REPORTES
   └─> GET /api/competitor-analysis/history
   └─> Filtrar por tipo/fecha
   └─> Comparar análisis pasados
   └─> Ver evolución de tendencias
```

---

## Propuesta de Frontend

### 🎨 Estructura de Pantallas

#### 1. **Dashboard Principal** (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Dashboard                    Usuario: Juan | Premium    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Resumen                                                  │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ Análisis     │ Búsquedas    │ Sugerencias  │            │
│  │ Realizados   │ Restantes    │ Generadas    │            │
│  │     12       │   38/50      │     84       │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                              │
│  🚀 Nuevo Análisis                                          │
│  ┌────────────┬────────────┬────────────┬────────────┐    │
│  │ 🎯         │ 📁         │ 🔥         │ ⚖️         │    │
│  │ Analizar   │ Analizar   │ Trending   │ Comparar   │    │
│  │ Competencia│ Categoría  │            │ Perfiles   │    │
│  └────────────┴────────────┴────────────┴────────────┘    │
│                                                              │
│  📋 Últimos Análisis                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🎯 Competidores: @user1, @user2 | Hace 2 horas     │  │
│  │    ✓ Completado | 20 videos | 8 sugerencias        │  │
│  │    [Ver Detalles]                                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 📁 Categoría: #marketing | Hace 1 día               │  │
│  │    ✓ Completado | 100 videos | 10 sugerencias      │  │
│  │    [Ver Detalles]                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 2. **Analizar Competencia** (`/analyze/competitors`)

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Analizar Competencia                     [← Volver]     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Paso 1: Selecciona competidores                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 Buscar perfiles de TikTok                        │   │
│  │ @____________________________________________       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Competidores seleccionados:                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ @competitor1              [×]                     │   │
│  │ ✓ @competitor2              [×]                     │   │
│  │ ✓ @competitor3              [×]                     │   │
│  │                                                      │   │
│  │ [+ Agregar otro competidor]  (máx: 5)               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Configuración:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Videos por perfil:    [50 ▼]                        │   │
│  │ Analizar con IA:      [20 ▼] videos                │   │
│  │                                                      │   │
│  │ Filtros avanzados: [Expandir ▼]                     │   │
│  │   └─ Mín. views:       [5000]                       │   │
│  │   └─ Mín. engagement:  [0.03]                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Estimado: ~3 minutos | Costo: 0 créditos                  │
│                                                              │
│  [Cancelar]                    [Iniciar Análisis →]        │
└─────────────────────────────────────────────────────────────┘
```

#### 3. **Resultados del Análisis** (`/analysis/:id`)

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Resultados: Análisis de Competencia    [Exportar PDF]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⭐ Perfil Ganador                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ @competitor1                                         │   │
│  │ Engagement: 5.2% | 50 videos | Top: "marketing"     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Insights] [Hashtags] [Prácticas] [Sugerencias]           │
│  ════════════════════════════════════════════════           │
│                                                              │
│  🎯 Top Temas Identificados                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Marketing Digital        ████████░░ 15 videos    │   │
│  │    Engagement: 4.8%                                  │   │
│  │                                                      │   │
│  │ 2. Estrategias de contenido ██████░░░░ 12 videos    │   │
│  │    Engagement: 4.5%                                  │   │
│  │                                                      │   │
│  │ 3. Herramientas IA          ████░░░░░░ 8 videos     │   │
│  │    Engagement: 5.1%                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  #️⃣ Hashtags Más Efectivos                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ #marketing        25 usos | 45K views promedio      │   │
│  │ #emprendimiento   18 usos | 38K views promedio      │   │
│  │ #tips             15 usos | 32K views promedio      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ✅ Mejores Prácticas Detectadas                           │
│  • Videos entre 15-30 segundos tienen mejor engagement     │
│  • Subtítulos aumentan engagement en 25%                   │
│  • Hooks en primeros 3 segundos son críticos               │
│  • Formato "problema-solución" es recurrente               │
│                                                              │
│  💡 Sugerencias de Contenido (8)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. "5 errores fatales en marketing digital" [HIGH] │   │
│  │    Basado en: @competitor1 (50K views)              │   │
│  │    📝 Crea un video educativo corto (20s)...        │   │
│  │    🏷️ #marketing #tips #emprendimiento              │   │
│  │    [💾 Guardar] [📅 Programar] [Ver Más ▼]         │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 2. "Herramientas IA que uso diario" [HIGH]         │   │
│  │    ...                                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [← Volver al Dashboard]     [Nuevo Análisis →]           │
└─────────────────────────────────────────────────────────────┘
```

#### 4. **Historial de Análisis** (`/history`)

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Historial de Análisis                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Filtros: [Todos ▼] [Última semana ▼] [🔍 Buscar]         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🎯 Competidores: 3 perfiles | Hace 2 horas         │  │
│  │    @comp1, @comp2, @comp3                           │  │
│  │    ✓ 150 videos | 20 analizados | 8 sugerencias     │  │
│  │    [Ver] [Exportar] [Eliminar]                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 📁 Categoría: #marketing | Hace 1 día               │  │
│  │    200 videos | 30 analizados | 10 sugerencias      │  │
│  │    [Ver] [Exportar] [Eliminar]                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ 🔥 Trending: US | Hace 3 días                       │  │
│  │    100 videos | 20 analizados | 8 sugerencias       │  │
│  │    [Ver] [Exportar] [Eliminar]                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Mostrando 1-10 de 25 | [< Anterior] [Siguiente >]        │
└─────────────────────────────────────────────────────────────┘
```

---

### 🎯 Flujo de Usuario Optimizado (UX)

#### **Estado 1: Nuevo Usuario**
```
Login → Onboarding (3 pasos) → Dashboard
  │
  └─> Onboarding:
      1. "¿Qué quieres lograr?"
         □ Espiar a la competencia
         □ Descubrir tendencias
         □ Mejorar mi contenido
         □ Todo lo anterior

      2. "¿En qué nicho estás?"
         Input: [marketing digital___]

      3. "Conecta tu perfil de TikTok (opcional)"
         Input: [@mi_usuario________]

      [Comenzar →]
```

#### **Estado 2: Usuario con Experiencia**
```
Dashboard → [Acceso Rápido]
  │
  ├─> Botón: "Analizar Competencia" (1 click)
  ├─> Botón: "Ver Trending Ahora" (1 click)
  ├─> Últimos análisis → [Ver] (1 click)
  └─> Sugerencias guardadas → [Ver Calendario]
```

#### **Estado 3: Durante Análisis (Loading)**
```
┌─────────────────────────────────────────┐
│  🔄 Analizando...                       │
│                                          │
│  [████████████████░░░░] 75%             │
│                                          │
│  ✓ Scrapeando 150 videos                │
│  ✓ Filtrando por engagement             │
│  ⏳ Analizando con IA (20 videos)...    │
│  ⏸️ Generando sugerencias...            │
│                                          │
│  Tiempo estimado: 2 minutos             │
│                                          │
│  💡 Mientras esperas:                   │
│  "El 80% de los videos virales tienen  │
│   hooks en los primeros 3 segundos"     │
│                                          │
│  [Cancelar]                             │
└─────────────────────────────────────────┘
```