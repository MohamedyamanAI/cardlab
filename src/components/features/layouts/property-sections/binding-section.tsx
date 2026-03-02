import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CanvasElement } from "@/lib/types/canvas-elements";
import type { Property } from "@/lib/types";
import { useLayoutEditorStore } from "@/lib/store/layout-editor-store";

interface BindingSectionProps {
  element: CanvasElement;
  properties: Property[];
}

const COMPATIBLE_TYPES: Record<CanvasElement["type"], string[]> = {
  text: ["text", "number", "select", "boolean", "color"],
  image: ["image"],
  shape: [],
};

export function BindingSection({ element, properties }: BindingSectionProps) {
  const updateElement = useLayoutEditorStore((s) => s.updateElement);

  const compatible = properties.filter((p) =>
    COMPATIBLE_TYPES[element.type].includes(p.type)
  );

  if (compatible.length === 0 && element.type === "shape") return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase">Binding</h4>
      <div>
        <Label className="text-xs">Property</Label>
        <Select
          value={element.bind_to ?? "__none__"}
          onValueChange={(val) =>
            updateElement(element.id, {
              bind_to: val === "__none__" ? undefined : val,
            })
          }
        >
          <SelectTrigger className="h-7 w-full text-xs">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {compatible.map((p) => (
              <SelectItem key={p.id} value={p.slug}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
