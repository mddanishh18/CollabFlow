// Quick test - just check if login works
import fetch from 'node-fetch';

async function quickTest() {
    console.log('\n🔍 Quick Authentication Test\n');

    try {
        console.log('Attempting login...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success && data.data && data.data.token) {
            console.log('\n✅ Login successful!');
            console.log('Token:', data.data.token.substring(0, 30) + '...');
        } else {
            console.log('\n❌ Login failed');
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

quickTest();
