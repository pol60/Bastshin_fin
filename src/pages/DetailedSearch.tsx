import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Select, SelectItem } from "../components/ui/select";
import { supabase } from "../lib/supabaseClient";
import { Toast } from "../components/ui/Toast";

export const DetailedSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Фильтры для базовых параметров (мультивыбор)
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [widths, setWidths] = useState<number[]>([]);
  const [diameters, setDiameters] = useState<number[]>([]);
  const [profiles, setProfiles] = useState<number[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);

  // Дополнительные (расширенные) фильтры (мультивыбор)
  const [noiseLevels, setNoiseLevels] = useState<number[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [wetGrips, setWetGrips] = useState<string[]>([]);
  const [fuelEfficiencies, setFuelEfficiencies] = useState<string[]>([]);
  const [loadIndexes, setLoadIndexes] = useState<string[]>([]);
  const [speedIndexes, setSpeedIndexes] = useState<string[]>([]);

  // Состояния для ценового фильтра
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minDbPrice, setMinDbPrice] = useState<number>(0);
  const [maxDbPrice, setMaxDbPrice] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number>(0);

  // Новый фильтр "Акційні товари"
  const [sale, setSale] = useState<boolean>(false);

  // Выбранные значения для базовых фильтров (мультивыбор)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedWidths, setSelectedWidths] = useState<string[]>([]);
  const [selectedDiameters, setSelectedDiameters] = useState<string[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);

  // Выбранные значения для расширенных фильтров (мультивыбор)
  const [selectedNoiseLevels, setSelectedNoiseLevels] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedWetGrips, setSelectedWetGrips] = useState<string[]>([]);
  const [selectedFuelEfficiencies, setSelectedFuelEfficiencies] = useState<string[]>([]);
  const [selectedLoadIndexes, setSelectedLoadIndexes] = useState<string[]>([]);
  const [selectedSpeedIndexes, setSelectedSpeedIndexes] = useState<string[]>([]);

  // Фильтр «шипы» реализован как чекбокс
  const [spikes, setSpikes] = useState<boolean>(false);

  // Флаг для показа/скрытия дополнительных фильтров
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);

  // Функция показа уведомления
  const showToastMessage = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
  }, []);

  // Функция закрытия уведомления
  const handleToastClose = useCallback(() => {
    setShowToast(false);
    setToastMessage("");
  }, []);

  // Инициализация выбранных значений из query-параметров
  useEffect(() => {
    const brandsParam = searchParams.get("brand");
    if (brandsParam) setSelectedBrands(brandsParam.split(","));

    const modelsParam = searchParams.get("model");
    if (modelsParam) setSelectedModels(modelsParam.split(","));

    const widthsParam = searchParams.get("width");
    if (widthsParam) setSelectedWidths(widthsParam.split(","));

    const diametersParam = searchParams.get("diameter");
    if (diametersParam) setSelectedDiameters(diametersParam.split(","));

    const profilesParam = searchParams.get("profile");
    if (profilesParam) setSelectedProfiles(profilesParam.split(","));

    const seasonsParam = searchParams.get("season");
    if (seasonsParam) setSelectedSeasons(seasonsParam.split(","));

    const noiseLevelParam = searchParams.get("noiseLevel");
    if (noiseLevelParam) setSelectedNoiseLevels(noiseLevelParam.split(","));

    const countryParam = searchParams.get("country");
    if (countryParam) setSelectedCountries(countryParam.split(","));

    const yearParam = searchParams.get("year");
    if (yearParam) setSelectedYears(yearParam.split(","));

    const wetGripParam = searchParams.get("wetGrip");
    if (wetGripParam) setSelectedWetGrips(wetGripParam.split(","));

    const fuelEfficiencyParam = searchParams.get("fuelEfficiency");
    if (fuelEfficiencyParam) setSelectedFuelEfficiencies(fuelEfficiencyParam.split(","));

    const loadIndexParam = searchParams.get("loadIndex");
    if (loadIndexParam) setSelectedLoadIndexes(loadIndexParam.split(","));

    const speedIndexParam = searchParams.get("speedIndex");
    if (speedIndexParam) setSelectedSpeedIndexes(speedIndexParam.split(","));

    const spikesParam = searchParams.get("spikes");
    if (spikesParam) setSpikes(spikesParam === "true");

    const saleParam = searchParams.get("sale");
    if (saleParam) setSale(saleParam === "true");

    const minPriceParam = searchParams.get("minPrice");
    if (minPriceParam) setMinPrice(minPriceParam);

    const maxPriceParam = searchParams.get("maxPrice");
    if (maxPriceParam) setMaxPrice(maxPriceParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            `brand, model, width, diameter, profile, season, price,
             noise_level, country, year, wet_grip, fuel_efficiency,
             load_index, speed_index, spikes`
          );

        if (error) throw error;

        if (data && data.length > 0) {
          const uniqueData = {
            brands: Array.from(new Set(data.map((item) => item.brand)))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b)),
            models: Array.from(new Set(data.map((item) => item.model)))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b)),
            widths: Array.from(new Set(data.map((item) => item.width)))
              .filter((val) => val !== null)
              .sort((a, b) => a - b),
            diameters: Array.from(new Set(data.map((item) => item.diameter)))
              .filter((val) => val !== null)
              .sort((a, b) => a - b),
            profiles: Array.from(new Set(data.map((item) => item.profile)))
              .filter((val) => val !== null)
              .sort((a, b) => a - b),
            seasons: Array.from(new Set(data.map((item) => item.season)))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b)),
            noiseLevels: Array.from(new Set(data.map((item) => item.noise_level)))
              .filter((val) => val !== null)
              .sort((a, b) => a - b),
            countries: Array.from(new Set(data.map((item) => item.country)))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b)),
            years: Array.from(new Set(data.map((item) => item.year)))
              .filter((val) => val !== null)
              .sort((a, b) => a - b),
            wetGrips: Array.from(new Set(data.map((item) => item.wet_grip)))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b)),
            fuelEfficiencies: Array.from(new Set(data.map((item) => item.fuel_efficiency)))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b)),
            loadIndexes: Array.from(new Set(data.map((item) => item.load_index)))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b)),
            speedIndexes: Array.from(new Set(data.map((item) => item.speed_index)))
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b)),
          };

          setBrands(uniqueData.brands);
          setModels(uniqueData.models);
          setWidths(uniqueData.widths);
          setDiameters(uniqueData.diameters);
          setProfiles(uniqueData.profiles);
          setSeasons(uniqueData.seasons);
          setNoiseLevels(uniqueData.noiseLevels);
          setCountries(uniqueData.countries);
          setYears(uniqueData.years);
          setWetGrips(uniqueData.wetGrips);
          setFuelEfficiencies(uniqueData.fuelEfficiencies);
          setLoadIndexes(uniqueData.loadIndexes);
          setSpeedIndexes(uniqueData.speedIndexes);

          const prices = data.map((item) => item.price);
          const dbMinPrice = Math.min(...prices);
          const dbMaxPrice = Math.max(...prices);
          setMinDbPrice(dbMinPrice);
          setMaxDbPrice(dbMaxPrice);
          setSliderValue(dbMaxPrice);
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
        showToastMessage("Помилка завантаження фільтрів");
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [showToastMessage]);

  const handlePriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "min" | "max"
  ) => {
    const value = e.target.value.replace(/\D/g, "");
    handleToastClose();
    if (type === "min") {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setSliderValue(value);
    setMinPrice(minDbPrice.toString());
    setMaxPrice(value.toString());
  };

  const validatePrice = () => {
    if (maxPrice === "") return;
    const effectiveMax = parseInt(maxPrice);
    if (effectiveMax < minDbPrice) {
      showToastMessage(`Максимальна ціна не може бути нижчою за ${minDbPrice}`);
      return;
    }
    if (effectiveMax > maxDbPrice) {
      showToastMessage(`Максимальна ціна не може бути вищою за ${maxDbPrice}`);
      return;
    }
    const effectiveMin = minPrice ? parseInt(minPrice) : minDbPrice;
    if (effectiveMin >= effectiveMax) {
      showToastMessage("Максимальне значення має бути більшим за мінімальне");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveMinPrice = minPrice ? parseInt(minPrice) : minDbPrice;
    const effectiveMaxPrice = maxPrice ? parseInt(maxPrice) : maxDbPrice;

    if (effectiveMaxPrice < minDbPrice) {
      showToastMessage(`Максимальна ціна не може бути нижчою за ${minDbPrice}`);
      return;
    }
    if (effectiveMaxPrice > maxDbPrice) {
      showToastMessage(`Максимальна ціна не може бути вищою за ${maxDbPrice}`);
      return;
    }
    if (effectiveMinPrice >= effectiveMaxPrice) {
      showToastMessage("Максимальне значення має бути більшим за мінімальне");
      return;
    }

    const params = new URLSearchParams();
    params.set("minPrice", effectiveMinPrice.toString());
    params.set("maxPrice", effectiveMaxPrice.toString());

    if (selectedBrands.length > 0) params.set("brand", selectedBrands.join(","));
    if (selectedModels.length > 0) params.set("model", selectedModels.join(","));
    if (selectedWidths.length > 0) params.set("width", selectedWidths.join(","));
    if (selectedDiameters.length > 0) params.set("diameter", selectedDiameters.join(","));
    if (selectedProfiles.length > 0) params.set("profile", selectedProfiles.join(","));
    if (selectedSeasons.length > 0) params.set("season", selectedSeasons.join(","));

    if (selectedNoiseLevels.length > 0) params.set("noiseLevel", selectedNoiseLevels.join(","));
    if (selectedCountries.length > 0) params.set("country", selectedCountries.join(","));
    if (selectedYears.length > 0) params.set("year", selectedYears.join(","));
    if (selectedWetGrips.length > 0) params.set("wetGrip", selectedWetGrips.join(","));
    if (selectedFuelEfficiencies.length > 0) params.set("fuelEfficiency", selectedFuelEfficiencies.join(","));
    if (selectedLoadIndexes.length > 0) params.set("loadIndex", selectedLoadIndexes.join(","));
    if (selectedSpeedIndexes.length > 0) params.set("speedIndex", selectedSpeedIndexes.join(","));
    if (spikes) params.set("spikes", "true");
    if (sale) params.set("sale", "true");

    navigate(`/search-results?${params.toString()}`);
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedBrands([]);
    setSelectedModels([]);
    setSelectedWidths([]);
    setSelectedDiameters([]);
    setSelectedProfiles([]);
    setSelectedSeasons([]);
    setSelectedNoiseLevels([]);
    setSelectedCountries([]);
    setSelectedYears([]);
    setSelectedWetGrips([]);
    setSelectedFuelEfficiencies([]);
    setSelectedLoadIndexes([]);
    setSelectedSpeedIndexes([]);
    setSpikes(false);
    setSale(false);
    handleToastClose();
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto p-4 relative">
        {showToast && (
          <Toast message={toastMessage} duration={5000} onClose={handleToastClose} />
        )}

        <h1 className="text-2xl font-bold mb-6">Детальний пошук</h1>

        <form onSubmit={handleSearch} className="p-6">
          {/* Ціновий діапазон */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium mb-2">ЦІНОВИЙ ДІАПАЗОН</h3>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="sale"
                  checked={sale}
                  onChange={(e) => setSale(e.target.checked)}
                  className="form-checkbox"
                />
                <label htmlFor="sale" className="text-sm font-medium">
                  Акційні товари
                </label>
              </div>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Мінімум"
                  value={minPrice}
                  onChange={(e) => handlePriceChange(e, "min")}
                  className="w-full p-2 border rounded"
                  inputMode="numeric"
                />
                <input
                  type="text"
                  placeholder="Максимум"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange(e, "max")}
                  onBlur={validatePrice}
                  className="w-full p-2 border rounded"
                  inputMode="numeric"
                />
              </div>
              {!loading && maxDbPrice > minDbPrice && (
                <div className="space-y-2">
                  <h3 className="font-medium">Швидкий вибір максимальної ціни</h3>
                  <input
                    type="range"
                    min={minDbPrice}
                    max={maxDbPrice}
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600">Вибрано: до {sliderValue}</div>
                </div>
              )}
            </div>

            {/* Фільтри базових параметрів */}
            <div className="space-y-4">
              <h3 className="font-medium mb-2">БАЗОВІ ПАРАМЕТРИ</h3>
              <Select
                multiple
                value={selectedBrands}
                onValueChange={(value) => setSelectedBrands(value as string[])}
                placeholder={loading ? "Завантаження..." : "ВСІ БРЕНДИ"}
                disabled={loading}
              >
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand.toUpperCase()}
                  </SelectItem>
                ))}
              </Select>

              <Select
                multiple
                value={selectedModels}
                onValueChange={(value) => setSelectedModels(value as string[])}
                placeholder="ВСІ МОДЕЛІ"
              >
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model.toUpperCase()}
                  </SelectItem>
                ))}
              </Select>

              <Select
                multiple
                value={selectedDiameters}
                onValueChange={(value) => setSelectedDiameters(value as string[])}
                placeholder="ВИБЕРІТЬ ДІАМЕТР"
              >
                {diameters.map((diameter) => {
                  const val = diameter.toString();
                  return (
                    <SelectItem key={diameter} value={val}>
                      {`R${diameter}`}
                    </SelectItem>
                  );
                })}
              </Select>
            </div>
          </div>

          {/* Фільтри габаритів */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="space-y-4">
              <h3 className="font-medium mb-2">ШИРИНА</h3>
              <Select
                multiple
                value={selectedWidths}
                onValueChange={(value) => setSelectedWidths(value as string[])}
                placeholder="ВИБЕРІТЬ ШИРИНУ"
              >
                {widths.map((width) => {
                  const val = width.toString();
                  return (
                    <SelectItem key={width} value={val}>
                      {width}
                    </SelectItem>
                  );
                })}
              </Select>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium mb-2">ПРОФІЛЬ</h3>
              <Select
                multiple
                value={selectedProfiles}
                onValueChange={(value) => setSelectedProfiles(value as string[])}
                placeholder="ВИБЕРІТЬ ПРОФІЛЬ"
              >
                {profiles.map((profile) => {
                  const val = profile.toString();
                  return (
                    <SelectItem key={profile} value={val}>
                      {profile}
                    </SelectItem>
                  );
                })}
              </Select>
            </div>
          </div>

          {/* Фільтр по сезону */}
          <div className="space-y-4 mt-6">
            <h3 className="font-medium mb-2">СЕЗОН</h3>
            <Select
              multiple
              value={selectedSeasons}
              onValueChange={(value) => setSelectedSeasons(value as string[])}
              placeholder="ВИБЕРІТЬ СЕЗОН"
              displayValue={(value: string[]) =>
                value
                  .map((v) =>
                    v === "summer" ? "ЛІТНІ" : v === "winter" ? "ЗИМОВІ" : "ВСЕСЕЗОННІ"
                  )
                  .join(", ")
              }
            >
              {seasons.map((season) => (
                <SelectItem key={season} value={season}>
                  {season === "summer"
                    ? "ЛІТНІ"
                    : season === "winter"
                    ? "ЗИМОВІ"
                    : "ВСЕСЕЗОННІ"}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Кнопка "Показати/Сховати додаткові параметри" */}
          <div className="mt-6">
            <Button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="bg-blue-600 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded w-full md:w-auto"
            >
              {showAdvanced ? "Сховати додаткові параметри" : "Показати додаткові параметри"}
            </Button>
          </div>

          {showAdvanced && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium mb-2">УРОВЕНЬ ШУМУ</h3>
                <Select
                  multiple
                  value={selectedNoiseLevels}
                  onValueChange={(value) => setSelectedNoiseLevels(value as string[])}
                  placeholder="ВИБЕРІТЬ"
                >
                  {noiseLevels.map((noise) => {
                    const val = noise.toString();
                    return (
                      <SelectItem key={noise} value={val}>
                        {noise}
                      </SelectItem>
                    );
                  })}
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-2">КРАЇНА</h3>
                <Select
                  multiple
                  value={selectedCountries}
                  onValueChange={(value) => setSelectedCountries(value as string[])}
                  placeholder="ВИБЕРІТЬ КРАЇНУ"
                >
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country.toUpperCase()}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-2">ГОД</h3>
                <Select
                  multiple
                  value={selectedYears}
                  onValueChange={(value) => setSelectedYears(value as string[])}
                  placeholder="ВИБЕРІТЬ РІК"
                >
                  {years.map((year) => {
                    const val = year.toString();
                    return (
                      <SelectItem key={year} value={val}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-2">СЦЕПЛЕННЯ</h3>
                <Select
                  multiple
                  value={selectedWetGrips}
                  onValueChange={(value) => setSelectedWetGrips(value as string[])}
                  placeholder="ВИБЕРІТЬ"
                >
                  {wetGrips.map((wg) => (
                    <SelectItem key={wg} value={wg}>
                      {wg.toUpperCase()}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-2">ЕФЕКТИВНІСТЬ ПАЛИВА</h3>
                <Select
                  multiple
                  value={selectedFuelEfficiencies}
                  onValueChange={(value) => setSelectedFuelEfficiencies(value as string[])}
                  placeholder="ВИБЕРІТЬ"
                >
                  {fuelEfficiencies.map((fe) => (
                    <SelectItem key={fe} value={fe}>
                      {fe.toUpperCase()}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-2">ІНДЕКС НАВАНТАЖЕННЯ</h3>
                <Select
                  multiple
                  value={selectedLoadIndexes}
                  onValueChange={(value) => setSelectedLoadIndexes(value as string[])}
                  placeholder="ВИБЕРІТЬ"
                >
                  {loadIndexes.map((li) => (
                    <SelectItem key={li} value={li}>
                      {li.toUpperCase()}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium mb-2">ІНДЕКС ШВИДКОСТІ</h3>
                <Select
                  multiple
                  value={selectedSpeedIndexes}
                  onValueChange={(value) => setSelectedSpeedIndexes(value as string[])}
                  placeholder="ВИБЕРІТЬ"
                >
                  {speedIndexes.map((si) => (
                    <SelectItem key={si} value={si}>
                      {si.toUpperCase()}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="spikes"
                    checked={spikes}
                    onChange={(e) => setSpikes(e.target.checked)}
                    className="form-checkbox"
                  />
                  <label htmlFor="spikes" className="ml-2 select-none">
                    ШИПИ
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Нижние кнопки: "Скасувати" и "Пошук" */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              type="button"
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded"
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white text-sm px-8 py-2 rounded"
            >
              Пошук
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
