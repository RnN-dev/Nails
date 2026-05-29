import type { Service } from "../types";

type Props = {
  icon: Service["icon"];
};

export function ServiceIcon({ icon }: Props): JSX.Element {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  if (icon === "gel") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path {...common} d="M24 5c7 7 12 15 12 24 0 7-5 13-12 13S12 36 12 29C12 20 17 12 24 5Z" />
        <path {...common} d="M19 30c2 3 7 4 10 0" />
      </svg>
    );
  }

  if (icon === "acrylic") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path {...common} d="M17 8h14l4 9-11 24L13 17l4-9Z" />
        <path {...common} d="M13 17h22M20 8l4 33M28 8l-4 33" />
      </svg>
    );
  }

  if (icon === "art") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path {...common} d="M12 34c8-2 13-7 17-17l2-5 5 5-5 2c-10 4-15 9-17 17l-2-2Z" />
        <path {...common} d="M28 14l6 6M15 35l-3 5M35 10l3-3" />
      </svg>
    );
  }

  if (icon === "shield") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path {...common} d="M24 5 38 11v10c0 10-6 18-14 22C16 39 10 31 10 21V11l14-6Z" />
        <path {...common} d="m18 24 4 4 9-10" />
      </svg>
    );
  }

  if (icon === "remove") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path {...common} d="M15 15h18l-2 26H17l-2-26ZM12 15h24M20 10h8" />
        <path {...common} d="M20 23h8M19 31h10" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path {...common} d="M16 8h16v15c0 10-4 17-8 17s-8-7-8-17V8Z" />
      <path {...common} d="M16 17h16M21 24h6" />
    </svg>
  );
}
