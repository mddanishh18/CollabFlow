#!/usr/bin/env node

/**
 * Chat System Verification Script
 * Checks if all chat-related fixes are properly applied
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Chat System Fixes...\n');

let allChecksPass = true;

// ========================================
// 1. Check Backend Routes
// ========================================
console.log('📋 Checking Backend Configuration...');

const appTsPath = path.join(__dirname, 'backend', 'src', 'app.ts');
try {
    const appTsContent = fs.readFileSync(appTsPath, 'utf8');
    
    // Check if chatRoutes is imported
    const hasImport = appTsContent.includes("import chatRoutes from './routes/chat.routes.js'");
    if (hasImport) {
        console.log('  ✅ Chat routes imported in app.ts');
    } else {
        console.log('  ❌ Chat routes NOT imported in app.ts');
        allChecksPass = false;
    }
    
    // Check if chatRoutes is mounted
    const hasMounted = appTsContent.includes("app.use('/api/chat', chatRoutes)");
    if (hasMounted) {
        console.log('  ✅ Chat routes mounted at /api/chat');
    } else {
        console.log('  ❌ Chat routes NOT mounted');
        allChecksPass = false;
    }
} catch (error) {
    console.log('  ❌ Error reading app.ts:', error.message);
    allChecksPass = false;
}

// ========================================
// 2. Check Socket Implementation
// ========================================
console.log('\n📋 Checking Socket Implementation...');

const socketTsPath = path.join(__dirname, 'frontend', 'src', 'lib', 'socket.ts');
try {
    const socketContent = fs.readFileSync(socketTsPath, 'utf8');
    
    // Check for polling transport
    const hasPolling = socketContent.includes('transports: ["websocket", "polling"]');
    if (hasPolling) {
        console.log('  ✅ Socket has fallback transport (polling)');
    } else {
        console.log('  ⚠️  Socket may not have transport fallback');
    }
    
    // Check for reconnection handling
    const hasReconnect = socketContent.includes('reconnect_attempt');
    if (hasReconnect) {
        console.log('  ✅ Socket has reconnection event handlers');
    } else {
        console.log('  ⚠️  Socket may be missing reconnection handlers');
    }
    
    // Check for proper cleanup
    const hasCleanup = socketContent.includes('removeAllListeners');
    if (hasCleanup) {
        console.log('  ✅ Socket has proper cleanup logic');
    } else {
        console.log('  ⚠️  Socket cleanup may be incomplete');
    }
} catch (error) {
    console.log('  ❌ Error reading socket.ts:', error.message);
    allChecksPass = false;
}

// ========================================
// 3. Check useSocket Hook
// ========================================
console.log('\n📋 Checking useSocket Hook...');

const useSocketPath = path.join(__dirname, 'frontend', 'src', 'hooks', 'use-socket.ts');
try {
    const useSocketContent = fs.readFileSync(useSocketPath, 'utf8');
    
    // Check for state management
    const hasState = useSocketContent.includes('useState');
    if (hasState) {
        console.log('  ✅ useSocket uses React state for connection');
    } else {
        console.log('  ⚠️  useSocket may not track connection state properly');
    }
    
    // Check for event listeners
    const hasListeners = useSocketContent.includes('handleConnect') && useSocketContent.includes('handleDisconnect');
    if (hasListeners) {
        console.log('  ✅ useSocket has connection event listeners');
    } else {
        console.log('  ⚠️  useSocket may be missing event listeners');
    }
} catch (error) {
    console.log('  ❌ Error reading use-socket.ts:', error.message);
    allChecksPass = false;
}

// ========================================
// 4. Check Chat Routes File Exists
// ========================================
console.log('\n📋 Checking Chat Routes File...');

const chatRoutesPath = path.join(__dirname, 'backend', 'src', 'routes', 'chat.routes.ts');
try {
    if (fs.existsSync(chatRoutesPath)) {
        console.log('  ✅ chat.routes.ts exists');
        
        const chatRoutesContent = fs.readFileSync(chatRoutesPath, 'utf8');
        const hasChannelRoutes = chatRoutesContent.includes('getWorkspaceChannels');
        const hasMessageRoutes = chatRoutesContent.includes('getChannelMessages');
        
        if (hasChannelRoutes && hasMessageRoutes) {
            console.log('  ✅ Chat routes properly defined');
        } else {
            console.log('  ⚠️  Some chat routes may be missing');
        }
    } else {
        console.log('  ❌ chat.routes.ts NOT FOUND');
        allChecksPass = false;
    }
} catch (error) {
    console.log('  ❌ Error checking chat.routes.ts:', error.message);
    allChecksPass = false;
}

// ========================================
// 5. Check Environment Variables
// ========================================
console.log('\n📋 Checking Environment Configuration...');

const backendEnvPath = path.join(__dirname, 'backend', '.env');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env.local');

try {
    if (fs.existsSync(backendEnvPath)) {
        const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
        const hasPort = backendEnv.includes('PORT=');
        const hasClientUrl = backendEnv.includes('CLIENT_URL=');
        
        if (hasPort && hasClientUrl) {
            console.log('  ✅ Backend .env configured');
        } else {
            console.log('  ⚠️  Backend .env may be incomplete');
        }
    } else {
        console.log('  ⚠️  Backend .env not found (using defaults)');
    }
    
    if (fs.existsSync(frontendEnvPath)) {
        const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
        const hasApiUrl = frontendEnv.includes('NEXT_PUBLIC_API_URL=');
        
        if (hasApiUrl) {
            console.log('  ✅ Frontend .env.local configured');
        } else {
            console.log('  ⚠️  Frontend .env.local may be incomplete');
        }
    } else {
        console.log('  ⚠️  Frontend .env.local not found (using defaults)');
    }
} catch (error) {
    console.log('  ❌ Error checking environment files:', error.message);
}

// ========================================
// Final Summary
// ========================================
console.log('\n' + '='.repeat(50));
if (allChecksPass) {
    console.log('✅ All critical checks PASSED!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Start backend: cd backend && npm run dev');
    console.log('   2. Start frontend: cd frontend && npm run dev');
    console.log('   3. Navigate to: http://localhost:3000/workspace/{id}/chat');
    console.log('   4. Check browser console for socket connection');
} else {
    console.log('❌ Some checks FAILED!');
    console.log('\n📝 Review the output above and fix the issues.');
    console.log('   See CHAT_FIXES_SUMMARY.md for detailed fix instructions.');
}
console.log('='.repeat(50) + '\n');

process.exit(allChecksPass ? 0 : 1);
