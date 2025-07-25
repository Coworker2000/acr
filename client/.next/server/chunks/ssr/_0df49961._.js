module.exports = {

"[project]/lib/auth-utils.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "getValidatedToken": (()=>getValidatedToken),
    "isTokenExpired": (()=>isTokenExpired),
    "validateToken": (()=>validateToken)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jwt-decode/build/esm/index.js [app-ssr] (ecmascript)");
;
function validateToken(token) {
    try {
        if (!token) {
            return {
                isValid: false,
                error: "No token provided"
            };
        }
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jwtDecode"])(token);
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
                    source: decoded.email ? 'email' : decoded.userEmail ? 'userEmail' : 'none'
                },
                userName: {
                    value: userName,
                    source: decoded.userName ? 'userName' : decoded.username ? 'username' : decoded.firstName ? 'firstName' : 'none'
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
function isTokenExpired(token) {
    try {
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jwtDecode"])(token);
        if (!decoded.exp) return false;
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch  {
        return true;
    }
}
function getValidatedToken() {
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
}}),
"[project]/app/debug-token/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>DebugTokenPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jwt-decode/build/esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth-utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function DebugTokenPage() {
    const [tokenInfo, setTokenInfo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [validationResult, setValidationResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
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
            const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["validateToken"])(token);
            setValidationResult(validation);
            if (!validation.isValid) {
                setError(validation.error || "Token validation failed");
                // Still try to decode for debugging
                try {
                    const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jwtDecode"])(token);
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
            const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jwt$2d$decode$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jwtDecode"])(token);
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-4xl mx-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold text-white mb-6",
                    children: "Token Debug Page"
                }, void 0, false, {
                    fileName: "[project]/app/debug-token/page.tsx",
                    lineNumber: 67,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                            children: "Error:"
                        }, void 0, false, {
                            fileName: "[project]/app/debug-token/page.tsx",
                            lineNumber: 71,
                            columnNumber: 13
                        }, this),
                        " ",
                        error
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/debug-token/page.tsx",
                    lineNumber: 70,
                    columnNumber: 11
                }, this),
                tokenInfo && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white/5 p-6 rounded-lg border border-white/10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl text-white mb-4",
                                    children: "Token Information"
                                }, void 0, false, {
                                    fileName: "[project]/app/debug-token/page.tsx",
                                    lineNumber: 78,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2 text-gray-300",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Token Length:"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/debug-token/page.tsx",
                                                    lineNumber: 80,
                                                    columnNumber: 20
                                                }, this),
                                                " ",
                                                tokenInfo.tokenLength
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/debug-token/page.tsx",
                                            lineNumber: 80,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: "Token (first 50 chars):"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/debug-token/page.tsx",
                                                    lineNumber: 81,
                                                    columnNumber: 20
                                                }, this),
                                                " ",
                                                tokenInfo.rawToken.substring(0, 50),
                                                "..."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/debug-token/page.tsx",
                                            lineNumber: 81,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/debug-token/page.tsx",
                                    lineNumber: 79,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/debug-token/page.tsx",
                            lineNumber: 77,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white/5 p-6 rounded-lg border border-white/10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl text-white mb-4",
                                    children: "Decoded Token Keys"
                                }, void 0, false, {
                                    fileName: "[project]/app/debug-token/page.tsx",
                                    lineNumber: 86,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-300",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: tokenInfo.decodedKeys.join(", ")
                                    }, void 0, false, {
                                        fileName: "[project]/app/debug-token/page.tsx",
                                        lineNumber: 88,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/debug-token/page.tsx",
                                    lineNumber: 87,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/debug-token/page.tsx",
                            lineNumber: 85,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white/5 p-6 rounded-lg border border-white/10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl text-white mb-4",
                                    children: "Decoded Token Content"
                                }, void 0, false, {
                                    fileName: "[project]/app/debug-token/page.tsx",
                                    lineNumber: 93,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "text-gray-300 text-sm bg-black/20 p-4 rounded overflow-auto",
                                    children: JSON.stringify(tokenInfo.decoded, null, 2)
                                }, void 0, false, {
                                    fileName: "[project]/app/debug-token/page.tsx",
                                    lineNumber: 94,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/debug-token/page.tsx",
                            lineNumber: 92,
                            columnNumber: 13
                        }, this),
                        tokenInfo.user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white/5 p-6 rounded-lg border border-white/10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xl text-white mb-4",
                                    children: "User Object"
                                }, void 0, false, {
                                    fileName: "[project]/app/debug-token/page.tsx",
                                    lineNumber: 101,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "text-gray-300 text-sm bg-black/20 p-4 rounded overflow-auto",
                                    children: JSON.stringify(tokenInfo.user, null, 2)
                                }, void 0, false, {
                                    fileName: "[project]/app/debug-token/page.tsx",
                                    lineNumber: 102,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/debug-token/page.tsx",
                            lineNumber: 100,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/debug-token/page.tsx",
                    lineNumber: 76,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                localStorage.clear();
                                setTokenInfo(null);
                                setError("localStorage cleared");
                            },
                            className: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-4",
                            children: "Clear localStorage"
                        }, void 0, false, {
                            fileName: "[project]/app/debug-token/page.tsx",
                            lineNumber: 111,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>window.location.reload(),
                            className: "bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded",
                            children: "Reload Page"
                        }, void 0, false, {
                            fileName: "[project]/app/debug-token/page.tsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/debug-token/page.tsx",
                    lineNumber: 110,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/debug-token/page.tsx",
            lineNumber: 66,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/debug-token/page.tsx",
        lineNumber: 65,
        columnNumber: 5
    }, this);
}
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}}),
"[project]/node_modules/jwt-decode/build/esm/index.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "InvalidTokenError": (()=>InvalidTokenError),
    "jwtDecode": (()=>jwtDecode)
});
class InvalidTokenError extends Error {
}
InvalidTokenError.prototype.name = "InvalidTokenError";
function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p)=>{
        let code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
            code = "0" + code;
        }
        return "%" + code;
    }));
}
function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch(output.length % 4){
        case 0:
            break;
        case 2:
            output += "==";
            break;
        case 3:
            output += "=";
            break;
        default:
            throw new Error("base64 string is not of the correct length");
    }
    try {
        return b64DecodeUnicode(output);
    } catch (err) {
        return atob(output);
    }
}
function jwtDecode(token, options) {
    if (typeof token !== "string") {
        throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    options || (options = {});
    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
        throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
    }
    let decoded;
    try {
        decoded = base64UrlDecode(part);
    } catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
    }
    try {
        return JSON.parse(decoded);
    } catch (e) {
        throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
    }
}
}}),

};

//# sourceMappingURL=_0df49961._.js.map