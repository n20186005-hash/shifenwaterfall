// 十分瀑布天氣資料層（Server 端）
// 使用 Open-Meteo 免費天氣 API（https://open-meteo.com，無需金鑰、非營利適用）。
// 在 Astro `output: 'server'` 模式下，此模組由伺服器（Cloudflare Workers）執行，
// 並透過 Cloudflare Cache API 快取回應，避免每次頁面請求都向 Open-Meteo 索取資料。

export const WEATHER_LAT = 25.0482681;
export const WEATHER_LON = 121.7846723;
export const WEATHER_TZ = 'Asia/Taipei';
export const FORECAST_DAYS = 7;

/** 快取 TTL：30 分鐘。Open-Meteo 免費層建議避免過度頻繁請求。 */
const CACHE_TTL_SECONDS = 1800;
/** 外部請求硬性逾時（毫秒）。 */
const WEATHER_TIMEOUT_MS = 8000;
const API_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherNow {
  /** Asia/Taipei 本地時間，ISO 格式（例：2026-09-02T14:30） */
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
}

export interface WeatherDay {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipProb: number;
}

export interface WeatherData {
  now: WeatherNow;
  daily: WeatherDay[];
}

/** Cloudflare Cache API 的最小型別描述，避免硬相依於 workers 型別套件。 */
export interface CacheLike {
  default?: {
    match(request: RequestInfo): Promise<Response | undefined>;
    put(request: RequestInfo, response: Response): Promise<void>;
  };
}

interface OpenMeteoCurrent {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
}

interface OpenMeteoDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[] | null;
}

interface OpenMeteoResponse {
  current?: OpenMeteoCurrent;
  daily?: OpenMeteoDaily;
}

function buildRequestUrl(): string {
  const u = new URL(API_ENDPOINT);
  u.searchParams.set('latitude', String(WEATHER_LAT));
  u.searchParams.set('longitude', String(WEATHER_LON));
  u.searchParams.set('timezone', WEATHER_TZ);
  u.searchParams.set('forecast_days', String(FORECAST_DAYS));
  u.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
  );
  u.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  );
  return u.toString();
}

function normalize(payload: OpenMeteoResponse): WeatherData | null {
  const c = payload.current;
  const d = payload.daily;
  if (!c || !d || !d.time || d.time.length === 0) return null;

  const daily: WeatherDay[] = d.time.map((date, i) => ({
    date,
    weatherCode: d.weather_code[i] ?? 0,
    tempMax: Math.round(d.temperature_2m_max[i] ?? 0),
    tempMin: Math.round(d.temperature_2m_min[i] ?? 0),
    precipProb: d.precipitation_probability_max?.[i] ?? 0,
  }));

  return {
    now: {
      time: c.time,
      temperature: Math.round(c.temperature_2m ?? 0),
      apparentTemperature: Math.round(c.apparent_temperature ?? 0),
      humidity: Math.round(c.relative_humidity_2m ?? 0),
      precipitation: c.precipitation ?? 0,
      windSpeed: Math.round(c.wind_speed_10m ?? 0),
      weatherCode: c.weather_code ?? 0,
      isDay: c.is_day === 1,
    },
    daily,
  };
}

/**
 * 取得天氣資料。優先讀 Cloudflare Cache API；未命中時請求 Open-Meteo 並回寫快取。
 * 快取讀寫失敗都會自動降級（不因此丟失資料）；整體失敗才回傳 null，由元件端優雅降級。
 */
export async function getWeather(caches?: CacheLike): Promise<WeatherData | null> {
  const url = buildRequestUrl();
  const store = caches?.default;

  // 1. 快取命中直接回傳
  if (store) {
    try {
      const cached = await store.match(url);
      if (cached) {
        const payload = (await cached.json()) as OpenMeteoResponse;
        const data = normalize(payload);
        if (data) return data;
      }
    } catch {
      // 快取讀取失敗時略過，改走網路請求
    }
  }

  try {
    // 2. 請求 Open-Meteo
    // 雙重逾時保險：AbortSignal 在部分 serverless runtime 未必生效，
    // 再以 Promise.race 施加硬性上限，確保 SSR 不會因外部請求掛起而無法產生回應。
    let timer: ReturnType<typeof setTimeout> | undefined;
    let res: Response | undefined;
    try {
      res = await Promise.race<Response>([
        fetch(url, {
          headers: { accept: 'application/json' },
          signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS),
        }),
        new Promise<Response>((_, reject) => {
          timer = setTimeout(() => reject(new Error('weather request timeout')), WEATHER_TIMEOUT_MS);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
    if (!res || !res.ok) return null;
    const payload = (await res.json()) as OpenMeteoResponse;

    // 3. 回寫 Cache API（body 已被讀取，需以新 Response 寫入；寫入失敗不影響回傳）
    if (store) {
      try {
        const copy = new Response(JSON.stringify(payload), {
          headers: {
            'content-type': 'application/json',
            'cache-control': `public, max-age=${CACHE_TTL_SECONDS}`,
          },
        });
        await store.put(url, copy);
      } catch {
        // 略過快取寫入失敗
      }
    }

    return normalize(payload);
  } catch {
    return null;
  }
}

// WMO Weather interpretation codes（https://open-meteo.com/en/docs 附對照表）
export function weatherCodeToZh(code: number): string {
  if (code === 0) return '晴朗';
  if (code === 1) return '大致晴朗';
  if (code === 2) return '多雲';
  if (code === 3) return '陰天';
  if (code >= 45 && code <= 48) return '有霧';
  if (code >= 51 && code <= 57) return '毛毛雨';
  if (code >= 61 && code <= 67) return '降雨';
  if (code >= 71 && code <= 77) return '降雪';
  if (code >= 80 && code <= 82) return '陣雨';
  if (code >= 85 && code <= 86) return '陣雪';
  if (code === 95) return '雷雨';
  if (code >= 96 && code <= 99) return '雷雨伴冰雹';
  return '天氣多變';
}

export type WeatherIconKey =
  | 'sun'
  | 'cloudSun'
  | 'cloud'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'shower'
  | 'snow'
  | 'thunder';

export function weatherCodeToIconKey(code: number): WeatherIconKey {
  if (code === 0 || code === 1) return 'sun';
  if (code === 2) return 'cloudSun';
  if (code === 3) return 'cloud';
  if (code >= 45 && code <= 48) return 'fog';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'shower';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95) return 'thunder';
  return 'cloud';
}
