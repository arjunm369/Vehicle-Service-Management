// Razorpay Configuration
// Get your keys from: https://dashboard.razorpay.com/app/website-app-settings/api-keys

// For Testing (Test Mode Keys):
// Sign up at razorpay.com → Dashboard → Settings → API Keys → Generate Test Key
export const RAZORPAY_KEY_ID = "rzp_test_SQZX6y25mriFCf";
export const RAZORPAY_KEY_SECRET = "cJeixL2dnmNoM3gEiv7Ii95a";

// For Production (Live Mode Keys):
// export const RAZORPAY_KEY_ID = "rzp_live_YOUR_KEY_ID";

// HOW TO SETUP RAZORPAY:
// 1. Go to https://razorpay.com/
// 2. Sign up for free account
// 3. Verify your email
// 4. Go to Dashboard → Settings → API Keys
// 5. Click "Generate Test Key" (for testing)
// 6. Copy "Key Id" and paste above
// 7. Test with test cards: https://razorpay.com/docs/payments/payments/test-card-upi-details/
//
// Test Card Numbers:
// - Success: 4111 1111 1111 1111
// - Failure: 4111 1111 1111 1112
// - CVV: Any 3 digits, Expiry: Any future date
//
// For Production:
// 1. Complete KYC verification
// 2. Generate Live Keys
// 3. Replace test key with live key
// 4. Update in checkout page

export default RAZORPAY_KEY_ID;



