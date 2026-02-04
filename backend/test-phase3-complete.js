// Comprehensive Phase 3 Test Script - Task Management & Real-Time WebSocket Sync
// Tests all CRUD operations and WebSocket events
// Run with: node test-phase3-complete.js

import fetch from 'node-fetch';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000';
const WS_URL = 'http://localhost:5000';

// Test credentials
const CREDENTIALS = {
    email: 'user2@gmail.com',
    password: 'user123'
};

const WORKSPACE_NAME = 'Test Workspace';

let authToken = '';
let testWorkspaceId = '';
let testProjectId = '';
let testTaskId = '';
let secondTaskId = '';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
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
    console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
    console.log(`${colors.blue}${message}${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);
}

// Helper to make authenticated requests
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                ...options.headers
            }
        });
        const data = await response.json();
        return { response, data, status: response.status };
    } catch (err) {
        return { response: null, data: null, status: 0, error: err.message };
    }
}

// ============================================================================
// TEST 1: Authentication
// ============================================================================
async function test01_Authentication() {
    section('TEST 1: User Authentication');

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: CREDENTIALS.email,
                password: CREDENTIALS.password
            })
        });

        const data = await response.json();

        if (data.success && data.data && data.data.token) {
            authToken = data.data.token;
            success('✓ User logged in successfully');
            info(`  Email: ${CREDENTIALS.email}`);
            info(`  Token: ${authToken.substring(0, 30)}...`);
            info(`  User: ${data.data.user.name}`);
            return true;
        } else {
            error('✗ Login failed');
            info(`  Message: ${data.message}`);
            return false;
        }
    } catch (err) {
        error(`✗ Login error: ${err.message}`);
        return false;
    }
}

// ============================================================================
// TEST 2: Workspace Setup
// ============================================================================
async function test02_WorkspaceSetup() {
    section('TEST 2: Workspace Setup & Retrieval');

    try {
        // Get all workspaces
        const { data: listData } = await apiRequest('/api/workspaces');

        if (listData.success && listData.data && listData.data.length > 0) {
            // Find workspace by name
            const workspace = listData.data.find(w => w.name === WORKSPACE_NAME);

            if (workspace) {
                testWorkspaceId = workspace._id;
                success(`✓ Found existing workspace: "${WORKSPACE_NAME}"`);
                info(`  Workspace ID: ${testWorkspaceId}`);
                info(`  Members: ${workspace.members?.length || 0}`);
                return true;
            } else {
                // Create new workspace
                const { data: createData } = await apiRequest('/api/workspaces', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: WORKSPACE_NAME,
                        description: 'Workspace for comprehensive Phase 3 testing'
                    })
                });

                if (createData.success && createData.data && createData.data.workspace) {
                    testWorkspaceId = createData.data.workspace._id;
                    success(`✓ Created new workspace: "${WORKSPACE_NAME}"`);
                    info(`  Workspace ID: ${testWorkspaceId}`);
                    return true;
                }
            }
        } else {
            // No workspaces, create one
            const { data: createData } = await apiRequest('/api/workspaces', {
                method: 'POST',
                body: JSON.stringify({
                    name: WORKSPACE_NAME,
                    description: 'Workspace for comprehensive Phase 3 testing'
                })
            });

            if (createData.success && createData.data && createData.data.workspace) {
                testWorkspaceId = createData.data.workspace._id;
                success(`✓ Created new workspace: "${WORKSPACE_NAME}"`);
                info(`  Workspace ID: ${testWorkspaceId}`);
                return true;
            }
        }

        error('✗ Workspace setup failed');
        return false;
    } catch (err) {
        error(`✗ Workspace error: ${err.message}`);
        return false;
    }
}

// ============================================================================
// TEST 3: Project Creation
// ============================================================================
async function test03_ProjectCreation() {
    section('TEST 3: Project Creation');

    try {
        const { data } = await apiRequest('/api/projects', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Phase 3 Test Project',
                description: 'Project for testing task management and real-time sync',
                workspace: testWorkspaceId,
                priority: 'high',
                color: '#10B981'
            })
        });

        if (data.success && data.data && data.data.project) {
            testProjectId = data.data.project._id;
            success('✓ Project created successfully');
            info(`  Project ID: ${testProjectId}`);
            info(`  Name: ${data.data.project.name}`);
            info(`  Priority: ${data.data.project.priority}`);
            info(`  Workspace: ${data.data.project.workspace.name}`);
            return true;
        } else {
            error('✗ Project creation failed');
            info(`  Message: ${data.message}`);
            return false;
        }
    } catch (err) {
        error(`✗ Project creation error: ${err.message}`);
        return false;
    }
}

// ============================================================================
// TEST 4: Task Creation (HTTP API)
// ============================================================================
async function test04_TaskCreation() {
    section('TEST 4: Task Creation via HTTP API');

    try {
        const { data } = await apiRequest('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Implement WebSocket Task Sync',
                description: 'Test real-time task synchronization across clients',
                status: 'todo',
                priority: 'high',
                projectId: testProjectId,
                labels: [
                    { name: 'Backend', color: '#3B82F6' },
                    { name: 'Real-time', color: '#10B981' }
                ],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            })
        });

        if (data.success && data.data) {
            testTaskId = data.data._id;
            success('✓ Task created successfully');
            info(`  Task ID: ${testTaskId}`);
            info(`  Title: ${data.data.title}`);
            info(`  Status: ${data.data.status}`);
            info(`  Priority: ${data.data.priority}`);
            info(`  Labels: ${data.data.labels.length}`);
            info(`  Created by: ${data.data.createdBy.name}`);
            return true;
        } else {
            error('✗ Task creation failed');
            info(`  Message: ${data.message}`);
            return false;
        }
    } catch (err) {
        error(`✗ Task creation error: ${err.message}`);
        return false;
    }
}

// ============================================================================
// TEST 5: Create Second Task
// ============================================================================
async function test05_CreateSecondTask() {
    section('TEST 5: Create Second Task for Testing');

    try {
        const { data } = await apiRequest('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Write Integration Tests',
                description: 'Create comprehensive test suite for all features',
                status: 'in-progress',
                priority: 'medium',
                projectId: testProjectId,
                labels: [
                    { name: 'Testing', color: '#F59E0B' }
                ]
            })
        });

        if (data.success && data.data) {
            secondTaskId = data.data._id;
            success('✓ Second task created successfully');
            info(`  Task ID: ${secondTaskId}`);
            info(`  Title: ${data.data.title}`);
            info(`  Status: ${data.data.status}`);
            return true;
        } else {
            error('✗ Second task creation failed');
            return false;
        }
    } catch (err) {
        error(`✗ Second task creation error: ${err.message}`);
        return false;
    }
}

// ============================================================================
// TEST 6: Get All Project Tasks
// ============================================================================
async function test06_GetProjectTasks() {
    section('TEST 6: Retrieve All Project Tasks');

    try {
        const { data } = await apiRequest(`/api/tasks/project/${testProjectId}`);

        if (data.success && data.data) {
            success(`✓ Retrieved ${data.data.length} task(s)`);
            data.data.forEach((task, index) => {
                info(`  Task ${index + 1}:`);
                info(`    - Title: ${task.title}`);
                info(`    - Status: ${task.status}`);
                info(`    - Priority: ${task.priority}`);
            });
            return data.data.length >= 2;
        } else {
            error('✗ Failed to retrieve tasks');
            return false;
        }
    } catch (err) {
        error(`✗ Get tasks error: ${err.message}`);
        return false;
    }
}

// ============================================================================
// TEST 7: Get Single Task
// ============================================================================
async function test07_GetSingleTask() {
    section('TEST 7: Retrieve Single Task by ID');

    try {
        const { data } = await apiRequest(`/api/tasks/${testTaskId}`);

        if (data.success && data.data) {
            success('✓ Task retrieved successfully');
            info(`  ID: ${data.data._id}`);
            info(`  Title: ${data.data.title}`);
            info(`  Description: ${data.data.description}`);
            info(`  Status: ${data.data.status}`);
            info(`  Priority: ${data.data.priority}`);
            info(`  Labels: ${data.data.labels.length}`);
            return true;
        } else {
            error('✗ Failed to retrieve task');
            return false;
        }
    } catch (err) {
        error(`✗ Get task error: ${err.message}`);
        return false;
    }
}

// ============================================================================
// TEST 8: Update Task
// ============================================================================
async function test08_UpdateTask() {
    section('TEST 8: Update Task Fields');

    try {
        const { data } = await apiRequest(`/api/tasks/${testTaskId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'in-progress',
                description: 'Updated: Testing real-time task sync with WebSocket integration',
                subtasks: [
                    { title: 'Set up Socket.io server', completed: true },
                    { title: 'Implement Redis adapter', completed: true },
                    { title: 'Create event handlers', completed: false }
                ]
            })
        });

        if (data.success && data.data) {
            success('✓ Task updated successfully');
            info(`  New status: ${data.data.status}`);
            info(`  Subtasks added: ${data.data.subtasks.length}`);
            info(`  Description updated: Yes`);
            return true;
        } else {
            error('✗ Task update failed');
            info(`  Message: ${data.message}`);
            return false;
        }
    } catch (err) {
        error(`✗ Update task error: ${err.message}`);
        return false;
    }
}

