import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t bg-white py-12">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2QLEZpPlECWtj3bIM6kVOkaj25Bmai.png"
                alt="Sahasra Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-navy to-brand-coral bg-clip-text text-transparent">
                Sahasra
              </span>
            </Link>
            <p className="text-sm text-gray-600">
              Smart learning powered by AI for every Indian student. Personalized education that adapts to your needs.
            </p>
            <div className="mt-4 flex gap-4">
              <Link href="#" className="text-gray-500 hover:text-brand-coral">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-brand-coral">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-brand-coral">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-brand-coral">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="text-gray-500 hover:text-brand-coral">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-gray-500 hover:text-brand-coral">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  For Schools
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  For Parents
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  For Students
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  Press
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  Partners
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-brand-coral">
                  Terms of Service
                </Link>
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <Mail className="h-4 w-4" />
                <span>support@sahasra.ai</span>
              </li>
              <li className="flex items-center gap-2 text-gray-500">
                <Phone className="h-4 w-4" />
                <span>+91 1234567890</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Sahasra AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
