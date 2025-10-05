const { OAuth2Client } = require('google-auth-library');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (without service account for Firebase tokens)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'taskmanagement-6230e' // Your Firebase project ID
  });
}

// Initialize OAuth2Client for Google Cloud tokens
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

console.log('Google OAuth Client initialized');
console.log('Client ID configured:', process.env.GOOGLE_CLIENT_ID ? 'Yes' : 'No');
console.log('Expected audience:', process.env.GOOGLE_CLIENT_ID);
console.log('Project ID from client ID:', process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.split('-')[0] : 'Not Set');

const verifyGoogleToken = async (idToken) => {
  try {
    console.log('🔍 Starting Google token verification...');
    console.log('📏 Token length:', idToken.length);
    
    // Decode the token once at the beginning
    const tokenParts = idToken.split('.');
    if (tokenParts.length === 3) {
      const header = JSON.parse(Buffer.from(tokenParts[0], 'base64url').toString());
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64url').toString());
      console.log('🔑 Token header:', header);
      console.log('🆔 Key ID (kid):', header.kid);
      console.log('👤 Token payload info:');
      console.log('   Audience (aud):', payload.aud);
      console.log('   Issuer (iss):', payload.iss);
      console.log('   Subject (sub):', payload.sub);
      console.log('   Email:', payload.email);
      
      console.log('🎯 Verifying against audience:', process.env.GOOGLE_CLIENT_ID);
      
      // Check if this is a Firebase token (audience is project ID, issuer is securetoken.google.com)
      const tokenAudience = payload.aud;
      const tokenIssuer = payload.iss;
      
      // If it's a Firebase token, use Firebase Admin SDK
      if (tokenIssuer && tokenIssuer.includes('securetoken.google.com')) {
        console.log('🔥 Detected Firebase token, using Firebase Admin SDK...');
        
        try {
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          console.log('✅ Firebase token verified successfully!');
          console.log('👤 User email:', decodedToken.email);
          console.log('🆔 User UID:', decodedToken.uid);
          console.log('🎯 Token audience:', decodedToken.aud);
          
          return {
            success: true,
            payload: {
              email: decodedToken.email,
              sub: decodedToken.uid,
              name: decodedToken.name,
              picture: decodedToken.picture,
              email_verified: decodedToken.email_verified,
              aud: decodedToken.aud,
              iss: decodedToken.iss
            }
          };
        } catch (firebaseError) {
          console.error('❌ Firebase token verification failed:', firebaseError.message);
          throw new Error(`Invalid Firebase token: ${firebaseError.message}`);
        }
      }
      
      // If not a Firebase token, try Google OAuth verification
      console.log('🔍 Not a Firebase token, trying Google OAuth verification...');
      
      // First, try with our configured client ID
      try {
        const ticket = await client.verifyIdToken({
          idToken: idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const oauthPayload = ticket.getPayload();
        console.log('✅ Google OAuth token verified successfully with configured client ID!');
        console.log('👤 User email:', oauthPayload.email);
        console.log('🎯 Token audience (aud):', oauthPayload.aud);
        console.log('🏢 Token issuer (iss):', oauthPayload.iss);
        
        return {
          success: true,
          payload: oauthPayload
        };
      } catch (primaryError) {
        console.log('⚠️ Primary client ID verification failed, trying with token\'s audience...');
        
        if (tokenAudience && tokenAudience !== process.env.GOOGLE_CLIENT_ID) {
          console.log('🔄 Trying verification with token audience:', tokenAudience);
          
          // Create a new client with the token's audience
          const tokenClient = new OAuth2Client(tokenAudience);
          
          try {
            const ticket = await tokenClient.verifyIdToken({
              idToken: idToken,
              audience: tokenAudience,
            });
            
            const verifiedPayload = ticket.getPayload();
            console.log('✅ Google OAuth token verified successfully with token audience!');
            console.log('👤 User email:', verifiedPayload.email);
            console.log('🎯 Used audience:', tokenAudience);
            
            return {
              success: true,
              payload: verifiedPayload
            };
          } catch (secondaryError) {
            console.error('❌ Secondary verification also failed:', secondaryError.message);
            throw primaryError; // Throw the original error
          }
        }
        
        // If no secondary attempt was made, throw the original error
        throw primaryError;
      }
    }
  } catch (error) {
    console.error('❌ Google token verification failed:');
    console.error('   Message:', error.message);
    console.error('   Code:', error.code);
    console.error('   Details:', error.details);
    
    // Additional debugging for PEM error
    if (error.message.includes('No pem found')) {
      console.error('🔍 PEM Error Analysis:');
      console.error('   This usually means the token was issued by a different client ID');
      console.error('   Token might be from a different Google OAuth client');
      console.error('   Check if Frontend and Backend use the same Client ID');
    }
    
    throw new Error(`Invalid Google token: ${error.message}`);
  }
};

module.exports = { verifyGoogleToken };
