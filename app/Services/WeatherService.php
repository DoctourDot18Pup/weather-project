<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Models\WeatherSearch;

class WeatherService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = config('services.openweather.api_key');
        $this->baseUrl = config('services.openweather.base_url');
    }

    // ── Puntos de entrada públicos ─────────────────────────────────────────

    public function getWeather(string $city): array
    {
        return $this->resolve(
            cacheKey: 'weather:city:' . $this->slug($city),
            fetcher:  fn() => $this->callApis(q: $city),
        );
    }

    public function getWeatherByCoords(float $lat, float $lon): array
    {
        return $this->resolve(
            cacheKey: "weather:coords:{$lat},{$lon}",
            fetcher:  fn() => $this->callApis(lat: $lat, lon: $lon),
        );
    }

    // ── Núcleo ────────────────────────────────────────────────────────────

    private function resolve(string $cacheKey, callable $fetcher): array
    {
        try {
            // Intentar caché primero (10 min TTL)
            $raw = Cache::get($cacheKey);

            if ($raw === null) {
                $raw = $fetcher();

                if ($raw === null) {
                    return ['success' => false, 'message' => 'Ciudad no encontrada'];
                }

                Cache::put($cacheKey, $raw, now()->addMinutes(10));
            }

            $dbData = $this->buildDbData($raw);
            WeatherSearch::create($dbData);

            return ['success' => true, 'data' => $this->buildResponse($dbData, $raw)];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al obtener datos del clima',
                'error'   => $e->getMessage(),
            ];
        }
    }

    // ── Llamadas a la API ─────────────────────────────────────────────────

    private function callApis(?string $q = null, ?float $lat = null, ?float $lon = null): ?array
    {
        // Parámetros de localización (ciudad O coordenadas)
        $locParams = array_filter(
            ['q' => $q, 'lat' => $lat, 'lon' => $lon],
            fn($v) => $v !== null
        );

        // 1. Clima actual
        $currentRes = Http::get("{$this->baseUrl}/weather", array_merge($locParams, [
            'appid' => $this->apiKey,
            'units' => 'metric',
            'lang'  => 'es',
        ]));

        if ($currentRes->failed() || $currentRes->json('cod') !== 200) {
            return null;
        }

        $current  = $currentRes->json();
        $coordLat = $current['coord']['lat'];
        $coordLon = $current['coord']['lon'];

        // 2. Pronóstico 5 días / 3h
        $forecastRes = Http::get("{$this->baseUrl}/forecast", [
            'lat'   => $coordLat,
            'lon'   => $coordLon,
            'appid' => $this->apiKey,
            'units' => 'metric',
            'lang'  => 'es',
            'cnt'   => 40,
        ]);

        [$hourly, $daily] = $forecastRes->ok()
            ? $this->processForecast($forecastRes->json('list', []))
            : [[], []];

        // 3. Calidad del aire
        $airRes = Http::get("{$this->baseUrl}/air_pollution", [
            'lat'   => $coordLat,
            'lon'   => $coordLon,
            'appid' => $this->apiKey,
        ]);

        $aqi = $aqiComponents = null;
        if ($airRes->ok()) {
            $airItem       = $airRes->json('list.0', []);
            $aqi           = $airItem['main']['aqi'] ?? null;
            $comp          = $airItem['components'] ?? [];
            $aqiComponents = [
                'pm2_5' => round($comp['pm2_5'] ?? 0, 2),
                'pm10'  => round($comp['pm10']  ?? 0, 2),
                'o3'    => round($comp['o3']    ?? 0, 2),
                'co'    => round($comp['co']    ?? 0, 2),
            ];
        }

        return compact('current', 'hourly', 'daily', 'aqi', 'aqiComponents');
    }

    // ── Construcción de datos ─────────────────────────────────────────────

    private function buildDbData(array $raw): array
    {
        $c = $raw['current'];

        return [
            'city'                => $c['name'],
            'country'             => $c['sys']['country']          ?? null,
            'lat'                 => $c['coord']['lat'],
            'lon'                 => $c['coord']['lon'],
            'timezone_offset'     => $c['timezone']                ?? 0,
            'temperature'         => $c['main']['temp'],
            'feels_like'          => $c['main']['feels_like'],
            'temp_min'            => $c['main']['temp_min'],
            'temp_max'            => $c['main']['temp_max'],
            'weather_main'        => $c['weather'][0]['main'],
            'weather_description' => $c['weather'][0]['description'],
            'icon'                => $c['weather'][0]['icon'],
            'humidity'            => $c['main']['humidity'],
            'pressure'            => $c['main']['pressure'],
            'visibility'          => $c['visibility']              ?? null,
            'wind_speed'          => $c['wind']['speed'],
            'wind_deg'            => $c['wind']['deg']             ?? null,
            'clouds'              => $c['clouds']['all']           ?? null,
            'sunrise'             => $c['sys']['sunrise']          ?? null,
            'sunset'              => $c['sys']['sunset']           ?? null,
            'aqi'                 => $raw['aqi'],
            'aqi_components'      => $raw['aqiComponents'],
            'hourly'              => $raw['hourly'],
            'daily'               => $raw['daily'],
        ];
    }

    private function buildResponse(array $dbData, array $raw): array
    {
        $c = $raw['current'];

        return array_merge($dbData, [
            'main'        => $dbData['weather_main'],
            'description' => $dbData['weather_description'],
            'wind_gust'   => $c['wind']['gust'] ?? null,
            'rain_1h'     => $c['rain']['1h']   ?? null,
            'snow_1h'     => $c['snow']['1h']   ?? null,
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private function slug(string $text): string
    {
        return strtolower(preg_replace('/\s+/', '_', trim($text)));
    }

    private function processForecast(array $list): array
    {
        if (empty($list)) return [[], []];

        $hourly = array_map(fn($item) => [
            'dt'          => $item['dt'],
            'temp'        => round($item['main']['temp'], 1),
            'feels_like'  => round($item['main']['feels_like'], 1),
            'icon'        => $item['weather'][0]['icon'],
            'main'        => $item['weather'][0]['main'],
            'description' => $item['weather'][0]['description'],
            'pop'         => (int) round(($item['pop'] ?? 0) * 100),
            'humidity'    => $item['main']['humidity'],
            'wind_speed'  => round($item['wind']['speed'], 1),
            'wind_deg'    => $item['wind']['deg'] ?? null,
            'clouds'      => $item['clouds']['all'] ?? null,
        ], array_slice($list, 0, 8));

        $groups = [];
        foreach ($list as $item) {
            $groups[substr($item['dt_txt'], 0, 10)][] = $item;
        }

        $daily = [];
        foreach ($groups as $date => $items) {
            $temps   = array_column(array_column($items, 'main'), 'temp');
            $pops    = array_map(fn($i) => $i['pop'] ?? 0, $items);
            $ref     = collect($items)->first(fn($i) => str_contains($i['dt_txt'], '12:00:00')) ?? $items[0];
            $daily[] = [
                'date'        => $date,
                'temp_min'    => round(min($temps), 1),
                'temp_max'    => round(max($temps), 1),
                'icon'        => $ref['weather'][0]['icon'],
                'main'        => $ref['weather'][0]['main'],
                'description' => $ref['weather'][0]['description'],
                'pop'         => (int) round(max($pops) * 100),
            ];
        }

        return [$hourly, array_values($daily)];
    }
}
