# Payment/Subscription Implementation

## Overview
This document describes the payment and subscription system implemented for the phone validation service.

## Features

### Free Tier
- Users can validate **5 phone numbers for free** (total across all validations)
- Free validations are tracked automatically
- Once 5 validations are used, users must upgrade to continue

### Premium Subscription
- **$19.99/month** for unlimited phone number validations
- 30-day subscription period
- Automatic expiration after 30 days
- Users must renew subscription to continue after expiration

## Database Models

### Subscription Model
- `id`: Unique subscription ID
- `userId`: User who owns the subscription
- `plan`: Subscription plan (FREE, PREMIUM)
- `status`: Subscription status (ACTIVE, EXPIRED, CANCELLED, PENDING)
- `startDate`: Subscription start date
- `endDate`: Subscription end date (30 days from start)
- `createdAt`: Record creation timestamp
- `updatedAt`: Record update timestamp

### Payment Model
- `id`: Unique payment ID
- `userId`: User who made the payment
- `subscriptionId`: Associated subscription ID
- `amount`: Payment amount (19.99.00)
- `currency`: Payment currency (USD)
- `status`: Payment status (PENDING, COMPLETED, FAILED, REFUNDED)
- `method`: Payment method (STRIPE, PAYPAL, MANUAL)
- `transactionId`: External transaction ID (from payment gateway)
- `metadata`: Additional payment metadata
- `createdAt`: Record creation timestamp
- `updatedAt`: Record update timestamp

## API Endpoints

### Subscription Endpoints

#### GET `/api/subscription/status`
Get current subscription status and usage information.

**Response:**
```json
{
  "usage": {
    "freeValidationsUsed": 3,
    "freeValidationsRemaining": 2,
    "hasActiveSubscription": false,
    "subscriptionEndDate": null,
    "subscriptionPlan": null
  },
  "limit": {
    "canValidate": true,
    "remainingFree": 2,
    "hasActiveSubscription": false,
    "limitType": "free"
  },
  "premiumPrice": 19.99
}
```

#### POST `/api/subscription/create`
Create a new premium subscription (currently manual, payment gateway integration pending).

**Response:**
```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscription": {
    "id": "...",
    "userId": "...",
    "plan": "PREMIUM",
    "status": "ACTIVE",
    "startDate": "...",
    "endDate": "..."
  },
  "payment": {
    "id": "...",
    "amount": 19.99,
    "status": "COMPLETED"
  }
}
```

#### GET `/api/subscription/history`
Get subscription and payment history.

**Response:**
```json
{
  "subscriptions": [...],
  "payments": [...]
}
```

### Updated Validation Endpoints

All phone validation endpoints now check subscription status before processing:

- `POST /api/phone-validation/single`
- `POST /api/phone-validation/bulk`
- `POST /api/phone-validation/csv`

**Error Response (Limit Reached):**
```json
{
  "error": "Validation limit reached",
  "message": "Please upgrade to premium to continue validating phone numbers.",
  "limitType": "exceeded",
  "requiresUpgrade": true
}
```

## Business Logic

### Validation Limit Checking
1. Check if user has active premium subscription
2. If yes → Allow unlimited validations
3. If no → Check free tier usage
4. If free validations remaining → Allow validation
5. If free tier exhausted → Block validation and require upgrade

### Free Tier Counting
- Total phone numbers validated across all validation histories
- Single validation = 1 count
- Bulk validation = number of phone numbers in array
- CSV validation = number of phone numbers in CSV file

### Subscription Expiration
- Subscriptions automatically expire after 30 days
- Expired subscriptions are marked as EXPIRED status
- Users must create a new subscription to continue

## Frontend Components

### SubscriptionStatus Component
- Displays current subscription status
- Shows free tier usage with progress bar
- Upgrade prompts when limit is reached
- Premium subscription status display

### UpgradeModal Component
- Modal for upgrading to premium
- Shows pricing and features
- Handles subscription creation
- Success/error states

### Dashboard Integration
- New "Subscription" tab in dashboard
- Subscription status shown on validator tab
- Upgrade prompts when validation limit is reached
- Real-time status updates

## Future Payment Gateway Integration

The system is designed to easily integrate with payment gateways:

1. **Stripe Integration:**
   - Update `createSubscription` endpoint to create Stripe payment intent
   - Add webhook handler for payment confirmation
   - Update payment status on successful payment

2. **PayPal Integration:**
   - Similar flow to Stripe
   - Use PayPal SDK for payment processing

3. **Manual Payment:**
   - Currently implemented for testing
   - Can be used for manual payment processing

## Database Indexes

Created indexes for optimal performance:
- `subscriptions`: `userId`, `status`, `endDate`
- `payments`: `userId`, `subscriptionId`

## Environment Variables

No additional environment variables required for basic functionality. Payment gateway integration will require:
- `STRIPE_SECRET_KEY` (for Stripe)
- `STRIPE_WEBHOOK_SECRET` (for Stripe webhooks)
- `PAYPAL_CLIENT_ID` (for PayPal)
- `PAYPAL_CLIENT_SECRET` (for PayPal)

## Testing

### Test Free Tier
1. Register a new user
2. Validate 5 phone numbers (should work)
3. Try to validate 6th phone number (should require upgrade)

### Test Premium Subscription
1. Create a premium subscription
2. Validate unlimited phone numbers
3. Check subscription status shows as active
4. Wait 30 days or manually expire subscription
5. Verify validation is blocked until renewal

## Notes

- Payment gateway integration is pending
- Currently using manual payment method for testing
- Subscription expiration should be handled by a cron job (to be implemented)
- All validation counts are tracked automatically
- Free tier resets are not implemented (users get 5 free validations total, not per month)

