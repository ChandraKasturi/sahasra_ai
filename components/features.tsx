import { BookOpen, Upload, MessageSquare, School, ClipboardCheck, Calendar, BarChart2, Globe } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function Features() {
  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-brand-coral" />,
      title: "Student Chat Assistant",
      description: "Voice & text chat in English + Indian languages. Get instant answers to your academic questions.",
      badge: "Popular",
    },
    {
      icon: <Upload className="h-10 w-10 text-brand-coral" />,
      title: "Upload & Learn",
      description:
        "Ask questions from uploaded documents (PDFs/images). Turn any study material into an interactive learning experience.",
    },
    {
      icon: <BookOpen className="h-10 w-10 text-brand-coral" />,
      title: "Syllabus-Aware & Open Learning",
      description: "Choose between syllabus-specific responses or open learning mode for broader knowledge.",
    },
    {
      icon: <School className="h-10 w-10 text-brand-coral" />,
      title: "School/Institute Mode",
      description:
        "Custom-trained for institutional syllabi. Integrate your school's teaching methodology and materials.",
      badge: "New",
    },
    {
      icon: <ClipboardCheck className="h-10 w-10 text-brand-coral" />,
      title: "Smart Assessments",
      description:
        "MCQs, fill-in-the-blanks, short answers with review tools. Track your progress and identify areas for improvement.",
    },
    {
      icon: <Calendar className="h-10 w-10 text-brand-coral" />,
      title: "AI Study Planner",
      description: "Personalized study plans based on your goals, available time, and learning pace.",
    },
    {
      icon: <BarChart2 className="h-10 w-10 text-brand-coral" />,
      title: "Progress Tracker",
      description:
        "Skill-level insights at subject/topic level. Visualize your learning journey and celebrate milestones.",
    },
    {
      icon: <Globe className="h-10 w-10 text-brand-coral" />,
      title: "Multilingual Support",
      description:
        "English + regional languages (Hindi, Tamil, Telugu, and more). Learn in the language you're most comfortable with.",
    },
  ]

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge variant="outline" className="px-3 py-1 text-sm border-brand-coral bg-brand-coral/10 text-brand-navy">
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-brand-navy">
              Everything you need to excel
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Sahasra combines AI-powered learning with personalized assessments to help every student reach their full
              potential.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 mt-12">
          {features.map((feature, index) => (
            <Card key={index} className="group relative overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  {feature.icon}
                  {feature.badge && (
                    <Badge variant="secondary" className="bg-brand-coral/20 text-brand-navy hover:bg-brand-coral/30">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <CardDescription className="text-base text-gray-600">{feature.description}</CardDescription>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-navy to-brand-coral scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
