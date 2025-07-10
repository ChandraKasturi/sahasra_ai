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

    // Topics for Social Science learning based on the date
    const topics = [
      "The Rise of Nationalism in Europe",
      "The Nationalist Movement in Indo-China",
      "Nationalism in India",
      "Resources and Development",
      "Forest and Wildlife Resources",
      "Democracy and Diversity",
      "Gender, Religion and Caste",
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
      content: `I'm preparing for my CBSE exams and need to understand the key points about ${topic.toLowerCase()}. Can you explain the main concepts?`,
      timestamp: new Date(date),
    })

    // Detailed AI response
    let aiResponse = ""

    switch (topic) {
      case "Nationalism in India":
        aiResponse = `# Nationalism in India

Nationalism in India emerged as a response to colonial rule and developed into a mass movement that eventually led to India's independence. Let's explore the key concepts:

## The First World War and Khilafat Movement (1914-1919)

1. **Impact of World War I**:
   - Economic hardships: Increased taxes, prices, and forced recruitment
   - Political repression: Rowlatt Act of 1919 (indefinite detention without trial)

2. **Khilafat Movement**:
   - Led by Muhammad Ali and Shaukat Ali
   - Aimed to preserve the Ottoman Caliphate
   - Gandhi supported it to unite Hindus and Muslims

## Non-Cooperation Movement (1920-1922)

1. **Key Features**:
   - Boycott of foreign goods, schools, courts, and elections
   - Surrender of government titles and honors
   - Promotion of swadeshi (domestic goods)

2. **Participation**:
   - Urban middle class: Lawyers, students, merchants
   - Rural areas: Peasants and tribal groups
   - Workers: Factory workers and plantation laborers

3. **End of Movement**:
   - Chauri Chaura incident (1922): Violence against police
   - Gandhi withdrew the movement

## Civil Disobedience Movement (1930-1934)

1. **Salt March**:
   - Gandhi's 24-day march to Dandi (March-April 1930)
   - Breaking the Salt Law as symbolic defiance

2. **Participation**:
   - Rich peasants: Protested against depression and revenue demands
   - Poor peasants: Fought against zamindari taxes
   - Business classes: Supported due to protection against imports
   - Women: Participated in protests and picketing

3. **Government Response**:
   - Gandhi-Irwin Pact (1931)
   - Second Round Table Conference
   - Repression and arrests

## Quit India Movement (1942)

1. **Background**:
   - World War II context
   - Failure of Cripps Mission

2. **Nature of Movement**:
   - "Do or Die" call by Gandhi
   - Underground resistance
   - Parallel governments in some areas

3. **Significance**:
   - Last major movement before independence
   - Demonstrated mass support for independence

Would you like me to elaborate on any specific aspect of Indian nationalism?`
        break

      case "Democracy and Diversity":
        aiResponse = `# Democracy and Diversity

Democracy and diversity are interconnected concepts that shape modern societies. Let's explore the key concepts:

## Understanding Social Differences

1. **Origins of Social Differences**:
   - Birth and biological factors (gender, race)
   - Economic background (income, occupation)
   - Religion, culture, and language
   - Choices and preferences

2. **Types of Social Differences**:
   - **Overlapping differences**: When different social differences overlap (e.g., poor + female + religious minority)
   - **Cross-cutting differences**: When social differences cut across each other (e.g., rich and poor within same religion)

## Politics of Social Divisions

1. **How Social Divisions Affect Politics**:
   - Expression of social divisions in politics is normal and unavoidable
   - Can lead to political mobilization and representation
   - Can sometimes lead to conflict and violence

2. **Factors Determining Political Outcome**:
   - **People's perception**: How people see their identities
   - **Political leaders' response**: How political leaders raise demands
   - **Government's reaction**: How democratic governments handle demands

## Case Studies

1. **Northern Ireland**:
   - Conflict between Catholics and Protestants
   - Religious differences reinforced by economic and political differences
   - Good Friday Agreement (1998) as a power-sharing solution

2. **Belgium**:
   - Linguistic divisions between Dutch-speaking (Flemish) and French-speaking (Walloons)
   - Successful accommodation of diversity through constitutional amendments
   - Equal representation at all levels of government
   - Regional autonomy for linguistic groups

3. **India**:
   - Diverse society with multiple religions, languages, castes, and tribes
   - Democratic politics allows expression of social divisions
   - Constitutional provisions for minority rights and representation

## Democracy and Social Diversity

1. **Benefits of Democracy in Diverse Societies**:
   - Provides platform for peaceful negotiation
   - Ensures representation of different groups
   - Prevents majoritarianism
   - Accommodates differences through power-sharing

2. **Challenges**:
   - Balancing unity and diversity
   - Preventing social divisions from becoming violent
   - Ensuring fair representation for all groups

Would you like me to elaborate on any specific aspect of democracy and diversity?`
        break

      default:
        aiResponse = `# ${topic}

${topic} is an important topic in CBSE Social Science. Let's explore the key concepts:

## Historical Context

Understanding the historical background is crucial for comprehending ${topic.toLowerCase()}. This includes the social, political, and economic factors that influenced its development.

## Key Concepts

1. **Fundamental Principles**: The basic ideas and theories that form the foundation of ${topic.toLowerCase()}.

2. **Major Developments**: The significant events, movements, or changes related to ${topic.toLowerCase()}.

3. **Important Figures**: The key individuals who played crucial roles in shaping ${topic.toLowerCase()}.

4. **Impact and Legacy**: How ${topic.toLowerCase()} has influenced society, politics, or the environment.

## CBSE Examination Focus

For your CBSE exams, you should focus on:
- Understanding the chronology of events
- Analyzing cause-and-effect relationships
- Connecting historical events to contemporary issues
- Developing critical thinking about social and political processes
- Learning key terms and concepts

Would you like me to explain any specific aspect of ${topic.toLowerCase()} in more detail?`
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
      content: "That's really helpful! Can you give me some practice questions on this topic for my exam preparation?",
      timestamp: new Date(date),
    })

    // AI response with exercises
    messages.push({
      id: `${dateString}-6`,
      type: "ai",
      content: `I'm glad you found that helpful! Here are some practice questions on ${topic.toLowerCase()} to help with your exam preparation:

### Practice Questions:

1. **Multiple Choice Questions**:
   
   a) ${
     topic === "Nationalism in India"
       ? "Who led the Dandi March in 1930?\n   i) Jawaharlal Nehru\n   ii) Mahatma Gandhi\n   iii) Subhas Chandra Bose\n   iv) Sardar Vallabhbhai Patel"
       : "Which of the following best describes " +
         topic.toLowerCase() +
         "?\n   i) Option 1\n   ii) Option 2\n   iii) Option 3\n   iv) Option 4"
   }
   
   b) ${
     topic === "Democracy and Diversity"
       ? "Which country resolved its ethnic conflict through a power-sharing arrangement called the 'Good Friday Agreement'?\n   i) Belgium\n   ii) Sri Lanka\n   iii) Northern Ireland\n   iv) Yugoslavia"
       : "A key event related to " +
         topic.toLowerCase() +
         " was:\n   i) Event 1\n   ii) Event 2\n   iii) Event 3\n   iv) Event 4"
   }

2. **Short Answer Questions (3 marks)**:
   
   a) ${
     topic === "Nationalism in India"
       ? "Explain the significance of the Khilafat Movement in India's freedom struggle."
       : "Describe two main features of " + topic.toLowerCase() + "."
   }
   
   b) ${
     topic === "Democracy and Diversity"
       ? "Distinguish between overlapping and cross-cutting social differences with examples."
       : "Explain the impact of " + topic.toLowerCase() + " on modern society."
   }

3. **Long Answer Questions (5 marks)**:
   
   a) ${
     topic === "Nationalism in India"
       ? "Describe the various social groups that participated in the Civil Disobedience Movement and explain their motivations."
       : "Analyze the key developments in " + topic.toLowerCase() + " and their significance."
   }
   
   b) ${
     topic === "Democracy and Diversity"
       ? "How did Belgium and Sri Lanka deal with the challenge of cultural diversity? Which country was more successful and why?"
       : "Discuss the challenges and opportunities presented by " + topic.toLowerCase() + "."
   }

4. **Source-Based Question**:
   
   ${
     topic === "Nationalism in India"
       ? `Read the following extract and answer the questions that follow:

   "Gandhiji wished to arouse the people from their deep slumber of centuries. He wished to instill courage in place of fear, strength in place of weakness and self-confidence in place of dependence. He wanted the people to realize that the power of the British in India depended entirely on the cooperation of the Indians."

   i) What was Gandhiji's main goal according to the passage?
   ii) Which movement did Gandhi launch to achieve this goal?
   iii) How did Gandhi propose to challenge British authority?`
       : `Read the following extract and answer the questions that follow:

   "Social divisions of one kind or another exist in most countries. It is difficult to find a country which does not have some social divisions on the basis of races, religions, tribes, castes or language. But not all countries have the same level of social divisions."

   i) What are the common bases of social division mentioned in the passage?
   ii) Why do different countries have different levels of social division?
   iii) How can social divisions affect politics?`
   }

5. **Map-Based Question**:
   
   ${
     topic === "Nationalism in India"
       ? "On an outline map of India, mark and label the following:\n   i) Champaran - Site of Gandhi's first civil disobedience\n   ii) Dandi - Where Salt March ended\n   iii) Chauri Chaura - Site of violence that led to withdrawal of Non-Cooperation Movement"
       : "On an appropriate map, identify and label key locations related to " + topic.toLowerCase() + "."
   }

Would you like me to provide answers to any of these questions or explain any specific concept in more detail?`,
      timestamp: new Date(date),
    })

    return messages
  } catch (error) {
    console.error("Error generating chat for date:", error)
    return []
  }
}

