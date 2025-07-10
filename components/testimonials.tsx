import Image from "next/image"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Testimonials() {
  const testimonials = [
    {
      quote:
        "Sahasra helped my daughter improve her grades significantly. The personalized study plans and assessments are exactly what she needed.",
      name: "Priya Sharma",
      role: "Parent",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote:
        "I love that I can ask questions in Hindi. The AI explains complex topics in a way that's easy to understand, and the assessments help me identify my weak areas.",
      name: "Rahul Verma",
      role: "Class 10 Student, CBSE",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote:
        "As a teacher, I've seen a remarkable improvement in student engagement. The ability to customize the AI with our school's curriculum has been invaluable.",
      name: "Anjali Desai",
      role: "Science Teacher",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote:
        "The multilingual support is a game-changer. My son can learn in Tamil, which has boosted his confidence tremendously.",
      name: "Karthik Rajan",
      role: "Parent",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote:
        "The AI study planner helped me prepare for my board exams efficiently. I could focus on areas where I needed improvement.",
      name: "Aisha Khan",
      role: "Class 12 Student, State Board",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote:
        "Implementing Sahasra in our school has led to measurable improvements in test scores. The analytics help us identify trends and adjust our teaching methods.",
      name: "Dr. Rajesh Patel",
      role: "School Principal",
      avatar: "/placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge variant="outline" className="px-3 py-1 text-sm border-brand-coral bg-brand-coral/10 text-brand-navy">
              Testimonials
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-brand-navy">
              Loved by students, parents, and teachers
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              See how Sahasra is transforming education across India.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="overflow-hidden group transition-all duration-300 hover:-translate-y-2 shadow-md hover:shadow-xl rounded-xl border border-gray-100"
            >
              <CardContent className="p-6 pb-4">
                <div className="relative">
                  <span className="absolute -left-3 -top-3 text-6xl text-brand-coral/20">"</span>
                  <blockquote className="relative z-10 text-gray-600 italic">{testimonial.quote}</blockquote>
                </div>
              </CardContent>
              <CardFooter className="flex items-center gap-4 p-6 pt-2 bg-gradient-to-r from-brand-navy/5 to-brand-coral/5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-navy to-brand-coral blur-[1px]"></div>
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="relative rounded-full object-cover border-2 border-white"
                  />
                </div>
                <div>
                  <p className="font-semibold text-brand-navy bg-gradient-to-r from-brand-navy to-brand-coral bg-clip-text text-transparent">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
