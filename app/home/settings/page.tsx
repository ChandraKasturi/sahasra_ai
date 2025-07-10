import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Settings className="h-10 w-10 text-brand-navy" />
          <h1 className="text-3xl font-bold text-brand-navy">Settings</h1>
        </div>
        <p className="text-gray-600 mb-8">Customize your application settings and preferences.</p>
        <div className="p-8 border rounded-lg bg-gray-50">
          <p className="text-lg">This page will contain application settings and preferences.</p>
        </div>
      </div>
    </div>
  )
}
