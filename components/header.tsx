"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-brand-coral transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-brand-coral transition-colors">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-brand-coral transition-colors">
            Testimonials
          </Link>
          <Link href="#faq" className="text-sm font-medium hover:text-brand-coral transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" asChild className="border-brand-navy text-brand-navy hover:bg-brand-navy/10">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90 text-white">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="block md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="z-50 relative" onClick={() => setIsMenuOpen(true)}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] pt-12">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="#features"
                  className="text-sm font-medium hover:text-brand-coral transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-sm font-medium hover:text-brand-coral transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="#testimonials"
                  className="text-sm font-medium hover:text-brand-coral transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Testimonials
                </Link>
                <Link
                  href="#faq"
                  className="text-sm font-medium hover:text-brand-coral transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    variant="outline"
                    asChild
                    className="w-full border-brand-navy text-brand-navy hover:bg-brand-navy/10"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/signin">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
