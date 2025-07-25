import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  id: string;
  userId: string;
  email: string;
  userEmail: string;
  userName: string;
  firstName?: string;
  username?: string;
  iat?: number;
  exp?: number;
}

export interface TokenValidationResult {
  isValid: boolean;
  email?: string;
  userName?: string;
  error?: string;
  debugInfo?: any;
}

/**
 * Validates and extracts user information from JWT token
 * Now handles legacy tokens and provides fallback authentication
 */
export function validateToken(token: string): TokenValidationResult {
  try {
    if (!token) {
      return {
        isValid: false,
        error: "No token provided"
      };
    }

    const decoded = jwtDecode<DecodedToken>(token);
    
    // Check if token is expired first
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return {
        isValid: false,
        error: "Token has expired. Please login again."
      };
    }
    
    // Extract email with fallbacks
    const email = decoded.email || decoded.userEmail;
    
    // Extract userName with fallbacks
    const userName = decoded.userName || decoded.username || decoded.firstName;
    
    const debugInfo = {
      tokenKeys: Object.keys(decoded),
      tokenFields: {
        hasId: !!decoded.id,
        hasUserId: !!decoded.userId,
        hasEmail: !!decoded.email,
        hasUserEmail: !!decoded.userEmail,
        hasUserName: !!decoded.userName,
        hasUsername: !!decoded.username,
        hasFirstName: !!decoded.firstName
      },
      extractedValues: {
        email: {
          value: email,
          source: decoded.email ? 'email' : (decoded.userEmail ? 'userEmail' : 'none')
        },
        userName: {
          value: userName,
          source: decoded.userName ? 'userName' : (decoded.username ? 'username' : (decoded.firstName ? 'firstName' : 'none'))
        }
      },
      rawDecoded: decoded,
      isLegacyToken: !email || !userName
    };

    // Handle legacy tokens from older backend versions
    if (!email || !userName) {
      // Check if we have user data in localStorage as fallback
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const fallbackEmail = email || userData.email;
          const fallbackUserName = userName || userData.username || userData.firstName || userData.name;
          
          if (fallbackEmail && fallbackUserName) {
            console.warn('Using fallback user data from localStorage for legacy token');
            return {
              isValid: true,
              email: fallbackEmail,
              userName: fallbackUserName,
              debugInfo: {
                ...debugInfo,
                usedFallback: true,
                fallbackSource: 'localStorage'
              }
            };
          }
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }
      
      // If no fallback available, return error with helpful message
      const missingFields = [];
      if (!email) missingFields.push('email');
      if (!userName) missingFields.push('userName');
      
      return {
        isValid: false,
        error: `Your session is using an older token format. Please log out and log in again to update your authentication.`,
        debugInfo
      };
    }

    return {
      isValid: true,
      email,
      userName,
      debugInfo
    };

  } catch (error) {
    return {
      isValid: false,
      error: `Token decode error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Checks if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) return false;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

/**
 * Gets token from localStorage with validation
 */
export function getValidatedToken(): TokenValidationResult {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return {
      isValid: false,
      error: "No token found in localStorage"
    };
  }

  if (isTokenExpired(token)) {
    return {
      isValid: false,
      error: "Token has expired"
    };
  }

  return validateToken(token);
}
