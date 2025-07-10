import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export function FAQ() {
  const faqs = [
    {
      question: "Is my syllabus supported?",
      answer:
        "Sahasra supports all major Indian education boards including CBSE, ICSE, State Boards, and more. We're constantly expanding our syllabus coverage. If your specific board or syllabus isn't fully supported yet, you can still use our open learning mode and document upload features.",
    },
    {
      question: "Can I use it in my local language?",
      answer:
        "Yes! Sahasra supports multiple Indian languages including Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, and more. You can interact with the AI in your preferred language, and it will respond in the same language.",
    },
    {
      question: "How are assessments personalized?",
      answer:
        "Our AI analyzes your learning patterns, strengths, and areas for improvement. Based on this analysis, it creates customized assessments that focus on concepts you need to strengthen. The difficulty level adapts as you progress, ensuring you're always appropriately challenged.",
    },
    {
      question: "How do institutions onboard?",
      answer:
        "Institutions can contact our sales team for a customized onboarding process. We'll work with you to integrate your curriculum, teaching methodologies, and existing learning materials into the Sahasra platform. We also provide bulk account creation, administrative dashboards, and training for teachers.",
    },
    {
      question: "Is my data secure and private?",
      answer:
        "Absolutely. We take data privacy very seriously, especially when it comes to student information. All data is encrypted, and we comply with all relevant data protection regulations. We never share your data with third parties without explicit consent.",
    },
    {
      question: "Can I use Sahasra without internet access?",
      answer:
        "While Sahasra primarily requires internet connectivity for full functionality, we do offer limited offline capabilities. You can download certain lessons and assessments for offline use, and your progress will sync when you reconnect.",
    },
    {
      question: "How does the AI Study Planner work?",
      answer:
        "The AI Study Planner creates personalized learning schedules based on your goals, available study time, current knowledge level, and upcoming exams. It adapts as you progress, adjusting to your learning pace and focusing on areas that need more attention.",
    },
    {
      question: "Can parents monitor their child's progress?",
      answer:
        "Yes, parents can access a dedicated dashboard to monitor their child's learning progress, assessment results, and study habits. The dashboard provides insights without being intrusive, helping parents support their child's educational journey.",
    },
  ]

  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-brand-navy/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge variant="outline" className="px-3 py-1 text-sm border-brand-coral bg-brand-coral/10 text-brand-navy">
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-brand-navy">
              Frequently asked questions
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to know about Sahasra.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