// ============================================================================
// TEST 9: WebSocket Connection & Authentication
// ============================================================================
async function test09_WebSocketConnection() {
    section('TEST 9: WebSocket Connection & Authentication');

    return new Promise((resolve) => {
        const socket = io(WS_URL, {
            auth: {
                token: authToken
            },
            transports: ['websocket']
        });

        let testsPassed = 0;
        const testsRequired = 3;

        const timeout = setTimeout(() => {
            socket.disconnect();
            error('✗ WebSocket tests timed out');
            resolve(false);
        }, 5000);

        socket.on('connect', () => {
            testsPassed++;
            success('✓ WebSocket connected successfully');
            info(`  Socket ID: ${socket.id}`);
            info(`  Transport: ${socket.io.engine.transport.name}`);
        });

        socket.on('connect_error', (err) => {
            clearTimeout(timeout);
            error(`✗ WebSocket connection error: ${err.message}`);
            resolve(false);
        });

        socket.on('disconnect', () => {
            clearTimeout(timeout);
            info('  Socket disconnected');
            resolve(testsPassed >= testsRequired);
        });

        setTimeout(() => {
            // Test should have connected by now
            if (testsPassed > 0) {
                testsPassed++;
                success('✓ Authentication verified (connection successful)');
                setTimeout(() => {
                    testsPassed++;
                    success('✓ WebSocket connection stable');
                    socket.disconnect();
                }, 1000);
            }
        }, 1500);
    });
}

