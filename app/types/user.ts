export interface ProviderProfile {
  providerId: string;
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

export interface TokenManager {
  refreshToken: string;
  accessToken: string;
  expirationTime: number;
}

export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  isAnonymous: boolean;
  photoURL: string;
  providerData: ProviderProfile[];
  stsTokenManager: TokenManager;
  createdAt: string; // Timestamp string
  lastLoginAt: string; // Timestamp string
  apiKey: string;
  appName: string;
}

export interface TokenResponse {
  federatedId: string;
  providerId: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  fullName: string;
  lastName: string;
  photoUrl: string;
  localId: string;
  idToken: string;
  context: string;
  oauthAccessToken: string;
  oauthExpireIn: number;
  refreshToken: string;
  expiresIn: string; // Explicitly a string in Firebase payload
  oauthIdToken: string;
  rawUserInfo: string; // JSON string payload
  isNewUser: boolean;
  kind: string;
}

// Core payload wrapper interface
export interface FirebaseAuthResult {
  user: User;
  providerId: string;
  _tokenResponse: TokenResponse;
  operationType: 'signIn' | 'link' | 'reauthenticate'; 
}