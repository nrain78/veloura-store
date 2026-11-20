import { brand } from "../brand.js";

export default function Logo({ light = false }) {
  return (
    <span className={`logo ${light ? "logo--light" : ""}`}>
      <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
        <circle cx="20" cy="20" r="19" fill="currentColor" />
        <path
          d="M11 12 L20 29 L29 12"
          fill="none"
          stroke="var(--logo-inner)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="logo__text">{brand.name}</span>
    </span>
  );
}
