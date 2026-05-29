import type { CSSProperties } from "react";

export function SectionParticles(): JSX.Element {
  return (
    <div className="particles" aria-hidden="true">
      {Array.from({ length: 22 }, (_, index) => (
        <span key={index} style={{ "--particle-index": index } as CSSProperties} />
      ))}
    </div>
  );
}
