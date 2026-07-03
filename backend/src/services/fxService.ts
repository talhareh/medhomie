const FRANKFURTER_LATEST_URL = 'https://api.frankfurter.dev/v2/rates?base=USD&quotes=PKR';
const FX_CACHE_TTL_MS = 60 * 60 * 1000;

interface FrankfurterRateEntry {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
}

export interface UsdToPkrQuote {
  baseCurrency: 'USD';
  targetCurrency: 'PKR';
  exchangeRate: number;
  rateDate: string;
}

let cachedQuote: { quote: UsdToPkrQuote; expiresAt: number } | null = null;

const roundTo4 = (value: number): number => Number(value.toFixed(4));

export const getUsdToPkrQuote = async (): Promise<UsdToPkrQuote> => {
  const now = Date.now();

  if (cachedQuote && cachedQuote.expiresAt > now) {
    return cachedQuote.quote;
  }

  const response = await fetch(FRANKFURTER_LATEST_URL, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'MedHome-Backend/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch USD to PKR exchange rate: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as FrankfurterRateEntry[];
  const latestRate = Array.isArray(data) ? data[0] : undefined;
  const rate = latestRate?.rate;

  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
    throw new Error('Frankfurter response did not include a valid PKR exchange rate');
  }

  if (!latestRate?.date) {
    throw new Error('Frankfurter response did not include a rate date');
  }

  const quote: UsdToPkrQuote = {
    baseCurrency: 'USD',
    targetCurrency: 'PKR',
    exchangeRate: roundTo4(rate),
    rateDate: latestRate.date
  };

  cachedQuote = {
    quote,
    expiresAt: now + FX_CACHE_TTL_MS
  };

  return quote;
};
