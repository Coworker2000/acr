"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { validateToken, getValidatedToken, type TokenValidationResult } from "@/lib/auth-utils";

export default function DebugTokenPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<TokenValidationResult | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      console.log("Raw token from localStorage:", token);
      console.log("Raw user from localStorage:", user);
      
      if (!token) {
        setError("No token found in localStorage");
        return;
      }

      // Use the validation utility
      const validation = validateToken(token);
      setValidationResult(validation);
      
      if (!validation.isValid) {
        setError(validation.error || "Token validation failed");
        // Still try to decode for debugging
        try {
          const decoded = jwtDecode(token);
          setTokenInfo({
            rawToken: token,
            tokenLength: token.length,
            decoded: decoded,
            decodedKeys: Object.keys(decoded),
            user: user ? JSON.parse(user) : null
          });
        } catch (decodeErr) {
          console.error("Error decoding invalid token:", decodeErr);
        }
        return;
      }

      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      
      setTokenInfo({
        rawToken: token,
        tokenLength: token.length,
        decoded: decoded,
        decodedKeys: Object.keys(decoded),
        user: user ? JSON.parse(user) : null,
        validation: validation
      });
    } catch (err) {
      console.error("Error decoding token:", err);
      setError(`Error decoding token: ${err}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Token Debug Page</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {tokenInfo && (
          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h2 className="text-xl text-white mb-4">Token Information</h2>
              <div className="space-y-2 text-gray-300">
                <p><strong>Token Length:</strong> {tokenInfo.tokenLength}</p>
                <p><strong>Token (first 50 chars):</strong> {tokenInfo.rawToken.substring(0, 50)}...</p>
              </div>
            </div>
            
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h2 className="text-xl text-white mb-4">Decoded Token Keys</h2>
              <div className="text-gray-300">
                <p>{tokenInfo.decodedKeys.join(", ")}</p>
              </div>
            </div>
            
            <div className="bg-white/5 p-6 rounded-lg border border-white/10">
              <h2 className="text-xl text-white mb-4">Decoded Token Content</h2>
              <pre className="text-gray-300 text-sm bg-black/20 p-4 rounded overflow-auto">
                {JSON.stringify(tokenInfo.decoded, null, 2)}
              </pre>
            </div>
            
            {tokenInfo.user && (
              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <h2 className="text-xl text-white mb-4">User Object</h2>
                <pre className="text-gray-300 text-sm bg-black/20 p-4 rounded overflow-auto">
                  {JSON.stringify(tokenInfo.user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8">
          <button 
            onClick={() => {
              localStorage.clear();
              setTokenInfo(null);
              setError("localStorage cleared");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-4"
          >
            Clear localStorage
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
