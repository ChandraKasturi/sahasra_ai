"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")

  const plans = [
    {
      name: "Free",
      description: "Basic access for students",
      price: {
        monthly: "₹0",
        yearly: "₹0",
      },
      priceLabel: {
        monthly: "/month",
        yearly: "/year",
      },
      features: [
        "Basic chat assistant",
        "Limited document uploads (5/month)",
        "Access to syllabus-aware mode",
        "Basic assessments",
        "Progress tracking for 2 subjects",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Premium",
      description: "Advanced AI planning + full assessment access",
      price: {
        monthly: "₹299",
        yearly: "₹2,999",
      },
      priceLabel: {
        monthly: "/month",
        yearly: "/year",
      },
      features: [
        "Advanced chat assistant with voice",
        "Unlimited document uploads",
        "Both syllabus-aware & open learning modes",
        "Comprehensive assessments with detailed feedback",
        "AI study planner",
        "Full progress tracking for all subjects",
        "Multilingual support",
      ],
      cta: "Upgrade Now",
      popular: true,
    },
    {
      name: "Institution",
      description: "Custom pricing for schools",
      price: {
        monthly: "Custom",
        yearly: "Custom",
      },
      priceLabel: {
        monthly: "",
        yearly: "",
      },
      features: [
        "Everything in Premium",
        "Custom training on institution syllabus",
        "Bulk student accounts",
        "Teacher & parent dashboards",
        "Integration with existing LMS",
        "Priority support",
        "Custom reporting",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-brand-navy/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge variant="outline" className="px-3 py-1 text-sm border-brand-coral bg-brand-coral/10 text-brand-navy">
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-brand-navy">
              Simple, transparent pricing
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Choose the plan that works best for you or your institution.
            </p>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="mx-auto mt-10 flex w-full max-w-md flex-col items-center space-y-4">
          <div className="relative flex w-full max-w-xs items-center justify-center rounded-full bg-white p-1 shadow-md">
            <div className="absolute inset-0 z-0 flex w-full" style={{ padding: "0.25rem" }}>
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand-navy/10 to-brand-coral/10"
                animate={{
                  x: billingPeriod === "monthly" ? 0 : "100%",
                }}
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ width: "50%" }}
              />
            </div>

            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`relative z-10 w-1/2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                billingPeriod === "monthly" ? "text-brand-navy" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`relative z-10 w-1/2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                billingPeriod === "yearly" ? "text-brand-navy" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Yearly (Save 15%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-screen-lg grid-cols-1 gap-5 md:grid-cols-3 lg:gap-8 mt-10">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <Card
                className={`flex h-full flex-col overflow-hidden transition-all duration-200 hover:shadow-lg ${
                  plan.popular ? "border-2 border-brand-coral shadow-md relative" : "border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -right-12 top-6 z-10 w-40 rotate-45 bg-gradient-to-r from-brand-navy to-brand-coral py-1 text-center text-xs font-semibold text-white shadow-sm">
                    Popular
                  </div>
                )}
                <CardHeader
                  className={`flex flex-col space-y-1.5 p-6 ${plan.popular ? "bg-gradient-to-r from-brand-navy/5 to-brand-coral/5" : ""}`}
                >
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-6 pt-0">
                  <div className="mb-6">
                    <motion.div
                      key={`${plan.name}-${billingPeriod}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-end"
                    >
                      <span className="text-4xl font-bold">{plan.price[billingPeriod]}</span>
                      {plan.priceLabel[billingPeriod] && (
                        <span className="ml-1 text-sm text-gray-500">{plan.priceLabel[billingPeriod]}</span>
                      )}
                    </motion.div>
                  </div>
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90 text-white"
                        : "border-brand-navy text-brand-navy hover:bg-brand-navy/10"
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
