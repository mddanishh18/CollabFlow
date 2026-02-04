import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Plus, Tag } from "lucide-react";

interface Label {
    name: string;
    color: string;
}

interface LabelPickerProps {
    labels: Label[];
    onChange: (labels: Label[]) => void;
}

const PRESET_COLORS = [
    "#ef4444", // red
    "#f59e0b", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#6b7280", // gray
];

export function LabelPicker({ labels, onChange }: LabelPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newLabelName, setNewLabelName] = useState("");
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

    const addLabel = () => {
        if (!newLabelName.trim()) return;

        const newLabel = {
            name: newLabelName.trim(),
            color: selectedColor,
        };

        onChange([...labels, newLabel]);
        setNewLabelName("");
        setSelectedColor(PRESET_COLORS[0]);
    };

    const removeLabel = (index: number) => {
        onChange(labels.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            {/* Current Labels */}
            <div className="flex flex-wrap gap-2">
                {labels.map((label, index) => (
                    <Badge
                        key={index}
                        variant="outline"
                        style={{ borderColor: label.color, color: label.color }}
                        className="flex items-center gap-1"
                    >
                        {label.name}
                        <X
                            className="h-3 w-3 cursor-pointer hover:opacity-70"
                            onClick={() => removeLabel(index)}
                        />
                    </Badge>
                ))}

                {/* Add Label Popover */}
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Label
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Label Name</label>
                                <Input
                                    placeholder="e.g., Bug, Feature"
                                    value={newLabelName}
                                    onChange={(e) => setNewLabelName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            addLabel();
                                        }
                                    }}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Color</label>
                                <div className="grid grid-cols-8 gap-2">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            className={`h-8 w-8 rounded-full border-2 ${selectedColor === color
                                                    ? "border-foreground"
                                                    : "border-border"
                                                }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setSelectedColor(color)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                    addLabel();
                                    setIsOpen(false);
                                }}
                                disabled={!newLabelName.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Empty State */}
            {labels.length === 0 && (
                <p className="text-sm text-muted-foreground">No labels yet. Click "Add Label" to create one.</p>
            )}
        </div>
    );
}
