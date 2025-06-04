import React from 'react';

const DiscountIcon: React.FC<React.SVGProps<SVGSVGElement> & { strokeWidth?: number }> = ({
  width = "100px",
  height = "40px",
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 100 40"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "scale(2.5)" }}
    {...props}
  >
    <rect
      x="0"
      y="0"
      width="100"
      height="40"
      rx="10" // Скругленные углы
      fill="#ef4444" // Красный цвет
    />
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      alignmentBaseline="middle"
      fill="white" // Белый цвет текста
      fontSize="25"
      fontWeight="bold"
    >
      акція
    </text>
  </svg>
);

export default DiscountIcon;
