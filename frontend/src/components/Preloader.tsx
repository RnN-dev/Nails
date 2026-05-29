import { useEffect, useState } from "react";

export function Preloader(): JSX.Element | null {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="preloader" aria-label="Carregando Aline Studio">
      <div className="preloader__mark">Aline Studio</div>
      <div className="preloader__bar">
        <span />
      </div>
    </div>
  );
}
