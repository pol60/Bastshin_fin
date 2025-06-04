import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { ProductCard } from '../pagesHome/ProductCard';
import { Product } from '../types/database.types';
import { supabase } from '../lib/supabaseClient';
import { debounce } from 'lodash-es';
import { Select, SelectItem } from '../components/ui/select';
import { Pagination } from '../components/ui/adminProducts/Pagination';

interface Filters {
  [key: string]: string;
}

interface DistinctOptions {
  brands: string[];
  models: string[];
  widths: number[];
  profiles: number[];
  diameters: number[];
  seasons: string[];
  countries: string[];
  years: number[];
}

export const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // Пагинация: 8 товаров на странице
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  }, [products, currentPage]);

  // Списки фильтров
  const [distinctOptions, setDistinctOptions] = useState<DistinctOptions>({
    brands: [],
    models: [],
    widths: [],
    profiles: [],
    diameters: [],
    seasons: [],
    countries: [],
    years: [],
  });

  // Текущие фильтры из URL
  const currentFilters = useMemo(() => ({
    brand: searchParams.get('brand') || '',
    model: searchParams.get('model') || '',
    width: searchParams.get('width') || '',
    profile: searchParams.get('profile') || '',
    diameter: searchParams.get('diameter') || '',
    season: searchParams.get('season') || '',
    country: searchParams.get('country') || '',
    year: searchParams.get('year') || '',
    spikes: searchParams.get('spikes') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sale: searchParams.get('sale') || '',
    tireSize: searchParams.get('tireSize') || '',
  }), [searchParams]);

  // Отключение автоматического скролла при изменении параметров
  useEffect(() => {
    window.history.scrollRestoration = 'manual';
  }, [pathname]);

  // Обработка одиночных полей (input, checkbox)
  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type, checked } = e.target as HTMLInputElement;
      const newParams = new URLSearchParams(searchParams);
      if (type === 'checkbox') {
        if (checked) {
          newParams.set(name, 'true');
        } else {
          newParams.delete(name);
        }
      } else {
        if (value) {
          newParams.set(name, value);
        } else {
          newParams.delete(name);
        }
      }
      setSearchParams(newParams);
      setCurrentPage(1);
    },
    [searchParams, setSearchParams]
  );

  // Обработка мультиселектов
  const handleMultiSelectChange = useCallback(
    (name: string, values: string[]) => {
      const newParams = new URLSearchParams(searchParams);
      if (values.length > 0) {
        newParams.set(name, values.join(','));
      } else {
        newParams.delete(name);
      }
      setSearchParams(newParams);
      setCurrentPage(1);
    },
    [searchParams, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    setCurrentPage(1);
  }, [setSearchParams]);

  // Загрузка товаров из Supabase
  const fetchProducts = useCallback(
    debounce(async (filters: Filters, signal: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const processedFilters = { ...filters };

        if (processedFilters.tireSize) {
          const tireSizePattern = /^(\d+)[/](\d+)\s*R?(\d+)$/i;
          const match = processedFilters.tireSize.match(tireSizePattern);
          if (match) {
            const [, width, profile, diameter] = match;
            processedFilters.width = width;
            processedFilters.profile = profile;
            processedFilters.diameter = diameter;
          }
          delete processedFilters.tireSize;
        }

        let query = supabase.from('products').select('*');

        Object.entries(processedFilters).forEach(([key, value]) => {
          if (!value) return;
          switch (key) {
            case 'sale':
              query = query.not('sale_price', 'is', null);
              break;
            case 'brand':
            case 'model': {
              const values = value.split(',');
              query = query.in(key, values);
              break;
            }
            case 'width':
            case 'profile':
            case 'diameter':
            case 'year':
            case 'minPrice':
            case 'maxPrice': {
              const numValue = Number(value);
              if (!isNaN(numValue)) {
                if (key === 'minPrice') {
                  query = query.gte('price', numValue);
                } else if (key === 'maxPrice') {
                  query = query.lte('price', numValue);
                } else {
                  query = query.eq(key, numValue);
                }
              }
              break;
            }
            case 'spikes':
              query = query.eq('spikes', value === 'true');
              break;
            default:
              query = query.eq(key, value);
          }
        });

        const { data, error } = await query.abortSignal(signal);
        if (error) throw error;
        setProducts(data as Product[]);
      } catch (err) {
        if (!signal.aborted) {
          console.error('Error fetching products:', err);
          setError('Ошибка загрузки. Попробуйте ещё раз.');
          setProducts([]);
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(currentFilters, controller.signal);
    return () => controller.abort();
  }, [currentFilters, fetchProducts]);

  // Загрузка списков для фильтров
  useEffect(() => {
    const fetchDistinctFilters = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('brand, model, width, profile, diameter, season, country, year');
        if (error) throw error;
        if (data && data.length > 0) {
          setDistinctOptions({
            brands: Array.from(new Set(data.map(item => item.brand).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b)),
            models: Array.from(new Set(data.map(item => item.model).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b)),
            widths: Array.from(new Set(data.map(item => item.width).filter(val => val != null) as number[])).sort((a, b) => a - b),
            profiles: Array.from(new Set(data.map(item => item.profile).filter(val => val != null) as number[])).sort((a, b) => a - b),
            diameters: Array.from(new Set(data.map(item => item.diameter).filter(val => val != null) as number[])).sort((a, b) => a - b),
            seasons: Array.from(new Set(data.map(item => item.season).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b)),
            countries: Array.from(new Set(data.map(item => item.country).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b)),
            years: Array.from(new Set(data.map(item => item.year).filter(val => val != null) as number[])).sort((a, b) => a - b),
          });
        }
      } catch (err) {
        console.error('Error fetching distinct filters', err);
      }
    };
    fetchDistinctFilters();
  }, []);

  const productList = useMemo(() =>
    displayedProducts.map(product => {
      const hasDiscount = product.sale_price && product.price > product.sale_price;
      const discountPercent = hasDiscount
        ? Math.round(((product.price - (product.sale_price || 0)) / product.price * 100))
        : undefined;

      return (
        <div key={product.id} className="relative group">
          <ProductCard
            {...product}
            productType={product.type as 'tire' | 'wheel'}
            price={product.sale_price || product.price}
            oldPrice={hasDiscount ? product.price : undefined}
            discount={discountPercent}
            image={product.image_url || []}
            initialRating={product.rating || 0}
            specs={{
              season: product.season as 'winter' | 'summer' | 'all-season' || '',
              width: product.width || 0,
              profile: product.profile || 0,
              diameter: product.diameter || 0,
              spikes: product.spikes || false,
            }}
            year={product.year || new Date().getFullYear()}
            country={product.country || ''}
            articleNumber={product.id.slice(0, 8)}
          />
        </div>
      );
    }), [displayedProducts]);

  return (
    <div className="bg-white min-h-screen relative">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Каталог шин</h1>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/detailed-search?${searchParams.toString()}`);
            }}
            className="flex items-center gap-2 text-blue-800 md:hidden"
          >
            <Filter className="w-5 h-5" />
            <span>Фільтри</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="hidden md:block md:w-1/4">
            <FilterPanel
              filters={currentFilters}
              onChange={handleFilterChange}
              onMultiSelectChange={handleMultiSelectChange}
              distinctOptions={distinctOptions}
            />
          </div>

          <div className="flex -mx-2 sm:mx-0">
            {loading ? (
              <LoadingSpinner />
            ) : products.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-0 sm:px-0 justify-items-stretch">
                  {productList}
                </div>
                {totalPages > 1 && (
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={(page) => setCurrentPage(page)} 
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterPanel = React.memo(({
  filters,
  onChange,
  onMultiSelectChange,
  distinctOptions
}: {
  filters: Filters;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onMultiSelectChange: (name: string, values: string[]) => void;
  distinctOptions: DistinctOptions;
}) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h2 className="text-lg font-semibold mb-4">Фільтри</h2>
    <div className="space-y-4">
      <FilterCheckbox
        name="sale"
        label="Акційні товари"
        checked={filters.sale === 'true'}
        onChange={onChange}
      />
      <FilterSelectMultiple
        name="brand"
        label="Бренд"
        options={distinctOptions.brands}
        value={filters.brand ? filters.brand.split(',') : []}
        onChange={onMultiSelectChange}
      />
      <FilterSelectMultiple
        name="model"
        label="Модель"
        options={distinctOptions.models}
        value={filters.model ? filters.model.split(',') : []}
        onChange={onMultiSelectChange}
      />
      <FilterSelectMultiple
        name="width"
        label="Ширина"
        options={distinctOptions.widths}
        value={filters.width ? filters.width.split(',') : []}
        onChange={onMultiSelectChange}
      />
      <FilterSelectMultiple
        name="profile"
        label="Профіль"
        options={distinctOptions.profiles}
        value={filters.profile ? filters.profile.split(',') : []}
        onChange={onMultiSelectChange}
      />
      <FilterSelectMultiple
        name="diameter"
        label="Діаметр"
        options={distinctOptions.diameters}
        value={filters.diameter ? filters.diameter.split(',') : []}
        onChange={onMultiSelectChange}
      />
      <FilterSelectMultiple
        name="season"
        label="Сезон"
        options={distinctOptions.seasons}
        value={filters.season ? filters.season.split(',') : []}
        onChange={onMultiSelectChange}
      />
      <FilterSelectMultiple
        name="country"
        label="Країна"
        options={distinctOptions.countries}
        value={filters.country ? filters.country.split(',') : []}
        onChange={onMultiSelectChange}
      />
      <FilterSelectMultiple
        name="year"
        label="Рік"
        options={distinctOptions.years}
        value={filters.year ? filters.year.split(',') : []}
        onChange={onMultiSelectChange}
      />
      <FilterCheckbox
        name="spikes"
        label="Шипи"
        checked={filters.spikes === 'true'}
        onChange={onChange}
      />
      <FilterNumberInput
        name="minPrice"
        label="Мін. ціна"
        value={filters.minPrice}
        onChange={onChange}
      />
      <FilterNumberInput
        name="maxPrice"
        label="Макс. ціна"
        value={filters.maxPrice}
        onChange={onChange}
      />
    </div>
  </div>
));

const FilterNumberInput = React.memo(({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      name={name}
      type="number"
      value={value}
      onChange={onChange}
      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        value ? "bg-blue-100" : ""
      }`}
      min="0"
    />
  </div>
));

