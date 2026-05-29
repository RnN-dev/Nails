import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
};

export function RippleButton({ children, className = "", variant = "primary", ...props }: Props): JSX.Element {
  function handleClick(event: MouseEvent<HTMLButtonElement>): void {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);

    ripple.className = "ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 650);
    props.onClick?.(event);
  }

  return (
    <button {...props} className={`btn btn--${variant} ${className}`} onClick={handleClick}>
      {children}
    </button>
  );
}
