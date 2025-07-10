"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Copy, ThumbsUp, ThumbsDown, Volume2, Send, Mic, Paperclip, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import { toast } from "@/components/ui/use-toast"

// Add these imports at the top
import { useSearchParams } from "next/navigation"
import { parse } from "date-fns"

// Define the Message type
type Message = {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

// Sample chat data for each date
const generateSampleChatForDate = (dateString: string) => {
  try {
    const date = parse(dateString, "dd-MMM-yy", new Date())

    // Topics for Mathematics learning based on the date
    const topics = [
      "Real Numbers",
      "Polynomials",
      "Pair of Linear Equations in Two Variables",
      "Quadratic Equations",
      "Arithmetic Progressions",
      "Triangles",
      "Coordinate Geometry",
    ]

    // Use the date to determine which topic (consistent for the same date)
    const dayOfMonth = date.getDate()
    const topicIndex = dayOfMonth % topics.length
    const topic = topics[topicIndex]

    // Generate a conversation about the topic
    const messages = []

    // Initial user question
    messages.push({
      id: `${dateString}-1`,
      type: "user",
      content: `Can you help me understand ${topic.toLowerCase()}?`,
      timestamp: new Date(date),
    })

    // AI response
    messages.push({
      id: `${dateString}-2`,
      type: "ai",
      content: `I'd be happy to help you understand ${topic.toLowerCase()}! What specific aspects would you like to focus on today?`,
      timestamp: new Date(date),
    })

    // Follow-up user question
    messages.push({
      id: `${dateString}-3`,
      type: "user",
      content: `I'm preparing for my CBSE exams and need to understand the key concepts of ${topic.toLowerCase()}. Can you explain the main formulas and solve some example problems?`,
      timestamp: new Date(date),
    })

    // Detailed AI response
    let aiResponse = ""

    switch (topic) {
      case "Quadratic Equations":
        aiResponse = `# Quadratic Equations

A quadratic equation is a second-degree polynomial equation in a single variable, typically written as:

$$ax^2 + bx + c = 0$$

Where $a$, $b$, and $c$ are constants, and $a ≠ 0$.

## Methods to Solve Quadratic Equations

### 1. Factorization Method

If we can express $ax^2 + bx + c$ as a product of two linear factors, we can find the roots easily.

**Example:**
Solve $x^2 - 5x + 6 = 0$

**Solution:**
We need to find two numbers whose sum is -5 and product is 6.
These numbers are -2 and -3.

$x^2 - 5x + 6 = 0$
$x^2 - 2x - 3x + 6 = 0$
$x(x - 2) - 3(x - 2) = 0$
$(x - 3)(x - 2) = 0$

Therefore, $x = 3$ or $x = 2$

### 2. Completing the Square Method

This involves rewriting the equation to create a perfect square trinomial.

**Example:**
Solve $x^2 - 6x + 8 = 0$

**Solution:**
$x^2 - 6x + 8 = 0$
$x^2 - 6x = -8$

Add and subtract $(b/2)^2 = (-6/2)^2 = 9$ on the left side:
$x^2 - 6x + 9 - 9 = -8$
$(x - 3)^2 - 9 = -8$
$(x - 3)^2 = 1$
$x - 3 = ±1$
$x = 4$ or $x = 2$

### 3. Quadratic Formula

The solutions to $ax^2 + bx + c = 0$ are given by:

$$x = \frac{-b ± \sqrt{b^2 - 4ac}}{2a}$$

**Example:**
Solve $2x^2 - 7x + 3 = 0$

**Solution:**
Here, $a = 2$, $b = -7$, and $c = 3$

Using the quadratic formula:
$x = \frac{-b ± \sqrt{b^2 - 4ac}}{2a}$
$x = \frac{7 ± \sqrt{49 - 24}}{4}$
$x = \frac{7 ± \sqrt{25}}{4}$
$x = \frac{7 ± 5}{4}$

Therefore, $x = 3$ or $x = \frac{1}{2}$

## Nature of Roots

The discriminant $b^2 - 4ac$ determines the nature of the roots:

- If $b^2 - 4ac > 0$, there are two distinct real roots
- If $b^2 - 4ac = 0$, there is one real root (repeated)
- If $b^2 - 4ac < 0$, there are no real roots (two complex roots)

## Applications of Quadratic Equations

Quadratic equations are used in many real-life scenarios:

1. **Projectile motion**: Finding when an object will hit the ground
2. **Area problems**: Finding dimensions when area is known
3. **Revenue optimization**: Finding price points for maximum profit

Would you like to try solving some practice problems?`
        break

      case "Coordinate Geometry":
        aiResponse = `# Coordinate Geometry

Coordinate geometry combines algebra and geometry by using a coordinate system to represent geometric shapes and solve geometric problems.

## Distance Formula

The distance between two points $(x_1, y_1)$ and $(x_2, y_2)$ is given by:

$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$

**Example:**
Find the distance between the points $A(3, 4)$ and $B(6, 8)$.

**Solution:**
$d = \\sqrt{(6 - 3)^2 + (8 - 4)^2}$
$d = \\sqrt{9 + 16}$
$d = \\sqrt{25}$
$d = 5$ units

## Section Formula

The coordinates of a point $P$ that divides the line segment joining points $A(x_1, y_1)$ and $B(x_2, y_2)$ in the ratio $m:n$ are:

$$P = \\left(\\frac{mx_2 + nx_1}{m + n}, \\frac{my_2 + ny_1}{m + n}\\right)$$

**Example:**
Find the coordinates of the point that divides the line segment joining $A(2, 3)$ and $B(5, 7)$ in the ratio $2:1$.

**Solution:**
$x = \\frac{2 \\times 5 + 1 \\times 2}{2 + 1} = \\frac{10 + 2}{3} = 4$
$y = \\frac{2 \\times 7 + 1 \\times 3}{2 + 1} = \\frac{14 + 3}{3} = \\frac{17}{3}$

Therefore, the point is $(4, \\frac{17}{3})$

## Area of a Triangle

The area of a triangle with vertices $(x_1, y_1)$, $(x_2, y_2)$, and $(x_3, y_3)$ is given by:

$$Area = \\frac{1}{2}|x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)|$$

**Example:**
Find the area of the triangle with vertices $A(1, 2)$, $B(3, 4)$, and $C(5, 0)$.

**Solution:**
$Area = \\frac{1}{2}|1(4 - 0) + 3(0 - 2) + 5(2 - 4)|$
$Area = \\frac{1}{2}|1 \\times 4 + 3 \\times (-2) + 5 \\times (-2)|$
$Area = \\frac{1}{2}|4 - 6 - 10|$
$Area = \\frac{1}{2}|{-12}|$
$Area = 6$ square units

## Equation of a Line

### Slope-Intercept Form
$y = mx + c$, where $m$ is the slope and $c$ is the y-intercept.

### Point-Slope Form
$y - y_1 = m(x - x_1)$, where $m$ is the slope and $(x_1, y_1)$ is a point on the line.

### Two-Point Form
$\\frac{y - y_1}{y_2 - y_1} = \\frac{x - x_1}{x_2 - x_1}$, where $(x_1, y_1)$ and $(x_2, y_2)$ are two points on the line.

**Example:**
Find the equation of the line passing through the points $A(2, 3)$ and $B(4, 7)$.

**Solution:**
First, find the slope:
$m = \\frac{7 - 3}{4 - 2} = \\frac{4}{2} = 2$

Using the point-slope form with point $A(2, 3)$:
$y - 3 = 2(x - 2)$
$y - 3 = 2x - 4$
$y = 2x - 1$

Therefore, the equation of the line is $y = 2x - 1$

Would you like to try some practice problems on coordinate geometry?`
        break

      default:
        aiResponse = `# ${topic}

${topic} is an important topic in mathematics. Let's explore the key concepts:

## Key Concepts

1. **Definitions and Formulas**: Understanding the basic definitions and formulas related to ${topic.toLowerCase()}.

2. **Properties**: Learning the essential properties that make ${topic.toLowerCase()} work.

3. **Problem-Solving Techniques**: Mastering the methods to solve problems involving ${topic.toLowerCase()}.

4. **Applications**: Exploring how ${topic.toLowerCase()} is applied in real-world situations.

## Important Formulas

Here are some key formulas related to ${topic.toLowerCase()} (these would be specific to the actual topic):

1. Formula 1: $a^2 + b^2 = c^2$ (example)
2. Formula 2: $V = \\frac{4}{3}\\pi r^3$ (example)
3. Formula 3: $A = \\pi r^2$ (example)

## Example Problems

Let's work through some example problems to understand ${topic.toLowerCase()} better:

### Example 1:
[Problem statement would go here]

**Solution:**
[Step-by-step solution would go here]

### Example 2:
[Problem statement would go here]

**Solution:**
[Step-by-step solution would go here]

## Tips for CBSE Exams

For your CBSE exams, focus on:
- Understanding concepts rather than memorizing formulas
- Practicing a variety of problems
- Showing all steps in your solutions
- Drawing diagrams where applicable
- Checking your answers

Would you like to see more examples or practice problems related to ${topic.toLowerCase()}?`
    }

    messages.push({
      id: `${dateString}-4`,
      type: "ai",
      content: aiResponse,
      timestamp: new Date(date),
    })

    // Additional user question
    messages.push({
      id: `${dateString}-5`,
      type: "user",
      content: "That's really helpful! Can you give me some practice problems to solve?",
      timestamp: new Date(date),
    })

    // AI response with exercises
    messages.push({
      id: `${dateString}-6`,
      type: "ai",
      content: `I'm glad you found that helpful! Here are some practice problems on ${topic.toLowerCase()} to test your understanding:

### Practice Problems:

1. **Basic Level**:
   
   ${
     topic === "Quadratic Equations"
       ? "a) Solve the quadratic equation: $x^2 - 7x + 12 = 0$\n\nb) Find the value of $k$ for which the quadratic equation $kx^2 + 6x + 1 = 0$ has equal roots."
       : topic === "Coordinate Geometry"
         ? "a) Find the distance between the points $(5, -3)$ and $(2, 4)$.\n\nb) Find the coordinates of the midpoint of the line segment joining the points $(-2, 5)$ and $(6, -3)$."
         : "a) Basic problem 1 related to " +
           topic.toLowerCase() +
           "\n\nb) Basic problem 2 related to " +
           topic.toLowerCase()
   }

2. **Intermediate Level**:
   
   ${
     topic === "Quadratic Equations"
       ? "a) If $\\alpha$ and $\\beta$ are the roots of the equation $x^2 - 5x + 6 = 0$, find the value of $\\alpha^2 + \\beta^2$.\n\nb) Find the quadratic equation whose roots are twice the roots of the equation $2x^2 - 3x + 1 = 0$."
       : topic === "Coordinate Geometry"
         ? "a) Find the area of the triangle formed by the points $(1, 1)$, $(4, 5)$, and $(6, 2)$.\n\nb) Find the equation of the line passing through the point $(3, 4)$ and perpendicular to the line $2x - 3y + 5 = 0$."
         : "a) Intermediate problem 1 related to " +
           topic.toLowerCase() +
           "\n\nb) Intermediate problem 2 related to " +
           topic.toLowerCase()
   }

3. **Advanced Level**:
   
   ${
     topic === "Quadratic Equations"
       ? "a) If $\\alpha$ and $\\beta$ are the roots of the equation $ax^2 + bx + c = 0$, find the equation whose roots are $\\frac{1}{\\alpha}$ and $\\frac{1}{\\beta}$.\n\nb) For what value of $p$ will the equation $x^2 + px + 16 = 0$ have roots whose difference is 8?"
       : topic === "Coordinate Geometry"
         ? "a) Find the locus of a point that moves such that the sum of its distances from the points $(3, 4)$ and $(-1, 2)$ is always 10 units.\n\nb) Find the equation of the circle passing through the points $(1, 2)$, $(3, 4)$, and $(5, 6)$."
         : "a) Advanced problem 1 related to " +
           topic.toLowerCase() +
           "\n\nb) Advanced problem 2 related to " +
           topic.toLowerCase()
   }

4. **Word Problem**:
   
   ${
     topic === "Quadratic Equations"
       ? "The product of two consecutive positive integers is 156. Find the integers."
       : topic === "Coordinate Geometry"
         ? "A rectangle has vertices at $(0, 0)$, $(a, 0)$, $(a, b)$, and $(0, b)$, where $a$ and $b$ are positive. If the area of the rectangle is 24 square units and its perimeter is 20 units, find the values of $a$ and $b$."
         : "Word problem related to " + topic.toLowerCase()
   }

5. **CBSE Exam-Style Question**:
   
   ${
     topic === "Quadratic Equations"
       ? "a) Solve for $x$: $\\frac{1}{x-1} + \\frac{1}{x-2} = \\frac{5}{x-1} - \\frac{2}{x-2}$\n\nb) The sum of a number and its reciprocal is $\\frac{10}{3}$. Find the number."
       : topic === "Coordinate Geometry"
         ? "a) Show that the points $(3, 0)$, $(6, 4)$, and $(10, 3)$ are the vertices of a right-angled triangle.\n\nb) Find the ratio in which the line joining the points $(2, -3)$ and $(5, 6)$ is divided by the $x$-axis."
         : "CBSE exam-style question related to " + topic.toLowerCase()
   }

Would you like me to provide solutions to any of these problems or explain any specific concept in more detail?`,
      timestamp: new Date(date),
    })

    return messages
  } catch (error) {
    console.error("Error generating chat for date:", error)
    return []
  }
}

export default function MathematicsLearningPage() {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get("date")

  // State for messages
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages based on date parameter or default welcome message
  useEffect(() => {
    if (dateParam) {
      const historicalMessages = generateSampleChatForDate(dateParam)
      setMessages(historicalMessages)
    } else {
      setMessages([
        {
          id: "welcome",
          type: "ai",
          content: `# Welcome to Mathematics Learning!

I'm your Mathematics learning assistant. I can help you with:

- Number Systems (Real Numbers, Complex Numbers)
- Algebra (Polynomials, Quadratic Equations, Arithmetic Progressions)
- Coordinate Geometry
- Trigonometry
- Calculus (Limits, Derivatives, Integrals)
- Statistics and Probability
- Vectors and 3D Geometry
- Mathematical Reasoning

What topic would you like to learn about today?`,
          timestamp: new Date(),
        },
      ])
    }
  }, [dateParam]) // This will re-run whenever dateParam changes

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response after a short delay
    setTimeout(() => {
      const newAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: generateMathematicsResponse(inputValue),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newAIMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateMathematicsResponse = (query: string) => {
    // Simple logic to generate responses based on keywords in the query
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("quadratic") || lowerQuery.includes("equation")) {
      return `## Quadratic Equations

A quadratic equation has the form $ax^2 + bx + c = 0$ where $a ≠ 0$.

### Methods to Solve Quadratic Equations

1. **Factorization Method**
   - Find factors of $c$ whose sum is $b$
   - Example: $x^2 + 5x + 6 = 0$
   - Factors of 6 that sum to 5 are 2 and 3
   - $(x + 2)(x + 3) = 0$
   - $x = -2$ or $x = -3$

2. **Quadratic Formula**
   - $x = \\frac{-b ± \\sqrt{b^2 - 4ac}}{2a}$
   - Example: $2x^2 - 5x + 2 = 0$
   - $a = 2$, $b = -5$, $c = 2$
   - $x = \\frac{5 ± \\sqrt{25 - 16}}{4} = \\frac{5 ± 3}{4}$
   - $x = 2$ or $x = \\frac{1}{2}$

3. **Completing the Square**
   - Rearrange to $(x + \\frac{b}{2a})^2 = \\frac{b^2 - 4ac}{4a^2}$
   - Example: $x^2 - 6x + 8 = 0$
   - $(x - 3)^2 = 9 - 8 = 1$
   - $x - 3 = ±1$
   - $x = 4$ or $x = 2$

### Nature of Roots

The discriminant $b^2 - 4ac$ determines:
- If $b^2 - 4ac > 0$: Two distinct real roots
- If $b^2 - 4ac = 0$: One real root (repeated)
- If $b^2 - 4ac < 0$: No real roots (complex roots)

Would you like to try some practice problems?`
    } else if (lowerQuery.includes("coordinate") || lowerQuery.includes("geometry")) {
      return `## Coordinate Geometry

Coordinate geometry uses algebraic equations to represent geometric shapes.

### Distance Formula

The distance between points $(x_1, y_1)$ and $(x_2, y_2)$ is:
$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$

Example: Distance between $(3, 4)$ and $(6, 8)$
$d = \\sqrt{(6 - 3)^2 + (8 - 4)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$

### Section Formula

Point $P$ dividing line segment $AB$ in ratio $m:n$ has coordinates:
$P = (\\frac{mx_2 + nx_1}{m + n}, \\frac{my_2 + ny_1}{m + n})$

Example: Point dividing $(2, 3)$ and $(6, 7)$ in ratio $1:2$
$x = \\frac{1 × 6 + 2 × 2}{1 + 2} = \\frac{6 + 4}{3} = \\frac{10}{3}$
$y = \\frac{1 × 7 + 2 × 3}{1 + 2} = \\frac{7 + 6}{3} = \\frac{13}{3}$

### Area of Triangle

Area of triangle with vertices $(x_1, y_1)$, $(x_2, y_2)$, $(x_3, y_3)$ is:
$Area = \\frac{1}{2}|x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)|$

### Equation of Line

1. **Slope-Intercept Form**: $y = mx + c$
2. **Point-Slope Form**: $y - y_1 = m(x - x_1)$
3. **Two-Point Form**: $\\frac{y - y_1}{y_2 - y_1} = \\frac{x - x_1}{x_2 - x_1}$

Would you like to see more examples or practice problems?`
    } else if (lowerQuery.includes("trigonometry") || lowerQuery.includes("sin") || lowerQuery.includes("cos")) {
      return `## Trigonometry

Trigonometry studies relationships between angles and sides of triangles.

### Basic Trigonometric Ratios

In a right-angled triangle with angle $θ$:
- $\\sin θ = \\frac{Opposite}{Hypotenuse}$
- $\\cos θ = \\frac{Adjacent}{Hypotenuse}$
- $\\tan θ = \\frac{Opposite}{Adjacent} = \\frac{\\sin θ}{\\cos θ}$
- $\\csc θ = \\frac{1}{\\sin θ}$
- $\\sec θ = \\frac{1}{\\cos θ}$
- $\\cot θ = \\frac{1}{\\tan θ}$

### Trigonometric Identities

1. **Pythagorean Identities**:
   - $\\sin^2 θ + \\cos^2 θ = 1$
   - $1 + \\tan^2 θ = \\sec^2 θ$
   - $1 + \\cot^2 θ = \\csc^2 θ$

2. **Sum and Difference Formulas**:
   - $\\sin(A + B) = \\sin A \\cos B + \\cos A \\sin B$
   - $\\sin(A - B) = \\sin A \\cos B - \\cos A \\sin B$
   - $\\cos(A + B) = \\cos A \\cos B - \\sin A \\sin B$
   - $\\cos(A - B) = \\cos A \\cos B + \\sin A \\sin B$

3. **Double Angle Formulas**:
   - $\\sin 2A = 2\\sin A \\cos A$
   - $\\cos 2A = \\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$

### Values of Trigonometric Functions

| Angle | $0°$ | $30°$ | $45°$ | $60°$ | $90°$ |
|-------|------|-------|-------|-------|-------|
| $\\sin θ$ | 0 | $\\frac{1}{2}$ | $\\frac{1}{\\sqrt{2}}$ | $\\frac{\\sqrt{3}}{2}$ | 1 |
| $\\cos θ$ | 1 | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{\\sqrt{2}}$ | $\\frac{1}{2}$ | 0 |
| $\\tan θ$ | 0 | $\\frac{1}{\\sqrt{3}}$ | 1 | $\\sqrt{3}$ | Undefined |

Would you like to see some trigonometric problems?`
    } else {
      return `Thank you for your question about mathematics.

Mathematics is a powerful tool for understanding the world around us. To improve your mathematical skills, I recommend:

1. **Master the Fundamentals**: Ensure you have a solid understanding of basic concepts before moving to advanced topics
2. **Practice Regularly**: Mathematics requires consistent practice to develop problem-solving skills
3. **Understand, Don't Memorize**: Focus on understanding concepts rather than memorizing formulas
4. **Solve Varied Problems**: Expose yourself to different types of problems to build versatility
5. **Review Mistakes**: Learn from errors by analyzing where and why you went wrong

Is there a specific area of mathematics you'd like to focus on? I can provide more targeted guidance on algebra, geometry, calculus, or any other mathematical topic you're interested in.`
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    })
  }

  const handleSpeak = (content: string) => {
    // Text-to-speech functionality would be implemented here
    toast({
      title: "Coming Soon",
      description: "Text-to-speech functionality will be implemented soon.",
    })
  }

  const handleFeedback = (isPositive: boolean) => {
    // Feedback functionality would be implemented here
    toast({
      title: "Feedback Recorded",
      description: `Thank you for your ${isPositive ? "positive" : "negative"} feedback.`,
    })
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className={message.type === "ai" ? "bg-brand-coral/20" : "bg-brand-navy/20"}>
                    <AvatarFallback>{message.type === "ai" ? "AI" : "You"}</AvatarFallback>
                    {message.type === "ai" && (
                      <AvatarImage
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-2QLEZpPlECWtj3bIM6kVOkaj25Bmai.png"
                        alt="Sahasra AI"
                      />
                    )}
                  </Avatar>

                  <Card className={`p-4 ${message.type === "user" ? "bg-brand-navy text-white" : "bg-white border"}`}>
                    {message.type === "user" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="space-y-4">
                        <ReactMarkdown
                          className="prose prose-sm max-w-none"
                          components={{
                            img: ({ node, ...props }) => (
                              <div className="my-4">
                                <img {...props} className="rounded-md max-w-full h-auto" alt={props.alt || "Image"} />
                              </div>
                            ),
                            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>

                        <div className="flex gap-2 justify-end pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(message.content)}
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSpeak(message.content)}
                            title="Listen"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleFeedback(false)} title="Not helpful">
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleFeedback(true)} title="Helpful">
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed input area */}
      <div className="border-t bg-white w-full">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about Mathematics..."
              className="min-h-[60px] pr-24 resize-none"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <Button variant="ghost" size="icon" title="Attach file" disabled={isLoading}>
                <Paperclip className="h-5 w-5 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" title="Voice input" disabled={isLoading}>
                <Mic className="h-5 w-5 text-gray-500" />
              </Button>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-brand-coral hover:bg-brand-coral/90 text-white"
                title="Send message"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