export default function SocialScienceLearningPage() {
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
      setMessages(historicalMessages as Message[])
    } else {
      setMessages([
        {
          id: "welcome",
          type: "ai",
          content: `# Welcome to Social Science Learning!

I'm your Social Science learning assistant. I can help you with:

- History (Indian and World)
- Geography (Physical, Human, and Environmental)
- Political Science (Democracy, Government, and Rights)
- Economics (Development, Sectors, and Globalization)
- Disaster Management
- Map Skills and Analysis
- Source-based Questions

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
        content: generateSocialScienceResponse(inputValue),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newAIMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateSocialScienceResponse = (query: string) => {
    // Simple logic to generate responses based on keywords in the query
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("nationalism") || lowerQuery.includes("freedom") || lowerQuery.includes("independence")) {
      return `## Nationalism in India

Nationalism in India developed as a response to British colonialism. Here are the key movements:

### Non-Cooperation Movement (1920-22)
- **Led by**: Mahatma Gandhi
- **Features**: Boycott of foreign goods, government institutions, and titles
- **Participation**: Students, lawyers, workers, peasants
- **End**: Chauri Chaura incident (violence against police)

### Civil Disobedience Movement (1930-34)
- **Started with**: Salt March/Dandi March by Gandhi
- **Features**: Breaking Salt Law, boycott of foreign goods, non-payment of taxes
- **Participation**: Wider participation including women
- **Government Response**: Gandhi-Irwin Pact, Round Table Conferences

### Quit India Movement (1942)
- **Context**: World War II
- **Features**: "Do or Die" call by Gandhi, underground resistance
- **Significance**: Last major movement before independence

### Important Leaders
- Mahatma Gandhi, Jawaharlal Nehru, Sardar Patel, Subhas Chandra Bose

Would you like to know more about any specific movement or aspect?`
    } else if (
      lowerQuery.includes("democracy") ||
      lowerQuery.includes("diversity") ||
      lowerQuery.includes("social differences")
    ) {
      return `## Democracy and Diversity

Democracy and diversity are interconnected in modern societies:

### Social Differences
- **Types**: Birth-based (race, caste), chosen (religion, political views)
- **Overlapping differences**: When multiple differences align (e.g., poor + minority)
- **Cross-cutting differences**: When differences don't align (e.g., rich and poor in same religion)

### Politics of Social Divisions
- Social divisions reflected in politics is normal
- Outcome depends on:
  - How people perceive their identities
  - How political leaders raise demands
  - How government responds to these demands

### Case Studies
- **Belgium**: Successful accommodation of linguistic diversity
  - Equal representation for Dutch and French speakers
  - Regional autonomy

- **Sri Lanka**: Majoritarian policies led to civil war
  - Sinhala-only policy marginalized Tamils
  - Lack of power-sharing

### Democracy's Role
- Provides platform for negotiation
- Prevents majoritarianism through power-sharing
- Ensures representation for diverse groups

Would you like to explore any of these aspects in more detail?`
    } else if (
      lowerQuery.includes("geography") ||
      lowerQuery.includes("resources") ||
      lowerQuery.includes("development")
    ) {
      return `## Resources and Development

Resources are essential for economic development and human welfare:

### Types of Resources
- **Natural**: Land, water, minerals, forests
- **Human-made**: Buildings, machinery, technology
- **Human**: Knowledge, skills, abilities

### Resource Classification
- **Renewability**: Renewable vs. Non-renewable
- **Ownership**: Individual, Community, National, International
- **Development Status**: Developed, Potential, Stock, Reserves

### Resource Conservation
- **Sustainable Development**: Meeting present needs without compromising future generations
- **Methods**: Reduce, Reuse, Recycle
- **Conservation Initiatives**: Chipko Movement, Joint Forest Management

### Land Resources in India
- **Land Use Pattern**: Agriculture, forests, pastures, non-agricultural uses
- **Land Degradation**: Soil erosion, desertification, waterlogging
- **Soil Types**: Alluvial, Black, Red, Laterite, Arid, Forest

### Water Resources
- **Distribution**: Rivers, lakes, groundwater
- **Issues**: Water scarcity, pollution, unequal access
- **Conservation**: Rainwater harvesting, watershed management

Would you like to learn more about any specific aspect of resources and development?`
    } else {
      return `Thank you for your question about social science.

Social Science is a broad field that helps us understand human society and relationships. It includes history, geography, political science, economics, and sociology. To improve your understanding of social science concepts, I recommend:

1. **Connect Past and Present**: Understand how historical events influence current situations
2. **Analyze Multiple Perspectives**: Look at issues from different viewpoints
3. **Use Maps and Data**: Practice interpreting maps, charts, and statistics
4. **Make Connections**: See how different social science disciplines relate to each other
5. **Apply Concepts**: Connect theoretical concepts to real-world examples

Is there a specific area of social science you'd like to focus on? I can provide more targeted guidance on history, geography, political science, economics, or any other social science discipline you're interested in.`
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
              placeholder="Ask anything about Social Science..."
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
