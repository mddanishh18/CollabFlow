/**
 * Comprehensive API Test Script
 * Tests all Workspace and Project endpoints
 */

const BASE_URL = 'http://localhost:5000';

// Test data
const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!'
};

let authToken = '';
let userId = '';
let workspaceId = '';
let projectId = '';
let memberId = '';

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();

        return {
            status: response.status,
            success: result.success,
            data: result.data,
            message: result.message,
            error: result.error
        };
    } catch (error) {
        return {
            status: 0,
            success: false,
            error: error.message
        };
    }
}

// Test runner
async function runTests() {
    console.log('\n🧪 Starting API Tests...\n');
    console.log('='.repeat(60));

    let passedTests = 0;
    let totalTests = 0;

    // Test function
    const test = async (name, fn) => {
        totalTests++;
        try {
            await fn();
            console.log(`✅ PASS: ${name}`);
            passedTests++;
        } catch (error) {
            console.log(`❌ FAIL: ${name}`);
            console.log(`   Error: ${error.message}`);
        }
    };

    // ============================================
    // HEALTH CHECK
    // ============================================
    console.log('\n📍 HEALTH CHECK\n' + '-'.repeat(60));

    await test('Health check endpoint', async () => {
        const result = await apiRequest('GET', '/health');
        if (result.status !== 200 || !result.success) {
            throw new Error('Health check failed');
        }
    });

    // ============================================
    // AUTHENTICATION TESTS
    // ============================================
    console.log('\n🔐 AUTHENTICATION TESTS\n' + '-'.repeat(60));

    await test('Register new user', async () => {
        const result = await apiRequest('POST', '/api/auth/register', testUser);
        if (result.status !== 201 || !result.success) {
            throw new Error(result.message || 'Registration failed');
        }
        authToken = result.data.token;
        userId = result.data.user._id;
    });

    await test('Login with credentials', async () => {
        const result = await apiRequest('POST', '/api/auth/login', {
            email: testUser.email,
            password: testUser.password
        });
        if (result.status !== 200 || !result.success) {
            throw new Error(result.message || 'Login failed');
        }
        authToken = result.data.token;
    });

    await test('Get user profile', async () => {
        const result = await apiRequest('GET', '/api/auth/me', null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to get profile');
        }
    });

    // ============================================
    // WORKSPACE TESTS
    // ============================================
    console.log('\n🏢 WORKSPACE TESTS\n' + '-'.repeat(60));

    await test('Create workspace', async () => {
        const result = await apiRequest('POST', '/api/workspaces', {
            name: 'Test Workspace',
            description: 'A test workspace for API testing'
        }, authToken);
        if (result.status !== 201 || !result.success) {
            throw new Error(result.message || 'Workspace creation failed');
        }
        workspaceId = result.data.workspace._id;
    });

    await test('Get user workspaces', async () => {
        const result = await apiRequest('GET', '/api/workspaces', null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to get workspaces');
        }
        if (result.data.workspaces.length === 0) {
            throw new Error('No workspaces returned');
        }
    });

    await test('Get workspace by ID', async () => {
        const result = await apiRequest('GET', `/api/workspaces/${workspaceId}`, null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to get workspace');
        }
    });

    await test('Update workspace', async () => {
        const result = await apiRequest('PATCH', `/api/workspaces/${workspaceId}`, {
            name: 'Updated Test Workspace',
            description: 'Updated description'
        }, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to update workspace');
        }
    });

    await test('Get workspace members', async () => {
        const result = await apiRequest('GET', `/api/workspaces/${workspaceId}/members`, null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to get workspace members');
        }
    });

    // ============================================
    // PROJECT TESTS
    // ============================================
    console.log('\n📁 PROJECT TESTS\n' + '-'.repeat(60));

    await test('Create project', async () => {
        const result = await apiRequest('POST', '/api/projects', {
            name: 'Test Project',
            description: 'A test project for API testing',
            workspace: workspaceId,
            status: 'active',
            priority: 'high',
            tags: ['test', 'api'],
            color: '#FF5733'
        }, authToken);
        if (result.status !== 201 || !result.success) {
            throw new Error(result.message || 'Project creation failed');
        }
        projectId = result.data.project._id;
    });

    await test('Get user projects', async () => {
        const result = await apiRequest('GET', '/api/projects', null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to get projects');
        }
        if (result.data.projects.length === 0) {
            throw new Error('No projects returned');
        }
    });

    await test('Get workspace projects', async () => {
        const result = await apiRequest('GET', `/api/projects/workspace/${workspaceId}`, null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to get workspace projects');
        }
    });

    await test('Get project by ID', async () => {
        const result = await apiRequest('GET', `/api/projects/${projectId}`, null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to get project');
        }
    });

    await test('Update project', async () => {
        const result = await apiRequest('PATCH', `/api/projects/${projectId}`, {
            name: 'Updated Test Project',
            status: 'completed',
            progress: 75
        }, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to update project');
        }
    });

    await test('Get project members', async () => {
        const result = await apiRequest('GET', `/api/projects/${projectId}/members`, null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to get project members');
        }
    });

    // ============================================
    // CLEANUP TESTS (Optional Delete)
    // ============================================
    console.log('\n🗑️  CLEANUP TESTS\n' + '-'.repeat(60));

    await test('Archive project', async () => {
        const result = await apiRequest('DELETE', `/api/projects/${projectId}?permanent=false`, null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to archive project');
        }
    });

    await test('Archive workspace', async () => {
        const result = await apiRequest('DELETE', `/api/workspaces/${workspaceId}?permanent=false`, null, authToken);
        if (result.status !== 200 || !result.success) {
            throw new Error('Failed to archive workspace');
        }
    });

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
        console.log('\n🎉 ALL TESTS PASSED! ✨\n');
    } else {
        console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed\n`);
    }
}

// Run the tests
runTests().catch(console.error);
