# Read Receipts & Unread Message Counts - Complete Guide

## ✅ Features Implemented

### 1. **Read Receipts (WhatsApp-style)** ✅

Your backend now supports **full read receipt functionality** for all types of chats:

#### **How it Works:**
- Every message has a `readBy` array that tracks which users have read it
- When a user views a message, it's marked with their user ID and timestamp
- Other users in the channel get **real-time notifications** when someone reads their message

#### **Supported Chat Types:**
- ✅ **1-on-1 Direct Messages** (like WhatsApp DMs)
- ✅ **Group Chats / Channels** (like WhatsApp groups)
- ✅ **Public Channels** (workspace-wide)
- ✅ **Private Channels** (invite-only)

---

### 2. **Unread Message Count Bubbles** ✅

Like WhatsApp, you can now show **unread message counts** on each channel:

#### **Features:**
- Get unread count for a single channel
- Get unread counts for all channels in a workspace
- Get total unread count across entire workspace
- Real-time updates when new messages arrive

---

## 📡 API Endpoints

### **Mark Messages as Read**
```http
POST /api/chat/channels/:channelId/read
Authorization: Bearer <token>
```

**What it does:**
- Marks ALL unread messages in a channel as read by the current user
- Returns count of messages marked

**Response:**
```json
{
  "success": true,
  "message": "5 message(s) marked as read"
}
```

---

### **Get Unread Count for a Single Channel**
```http
GET /api/chat/channels/:channelId/unread-count
Authorization: Bearer <token>
```

**What it does:**
- Returns number of unread messages in this channel for the current user
- Excludes messages sent by the user themselves
- Excludes deleted messages

**Response:**
```json
{
  "success": true,
  "data": {
    "channelId": "507f1f77bcf86cd799439011",
    "unreadCount": 12
  }
}
```

**Use Case:**
- Show unread bubble on a single channel (e.g., when user is viewing channel list)

---

### **Get Unread Counts for All Channels in Workspace**
```http
GET /api/chat/workspace/:workspaceId/unread-counts
Authorization: Bearer <token>
```

**What it does:**
- Returns unread counts for ALL channels user has access to in a workspace
- Also returns total unread count across all channels

**Response:**
```json
{
  "success": true,
  "data": {
    "workspaceId": "507f1f77bcf86cd799439012",
    "totalUnread": 25,
    "channels": [
      {
        "channelId": "507f1f77bcf86cd799439011",
        "unreadCount": 12
      },
      {
        "channelId": "507f1f77bcf86cd799439013",
        "unreadCount": 8
      },
      {
        "channelId": "507f1f77bcf86cd799439014",
        "unreadCount": 5
      }
    ]
  }
}
```

**Use Case:**
- Show unread counts on all channels in sidebar
- Show total unread badge on workspace icon

---

## 🔌 WebSocket Events

### **Real-time Read Receipts**

#### **Client → Server: Mark messages as read**
```javascript
socket.emit('message:read', {
  channelId: '507f1f77bcf86cd799439011',
  messageIds: ['msg1', 'msg2', 'msg3']
}, (response) => {
  console.log(response); // { success: true }
});
```

#### **Server → Clients: Broadcast read receipt**
```javascript
socket.on('message:seen', (data) => {
  console.log(data);
  // {
  //   userId: '507f1f77bcf86cd799439015',
  //   user: { _id: '...', name: 'John Doe', email: '...' },
  //   messageIds: ['msg1', 'msg2', 'msg3'],
  //   readAt: '2026-02-05T10:30:00.000Z'
  // }
});
```

**What it does:**
- Updates database with read receipt
- Broadcasts to all other users in the channel
- They can show "✓✓" (double check) or "Seen by John" indicator

---

### **Real-time Unread Count Updates**

#### **Server → Clients: New message arrived**
```javascript
socket.on('unread:increment', (data) => {
  console.log(data);
  // {
  //   channelId: '507f1f77bcf86cd799439011',
  //   messageId: 'newMsg123'
  // }
  
  // Update unread count in UI
  incrementUnreadCount(data.channelId);
});
```

**What it does:**
- Notifies users that a new unread message arrived
- Frontend can increment the unread badge counter
- Only sent to users who are NOT the sender

