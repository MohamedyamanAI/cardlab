"use client";

import type { GeneratedImage } from "@/lib/intelligence/features/image-generation";

type ImageCardProps = {
  image: GeneratedImage;
  onClick: () => void;
};

export function ImageCard({ image, onClick }: ImageCardProps) {
  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-muted transition-transform duration-200 hover:z-10 hover:scale-105"
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${image.base64}`}
        alt={image.prompt}
        className="aspect-square w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
    </div>
  );
}
