import { forwardRef } from "react"
import { buttonVariants } from "./button.constants"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", style, ...props }, ref) => {
    return (
      <button
        // Добавляем свойство для отключения стандартного эффекта выделения на мобильных устройствах
        style={{ WebkitTapHighlightColor: "transparent", ...style }}
        className={cn(
          buttonVariants({ variant, size, className }),
          "active:scale-[0.98]"
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
