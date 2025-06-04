import React from "react";

const MessageCircle: React.FC<React.SVGProps<SVGSVGElement>> = (_props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "scale(0.8)" }}
  >
    <path
      d="M896 192H128c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h576.6l191.6 127.7L896 832c35.3 0 64-28.7 64-64V256c0-35.3-28.7-64-64-64z"
      fill="#5793d7"
    />
    <path
      d="M640 512c0-125.4-51.5-238.7-134.5-320H128c-35.3 0-64 28.7-64 64v512c0 35.3 28.7 64 64 64h377.5c83-81.3 134.5-194.6 134.5-320z"
      fill="#6CA0DC"
    />
    <path
      d="M256 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
      fill="#FFFF8D"
    />
    <path
      d="M512 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
      fill="#FFFF00"
    />
    <path
      d="M768 512m-64 0a64 64 0 1 0 128 0 64 64 0 1 0-128 0Z"
      fill="#FFEA00"
    />
  </svg>
);

export default MessageCircle;
