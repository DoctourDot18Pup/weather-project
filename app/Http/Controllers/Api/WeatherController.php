<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WeatherService;
use App\Models\WeatherSearch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
    public function __construct(private WeatherService $weatherService) {}

    public function getWeather(string $city)
    {
        $city = trim($city);

        if (strlen($city) < 2)   return response()->json(['message' => 'Mínimo 2 caracteres'], 400);
        if (strlen($city) > 100) return response()->json(['message' => 'Máximo 100 caracteres'], 400);

        if (!preg_match('/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\-]+$/u', $city)) {
            return response()->json(['message' => 'Solo letras, espacios y guiones'], 400);
        }

        $result = $this->weatherService->getWeather($city, auth()->id());

        return $result['success']
            ? response()->json($result['data'])
            : response()->json(['message' => $result['message'], 'error' => $result['error'] ?? null], 404);
    }

    public function getWeatherByCoords(Request $request)
    {
        $lat = $request->query('lat');
        $lon = $request->query('lon');

        if (!is_numeric($lat) || !is_numeric($lon)) {
            return response()->json(['message' => 'Coordenadas inválidas'], 400);
        }

        [$lat, $lon] = [(float) $lat, (float) $lon];

        if ($lat < -90 || $lat > 90 || $lon < -180 || $lon > 180) {
            return response()->json(['message' => 'Coordenadas fuera de rango'], 400);
        }

        $result = $this->weatherService->getWeatherByCoords($lat, $lon, auth()->id());

        return $result['success']
            ? response()->json($result['data'])
            : response()->json(['message' => $result['message']], 404);
    }

    // ── Geocodificación (autocompletado) ───────────────────────────────────

    public function geocode(Request $request)
    {
        $q = trim($request->query('q', ''));

        if (mb_strlen($q) < 2) return response()->json([]);

        $res = Http::get('http://api.openweathermap.org/geo/1.0/direct', [
            'q'     => $q,
            'limit' => 5,
            'appid' => config('services.openweather.api_key'),
        ]);

        if ($res->failed()) return response()->json([]);

        return response()->json(
            collect($res->json())->map(fn($p) => [
                'name'    => $p['name'],
                'country' => $p['country'],
                'state'   => $p['state'] ?? null,
                'lat'     => $p['lat'],
                'lon'     => $p['lon'],
            ])->unique(fn($p) => "{$p['name']},{$p['country']}")->values()
        );
    }

    // ── Estadísticas del historial ─────────────────────────────────────────

    public function getStats()
    {
        $query = $this->scopedQuery();
        $total = $query->count();

        if ($total === 0) return response()->json(['total' => 0]);

        $mostSearched = (clone $query)
            ->select('city', DB::raw('count(*) as searches'))
            ->groupBy('city')->orderByDesc('searches')->first();

        $conditions = (clone $query)
            ->select('weather_main', DB::raw('count(*) as total'))
            ->groupBy('weather_main')->orderByDesc('total')->get()
            ->map(fn($r) => ['label' => $r->weather_main, 'count' => (int) $r->total]);

        return response()->json([
            'total'         => $total,
            'most_searched' => ['city' => $mostSearched->city, 'count' => (int) $mostSearched->searches],
            'avg_temp'      => round((clone $query)->avg('temperature'), 1),
            'min_temp'      => round((clone $query)->min('temperature'), 1),
            'max_temp'      => round((clone $query)->max('temperature'), 1),
            'conditions'    => $conditions,
        ]);
    }

    // ── Historial ──────────────────────────────────────────────────────────

    public function getHistory()
    {
        $p = $this->scopedQuery()
            ->select(['id','city','country','temperature','weather_main','weather_description','icon','aqi','created_at'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'data' => collect($p->items())->map(fn($s) => [
                'id'          => $s->id,
                'city'        => $s->city,
                'country'     => $s->country,
                'temperature' => (float) $s->temperature,
                'main'        => $s->weather_main,
                'description' => $s->weather_description,
                'icon'        => $s->icon,
                'aqi'         => $s->aqi,
                'created_at'  => $s->created_at,
            ]),
            'meta' => [
                'current_page' => $p->currentPage(),
                'last_page'    => $p->lastPage(),
                'per_page'     => $p->perPage(),
                'total'        => $p->total(),
            ],
        ]);
    }

    public function getHistoryById(int $id)
    {
        return WeatherSearch::findOr($id, fn() => response()->json(['message' => 'No encontrado'], 404));
    }

    public function deleteHistory(int $id)
    {
        $s = $this->scopedQuery()->find($id);
        if (!$s) return response()->json(['message' => 'No encontrado'], 404);
        $s->delete();
        return response()->json(['message' => 'Eliminado']);
    }

    public function clearHistory()
    {
        $this->scopedQuery()->delete();
        return response()->json(['message' => 'Historial eliminado']);
    }

    // ── Helper: filtra por usuario si está autenticado ─────────────────────

    private function scopedQuery()
    {
        $userId = auth('sanctum')->id();

        return $userId
            ? WeatherSearch::where('user_id', $userId)
            : WeatherSearch::query();
    }
}
