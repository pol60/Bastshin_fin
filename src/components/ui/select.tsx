import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

// Функция throttle для ограниченного вызова функции
function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number
): T {
  let inThrottle = false;
  return function (...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  } as T;
}

// Функция для подсветки совпадающих частей текста
function highlightText(text: string, searchTerm: string): React.ReactNode[] {
  if (!searchTerm) return [text];
  const regex = new RegExp(`(${searchTerm})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className="bg-yellow-200">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  multiple?: boolean;
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  displayValue?: (value: string[]) => string;
}

export function Select({
  multiple = false,
  value,
  onValueChange,
  placeholder,
  children,
  className,
  disabled = false,
  displayValue,
  ...rest
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownDirection, setDropdownDirection] = React.useState<"up" | "down">("down");
  const [searchTerm, setSearchTerm] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSelect = (newValue: string) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValues = currentValue.includes(newValue)
        ? currentValue.filter((v) => v !== newValue)
        : [...currentValue, newValue];
      onValueChange?.(newValues);
    } else {
      onValueChange?.(newValue);
      setIsOpen(false);
    }
  };

  // Закрытие выпадающего списка при клике вне контейнера, включая нажатие на другие кнопки
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside); // Для мобильных устройств
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Закрытие списка при скролле (только на десктопе)
  React.useEffect(() => {
    const handleScroll = () => {
      if (isOpen && window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  const recalcDropdownDirection = React.useCallback(() => {
    if (containerRef.current && isOpen) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropdownDirection(spaceBelow < 200 ? "up" : "down");
    }
  }, [isOpen]);

  React.useEffect(() => {
    recalcDropdownDirection();
  }, [isOpen, recalcDropdownDirection]);

  React.useEffect(() => {
    const handleResize = throttle(() => recalcDropdownDirection(), 100);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [recalcDropdownDirection]);

  const displayText =
    multiple && Array.isArray(value)
      ? value.length > 0
        ? displayValue?.(value) ?? value.join(", ")
        : placeholder
      : (value as string) || placeholder;

  // Фильтрация элементов по введённому тексту
  const filteredChildren = React.Children.toArray(children).filter((child) => {
    if (React.isValidElement(child)) {
      const text = String(child.props.children).toLowerCase();
      return text.includes(searchTerm.toLowerCase());
    }
    return true;
  });
  // Если поиск не ведётся и элементов больше 6 – показываем только первые 6
  const displayedChildren =
    searchTerm === "" && filteredChildren.length > 6
      ? filteredChildren.slice(0, 6)
      : filteredChildren;

  const renderedChildren = React.Children.map(displayedChildren, (child) => {
    if (
      React.isValidElement(child) &&
      (child.type as React.ComponentType).displayName === "SelectItem"
    ) {
      const childValue = child.props.value;
      const isSelected = multiple
        ? Array.isArray(value) && value.includes(childValue)
        : value === childValue;
      
      // Подсветка совпадающих частей текста, если ведётся поиск
      let newChildren = child.props.children;
      if (typeof newChildren === "string" && searchTerm.trim() !== "") {
        newChildren = highlightText(newChildren, searchTerm);
      }
      
      return React.cloneElement(child as React.ReactElement<SelectItemProps>, {
        onSelect: () => handleSelect(childValue),
        isSelected,
        children: newChildren,
      });
    }
    return child;
  });

  return (
    <div ref={containerRef} className="relative" {...rest}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm(""); // сброс поиска при открытии
          }
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border",
          "border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          "ring-offset-background placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        disabled={disabled}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}
        />
      </button>
      
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            "absolute z-50 w-full rounded-md border shadow-lg animate-in fade-in-80",
            dropdownDirection === "down" ? "mt-1" : "bottom-full mb-1",
            "bg-white"
          )}
        >
          <div className="p-2">
            {/* Окно поиска с предотвращением закрытия при клике на него */}
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()} // Для мобильных устройств
              onTouchMove={(e) => e.stopPropagation()} // Для предотвращения закрытия при движении пальца
              placeholder="Пошук..."
              className="mb-2 w-full border p-3 text-xs"
            />
            {/* Список опций с ограниченной высотой (первые 6 элементов видны, остальное – скролл) */}
            <div className="max-h-48 overflow-y-auto">
              {renderedChildren}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onSelect?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, onSelect, isSelected, disabled = false, ...props }, ref) => (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center py-1.5 pl-8 pr-2 text-xs",
        "outline-none focus:bg-accent focus:text-accent-foreground",
        "transition-colors duration-200",
        isSelected && "bg-accent font-medium",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      onClick={
        !disabled
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect?.();
            }
          : undefined
      }
      {...props}
    >
      {isSelected && <span className="absolute left-2 text-xs text-current">✓</span>}
      {children}
    </div>
  )
);
SelectItem.displayName = "SelectItem";

export const MemoSelectItem = React.memo(SelectItem);
