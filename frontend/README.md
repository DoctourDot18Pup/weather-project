# Weather Dashboard — Frontend

React + Vite frontend for the Weather Dashboard project. Consumes the Laravel API at `http://127.0.0.1:8000/api`.

## Stack

- React 18
- Vite 5
- Tailwind CSS 3
- Axios
- React Icons

## Requisitos

- Node.js 18+
- Backend Laravel corriendo en `http://127.0.0.1:8000`

## Instalación

```bash
# Desde la raíz del proyecto
cd frontend
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` (ya incluido) y ajusta la URL si es necesario:

```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

## Producción

```bash
npm run build
# Los archivos quedan en frontend/dist/
npm run preview  # para previsualizar el build
```

## Estructura

```
src/
├── components/
│   ├── SearchBar.jsx      # Input de búsqueda con validación
│   ├── WeatherCard.jsx    # Tarjeta principal del clima
│   ├── HistoryList.jsx    # Historial paginado de búsquedas
│   └── LoadingSpinner.jsx # Spinner reutilizable
├── services/
│   └── weatherApi.js      # Llamadas HTTP al backend
├── utils/
│   └── weatherIcons.js    # Mapeado de códigos OpenWeather → React Icons
├── App.jsx
└── main.jsx
```

## Endpoints del backend esperados

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/weather/{city}` | Obtener clima actual |
| GET | `/api/weather-history` | Historial paginado (`?page=1`) |
| DELETE | `/api/weather-history/{id}` | Eliminar entrada |
| DELETE | `/api/weather-history` | Limpiar todo el historial |

### Respuesta esperada de `/api/weather/{city}`

```json
{
  "city": "Guadalajara",
  "country": "MX",
  "temperature": 24.5,
  "description": "cielo despejado",
  "icon": "01d",
  "main": "Clear",
  "humidity": 45,
  "wind_speed": 3.2
}
```

### Respuesta esperada de `/api/weather-history`

```json
{
  "data": [
    {
      "id": 1,
      "city": "Guadalajara",
      "temperature": 24.5,
      "description": "cielo despejado",
      "icon": "01d",
      "main": "Clear",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 10,
    "total": 15
  }
}
```
