import React from "react";

interface StockIconProps extends React.SVGProps<SVGSVGElement> {
  fillColor?: string;
  strokeColor?: string;
}

const Stock: React.FC<StockIconProps> = ({
  fillColor = "#6CA0DC",
  strokeColor = "#ffffff",
  ...props
}) => (
  <svg
    width="65"
    height="64"
    viewBox="0 0 65 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "scale(0.5)" }}
    {...props}
  >
    {/* Декагон с 10 углами с закруглением через арки */}
    <path
      fill={fillColor}
      d="
        M30.12 9.57
        A2.5 2.5 0 0 1 34.88 9.57
        L43.76 12.46
        A2.5 2.5 0 0 1 47.61 15.25
        L53.11 22.81
        A2.5 2.5 0 0 1 54.58 27.33
        L54.58 36.67
        A2.5 2.5 0 0 1 53.11 41.19
        L47.61 48.75
        A2.5 2.5 0 0 1 43.76 51.54
        L34.88 54.43
        A2.5 2.5 0 0 1 30.12 54.43
        L21.24 51.54
        A2.5 2.5 0 0 1 17.39 48.75
        L11.90 41.19
        A2.5 2.5 0 0 1 10.43 36.67
        L10.43 27.33
        A2.5 2.5 0 0 1 11.90 22.81
        L17.39 15.25
        A2.5 2.5 0 0 1 21.24 12.46
        L30.12 9.57
        Z"
    />
    {/* Жёлтая деталь */}
    <path
      d="M25.6 31.5L31.1 37L40.6 27.5"
      stroke={strokeColor}
      strokeWidth="4"
      strokeLinecap="square"
    />
  </svg>
);

export default Stock;