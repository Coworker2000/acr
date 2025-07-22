// app/plans/page.tsx or pages/plans/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, LogOut, Menu, X } from "lucide-react";

interface Plan {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  buttonText: string;
  image: string;
  isPaymentPlan?: boolean;
}

const plans: Plan[] = [
  {
    id: "super-sale",
    title: "Super Sale",
    subtitle: "Results in as little as 20-30 days!",
    price: "$399",
    originalPrice: "$599",
    buttonText: "Get Started!",
    image: "/images/plans/1.jpeg",
  },
  {
    id: "super-sale-payment",
    title: "Super Sale - Payment Plan",
    subtitle: "Results in as little as 15-30 days!",
    price: "$499",
    originalPrice: "$799",
    buttonText: "Get Started",
    image: "/images/plans/2.jpeg",
    isPaymentPlan: true,
  },
  {
    id: "vip-fast-track",
    title: "VIP Fast Track Program",
    subtitle: "Results in as little as 7-15 days!",
    price: "$750",
    originalPrice: "$1500",
    buttonText: "Get Started!",
    image: "/images/plans/3.jpeg",
  },
  {
    id: "instant-tradeline",
    title: "$2500 Instant Tradeline",
    subtitle:
      "Boost Your Credit Score by 40–100 Points — Fast! Results in as little as 7 days term!",
    price: "$1500",
    originalPrice: "$3,000",
    buttonText: "I Need This!",
    image: "/images/plans/4.jpeg",
  },
];

// export default function PlansPage() {
//   return (
//     <Suspense fallback={<div>Loading plans...</div>}>
//       <PlansPageContent />
//     </Suspense>
//   );
// }

function PlansPageContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userFirstName, setUserFirstName] = useState("");
  
  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      setIsAuthenticated(true);

      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("token");
      router.replace(`/plans?${newSearchParams.toString()}`);
    } else {
      const existingToken = localStorage.getItem("token");
      setIsAuthenticated(!!existingToken);
    }

    const storedName = localStorage.getItem("userFirstName");
    if (storedName) {
      setUserFirstName(storedName);
    }
  }, [searchParams, router]);
  // useEffect(() => {
  //   const authStatus = localStorage.getItem("isAuthenticated");
  //   if (!authStatus) {
  //     router.push("/login");
  //   } else {
  //     setIsAuthenticated(true);
  //   }
  // }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    localStorage.setItem("selectedPlan", JSON.stringify(plan));
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* Navigation */}
      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-lg sm:text-xl font-bold text-white">
            Arleen Credit Repair Program
          </h1>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/chat">
              <Button
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 bg-transparent text-sm"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with Agent
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10 bg-transparent text-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden text-white border-white/20 hover:bg-white/10 bg-transparent"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="/chat" className="block">
              <Button
                variant="outline"
                className="w-full text-white border-white/20 hover:bg-white/10 bg-transparent text-sm"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat with Agent
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-white border-white/20 hover:bg-white/10 bg-transparent text-sm"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </nav>

      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="lg:w-80 p-4 lg:p-6 mx-8 flex-shrink-0 lg:sticky lg:top-0 lg:h-full">
          <Card className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-3xl lg:h-full">
            <CardContent className="p-6 text-center flex flex-col justify-center lg:h-full">
              <div className="mb-6">
                <Image
                  src="/images/dp.jpg"
                  alt="Sasha Yvonne"
                  width={200}
                  height={200}
                  className="rounded-3xl mx-auto w-48 h-48 lg:w-full lg:h-auto object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold mb-6 text-white">
                Arleen Credit Repair
              </h2>
              {/* Social Buttons can go here */}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer rounded-2xl"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <Image
                        src={plan.image}
                        alt={plan.title}
                        width={80}
                        height={80}
                        className="rounded-xl w-20 h-20 object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold mb-1 leading-tight text-white">
                          {plan.title}
                        </h3>
                        <p className="text-gray-300 text-sm mb-3 leading-tight">
                          {plan.subtitle}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-white">
                            {plan.price}
                          </span>
                          {plan.originalPrice && (
                            <span className="text-lg text-gray-400 line-through">
                              {plan.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-gray-300 text-black text-base font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelect(plan);
                        router.push("/chat");
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ This wraps the whole component in <Suspense> to support useSearchParams
export default function PlansPage() {
  return (
    <Suspense
      fallback={
        <div className="text-white text-center mt-10">Loading page...</div>
      }
    >
      <PlansPageContent />
    </Suspense>
  );
}
