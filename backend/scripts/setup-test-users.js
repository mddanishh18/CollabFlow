// Test script to create accounts, workspace, invitations and accept them
const BASE_URL = 'http://localhost:5000';

const testUsers = [
    { name: 'Alice Smith', email: 'alice@example.com', password: 'password123' },
    { name: 'Bob Johnson', email: 'bob@example.com', password: 'password123' },
    { name: 'Charlie Brown', email: 'charlie@example.com', password: 'password123' },
    { name: 'Diana Prince', email: 'diana@example.com', password: 'password123' },
    { name: 'Eve Wilson', email: 'eve@example.com', password: 'password123' },
    { name: 'Frank Miller', email: 'frank@example.com', password: 'password123' },
];

const tokens = {};

async function registerUser(user) {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        const data = await res.json();
        if (data.success || data.data?.token) {
            tokens[user.email] = data.data?.token || data.token;
            console.log(`✅ Registered: ${user.name} (${user.email})`);
            return true;
        } else {
            console.log(`⚠️ Already exists or error: ${user.email} - ${data.message}`);
            // Try to login instead
            return await loginUser(user);
        }
    } catch (err) {
        console.log(`❌ Error registering ${user.email}:`, err.message);
        return false;
    }
}

async function loginUser(user) {
    try {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, password: user.password })
        });
        const data = await res.json();
        const token = data.data?.token || data.token;
        if (token) {
            tokens[user.email] = token;
            console.log(`✅ Logged in: ${user.name} (${user.email})`);
            return true;
        }
        console.log(`❌ Login failed: ${user.email} - ${JSON.stringify(data)}`);
        return false;
    } catch (err) {
        console.log(`❌ Error logging in ${user.email}:`, err.message);
        return false;
    }
}

async function createWorkspace(token, name, description) {
    try {
        const res = await fetch(`${BASE_URL}/api/workspaces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description })
        });
        const data = await res.json();
        if (data.success || data.data?.workspace) {
            console.log(`✅ Created workspace: ${name}`);
            return data.data?.workspace || data.workspace;
        }
        console.log(`❌ Failed to create workspace: ${data.message}`);
        return null;
    } catch (err) {
        console.log(`❌ Error creating workspace:`, err.message);
        return null;
    }
}

async function inviteMember(token, workspaceId, email, role = 'member') {
    try {
        const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email, role })
        });
        const data = await res.json();
        if (data.success || data.data?.invitation) {
            console.log(`✅ Invited ${email} as ${role}`);
            return data.data?.invitation || data.invitation;
        }
        console.log(`⚠️ Invite issue for ${email}: ${data.message}`);
        return null;
    } catch (err) {
        console.log(`❌ Error inviting ${email}:`, err.message);
        return null;
    }
}

async function getPendingInvitations(token) {
    try {
        const res = await fetch(`${BASE_URL}/api/workspaces/invitations/pending`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        return data.data?.invitations || [];
    } catch (err) {
        console.log(`❌ Error getting invitations:`, err.message);
        return [];
    }
}

async function acceptInvitation(token, invitationToken) {
    try {
        const res = await fetch(`${BASE_URL}/api/workspaces/invite/accept/${invitationToken}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();
        if (data.success) {
            console.log(`✅ Accepted invitation`);
            return true;
        }
        console.log(`❌ Failed to accept: ${data.message}`);
        return false;
    } catch (err) {
        console.log(`❌ Error accepting invitation:`, err.message);
        return false;
    }
}

async function main() {
    console.log('\n🚀 Starting Multi-User Test Setup\n');
    console.log('='.repeat(50));

    // Step 1: Register all users
    console.log('\n📝 Step 1: Creating/Logging in users...\n');
    for (const user of testUsers) {
        await registerUser(user);
    }

    // Step 2: Alice creates a workspace
    console.log('\n🏢 Step 2: Alice creates a workspace...\n');
    const aliceToken = tokens['alice@example.com'];
    if (!aliceToken) {
        console.log('❌ Alice not logged in, aborting');
        return;
    }

    const workspace = await createWorkspace(
        aliceToken,
        'Team Collaboration Hub',
        'A workspace for the whole team to collaborate on projects'
    );

    if (!workspace) {
        console.log('❌ Failed to create workspace, aborting');
        return;
    }

    // Step 3: Alice invites all other users
    console.log('\n📧 Step 3: Alice sends invitations...\n');
    const otherUsers = testUsers.filter(u => u.email !== 'alice@example.com');
    const roles = ['admin', 'member', 'member', 'viewer', 'viewer'];

    for (let i = 0; i < otherUsers.length; i++) {
        await inviteMember(aliceToken, workspace._id, otherUsers[i].email, roles[i]);
    }

    // Step 4: Each user accepts their invitation
    console.log('\n✉️ Step 4: Users accept invitations...\n');
    for (const user of otherUsers) {
        const userToken = tokens[user.email];
        if (!userToken) {
            console.log(`⚠️ No token for ${user.email}, skipping`);
            continue;
        }

        const invitations = await getPendingInvitations(userToken);
        if (invitations.length > 0) {
            console.log(`📨 ${user.name} has ${invitations.length} pending invitation(s)`);
            for (const inv of invitations) {
                await acceptInvitation(userToken, inv.token);
            }
        } else {
            console.log(`⚠️ No pending invitations for ${user.email}`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Test setup complete!\n');
    console.log('Login credentials for testing:');
    console.log('- alice@example.com / password123 (Owner)');
    console.log('- bob@example.com / password123 (Admin)');
    console.log('- charlie@example.com / password123 (Member)');
    console.log('- diana@example.com / password123 (Member)');
    console.log('- eve@example.com / password123 (Viewer)');
    console.log('- frank@example.com / password123 (Viewer)');
}

main().catch(console.error);
