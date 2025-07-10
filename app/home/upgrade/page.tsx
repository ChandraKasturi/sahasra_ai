import { Crown } from "lucide-react"

export default function UpgradePage() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        <Crown className="h-16 w-16 mx-auto mb-4 text-brand-coral" />
        <h1 className="text-3xl font-bold mb-6 text-brand-navy">Upgrade to Pro</h1>
        <p className="text-gray-600 mb-8">
          Unlock premium features and get the most out of your learning experience with Sahasra Pro.
        </p>
        <div className="p-8 border rounded-lg bg-gray-50">
          <p className="text-lg">This page will contain upgrade options and pricing plans.</p>
        </div>
      </div>
    </div>
  )
}
