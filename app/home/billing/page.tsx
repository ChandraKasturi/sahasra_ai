"use client"

import { useState } from "react"
import { CreditCard, Download, FileText, Info, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample billing data
const billingData = [
  {
    id: 1,
    plan: "Trial Plan",
    invoiceDate: "01/03/2025",
    overDueDays: 0,
    paidOnDate: "01/03/2025",
    referenceNumber: "SAH2025030101",
    status: "Paid",
  },
  {
    id: 2,
    plan: "Basic Plan",
    invoiceDate: "01/04/2025",
    overDueDays: 0,
    paidOnDate: "01/04/2025",
    referenceNumber: "SAH2025040102",
    status: "Paid",
  },
  {
    id: 3,
    plan: "Premium Plan",
    invoiceDate: "01/05/2025",
    overDueDays: 2,
    paidOnDate: "03/05/2025",
    referenceNumber: "SAH2025050103",
    status: "Paid",
  },
  {
    id: 4,
    plan: "Premium Plan",
    invoiceDate: "01/06/2025",
    overDueDays: 0,
    paidOnDate: "01/06/2025",
    referenceNumber: "SAH2025060104",
    status: "Paid",
  },
  {
    id: 5,
    plan: "Premium Plan",
    invoiceDate: "01/07/2025",
    overDueDays: null,
    paidOnDate: null,
    referenceNumber: null,
    status: "Pending",
  },
]

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"all" | "paid" | "pending">("all")

  const filteredData =
    activeTab === "all"
      ? billingData
      : billingData.filter((item) => (activeTab === "paid" ? item.status === "Paid" : item.status === "Pending"))

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-brand-navy to-brand-coral text-white">
            <CreditCard className="h-6 w-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">Billing & Invoices</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
            className={activeTab === "all" ? "bg-gradient-to-r from-brand-navy to-brand-coral text-white" : ""}
          >
            All
          </Button>
          <Button
            variant={activeTab === "paid" ? "default" : "outline"}
            onClick={() => setActiveTab("paid")}
            className={activeTab === "paid" ? "bg-gradient-to-r from-brand-navy to-brand-coral text-white" : ""}
          >
            Paid
          </Button>
          <Button
            variant={activeTab === "pending" ? "default" : "outline"}
            onClick={() => setActiveTab("pending")}
            className={activeTab === "pending" ? "bg-gradient-to-r from-brand-navy to-brand-coral text-white" : ""}
          >
            Pending
          </Button>
        </div>
      </div>

      <Card className="border-brand-navy border-2">
        <CardHeader className="bg-gradient-to-r from-brand-navy to-brand-coral text-white">
          <h2 className="text-xl font-semibold">Invoice History</h2>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="font-bold">S No</TableHead>
                <TableHead className="font-bold">Plan</TableHead>
                <TableHead className="font-bold">Invoice Date</TableHead>
                <TableHead className="font-bold">Over Due Days</TableHead>
                <TableHead className="font-bold">Paid On</TableHead>
                <TableHead className="font-bold">Reference Number</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>{item.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{item.plan}</div>
                    </TableCell>
                    <TableCell>{item.invoiceDate}</TableCell>
                    <TableCell>
                      {item.overDueDays !== null ? (
                        item.overDueDays > 0 ? (
                          <Badge variant="destructive">{item.overDueDays} days</Badge>
                        ) : (
                          <Badge variant="outline">0 days</Badge>
                        )
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{item.paidOnDate || "-"}</TableCell>
                    <TableCell>
                      <span className="font-mono">{item.referenceNumber || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === "Paid" ? "default" : "secondary"}
                        className={
                          item.status === "Paid"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.status === "Paid" ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download Invoice</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download Invoice</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Invoice</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Invoice</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No invoices found for the selected filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-brand-navy border-2">
        <CardHeader className="bg-gradient-to-r from-brand-navy to-brand-coral text-white">
          <h2 className="text-xl font-semibold">Billing Support</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-brand-navy mt-0.5" />
                <div>
                  <h3 className="font-medium text-brand-navy">Email Support</h3>
                  <p className="text-gray-600">
                    <a href="mailto:billing@sahasra.ai" className="hover:underline">
                      billing@sahasra.ai
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-brand-navy mt-0.5" />
                <div>
                  <h3 className="font-medium text-brand-navy">Phone Support</h3>
                  <p className="text-gray-600">
                    <a href="tel:+919980276563" className="hover:underline">
                      +91 9980 276 563
                    </a>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Available Monday-Friday, 9am-6pm IST</p>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-brand-navy" />
                <h3 className="font-medium text-brand-navy">Billing FAQ</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-brand-coral font-bold">•</span>
                  <span>Invoices are generated on the 1st of each month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-coral font-bold">•</span>
                  <span>Payment is due within 15 days of invoice generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-coral font-bold">•</span>
                  <span>We accept all major credit cards and bank transfers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-coral font-bold">•</span>
                  <span>For plan changes, please contact our support team</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Need help with your subscription? Our billing team is here to assist you.</p>
      </div>
    </div>
  )
}
