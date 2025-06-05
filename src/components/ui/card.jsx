// card.jsx
export function Card({ children, className = '' }) {
  return <div className={`bg-white border rounded shadow-sm ${className}`}>{children}</div>;
}
