const Card = ({ children, className }) => (
  <div className={`card ${className}`}>{children}</div>
);
export { Card };