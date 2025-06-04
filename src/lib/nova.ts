import axios from 'axios';

const NOVA_BASE_URL = 'https://api.novaposhta.ua/v2.0/json/';
const NOVA_API_KEY = import.meta.env.VITE_APP_NOVA_API_KEY;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 минут

export interface NovaResponse<T> {
  success: boolean;
  data: T;
  errors: string[];
  warnings: string[];
  info: string;
}

export interface NovaCity {
  Description: string;
  Ref: string;
  Area: string;
  Regions: string;
}

export interface NovaSettlement {
  Description: string;
  Ref: string;
  CityRef?: string;
}

export interface NovaWarehouse {
  Description: string;
  Ref: string;
  CityRef: string;
  SiteKey: string;
}

export interface WarehouseQueryParams {
  CityName?: string;
  CityRef?: string;
  FindByString?: string;
  Page?: string;
  Limit?: string;
  Language?: string;
  TypeOfWarehouseRef?: string;
  WarehouseId?: string;
  SettlementRef?: string;
  BicycleParking?: string;
  PostFinance?: string;
  Ref?: string;
}

// Универсальная функция для выполнения запросов с использованием кэширования
const makeRequest = async <T>(
  modelName: string,
  calledMethod: string,
  methodProperties: Record<string, string>,
  skipCache = false
): Promise<T> => {
  const cacheKey = `${modelName}_${calledMethod}_${JSON.stringify(methodProperties)}`;
  
  if (!skipCache) {
    const cachedData = cache.get(cacheKey) as CacheEntry<T> | undefined;
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
      return cachedData.data;
    }
  }
  
  try {
    const response = await axios.post<NovaResponse<T>>(NOVA_BASE_URL, {
      apiKey: NOVA_API_KEY,
      modelName,
      calledMethod,
      methodProperties,
    });
    
    if (response.data.success) {
      cache.set(cacheKey, { data: response.data.data, timestamp: Date.now() });
      return response.data.data;
    } else {
      throw new Error(response.data.errors.join(', '));
    }
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';
    throw new Error(`API Request failed: ${errorMessage}`);
  }
};

// Получение городов с пагинацией и кэшированием
export const getCities = async (): Promise<NovaCity[]> => {
  const cacheKey = 'all_cities';
  const cachedData = cache.get(cacheKey) as CacheEntry<NovaCity[]> | undefined;
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
    return cachedData.data;
  }
  
  const allCities: NovaCity[] = [];
  const limit = 300;
  let page = 1;
  let morePages = true;

  try {
    while (morePages) {
      const cities = await makeRequest<NovaCity[]>(
        'Address',
        'getCities',
        {
          Page: page.toString(),
          Limit: limit.toString(),
          Language: "UA"
        },
        true // Пропускаем кэширование для каждой страницы
      );
      
      allCities.push(...cities);
      
      if (cities.length < limit) {
        morePages = false;
      } else {
        page++;
      }
    }
    
    cache.set(cacheKey, { data: allCities, timestamp: Date.now() });
    return allCities;
  } catch (error: unknown) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

// Получение отделений по городу
export const getWarehouses = async (
  params: WarehouseQueryParams
): Promise<NovaWarehouse[]> => {
  try {
    const methodProperties: Record<string, string> = {
      Page: "1",
      Limit: "300",
      Language: "UA",
      ...params,
    };
    
    return await makeRequest<NovaWarehouse[]>(
      'AddressGeneral',
      'getWarehouses',
      methodProperties
    );
  } catch (error: unknown) {
    console.error('Error fetching warehouses:', error);
    return [];
  }
};

export const clearNovaApiCache = () => {
  cache.clear();
};

export default {
  getCities,
  getWarehouses,
  clearNovaApiCache,
};