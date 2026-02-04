// Phase 3 Test Script - Task Management & Real-Time Sync
// Run with: node test-phase3.js

import fetch from 'node-fetch';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000';
const WS_URL = 'http://localhost:5000';

let authToken = '';
let testWorkspaceId = '';
let testProjectId = '';
let testTaskId = '';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
    console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function success(message) {
    log('✅', message, colors.green);
}

function error(message) {
    log('❌', message, colors.red);
}

function info(message) {
    log('ℹ️', message, colors.cyan);
}

function section(message) {
    console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.blue}${message}${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

// Helper to make authenticated requests
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
            ...options.headers
        }
    });
    const data = await response.json();
    return { response, data };
}

// Test 1: Login
async function testLogin() {
    section('TEST 1: User Authentication');

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'user2@gmail.com',
                password: 'user123'
            })
        });

        const data = await response.json();

        if (data.success && data.data.token) {
            authToken = data.data.token;
            success('User logged in successfully');
            info(`Token: ${authToken.substring(0, 20)}...`);
            return true;
        } else {
            error('Login failed - User might not exist');
            info('Please create a test user first or update credentials');
            return false;
        }
    } catch (err) {
        error(`Login error: ${err.message}`);
        return false;
    }
}

// Test 2: Get or Create Workspace
async function testWorkspace() {
    section('TEST 2: Workspace Setup');

    try {
        // Try to get existing workspaces
        const { data } = await apiRequest('/api/workspaces');

        if (data.success && data.data.length > 0) {
            testWorkspaceId = data.data[0]._id;
            success('Using existing workspace');
            info(`Workspace ID: ${testWorkspaceId}`);
        } else {
            // Create new workspace
            const createRes = await apiRequest('/api/workspaces', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Test Workspace',
                    description: 'Workspace for Phase 3 testing'
                })
            });

            if (createRes.data.success) {
                testWorkspaceId = createRes.data.data._id;
                success('Created new workspace');
                info(`Workspace ID: ${testWorkspaceId}`);
            }
        }
        return true;
    } catch (err) {
        error(`Workspace error: ${err.message}`);
        return false;
    }
}

// Test 3: Get or Create Project
async function testProject() {
    section('TEST 3: Project Setup');

    try {
        // Try to get existing projects
        const { data } = await apiRequest('/api/projects');

        if (data.success && data.data.length > 0) {
            testProjectId = data.data[0]._id;
            success('Using existing project');
            info(`Project ID: ${testProjectId}`);
        } else {
            // Create new project
            const createRes = await apiRequest('/api/projects', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Test Project',
                    description: 'Project for Phase 3 testing',
                    workspace: testWorkspaceId
                })
            });

            if (createRes.data.success) {
                testProjectId = createRes.data.data.project._id;
                success('Created new project');
                info(`Project ID: ${testProjectId}`);
            }
        }
        return true;
    } catch (err) {
        error(`Project error: ${err.message}`);
        return false;
    }
}

// Test 4: Create Task
async function testCreateTask() {
    section('TEST 4: Create Task (HTTP API)');

    try {
        const { data } = await apiRequest('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Test Task - Phase 3',
                description: 'Testing task creation',
                status: 'todo',
                priority: 'high',
                projectId: testProjectId,
                labels: [
                    { name: 'testing', color: '#FF5733' },
                    { name: 'phase-3', color: '#33FF57' }
                ]
            })
        });

        if (data.success && data.data) {
            testTaskId = data.data._id;
            success('Task created successfully');
            info(`Task ID: ${testTaskId}`);
            info(`Title: ${data.data.title}`);
            info(`Status: ${data.data.status}`);
            info(`Priority: ${data.data.priority}`);
            return true;
        } else {
            error('Task creation failed');
            return false;
        }
    } catch (err) {
        error(`Create task error: ${err.message}`);
        return false;
    }
}

// Test 5: Get Tasks
async function testGetTasks() {
    section('TEST 5: Get Project Tasks');

    try {
        const { data } = await apiRequest(`/api/tasks/project/${testProjectId}`);

        if (data.success && data.data) {
            success(`Retrieved ${data.data.length} task(s)`);
            data.data.forEach((task, index) => {
                info(`Task ${index + 1}: ${task.title} (${task.status})`);
            });
            return true;
        } else {
            error('Failed to get tasks');
            return false;
        }
    } catch (err) {
        error(`Get tasks error: ${err.message}`);
        return false;
    }
}

