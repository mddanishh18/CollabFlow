import express from "express";
import {
    getProjectTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { wrap } from "../utils/routeHandler.js";

const router = express.Router();

router.use(authenticate);

router.get("/project/:projectId", wrap(getProjectTasks));
router.get("/:taskId", wrap(getTask));
router.post("/", wrap(createTask));
router.patch("/:taskId", wrap(updateTask));
router.delete("/:taskId", wrap(deleteTask));

export default router;
