// Test script for authentication endpoints
const API_URL = 'http://localhost:5000';

// Helper function to make requests
async function testEndpoint(name, method, endpoint, data = null, token = null) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log(`${method} ${endpoint}`);
    console.log('='.repeat(60));

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log('Response:', JSON.stringify(result, null, 2));

        return result;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

// Run tests
async function runTests() {
    console.log('\n🧪 Starting Authentication API Tests...\n');

    // Test 1: Health Check
    await testEndpoint('Health Check', 'GET', '/health');

    // Test 2: Register new user
    const registerData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`, // Unique email
        password: 'password123'
    };
    const registerResult = await testEndpoint(
        'Register User',
        'POST',
        '/api/auth/register',
        registerData
    );

    let token = null;
    if (registerResult && registerResult.data && registerResult.data.token) {
        token = registerResult.data.token;
        console.log('\n✅ Token received from registration');
    }

    // Test 3: Login with same credentials
    const loginData = {
        email: registerData.email,
        password: registerData.password
    };
    const loginResult = await testEndpoint(
        'Login User',
        'POST',
        '/api/auth/login',
        loginData
    );

    if (loginResult && loginResult.data && loginResult.data.token) {
        token = loginResult.data.token;
        console.log('\n✅ Token received from login');
    }

    // Test 4: Get current user profile (protected route)
    if (token) {
        await testEndpoint(
            'Get Profile (Protected)',
            'GET',
            '/api/auth/me',
            null,
            token
        );
    }

    // Test 5: Update profile (protected route)
    if (token) {
        const updateData = {
            name: 'John Doe Updated',
            avatar: 'https://i.pravatar.cc/150?img=12'
        };
        await testEndpoint(
            'Update Profile (Protected)',
            'PUT',
            '/api/auth/profile',
            updateData,
            token
        );
    }

    // Test 6: Try protected route without token (should fail)
    await testEndpoint(
        'Get Profile Without Token (Should Fail)',
        'GET',
        '/api/auth/me'
    );

    // Test 7: Login with wrong password (should fail)
    const wrongLoginData = {
        email: registerData.email,
        password: 'wrongpassword'
    };
    await testEndpoint(
        'Login with Wrong Password (Should Fail)',
        'POST',
        '/api/auth/login',
        wrongLoginData
    );

    // Test 8: Register with duplicate email (should fail)
    await testEndpoint(
        'Register with Duplicate Email (Should Fail)',
        'POST',
        '/api/auth/register',
        registerData
    );

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(console.error);