---

## 💡 Implementation Examples

### **Frontend: Show Unread Bubble**

```typescript
// 1. Fetch unread counts when loading workspace
const { data } = await api.get(`/api/chat/workspace/${workspaceId}/unread-counts`);

// 2. Display in channel list
{channels.map(channel => {
  const unreadCount = data.channels.find(c => c.channelId === channel._id)?.unreadCount || 0;
  
  return (
    <div key={channel._id} className="channel-item">
      <span>{channel.name}</span>
      {unreadCount > 0 && (
        <span className="unread-badge">{unreadCount}</span>
      )}
    </div>
  );
})}

// 3. Listen for real-time updates
socket.on('unread:increment', ({ channelId }) => {
  // Increment local counter
  setUnreadCounts(prev => ({
    ...prev,
    [channelId]: (prev[channelId] || 0) + 1
  }));
});
```

---

### **Frontend: Show Read Receipts (WhatsApp-style)**

```typescript
// 1. When user scrolls/views messages, mark as read
useEffect(() => {
  if (activeChannel && messages.length > 0) {
    const unreadMessageIds = messages
      .filter(msg => !msg.readBy.some(r => r.user === currentUser._id))
      .map(msg => msg._id);
    
    if (unreadMessageIds.length > 0) {
      // Mark as read via API
      api.post(`/api/chat/channels/${activeChannel._id}/read`);
      
      // Also broadcast via socket
      socket.emit('message:read', {
        channelId: activeChannel._id,
        messageIds: unreadMessageIds
      });
    }
  }
}, [activeChannel, messages]);

// 2. Show read status on each message
{messages.map(message => (
  <div key={message._id}>
    <p>{message.content}</p>
    
    {/* Show read receipts */}
    {message.sender._id === currentUser._id && (
      <span className="read-status">
        {message.readBy.length === 0 && '✓'}  {/* Sent */}
        {message.readBy.length > 0 && '✓✓'}   {/* Read */}
        {message.readBy.length > 1 && ` • ${message.readBy.length} read`}
      </span>
    )}
  </div>
))}

// 3. Listen for real-time read receipts
socket.on('message:seen', ({ userId, messageIds, readAt }) => {
  // Update messages to show they've been read
  setMessages(prev => prev.map(msg => {
    if (messageIds.includes(msg._id)) {
      return {
        ...msg,
        readBy: [...msg.readBy, { user: userId, readAt }]
      };
    }
    return msg;
  }));
});
```

---

### **Frontend: Clear Unread Count When Opening Channel**

```typescript
const openChannel = async (channelId: string) => {
  // 1. Open channel
  setActiveChannel(channel);
  
  // 2. Mark all messages as read
  await api.post(`/api/chat/channels/${channelId}/read`);
  
  // 3. Clear local unread count
  setUnreadCounts(prev => ({
    ...prev,
    [channelId]: 0
  }));
  
  // 4. Join socket room to receive updates
  socket.emit('channel:join', channelId);
};
```

---

## 🎯 How It Works (Technical Details)

### **Database Schema**

#### **Message Model:**
```typescript
{
  _id: ObjectId,
  channel: ObjectId,
  sender: ObjectId,
  content: string,
  readBy: [
    {
      user: ObjectId,      // Who read it
      readAt: Date         // When they read it
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

#### **Unread Count Query:**
```javascript
// Count messages where:
// 1. Message is in this channel
// 2. Message was NOT sent by current user
// 3. Current user has NOT read it yet
// 4. Message is not deleted

const unreadCount = await Message.countDocuments({
  channel: channelId,
  sender: { $ne: userId },          // Not sent by me
  'readBy.user': { $ne: userId },   // I haven't read it
  isDeleted: false
});
```

---

## 🔒 Security

### **Authorization Checks:**
- ✅ User must be channel member to mark messages as read
- ✅ User must be channel member to view unread counts
- ✅ User must be workspace member to view workspace unread counts
- ✅ All WebSocket events validate user permissions

### **Input Validation:**
- ✅ All IDs validated as valid MongoDB ObjectIDs
- ✅ Array inputs checked for proper format
- ✅ Error handling with user-friendly messages

---

## 📊 Performance Considerations

### **Database Indexes:**
```javascript
// Already exist in Message model:
messageSchema.index({ channel: 1, createdAt: -1 });

