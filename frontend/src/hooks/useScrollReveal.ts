import { useEffect } from "react";

export function useScrollReveal(): void {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal-up, .reveal-left, .reveal-right, .reveal-scale")
    );

    nodes.forEach((node) => {
      const staggerChildren = node.matches("[data-stagger]")
        ? Array.from(node.children).filter((child): child is HTMLElement => child instanceof HTMLElement)
        : [];

      staggerChildren.forEach((child, index) => {
        child.style.setProperty("--reveal-delay", `${index * 0.1}s`);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);
}
