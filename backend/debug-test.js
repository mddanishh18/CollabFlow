/**
 * Debug Test - Check specific failing endpoints
 */

const BASE_URL = 'http://localhost:5000';

async function debugTest() {
    console.log('\n🔍 Debug Test - Investigating Failures\n');

    // First register and login
    const testUser = {
        name: 'Debug User',
        email: `debug${Date.now()}@example.com`,
        password: 'TestPassword123!'
    };

    try {
        // Register
        let response = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        let result = await response.json();
        console.log('✅ Register response:', result.success);

        const token = result.data.token;

        // Create workspace
        response = await fetch(`${BASE_URL}/api/workspaces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Debug Workspace',
                description: 'Testing'
            })
        });
        result = await response.json();
        console.log('\n✅ Create workspace response:', {
            status: response.status,
            success: result.success,
            message: result.message
        });

        if (!result.success) {
            console.log('❌ Workspace creation failed!');
            console.log('Full response:', JSON.stringify(result, null, 2));
            return;
        }

        const workspaceId = result.data.workspace._id;
        console.log('Workspace ID:', workspaceId);

        // Test GET workspace by ID
        console.log('\n🔍 Testing GET /api/workspaces/:id...');
        response = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        result = await response.json();
        console.log('Response:', {
            status: response.status,
            success: result.success,
            message: result.message,
            error: result.error
        });

        if (!result.success) {
            console.log('\n❌ Failed to get workspace!');
            console.log('Full response:', JSON.stringify(result, null, 2));
        } else {
            console.log('\n✅ Successfully got workspace!');
        }

        // Create project
        console.log('\n🔍 Creating project...');
        response = await fetch(`${BASE_URL}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Debug Project',
                description: 'Testing',
                workspace: workspaceId
            })
        });
        result = await response.json();
        console.log('Create project response:', {
            status: response.status,
            success: result.success,
            message: result.message
        });

        if (!result.success) {
            console.log('❌ Project creation failed!');
            console.log('Full response:', JSON.stringify(result, null, 2));
            return;
        }

        const projectId = result.data.project._id;
        console.log('Project ID:', projectId);

        // Test GET project by ID
        console.log('\n🔍 Testing GET /api/projects/:id...');
        response = await fetch(`${BASE_URL}/api/projects/${projectId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        result = await response.json();
        console.log('Response:', {
            status: response.status,
            success: result.success,
            message: result.message,
            error: result.error
        });

        if (!result.success) {
            console.log('\n❌ Failed to get project!');
            console.log('Full response:', JSON.stringify(result, null, 2));
        } else {
            console.log('\n✅ Successfully got project!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

debugTest();
