"use client"

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTasks } from "@/hooks/use-task";
import { TaskList } from "@/components/task/task-list";
import { CreateTaskDialog } from "@/components/task/create-task-dialog";
import { UserPresence } from "@/components/realtime/user-presence";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ListTodo } from "lucide-react";

export default function TasksPage() {
    const params = useParams();
    const projectId = params?.projectId as string;
    const workspaceId = params?.workspaceId as string;

    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { projectTasks, loading } = useTasks(projectId);

    return (
        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pl-12 md:pl-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ListTodo className="h-7 w-7" />
                        Tasks
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Manage and track your project tasks
                    </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <UserPresence projectId={projectId} />
                    <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Task List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Tasks</CardTitle>
                    <CardDescription>
                        {projectTasks.length} task{projectTasks.length !== 1 ? "s" : ""} in this project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TaskList
                        tasks={projectTasks}
                        loading={loading}
                    />
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <CreateTaskDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onClose={(success) => {
                    setCreateDialogOpen(false);
                }}
                projectId={projectId}
            />
        </div>
    );
}