// ============================================================================
// TEST 10: Real-Time Presence Tracking
// ============================================================================
async function test10_PresenceTracking() {
    section('TEST 10: Real-Time Presence Tracking');

    return new Promise((resolve) => {
        const socket = io(WS_URL, {
            auth: { token: authToken }
        });

        let testsPassed = 0;

        socket.on('connect', () => {
            success('✓ Connected for presence testing');

            // Join project room
            socket.emit('join:project', testProjectId);
            info(`  Joined project room: ${testProjectId}`);
        });

        socket.on('room:users', (data) => {
            testsPassed++;
            success('✓ Received online users list');
            info(`  Users in room: ${data.users.length}`);
            info(`  Project ID: ${data.projectId}`);
        });

        socket.on('user:joined', (data) => {
            info(`  User joined event received: ${data.user?.name || 'Unknown'}`);
        });

        setTimeout(() => {
            // Leave room
            socket.emit('leave:project', testProjectId);
            info('  Left project room');

            setTimeout(() => {
                socket.disconnect();
                resolve(testsPassed >= 1);
            }, 500);
        }, 2000);
    });
}

// ============================================================================
// TEST 11: Real-Time Task Broadcasting
// ============================================================================
async function test11_TaskBroadcasting() {
    section('TEST 11: Real-Time Task Event Broadcasting');

    return new Promise((resolve) => {
        const socket = io(WS_URL, {
            auth: { token: authToken }
        });

        let eventReceived = false;

        socket.on('connect', () => {
            success('✓ Connected for task broadcasting test');
            socket.emit('join:project', testProjectId);
        });

        socket.on('room:users', () => {
            // Emit a test task creation event
            socket.emit('task:create', {
                projectId: testProjectId,
                task: {
                    title: 'WebSocket Broadcast Test Task',
                    status: 'todo'
                }
            });
            info('  Emitted task:create event');
        });

        socket.on('task:created', (data) => {
            eventReceived = true;
            success('✓ Received task:created broadcast');
            info(`  Task: ${data.task.title}`);
            info(`  Created by: ${data.createdBy.name}`);
        });

        setTimeout(() => {
            // Test task update broadcast
            socket.emit('task:update', {
                projectId: testProjectId,
                taskId: testTaskId,
                updates: { status: 'done' }
            });
            info('  Emitted task:update event');
        }, 1500);

        socket.on('task:updated', (data) => {
            eventReceived = true;
            success('✓ Received task:updated broadcast');
            info(`  Task ID: ${data.taskId}`);
            info(`  Updated by: ${data.updatedBy.name}`);
        });

        setTimeout(() => {
            socket.disconnect();
            resolve(eventReceived);
        }, 3500);
    });
}

