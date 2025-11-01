# Phone Number Validator Setup

This document explains how to set up and use the phone number validation feature with HLR lookup and Twilio fallback.

## Features

- ✅ Single phone number validation
- ✅ Bulk phone number validation (up to 1000 numbers)
- ✅ CSV file upload and validation (up to 10,000 rows)
- ✅ HLR (Home Location Register) lookup as primary method
- ✅ Twilio Lookup API as fallback
- ✅ Detailed validation results including carrier, country, line type
- ✅ Export results to CSV

## Backend Setup

### 1. Install Dependencies

Dependencies are already installed:
- `twilio` - Twilio SDK for phone validation
- `csv-parser` - CSV file parsing
- `multer` - File upload handling

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Twilio Configuration (Required for fallback)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# HLR Lookup API (Optional - choose one)
HLR_API_KEY=your_hlr_api_key
HLR_API_URL=https://hlrlookups.com/api/json

# Alternative: Abstract API
# ABSTRACT_API_KEY=your_abstract_api_key
```

### 3. Get API Keys

#### Twilio Setup:
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the dashboard
3. Add them to `.env`

#### HLR Lookup API Setup (Optional):
1. Sign up at [HLR Lookups](https://www.hlrlookups.com/) or [Abstract API](https://www.abstractapi.com/)
2. Get your API key
3. Add `HLR_API_KEY` to `.env`

## API Endpoints

All endpoints require authentication (JWT token).

### Single Validation
```
POST /api/phone-validation/single
Body: { "phoneNumber": "+1234567890" }
```

### Bulk Validation
```
POST /api/phone-validation/bulk
Body: { "phoneNumbers": ["+1234567890", "+1234567891"] }
```

### CSV Validation
```
POST /api/phone-validation/csv
Body: FormData with 'csvFile' field
```

## Validation Flow

1. **Primary**: HLR Lookup API (if configured)
   - Faster and more cost-effective
   - Provides carrier information
   
2. **Fallback**: Twilio Lookup API
   - Used if HLR fails or not configured
   - Provides detailed phone information

## Validation Response

```json
{
  "phoneNumber": "+1234567890",
  "isValid": true,
  "status": "MOBILE",
  "provider": "HLR",
  "countryCode": "US",
  "countryName": "United States",
  "carrier": "Verizon",
  "lineType": "MOBILE",
  "isReachable": true,
  "formattedNumber": "+1234567890",
  "validatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Frontend Usage

1. Navigate to Dashboard → "Phone Validator" tab
2. Choose validation method:
   - **Single**: Enter one phone number
   - **Bulk**: Paste multiple phone numbers (one per line)
   - **CSV Upload**: Upload a CSV file with phone numbers

## CSV Format

Your CSV should have a column containing phone numbers. The system will automatically detect columns named:
- `phone`, `phoneNumber`, `mobile`, `tel`, etc.

Or it will use the first column if no phone column is found.

## Status Types

- `VALID` / `MOBILE` - Valid mobile number
- `LANDLINE` - Valid landline number
- `INVALID` - Invalid phone number
- `UNKNOWN` - Could not validate (API unavailable or error)

## Rate Limits

- Bulk validation: Max 1000 numbers per request
- CSV validation: Max 10,000 rows per file
- File size: Max 10MB

## Notes

- Phone numbers are normalized automatically (removes non-digits, adds country codes)
- Results can be downloaded as CSV
- Validation uses batched processing to avoid rate limits
- All validations are logged with timestamps

