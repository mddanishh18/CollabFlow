// Create test user for Phase 3 testing
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000';

async function createTestUser() {
    console.log('\n🔧 Creating test user...\n');

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Test user created successfully!');
            console.log(`📧 Email: test@example.com`);
            console.log(`🔑 Password: password123`);
            console.log('\nℹ️  You can now run: node test-phase3.js\n');
        } else if (data.message && data.message.includes('already exists')) {
            console.log('ℹ️  Test user already exists');
            console.log(`📧 Email: test@example.com`);
            console.log(`🔑 Password: password123`);
            console.log('\nℹ️  You can now run: node test-phase3.js\n');
        } else {
            console.error('❌ Failed to create test user:', data.message);
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

createTestUser();
