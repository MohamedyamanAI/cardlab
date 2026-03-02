"use client";

import type { Property } from "@/lib/types";
import { PropertyContextMenu } from "./property-context-menu";
import {
  IconTypography,
  IconHash,
  IconPhoto,
  IconList,
  IconToggleLeft,
  IconPalette,
} from "@tabler/icons-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  text: <IconTypography size={14} className="text-muted-foreground" />,
  number: <IconHash size={14} className="text-muted-foreground" />,
  image: <IconPhoto size={14} className="text-muted-foreground" />,
  select: <IconList size={14} className="text-muted-foreground" />,
  boolean: <IconToggleLeft size={14} className="text-muted-foreground" />,
  color: <IconPalette size={14} className="text-muted-foreground" />,
};

interface ColumnHeaderProps {
  property: Property;
}

export function ColumnHeader({ property }: ColumnHeaderProps) {
  return (
    <PropertyContextMenu property={property}>
      <div className="flex cursor-default items-center gap-1.5 select-none">
        {TYPE_ICONS[property.type]}
        <span className="truncate">{property.name}</span>
        {property.is_required && (
          <span className="text-destructive" title="Required">*</span>
        )}
      </div>
    </PropertyContextMenu>
  );
}
