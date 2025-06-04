import React, { useState, useEffect } from 'react';

export type SortOptions =
  | 'created_at_asc'
  | 'created_at_desc'
  | 'price_asc'
  | 'price_desc'
  | 'rating_asc'
  | 'rating_desc';

interface FiltersProps {
  onFilterChange: (filters: { type: string; minPrice: number; maxPrice: number }) => void;
  onSortChange: (sort: SortOptions) => void;
}

export const Filters: React.FC<FiltersProps> = ({ onFilterChange, onSortChange }) => {
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);

  useEffect(() => {
    if (maxPrice < minPrice) {
      setMaxPrice(minPrice);
    }
  }, [minPrice, maxPrice]);

  const handleApplyFilters = () => {
    onFilterChange({
      type: type.trim(),
      minPrice: Math.max(0, minPrice),
      maxPrice: Math.max(minPrice, maxPrice)
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value as SortOptions);
  };

  const handleMinPriceChange = (value: string) => {
    const numericValue = Math.max(0, Number(value) || 0);
    setMinPrice(numericValue);
    if (maxPrice < numericValue) setMaxPrice(numericValue);
  };

  const handleMaxPriceChange = (value: string) => {
    const numericValue = Math.max(minPrice, Number(value) || minPrice);
    setMaxPrice(numericValue);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Всі товари</option>
            <option value="tire">Шини</option>
            <option value="wheel">Диски</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Мінімальна ціна
          </label>
          <div className="relative">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 pr-8 focus:ring-2 focus:ring-blue-500"
              min="0"
              placeholder="Від"
            />
            <span className="absolute right-3 top-3 text-gray-400">₴</span>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Максимальна ціна
          </label>
          <div className="relative">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 pr-8 focus:ring-2 focus:ring-blue-500"
              min={minPrice}
              placeholder="До"
            />
            <span className="absolute right-3 top-3 text-gray-400">₴</span>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Сортування</label>
          <select
            onChange={handleSortChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            defaultValue="created_at_desc"
          >
            <option value="created_at_desc">Новіші спочатку</option>
            <option value="created_at_asc">Старіші спочатку</option>
            <option value="price_asc">Від дешевих</option>
            <option value="price_desc">Від дорогих</option>
            <option value="rating_asc">За рейтингом (↑)</option>
            <option value="rating_desc">За рейтингом (↓)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleApplyFilters}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
        </svg>
        Застосувати фільтри
      </button>
    </div>
  );
};