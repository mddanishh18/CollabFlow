import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus } from "lucide-react";

interface Subtask {
    title: string;
    completed: boolean;
}

interface SubtaskListProps {
    subtasks: Subtask[];
    onChange: (subtasks: Subtask[]) => void;
}

export function SubtaskList({ subtasks, onChange }: SubtaskListProps) {
    const [newSubtask, setNewSubtask] = useState("");

    const addSubtask = () => {
        if (!newSubtask.trim()) return;

        onChange([...subtasks, { title: newSubtask.trim(), completed: false }]);
        setNewSubtask("");
    };

    const toggleSubtask = (index: number) => {
        const updated = [...subtasks];
        updated[index].completed = !updated[index].completed;
        onChange(updated);
    };

    const removeSubtask = (index: number) => {
        onChange(subtasks.filter((_, i) => i !== index));
    };

    const completedCount = subtasks.filter(st => st.completed).length;

    return (
        <div className="space-y-3">
            {/* Progress */}
            {subtasks.length > 0 && (
                <div className="text-sm text-muted-foreground">
                    {completedCount} of {subtasks.length} completed
                </div>
            )}

            {/* Subtask List */}
            <div className="space-y-2">
                {subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center gap-2 group">
                        <Checkbox
                            checked={subtask.completed}
                            onCheckedChange={() => toggleSubtask(index)}
                        />
                        <span
                            className={`flex-1 text-sm ${subtask.completed ? "line-through text-muted-foreground" : ""
                                }`}
                        >
                            {subtask.title}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={() => removeSubtask(index)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Add New Subtask */}
            <div className="flex gap-2">
                <Input
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            addSubtask();
                        }
                    }}
                    className="flex-1"
                />
                <Button size="sm" onClick={addSubtask} disabled={!newSubtask.trim()}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Empty State */}
            {subtasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                    No subtasks yet. Add one above!
                </p>
            )}
        </div>
    );
}
