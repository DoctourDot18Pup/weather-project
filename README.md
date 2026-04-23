# Weather Dashboard

Dashboard meteorológico full-stack con API Laravel + frontend React. Muestra clima actual, pronóstico horario y diario, calidad del aire, mapa interactivo e historial de búsquedas con estadísticas.

---

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | Laravel 13 · PHP 8.3 |
| Frontend | React 18 · Vite 8 |
| Estilos | Tailwind CSS 3 (B&W monochromático) |
| Base de datos | SQLite (dev) · PostgreSQL/Supabase (prod) |
| Fuente de datos | OpenWeatherMap Free Tier |
| Mapa | Leaflet + react-leaflet |

---

## Requisitos previos

- PHP 8.3+
- Composer
- Node.js 18+
- Una API key gratuita de [OpenWeatherMap](https://openweathermap.org/api)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd weather-project
```

### 2. Configurar el backend

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Editar `.env` y agregar:

```env
DB_CONNECTION=sqlite

OPENWEATHER_API_KEY=tu_api_key_aqui
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
```

Crear la base de datos y ejecutar migraciones:

```bash
touch database/database.sqlite
php artisan migrate
```

### 3. Configurar el frontend

Crear `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_OPENWEATHER_API_KEY=tu_api_key_aqui
```

Instalar dependencias:

```bash
cd frontend
npm install
```

---

## Levantar el entorno de desarrollo

Abrir **dos terminales**:

**Terminal 1 — API Laravel:**
```bash
php artisan serve --port=8000
```

**Terminal 2 — Frontend React:**
```bash
cd frontend
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

---

## Funcionalidades

### Búsqueda
- Búsqueda de ciudades por nombre con **autocompletado** (debounce 400 ms vía `/api/geocode`)
- **Geolocalización** automática con el botón de ubicación
- **URL compartible**: al buscar, la URL se actualiza a `?city=NombreCiudad`; cargar esa URL ejecuta la búsqueda automáticamente

### Ciudades favoritas
- Botón de estrella (★) en la tarjeta de clima actual
- Se persisten en `localStorage` (máximo 8 ciudades)
- Aparecen como chips clickeables sobre el buscador

### Clima actual
- Temperatura, sensación térmica, mín/máx del día
- Lluvia y nieve en mm/h (cuando aplica)
- Humedad, amanecer y atardecer
- Condición meteorológica e ícono

### Datos extendidos
- Velocidad y dirección del viento
- Presión atmosférica
- Visibilidad
- Nubosidad
- Punto de rocío (fórmula de Magnus)
- Ráfagas de viento

### Calidad del aire (AQI)
- Índice AQI 1–5 con barra de segmentos
- Contaminantes: PM2.5, PM10, O₃, CO con umbral de seguridad destacado

### Pronóstico horario (próximas 24 h)
- **Gráfica SVG interactiva**: curva de temperatura bezier, líneas de referencia mín/máx, barras de probabilidad de lluvia
- La gráfica se adapta al ancho del contenedor (`ResizeObserver`)
- **Tooltip al pasar el cursor**: temperatura, sensación térmica, humedad, prob. de lluvia, viento (velocidad + dirección cardinal), nubosidad — cada dato acompañado de una descripción textual cualitativa
- Ícono del tiempo y velocidad de viento por franja horaria

### Pronóstico diario (5 días)
- Ícono, descripción, barra visual de rango de temperatura, mín/máx y probabilidad de lluvia

### Mapa interactivo
- Tiles oscuros CartoDB Dark Matter como base
- Capas de OpenWeatherMap: **Nubes, Lluvia, Temperatura, Viento**
- Selector de capa en tiempo real
- Marcador en la ciudad activa

### Alertas automáticas

Detectadas del lado del cliente sin endpoint adicional:

| Condición | Umbral |
|-----------|--------|
| Viento fuerte | ≥ 10 m/s |
| Ráfagas intensas | ≥ 15 m/s |
| Calor extremo | ≥ 38 °C |
| Temperatura bajo cero | < 0 °C |
| Visibilidad reducida | < 1 000 m |
| Alta probabilidad de lluvia | ≥ 70 % en las próximas horas |

### Historial de búsquedas
- Lista paginada (10 por página) con temperatura, AQI, país y fecha
- Eliminar entradas individuales o limpiar todo el historial
- Hacer clic en una entrada relanza la búsqueda

### Estadísticas del historial
- Total de búsquedas realizadas
- Ciudad más buscada
- Temperatura promedio, mínima y máxima global
- Distribución de condiciones meteorológicas

---

## Estructura del proyecto

```
weather-project/
├── app/
│   ├── Http/Controllers/Api/
│   │   └── WeatherController.php   # Endpoints de la API
│   ├── Models/
│   │   └── WeatherSearch.php       # Modelo de historial
│   └── Services/
│       └── WeatherService.php      # Lógica de negocio + caché
├── database/migrations/            # Migraciones SQLite/PostgreSQL
├── routes/
│   └── api.php                     # Definición de rutas
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AirQuality.jsx
│   │   │   ├── DailyForecast.jsx
│   │   │   ├── ExtraStats.jsx
│   │   │   ├── FavoriteCities.jsx
│   │   │   ├── HistoryList.jsx
│   │   │   ├── HistoryStats.jsx
│   │   │   ├── HourlyForecast.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── WeatherAlerts.jsx
│   │   │   ├── WeatherCard.jsx
│   │   │   └── WeatherMap.jsx
│   │   ├── context/
│   │   │   └── UnitContext.jsx     # Toggle °C / °F global
│   │   ├── hooks/
│   │   │   └── useFavorites.js     # Favoritos con localStorage
│   │   ├── services/
│   │   │   └── weatherApi.js       # Llamadas a la API Laravel
│   │   └── utils/
│   │       ├── units.js            # Conversión de temperaturas
│   │       ├── weatherHelpers.js   # Helpers + inferAlerts
│   │       └── weatherIcons.js     # Íconos por condición meteorológica
│   └── package.json
└── .env
```

---

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/weather/{city}` | Clima actual por nombre de ciudad |
| `GET` | `/api/weather/by-coords?lat=&lon=` | Clima actual por coordenadas |
| `GET` | `/api/geocode?q=` | Autocompletado de ciudades (hasta 5 resultados) |
| `GET` | `/api/weather-history?page=` | Historial paginado (10 por página) |
| `GET` | `/api/weather-history/{id}` | Entrada específica del historial |
| `DELETE` | `/api/weather-history/{id}` | Eliminar una entrada |
| `DELETE` | `/api/weather-history` | Limpiar todo el historial |
| `GET` | `/api/weather-stats` | Estadísticas agregadas del historial |

### Ejemplo de respuesta — `/api/weather/{city}`

```json
{
  "city": "Celaya",
  "country": "MX",
  "lat": 20.52,
  "lon": -100.82,
  "temperature": 24.0,
  "feels_like": 23.5,
  "temp_min": 15.0,
  "temp_max": 31.0,
  "humidity": 45,
  "pressure": 1013,
  "visibility": 10000,
  "wind_speed": 4.2,
  "wind_deg": 180,
  "clouds": 20,
  "sunrise": 1745920000,
  "sunset": 1745964000,
  "weather_main": "Clear",
  "weather_description": "cielo despejado",
  "icon": "01d",
  "aqi": 2,
  "aqi_components": {
    "pm2_5": 8.5,
    "pm10": 12.1,
    "o3": 64.0,
    "co": 201.4
  },
  "hourly": [
    {
      "dt": 1745920000,
      "temp": 24.0,
      "feels_like": 23.5,
      "humidity": 45,
      "wind_speed": 4.2,
      "wind_deg": 180,
      "clouds": 20,
      "pop": 0,
      "icon": "01d",
      "main": "Clear",
      "description": "cielo despejado"
    }
  ],
  "daily": [
    {
      "date": "2026-04-22",
      "temp_min": 15.0,
      "temp_max": 31.0,
      "pop": 5,
      "icon": "01d",
      "main": "Clear",
      "description": "cielo despejado"
    }
  ]
}
```

---

## Caché

Las respuestas de la API de OpenWeatherMap se almacenan en caché durante **10 minutos** usando el sistema de caché de Laravel, con claves únicas por ciudad o por coordenadas. Esto evita exceder el límite de peticiones del plan gratuito (1 000 llamadas/día).

---

## Migración a producción (Supabase)

El archivo `.env` incluye una configuración comentada lista para PostgreSQL:

```env
# DB_CONNECTION=pgsql
# DB_HOST=db.<project>.supabase.co
# DB_PORT=5432
# DB_DATABASE=postgres
# DB_USERNAME=postgres
# DB_PASSWORD=<password>
# DB_SSLMODE=require
```

Para activarla:
1. Reactivar el proyecto en [supabase.com](https://supabase.com)
2. Descomentar las líneas en `.env`
3. Ejecutar:

```bash
php artisan config:clear
php artisan migrate
```

---

## Diseño

- Paleta estrictamente blanco y negro: `bg-black`, escala `neutral-900` → `white`
- Sin tarjetas ni contenedores flotantes — las secciones se fusionan con el fondo negro
- Divisores mediante `border-b border-neutral-900`
- Tipografía monoespaciada para valores numéricos (`tabular-nums`)
- Totalmente responsivo (mobile-first con breakpoints `sm` y `lg`)
