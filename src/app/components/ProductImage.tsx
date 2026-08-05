import { Package } from "lucide-react";

export function ProductImage({
  src, alt, className = "",
}: {
  src: string | null | undefined; alt: string; className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-300 ${className}`}>
        <Package size="40%" strokeWidth={1.25} />
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} />;
}
