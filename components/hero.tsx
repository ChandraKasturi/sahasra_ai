"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export function Hero() {
  const [videoOpen, setVideoOpen] = useState(false)

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-brand-coral/5">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_700px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-brand-coral">
                Sahasra
              </h1>
              <p className="text-xl text-brand-navy md:text-2xl">
                Smart learning powered by AI for every Indian student
              </p>
            </div>
            <p className="max-w-[600px] text-gray-600 md:text-xl">
              Personalized learning, assessments, and study planning tailored to your syllabus. Supporting multiple
              Indian education boards and languages.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-brand-navy to-brand-coral hover:opacity-90 text-white"
              >
                <Link href="/signup">Sign Up Free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-brand-navy text-brand-navy hover:bg-brand-navy/10"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[600px] aspect-video overflow-hidden rounded-xl shadow-2xl">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Sahasra AI Student Buddy"
                width={600}
                height={400}
                className="object-cover"
                priority
              />
              <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-white/90 text-brand-coral shadow-lg hover:bg-white hover:text-brand-navy"
                  >
                    <Play className="h-6 w-6" />
                    <span className="sr-only">Play demo video</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] p-0">
                  <div className="aspect-video w-full">
                    <iframe
                      width="100%"
                      height="100%"
                      src="about:blank"
                      title="Sahasra Demo Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