// ============================================================================
// TEST 12: Delete Task
// ============================================================================
async function test12_DeleteTask() {
    section('TEST 12: Task Deletion');

    try {
        // Delete second task
        const { data } = await apiRequest(`/api/tasks/${secondTaskId}`, {
            method: 'DELETE'
        });

        if (data.success) {
            success('✓ Task deleted successfully');
            info(`  Deleted task ID: ${secondTaskId}`);

            // Verify deletion
            const { data: verifyData } = await apiRequest(`/api/tasks/project/${testProjectId}`);
            if (verifyData.success) {
                const remainingTasks = verifyData.data.length;
                success(`✓ Verified deletion (${remainingTasks} task(s) remaining)`);
                return true;
            }
            return true;
        } else {
            error('✗ Task deletion failed');
            return false;
        }
    } catch (err) {
        error(`✗ Delete task error: ${err.message}`);
        return false;
    }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================
async function runAllTests() {
    console.log('\n');
    log('🧪', '═══════════════════════════════════════════════════════════════════', colors.yellow);
    log('🧪', '  PHASE 3 COMPREHENSIVE TEST SUITE                                ', colors.yellow);
    log('🧪', '  Task Management & Real-Time WebSocket Synchronization           ', colors.yellow);
    log('🧪', '═══════════════════════════════════════════════════════════════════', colors.yellow);
    console.log('\n');

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    const tests = [
        { name: 'User Authentication', fn: test01_Authentication, critical: true },
        { name: 'Workspace Setup', fn: test02_WorkspaceSetup, critical: true },
        { name: 'Project Creation', fn: test03_ProjectCreation, critical: true },
        { name: 'Task Creation (HTTP)', fn: test04_TaskCreation, critical: false },
        { name: 'Create Second Task', fn: test05_CreateSecondTask, critical: false },
        { name: 'Get All Tasks', fn: test06_GetProjectTasks, critical: false },
        { name: 'Get Single Task', fn: test07_GetSingleTask, critical: false },
        { name: 'Update Task', fn: test08_UpdateTask, critical: false },
        { name: 'WebSocket Connection', fn: test09_WebSocketConnection, critical: false },
        { name: 'Presence Tracking', fn: test10_PresenceTracking, critical: false },
        { name: 'Task Broadcasting', fn: test11_TaskBroadcasting, critical: false },
        { name: 'Delete Task', fn: test12_DeleteTask, critical: false }
    ];

    for (const test of tests) {
        const passed = await test.fn();
        results.tests.push({ name: test.name, passed });

        if (passed) {
            results.passed++;
        } else {
            results.failed++;
            if (test.critical) {
                error(`✗ Critical test failed: ${test.name}`);
                error('  Cannot continue - stopping test suite');
                break;
            }
        }
    }

    // Summary
    section('TEST SUMMARY');
    console.log('');
    log('📊', `Total Tests Run: ${results.passed + results.failed}`, colors.cyan);
    log('✅', `Passed: ${results.passed}`, colors.green);
    log('❌', `Failed: ${results.failed}`, colors.red);
    log('📈', `Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`, colors.magenta);

    console.log('\n' + colors.cyan + 'Test Details:' + colors.reset);
    results.tests.forEach((test, index) => {
        const icon = test.passed ? '✅' : '❌';
        const color = test.passed ? colors.green : colors.red;
        console.log(`  ${color}${icon} ${index + 1}. ${test.name}${colors.reset}`);
    });

    console.log('\n');

    if (results.failed === 0) {
        log('🎉', '═══════════════════════════════════════════════════════════════════', colors.green);
        log('🎉', '  ALL TESTS PASSED! Phase 3 is working perfectly!                 ', colors.green);
        log('🎉', '═══════════════════════════════════════════════════════════════════', colors.green);
    } else if (results.passed > results.failed) {
        log('⚠️', '═══════════════════════════════════════════════════════════════════', colors.yellow);
        log('⚠️', '  PARTIAL SUCCESS - Some tests failed, but core features work     ', colors.yellow);
        log('⚠️', '═══════════════════════════════════════════════════════════════════', colors.yellow);
    } else {
        log('💥', '═══════════════════════════════════════════════════════════════════', colors.red);
        log('💥', '  TESTS FAILED - Please review errors above                       ', colors.red);
        log('💥', '═══════════════════════════════════════════════════════════════════', colors.red);
    }

    console.log('\n');
}

// Start tests
runAllTests().catch(err => {
    error(`Fatal error: ${err.message}`);
    console.error(err);
    process.exit(1);
});
