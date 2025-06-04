import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/button";

interface QuickFilterModalProps {
  filterType: "width" | "profile" | "diameter" | "season";
  onSelect: (values: string[]) => void;
  onClose: () => void;
}

interface Product {
  width?: string | number;
  profile?: string | number;
  diameter?: string | number;
  season?: string;
}

// Компонент для плавного появлення (fade-in)
const FadeIn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ animation: "fadeIn 0.5s ease-in" }}>{children}</div>
);

export const QuickFilterModal: React.FC<QuickFilterModalProps> = ({
  filterType,
  onSelect,
  onClose,
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select(filterType)
          .range(0, 100);
        if (error) throw error;
        if (data) {
          const uniqueOptions = Array.from(
            new Set(
              data
                .map((item: Product) => item[filterType]?.toString())
                .filter((v): v is string => !!v)
            )
          );
          setOptions(uniqueOptions);
        }
      } catch (err) {
        console.error("Error fetching filter options:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, [filterType]);

  const handleCheckboxChange = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleApply = () => {
    onSelect(selectedOptions);
    onClose();
  };

  // Если данные ещё загружаются – ничего не рендерим (загрузка происходит вне видимости)
  if (isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <FadeIn>
        <div className="bg-white p-4 rounded-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              {filterType === "width"
                ? "Ширина"
                : filterType === "profile"
                ? "Профіль"
                : filterType === "diameter"
                ? "Діаметр"
                : "Сезон"}
            </h2>
            <Button onClick={onClose} className="text-sm">
              Закрити
            </Button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {options.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span>
                  {filterType === "diameter"
                    ? `R${option}`
                    : filterType === "season"
                    ? option === "summer"
                      ? "Літні"
                      : option === "winter"
                      ? "Зимові"
                      : "Всесезонні"
                    : option}
                </span>
              </label>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleApply}
              className="bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Застосувати
            </Button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default QuickFilterModal;