// Consider adding for better unread count performance:
messageSchema.index({ channel: 1, sender: 1, 'readBy.user': 1 });
```

### **Optimization Tips:**

1. **Batch Read Operations:**
   - Instead of marking each message individually, use `POST /api/chat/channels/:channelId/read`
   - Marks all unread messages in one database query

2. **Cache Unread Counts:**
   - Frontend can cache counts in Zustand store
   - Only refresh when needed (channel switch, new message, etc.)

3. **Throttle Socket Events:**
   - Don't emit `message:read` for every scroll
   - Use debounce/throttle (e.g., mark as read after 1 second of viewing)

4. **Pagination:**
   - Don't mark ALL messages as read if there are thousands
   - Only mark visible messages as read

---

## 🎨 UI/UX Best Practices

### **WhatsApp-style Read Receipts:**

1. **Single Check (✓):** Message sent but not delivered/read
2. **Double Check (✓✓):** Message delivered to recipient
3. **Blue Double Check (✓✓):** Message read by recipient

### **Unread Count Bubbles:**

1. **Red badge with count:** Show number (e.g., "5")
2. **Hide when count is 0:** Don't show badge
3. **Show "99+" for large counts:** Better than "152"
4. **Bold channel name:** Indicates unread messages

### **Channel List:**
```
📱 General              [5]   ← Red badge
💼 Project Updates      [2]
🎯 Design Team                ← No badge (all read)
👤 John Doe (DM)        [12]
```

---

## 🚀 Testing

### **Test Read Receipts:**

1. **1-on-1 Chat:**
   - User A sends message to User B
   - User B opens chat → message marked as read
   - User A sees "✓✓" (double check)

2. **Group Chat:**
   - User A sends message to group (5 members)
   - 3 members read it
   - User A sees "✓✓ Read by 3"

3. **Real-time Updates:**
   - User A sends message
   - User B reads it
   - User A instantly sees read receipt update

### **Test Unread Counts:**

1. **Channel List:**
   - Open workspace → see unread counts on each channel
   - Open channel → count disappears
   - New message arrives → count increments

2. **Multiple Devices:**
   - Mark as read on Device A
   - Count updates on Device B via WebSocket

3. **Workspace Badge:**
   - Total unread count shown on workspace icon
   - Updates in real-time

---

## 📝 Summary

### **What You Have Now:**

✅ **Full WhatsApp-style read receipts** for all chat types  
✅ **Unread message count bubbles** on channel list  
✅ **Real-time updates** via WebSocket  
✅ **Workspace-wide unread count** for total badge  
✅ **Group chat support** with multiple read receipts  
✅ **Security & authorization** properly implemented  
✅ **Database persistence** of read status  
✅ **Production-ready** with error handling  

### **API Endpoints Added:**
- `GET /api/chat/channels/:channelId/unread-count` - Single channel unread count
- `GET /api/chat/workspace/:workspaceId/unread-counts` - All channels unread counts
- `POST /api/chat/channels/:channelId/read` - Mark messages as read (already existed, now enhanced)

### **WebSocket Events:**
- `message:read` - Client sends when marking messages as read
- `message:seen` - Server broadcasts to show who read messages
- `unread:increment` - Server broadcasts when new message arrives

---

## 🎉 Next Steps

1. **Update Frontend:**
   - Add unread count badges to channel list
   - Show read receipts (✓✓) on sent messages
   - Implement auto-mark-as-read when viewing messages

2. **UI Components:**
   - Create `<UnreadBadge>` component
   - Create `<ReadReceipt>` component
   - Update channel list to show badges

3. **State Management:**
   - Add unread counts to `chat-store.ts`
   - Listen for socket events to update counts
   - Clear counts when opening channels

4. **Polish:**
   - Add animations for count updates
   - Show "typing..." indicator (already exists)
   - Add sound notification for new messages

---

**Your CollabFlow chat is now feature-complete with enterprise-grade read receipts and unread counts! 🎉**