const FilterSelectMultiple = React.memo(({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options: Array<string | number>;
  value: string[];
  onChange: (name: string, values: string[]) => void;
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <Select
        multiple
        value={value}
        onValueChange={(val) => onChange(name, val as string[])}
        placeholder={`Выберите ${label.toLowerCase()}`}
        onMouseDown={(e) => e.preventDefault()}
        className={value.length > 0 ? "bg-blue-100" : ""}
        {...(name === "season" && {
          displayValue: (vals: string[]) =>
            vals
              .map((v) =>
                v === "summer"
                  ? "ЛІТНІ"
                  : v === "winter"
                  ? "ЗИМОВІ"
                  : v === "all-season"
                  ? "ВСЕСЕЗОННІ"
                  : v
              )
              .join(", "),
        })}
      >
        {options.map((option) => {
          const optionString = option.toString();
          const displayText =
            name === "season"
              ? optionString === "summer"
                ? "ЛІТНІ"
                : optionString === "winter"
                ? "ЗИМОВІ"
                : optionString === "all-season"
                ? "ВСЕСЕЗОННІ"
                : optionString
              : optionString;
          return (
            <SelectItem key={optionString} value={optionString}>
              {displayText}
            </SelectItem>
          );
        })}
      </Select>
    </div>
  );
});

const FilterCheckbox = React.memo(({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className={checked ? "bg-blue-100 p-1 rounded" : ""}>
    <label className="flex items-center gap-2">
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox h-4 w-4 text-blue-600 transition-colors"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  </div>
));

const LoadingSpinner = React.memo(() => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
  </div>
));

const EmptyState = React.memo(({ onReset }: { onReset: () => void }) => (
  <div className="text-center text-gray-500 py-8">
    <p className="text-xl mb-2">Товари не знайдені</p>
    <p className="text-sm mb-4">Спробуйте змінити параметри фільтрів</p>
    <button onClick={onReset} className="text-blue-600 hover:text-blue-700 underline text-sm">
      Скинути всі фільтри
    </button>
  </div>
));

export default ProductList;
