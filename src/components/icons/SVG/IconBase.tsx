// components/icons/SVG/IconBase.tsx
import React, { memo } from 'react';

interface IconBaseProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string; // Размер в пикселях или строка (например "1em")
  inline?: boolean; // Для inline-режима (вертикальное выравнивание)
}

const IconBase = memo(({
  size = 24,
  inline = false,
  children,
  viewBox = '0 0 24 24',
  ...props
}: IconBaseProps) => (
  <svg
    viewBox={viewBox}
    width={size}
    height={size}
    fill="currentColor" // Цвет наследуется из CSS
    style={{
      display: inline ? 'inline-block' : 'block',
      verticalAlign: inline ? 'middle' : 'initial',
      flexShrink: 0, // Запрещаем сжатие в flex-контейнерах
      ...props.style
    }}
    {...props} // Передаем все стандартные SVG-пропсы
  >
    {children}
  </svg>
));

export default IconBase;