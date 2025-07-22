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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    ssn: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    currentCreditScore: "",
    goalCreditScore: "",
    monthlyIncome: "",
    employmentStatus: "",
    housingStatus: "",
    bankruptcyHistory: "",
    creditGoals: "",
    hearAboutUs: "",
    agreeToTerms: false,
    agreeToCredit: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToCredit) {
      alert("Please agree to all terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://arleen-credit-repair-backend.onrender.com/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      alert("Registration successful!");
      router.push("/login"); // Or wherever you'd like to go
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 py-4 sm:py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm sm:text-base">
              Join The Arleen Credit Repair Program and start improving your
              credit today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm sm:text-base text-gray-200"
                    >
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm sm:text-base text-gray-200"
                    >
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm sm:text-base text-gray-200"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm sm:text-base text-gray-200"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
                  />
                </div>
              </div>
              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Address Information
                </h3>
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-sm sm:text-base text-gray-200"
                  >
                    Street Address *
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter your street address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="city"
                      className="text-sm sm:text-base text-gray-200"
                    >
                      City *
                    </Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="state"
                      className="text-sm sm:text-base text-gray-200"
                    >
                      State *
                    </Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="zipCode"
                      className="text-sm sm:text-base text-gray-200"
                    >
                      ZIP Code *
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder="12345"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Account Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm sm:text-base text-gray-200"
                    >
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pr-10 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm sm:text-base text-gray-200"
                    >
                      Confirm Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pr-10 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <Label
                    htmlFor="creditGoals"
                    className="text-sm sm:text-base text-gray-200"
                  >
                    What are your primary credit goals?
                  </Label>
                  <Textarea
                    id="creditGoals"
                    placeholder="e.g., Buy a house, get a car loan, improve credit score..."
                    value={formData.creditGoals}
                    onChange={(e) =>
                      handleInputChange("creditGoals", e.target.value)
                    }
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-sm sm:text-base min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="hearAboutUs"
                    className="text-sm sm:text-base text-gray-200"
                  >
                    How did you hear about us?
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("hearAboutUs", value)
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm sm:text-base">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="google">Google Search</SelectItem>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="referral">
                        Friend/Family Referral
                      </SelectItem>
                      <SelectItem value="advertisement">
                        Advertisement
                      </SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      handleInputChange("agreeToTerms", checked as boolean)
                    }
                    className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-xs sm:text-sm leading-relaxed text-gray-300"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-white hover:text-gray-300"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-white hover:text-gray-300"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="credit"
                    checked={formData.agreeToCredit}
                    onCheckedChange={(checked) =>
                      handleInputChange("agreeToCredit", checked as boolean)
                    }
                    className="border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <Label
                    htmlFor="credit"
                    className="text-xs sm:text-sm leading-relaxed text-gray-300"
                  >
                    I authorize The Arleen Credit Repair Program to access my
                    credit reports and work on my behalf to improve my credit
                    profile.
                  </Label>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-black text-sm sm:text-base py-3 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            <div className="text-center text-xs sm:text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:text-gray-300">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
