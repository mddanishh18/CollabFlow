# Environment Variables Setup

## Frontend (.env.local)

Create a `.env.local` file in the `frontend` directory with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=CollabFlow
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Backend (.env)

Your backend already has `.env` configured with:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/collabflow
JWT_SECRET=dev_secret_key_change_in_production_123456789
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

## Production Environment Variables

### Backend (Render/Railway):
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong random secret (generate with `openssl rand -base64 32`)
- `CLIENT_URL` - Your Vercel frontend URL

### Frontend (Vercel):
- `NEXT_PUBLIC_API_URL` - Your backend URL from Render/Railway
