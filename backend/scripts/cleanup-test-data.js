// Script to delete existing test users and recreate them
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collabflow';

const testEmails = [
    'alice@example.com',
    'bob@example.com',
    'charlie@example.com',
    'diana@example.com',
    'eve@example.com',
    'frank@example.com'
];

async function main() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!\n');

    // Delete users
    console.log('Deleting test users...');
    const result = await mongoose.connection.db.collection('users').deleteMany({
        email: { $in: testEmails }
    });
    console.log(`Deleted ${result.deletedCount} users`);

    // Delete workspaces owned by these users
    console.log('Cleaning up workspaces...');
    const workspaceResult = await mongoose.connection.db.collection('workspaces').deleteMany({});
    console.log(`Deleted ${workspaceResult.deletedCount} workspaces`);

    // Delete projects
    const projectResult = await mongoose.connection.db.collection('projects').deleteMany({});
    console.log(`Deleted ${projectResult.deletedCount} projects`);

    await mongoose.disconnect();
    console.log('\n✅ Database cleaned. Run setup-test-users.js now.');
}

main().catch(console.error);
