import Image from "next/image";

export interface QuestionMediaProps {
  url: string;
  alt?: string;
  className?: string;
}

export function QuestionMedia({ url, alt = "", className = "" }: QuestionMediaProps) {
  if (!url) return null;
  return (
    <div className={`relative overflow-hidden rounded-lg border bg-muted/30 ${className}`}>
      <Image
        src={url}
        alt={alt}
        width={800}
        height={500}
        loading="lazy"
        className="h-auto w-full max-h-[420px] object-contain"
        sizes="(max-width: 768px) 100vw, 640px"
        unoptimized
      />
    </div>
  );
}
