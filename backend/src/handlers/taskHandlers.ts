import { Server } from "socket.io";
import { AuthenticatedSocket } from "../middleware/socketAuth.js";

export const registerTaskHandlers = (
    io: Server,
    socket: AuthenticatedSocket
) => {
    socket.on("task:create", (data: { projectId: string; task: any }) => {
        const roomName = `project:${data.projectId}`;

        socket.to(roomName).emit("task:created", {
            task: data.task,
            createdBy: socket.user
        });
    });

    socket.on("task:update", (data: { projectId: string; taskId: string; updates: any }) => {
        const roomName = `project:${data.projectId}`;

        socket.to(roomName).emit("task:updated", {
            taskId: data.taskId,
            updates: data.updates,
            updatedBy: socket.user
        });
    });

    socket.on("task:delete", (data: { projectId: string; taskId: string }) => {
        const roomName = `project:${data.projectId}`;

        socket.to(roomName).emit("task:deleted", {
            taskId: data.taskId,
            deletedBy: socket.user
        });
    });

    socket.on("task:move", (data: {
        projectId: string;
        taskId: string;
        fromStatus: string;
        toStatus: string;
        newIndex: number;
    }) => {
        const roomName = `project:${data.projectId}`;

        socket.to(roomName).emit("task:moved", {
            ...data,
            movedBy: socket.user,
        });
    });
};