// Test 6: Update Task
async function testUpdateTask() {
    section('TEST 6: Update Task');

    try {
        const { data } = await apiRequest(`/api/tasks/${testTaskId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'in-progress',
                description: 'Updated description for testing'
            })
        });

        if (data.success && data.data) {
            success('Task updated successfully');
            info(`New status: ${data.data.status}`);
            info(`New description: ${data.data.description}`);
            return true;
        } else {
            error('Task update failed');
            return false;
        }
    } catch (err) {
        error(`Update task error: ${err.message}`);
        return false;
    }
}

// Test 7: WebSocket Connection
async function testWebSocket() {
    section('TEST 7: WebSocket Connection & Real-Time Sync');

    return new Promise((resolve) => {
        const socket = io(WS_URL, {
            auth: {
                token: authToken
            }
        });

        socket.on('connect', () => {
            success('WebSocket connected');
            info(`Socket ID: ${socket.id}`);

            // Join project room
            socket.emit('join:project', testProjectId);
            info(`Joined project room: ${testProjectId}`);
        });

        socket.on('room:users', (data) => {
            success('Received online users');
            info(`Users in room: ${data.users.length}`);
        });

        socket.on('user:joined', (data) => {
            info(`User joined: ${data.user.name}`);
        });

        socket.on('task:created', (data) => {
            success('Received real-time task creation event');
            info(`Task: ${data.task.title}`);
        });

        socket.on('task:updated', (data) => {
            success('Received real-time task update event');
            info(`Task ID: ${data.taskId}`);
        });

        socket.on('connect_error', (err) => {
            error(`WebSocket connection error: ${err.message}`);
            resolve(false);
        });

        // Test broadcasting
        setTimeout(() => {
            socket.emit('task:create', {
                projectId: testProjectId,
                task: {
                    title: 'WebSocket Test Task',
                    status: 'todo'
                }
            });
            info('Emitted task:create event');
        }, 1000);

        setTimeout(() => {
            socket.disconnect();
            success('WebSocket test completed');
            resolve(true);
        }, 3000);
    });
}

// Test 8: Delete Task
async function testDeleteTask() {
    section('TEST 8: Delete Task');

    try {
        const { data } = await apiRequest(`/api/tasks/${testTaskId}`, {
            method: 'DELETE'
        });

        if (data.success) {
            success('Task deleted successfully');
            return true;
        } else {
            error('Task deletion failed');
            return false;
        }
    } catch (err) {
        error(`Delete task error: ${err.message}`);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('\n');
    log('🧪', 'PHASE 3 TEST SUITE - Task Management & Real-Time Sync', colors.yellow);
    console.log('\n');

    const results = {
        passed: 0,
        failed: 0
    };

    // Run tests sequentially
    const tests = [
        { name: 'Login', fn: testLogin },
        { name: 'Workspace', fn: testWorkspace },
        { name: 'Project', fn: testProject },
        { name: 'Create Task', fn: testCreateTask },
        { name: 'Get Tasks', fn: testGetTasks },
        { name: 'Update Task', fn: testUpdateTask },
        { name: 'WebSocket', fn: testWebSocket },
        { name: 'Delete Task', fn: testDeleteTask }
    ];

    for (const test of tests) {
        const passed = await test.fn();
        if (passed) {
            results.passed++;
        } else {
            results.failed++;
            // Stop on critical failures
            if (test.name === 'Login') {
                error('Cannot continue without authentication');
                break;
            }
        }
    }

    // Summary
    section('TEST SUMMARY');
    log('📊', `Total Tests: ${results.passed + results.failed}`, colors.cyan);
    log('✅', `Passed: ${results.passed}`, colors.green);
    log('❌', `Failed: ${results.failed}`, colors.red);

    console.log('\n');

    if (results.failed === 0) {
        log('🎉', 'ALL TESTS PASSED! Phase 3 is working correctly!', colors.green);
    } else {
        log('⚠️', 'Some tests failed. Please check the errors above.', colors.yellow);
    }

    console.log('\n');
}

runTests().catch(err => {
    error(`Test suite error: ${err.message}`);
    process.exit(1);
});
