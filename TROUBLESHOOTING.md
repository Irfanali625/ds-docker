# Troubleshooting Subscription Status Error

## Error: "Failed to fetch subscription status"

### Common Causes and Solutions

#### 1. Backend Server Not Running
**Solution:** Make sure the backend server is running:
```bash
cd ds-backend
npm run dev
```

#### 2. Backend Server Not Restarted
**Solution:** If you just added the subscription routes, restart the backend server:
- Stop the server (Ctrl+C)
- Start it again: `npm run dev`

#### 3. TypeScript Compilation Errors
**Solution:** Check for compilation errors:
```bash
cd ds-backend
npm run build
```

If there are errors, fix them before starting the server.

#### 4. Database Collections Not Created
**Solution:** The collections should be created automatically when the server starts. If not, you can manually create them:

```javascript
// Connect to MongoDB and run:
use data-scraping
db.createCollection("subscriptions")
db.createCollection("payments")
```

#### 5. CORS Issues
**Solution:** Make sure CORS is enabled in the backend (it should be in `index.ts`):
```typescript
app.use(cors());
```

#### 6. API URL Mismatch
**Solution:** Check that the frontend is using the correct API URL:
- Check `.env` file in `ds-frontend` for `NEXT_PUBLIC_API_URL`
- Default should be `http://localhost:8000`

#### 7. Authentication Token Missing
**Solution:** Make sure you're logged in. The subscription endpoints require authentication.

### Debugging Steps

1. **Check Backend Logs:**
   - Look at the backend console for any error messages
   - Check if the route is being hit: `GET /api/subscription/status`

2. **Check Browser Console:**
   - Open browser developer tools (F12)
   - Check the Network tab to see the actual request/response
   - Look for CORS errors or 404/500 errors

3. **Test the Endpoint Directly:**
   ```bash
   # Get your auth token first by logging in
   curl -X GET http://localhost:8000/api/subscription/status \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

4. **Check Database Connection:**
   - Verify MongoDB is running
   - Check that the database connection is successful in backend logs

### Quick Fix

If the error persists, try:

1. **Restart Backend:**
   ```bash
   cd ds-backend
   npm run dev
   ```

2. **Restart Frontend:**
   ```bash
   cd ds-frontend
   npm run dev
   ```

3. **Clear Browser Cache:**
   - Clear browser cache and localStorage
   - Log out and log back in

4. **Check Environment Variables:**
   - Ensure `.env` files are properly configured
   - Backend: Check MongoDB connection string
   - Frontend: Check `NEXT_PUBLIC_API_URL`

### Expected Behavior

When working correctly:
- Backend should log: `Server is running on http://localhost:8000`
- API endpoint should return:
  ```json
  {
    "usage": {
      "freeValidationsUsed": 0,
      "freeValidationsRemaining": 5,
      "hasActiveSubscription": false
    },
    "limit": {
      "canValidate": true,
      "remainingFree": 5,
      "limitType": "free"
    },
    "premiumPrice": 19.99
  }
  ```

