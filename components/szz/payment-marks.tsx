import * as React from "react";

// Recognizable acceptance marks for the payment methods SERVERIZZ accepts.
// Rendered as small white cards (how these marks are conventionally shown)
// so they stay legible on the dark footer.
const CARD_W = 38;
const CARD_H = 24;

function Badge({
  label,
  bg = "#ffffff",
  stroke = "#e6e6e6",
  children,
}: {
  label: string;
  bg?: string;
  stroke?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      width={CARD_W}
      height={CARD_H}
      viewBox={`0 0 ${CARD_W} ${CARD_H}`}
      role="img"
      aria-label={label}
      style={{ display: "block" }}
    >
      <rect
        width={CARD_W}
        height={CARD_H}
        rx={4}
        fill={bg}
        stroke={stroke}
        strokeWidth={1}
      />
      {children}
    </svg>
  );
}

function Visa() {
  return (
    <Badge label="Visa">
      <text
        x={19}
        y={16}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={11}
        fontWeight={700}
        fontStyle="italic"
        fill="#1A1F71"
        letterSpacing={0.3}
      >
        VISA
      </text>
    </Badge>
  );
}

function Mastercard() {
  return (
    <Badge label="Mastercard">
      <circle cx={15.5} cy={12} r={6.2} fill="#EB001B" />
      <circle cx={22.5} cy={12} r={6.2} fill="#F79E1B" fillOpacity={0.9} />
    </Badge>
  );
}

function Amex() {
  return (
    <Badge label="American Express" bg="#006FCF" stroke="#006FCF">
      <text
        x={19}
        y={15}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={8}
        fontWeight={700}
        fill="#ffffff"
        letterSpacing={0.3}
      >
        AMEX
      </text>
    </Badge>
  );
}

function Discover() {
  return (
    <Badge label="Discover">
      <circle cx={30} cy={11} r={6} fill="#FF6000" />
      <text
        x={4}
        y={15}
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={6}
        fontWeight={700}
        fill="#231F20"
        letterSpacing={0.2}
      >
        DISCOVER
      </text>
    </Badge>
  );
}

function BitPay() {
  return (
    <Badge label="BitPay" bg="#1A3D7C" stroke="#1A3D7C">
      <text
        x={19}
        y={15.5}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={8}
        fontWeight={700}
        fill="#ffffff"
      >
        BitPay
      </text>
    </Badge>
  );
}

export function PaymentMarks() {
  return (
    <div
      role="list"
      aria-label="Accepted payment methods"
      style={{ display: "flex", alignItems: "center", gap: 6 }}
    >
      <Visa />
      <Mastercard />
      <Discover />
      <Amex />
      <BitPay />
    </div>
  );
}
