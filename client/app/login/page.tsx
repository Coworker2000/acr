"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        "https://arleen-credit-repair-backend.onrender.com/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Login failed");
      }

      const data = await res.json();

      // Store token and user info
      // localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/plans");
    } catch (error: any) {
      alert(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-300 text-sm sm:text-base">
            Sign in to access your credit repair dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm sm:text-base text-gray-200"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm sm:text-base text-gray-200"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pr-10 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm text-gray-400 hover:text-white"
              >
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-black text-sm sm:text-base font-semibold"
              disabled={!email || !password || isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            {/* <Button
              onClick={() =>
                (window.location.href = "http://localhost:5000/auth/google")
              }
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold"
            >
              Sign in with Google
            </Button> */}
          </form>
          <div className="text-center text-xs sm:text-sm text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-white hover:text-gray-300">
              Sign up
            </Link>
          </div>
          
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2">Are you an agent?</p>
            <Link 
              href="/agent/login" 
              className="text-xs text-white hover:text-gray-300 underline"
            >
              Access Agent Portal
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}