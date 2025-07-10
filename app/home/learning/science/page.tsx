"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Copy, ThumbsUp, ThumbsDown, Volume2, Send, Mic, Paperclip, Loader2, ChevronLeft, FileText, Calendar, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import ReactMarkdown from "react-markdown"
import { toast } from "@/components/ui/use-toast"
import { getAuthToken } from "@/lib/auth"
import { buildApiUrl, API_ENDPOINTS } from "@/lib/config"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { parse, format, addDays, subDays, isValid } from "date-fns"

// Define the Message type
type Message = {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

// Sample chat data for each date
const generateSampleChatForDate = (dateString: string): Message[] => {
  try {
    const date = parse(dateString, "dd-MMM-yy", new Date())

    // Topics for Science learning based on the date
    const topics = [
      "Chemical Reactions and Equations",
      "Acids, Bases and Salts",
      "Metals and Non-metals",
      "Carbon and its Compounds",
      "Periodic Classification of Elements",
      "Life Processes",
      "Control and Coordination",
    ]

    // Use the date to determine which topic (consistent for the same date)
    const dayOfMonth = date.getDate()
    const topicIndex = dayOfMonth % topics.length
    const topic = topics[topicIndex]

    // Generate a conversation about the topic
    const messages: Message[] = []

    // Initial user question
    messages.push({
      id: `${dateString}-1`,
      type: "user",
      content: `Can you help me learn about ${topic.toLowerCase()}?`,
      timestamp: new Date(date),
    })

    // AI response
    messages.push({
      id: `${dateString}-2`,
      type: "ai",
      content: `I'd be happy to help you with ${topic.toLowerCase()}! What specific aspects would you like to focus on today?`,
      timestamp: new Date(date),
    })

    // Follow-up user question
    messages.push({
      id: `${dateString}-3`,
      type: "user",
      content: `I'm preparing for my CBSE exams and need to understand the basic concepts of ${topic.toLowerCase()}. Can you explain the key points?`,
      timestamp: new Date(date),
    })

    // Detailed AI response
    let aiResponse = ""

    switch (topic) {
      case "Chemical Reactions and Equations":
        aiResponse = `# Chemical Reactions and Equations

Chemical reactions involve the transformation of reactants into products with different properties. Let's explore the key concepts:

## Types of Chemical Reactions

1. **Combination Reaction**: Two or more substances combine to form a single product.
   - Example: C + O₂ → CO₂

2. **Decomposition Reaction**: A single compound breaks down into two or more simpler substances.
   - Example: 2H₂O → 2H₂ + O₂

3. **Displacement Reaction**: A more reactive element displaces a less reactive element from its compound.
   - Example: Zn + CuSO₄ → ZnSO₄ + Cu

4. **Double Displacement Reaction**: Exchange of ions between two compounds.
   - Example: AgNO₃ + NaCl → AgCl + NaNO₃

5. **Redox Reaction**: Involves transfer of electrons (oxidation and reduction).
   - Example: 2Mg + O₂ → 2MgO

## Balancing Chemical Equations

Chemical equations must be balanced to satisfy the law of conservation of mass. This means the number of atoms of each element must be equal on both sides of the equation.

Steps to balance an equation:
1. Count the atoms of each element on both sides
2. Add coefficients to balance the atoms
3. Check that all atoms are balanced

Example:
Unbalanced: H₂ + O₂ → H₂O
Balanced: 2H₂ + O₂ → 2H₂O

## Effects of Oxidation in Daily Life

1. **Corrosion**: Metals react with oxygen, water, and other substances to form oxides (e.g., rust on iron).
2. **Rancidity**: Oxidation of fats and oils in food, causing unpleasant smell and taste.

Would you like to practice balancing some chemical equations or learn more about a specific type of reaction?`
        break

      case "Life Processes":
        aiResponse = `# Life Processes

Life processes are the basic functions performed by living organisms to maintain their life. Let's explore the key concepts:

## Nutrition

1. **Autotrophic Nutrition**: Organisms make their own food (e.g., plants through photosynthesis)
   - Photosynthesis: 6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂
   - Takes place in chloroplasts containing chlorophyll

2. **Heterotrophic Nutrition**: Organisms depend on others for food (e.g., animals)
   - Types: Holozoic (humans, most animals), Parasitic (tapeworm), Saprophytic (fungi)

## Respiration

1. **Aerobic Respiration**: Requires oxygen
   - Glucose + Oxygen → Carbon dioxide + Water + Energy
   - C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy (ATP)

2. **Anaerobic Respiration**: Occurs without oxygen
   - In muscles: Glucose → Lactic acid + Energy
   - In yeast: Glucose → Ethanol + CO₂ + Energy

## Transportation

1. **In Humans**: Blood circulatory system
   - Heart: Four-chambered pump
   - Blood vessels: Arteries, veins, capillaries
   - Blood components: RBCs, WBCs, platelets, plasma

2. **In Plants**: Xylem and phloem
   - Xylem: Transports water and minerals (root to leaves)
   - Phloem: Transports food (leaves to other parts)

## Excretion

1. **In Humans**: Removal of nitrogenous wastes
   - Kidneys: Filter blood and form urine
   - Lungs: Remove CO₂
   - Skin: Removes water and salts through sweat

2. **In Plants**:
   - Gaseous waste (O₂ during photosynthesis, CO₂ during respiration) through stomata
   - Other wastes stored in leaves that fall off

Would you like to explore any of these processes in more detail?`
        break

      default:
        aiResponse = `# ${topic}

${topic} is an important topic in CBSE Class 10 Science. Let's explore the key concepts:

## Basic Principles

${topic} involves understanding fundamental scientific principles that help explain natural phenomena and processes. These concepts form the foundation for more advanced studies in science.

## Key Concepts

1. **Fundamental Definitions**: Understanding the basic terminology and definitions related to ${topic.toLowerCase()}.

2. **Core Processes**: Learning about the essential processes and mechanisms involved in ${topic.toLowerCase()}.

3. **Practical Applications**: Exploring how ${topic.toLowerCase()} applies to real-world situations and technologies.

4. **Experimental Evidence**: Examining the experimental basis for our understanding of ${topic.toLowerCase()}.

## CBSE Examination Focus

For your CBSE exams, you should focus on:
- Clear understanding of definitions and terminology
- Ability to explain processes with proper scientific reasoning
- Knowledge of relevant examples and applications
- Skill in solving numerical problems (if applicable)
- Drawing and labeling diagrams correctly (if applicable)

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
      content: "That's really helpful! Can you give me some practice questions on this topic?",
      timestamp: new Date(date),
    })

    // AI response with exercises
    messages.push({
      id: `${dateString}-6`,
      type: "ai",
      content: `I'm glad you found that helpful! Here are some practice questions on ${topic.toLowerCase()}:

### Practice Questions:

1. **Multiple Choice Questions**:
   
   a) ${
     topic === "Chemical Reactions and Equations"
       ? "Which of the following is an example of a combination reaction?\n   i) CaO + H₂O → Ca(OH)₂\n   ii) 2H₂O → 2H₂ + O₂\n   iii) Zn + CuSO₄ → ZnSO₄ + Cu\n   iv) AgNO₃ + NaCl → AgCl + NaNO₃"
       : "Which statement best describes " +
         topic.toLowerCase() +
         "?\n   i) Option 1\n   ii) Option 2\n   iii) Option 3\n   iv) Option 4"
   }
   
   b) ${
     topic === "Life Processes"
       ? "The process by which plants make their own food is called:\n   i) Respiration\n   ii) Photosynthesis\n   iii) Transpiration\n   iv) Excretion"
       : "A key characteristic of " +
         topic.toLowerCase() +
         " is:\n   i) Characteristic 1\n   ii) Characteristic 2\n   iii) Characteristic 3\n   iv) Characteristic 4"
   }

2. **Short Answer Questions**:
   
   a) ${
     topic === "Chemical Reactions and Equations"
       ? "Balance the following chemical equation: Fe + H₂O → Fe₃O₄ + H₂"
       : "Explain the main principle behind " + topic.toLowerCase() + " with an example."
   }
   
   b) ${
     topic === "Life Processes"
       ? "Differentiate between aerobic and anaerobic respiration."
       : "Describe two practical applications of " + topic.toLowerCase() + " in everyday life."
   }

3. **Long Answer Questions**:
   
   a) ${
     topic === "Chemical Reactions and Equations"
       ? "Explain the different types of chemical reactions with examples of each."
       : "Describe the key processes involved in " + topic.toLowerCase() + " and explain their significance."
   }
   
   b) ${
     topic === "Life Processes"
       ? "Explain the process of nutrition in humans, from ingestion to absorption of nutrients."
       : "Discuss the theoretical framework of " + topic.toLowerCase() + " and how it has evolved over time."
   }

4. **Diagram-Based Question**:
   
   ${
     topic === "Life Processes"
       ? "Draw a labeled diagram of the human digestive system and explain the function of any three digestive glands."
       : topic === "Chemical Reactions and Equations"
         ? "Draw a diagram showing the experimental setup to prove that iron rusts due to both air and moisture."
         : "Draw a labeled diagram related to " + topic.toLowerCase() + " and explain its key components."
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

// Function to fetch chat history from the API
const fetchChatHistory = async (currentDate: Date, page: number = 1): Promise<{ messages: Message[], hasMore: boolean, currentPage: number }> => {
  try {
    // Format current date as YYYY-MM-DD
    const formattedDate = format(currentDate, "yyyy-MM-dd");
    console.log("[ScienceLearningPage] fetchChatHistory date param:", formattedDate);
    
    // Get authentication token
    const authToken = getAuthToken();
    
    // Make API request with pagination using current chat date
    const response = await fetch(buildApiUrl(`${API_ENDPOINTS.GET_HISTORY}/science?time=${formattedDate}&page=${page}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-auth-session": authToken || ""
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Handle paginated response structure
    const historyItems = data.history || [];
    const hasMore = data.has_more || false;
    const currentPage = data.page || page;
    
    if (historyItems.length === 0) {
      return { messages: [], hasMore, currentPage };
    }
    
    // Group messages by session_id
    const sessionGroups: { [key: string]: Array<{
      message: string;
      is_ai: boolean;
      time: string;
    }> } = {};
    
    // Group messages by session
    historyItems.forEach((item: {
      message: string;
      is_ai: boolean;
      time: string;
      session_id: string;
    }) => {
      if (!sessionGroups[item.session_id]) {
        sessionGroups[item.session_id] = [];
      }
      sessionGroups[item.session_id].push(item);
    });
    
    // Convert grouped messages to Message[] format
    const formattedMessages: Message[] = [];
    
    // Process each session
    Object.values(sessionGroups).forEach(session => {
      // Sort messages by time within session
      const sortedSession = session.sort((a, b) => 
        new Date(a.time).getTime() - new Date(b.time).getTime()
      );
      
      // Convert each message in the session to Message type
      sortedSession.forEach(item => {
        formattedMessages.push({
          id: new Date(item.time).getTime().toString(),
          type: item.is_ai ? "ai" : "user",
          content: item.message,
          timestamp: new Date(item.time)
        });
      });
    });
    
    // Sort all messages chronologically: oldest first, newest last
    formattedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return { messages: formattedMessages, hasMore, currentPage };
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return { messages: [], hasMore: false, currentPage: page };
  }
};

export default function ScienceLearningPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State for messages
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [includePdfs, setIncludePdfs] = useState(false)
  
  const getInitialDate = () => {
    const dateParam = searchParams.get("date")
    if (dateParam) {
      const parsedDate = parse(dateParam, "yyyy-MM-dd", new Date())
      if (isValid(parsedDate)) {
        return parsedDate
      }
    }
    return new Date()
  }
  const [currentChatDate, setCurrentChatDate] = useState<Date>(getInitialDate())
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load real chat history from server on mount
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoadingHistory(true)
      try {
        const { messages: historyMessages, hasMore: moreAvailable, currentPage: page } = await fetchChatHistory(currentChatDate, 1)
        setCurrentPage(page)
        setHasMore(moreAvailable)
        
        if (historyMessages.length > 0) {
          setMessages(historyMessages)
        } else {
          // No history found, show empty state with suggestions
          setMessages([])
        }
      } catch (error) {
        console.error("Error loading messages:", error)
        setMessages([])
      } finally {
        setIsLoadingHistory(false)
      }
    }
    
    loadMessages()
  }, [currentChatDate])

  // Update URL when date changes
  useEffect(() => {
    const formattedDate = format(currentChatDate, "yyyy-MM-dd")
    router.replace(`${pathname}?date=${formattedDate}`, { scroll: false })
  }, [currentChatDate, pathname, router])

  // Load more messages function
  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    const nextPage = currentPage + 1

    try {
      const { messages: newMessages, hasMore: moreAvailable, currentPage: page } = await fetchChatHistory(currentChatDate, nextPage)
      setCurrentPage(page)
      setHasMore(moreAvailable)
      
      if (newMessages.length > 0) {
        // Prepend older messages to existing ones (since we're loading older history)
        setMessages(prevMessages => [...newMessages, ...prevMessages])
      }
    } catch (error) {
      console.error("Error loading more messages:", error)
      toast({
        title: "Error",
        description: "Failed to load more messages. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Handle date changes
  const handleDateChange = (days: number) => {
    setCurrentChatDate(prevDate => days > 0 ? addDays(prevDate, days) : subDays(prevDate, Math.abs(days)));
  }

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async () => {
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

    try {
      // Get authentication token
      const authToken = getAuthToken()
      
      // Call the server API
      const response = await fetch(buildApiUrl("api/learn/science"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-session": authToken || ""
        },
        body: JSON.stringify({
          question: inputValue,
          include_pdfs: includePdfs
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      
      const newAIMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.answer,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newAIMessage])
    } catch (error) {
      console.error("Error fetching response:", error)
      
      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Failed to get a response from the server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/30">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-6">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Load More Button - Show at top when there are more messages */}
            {hasMore && !isLoadingHistory && (
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={loadMoreMessages}
                  disabled={isLoadingMore}
                  className="bg-white/70 hover:bg-white border-green-200 shadow-sm"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Load previous messages
                    </>
                  )}
                </Button>
              </div>
            )}

            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg mb-4">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <p className="text-slate-600 font-medium">Loading your conversation...</p>
              </div>
            ) : messages.length === 0 && !isLoading ? (
              // Show initial AI message instead of empty card
              <div className="space-y-6">
                <div className="flex justify-start">
                  <Card className="max-w-[85%] shadow-lg border-0 bg-white/90 backdrop-blur-sm text-slate-800 border-slate-200">
                    <div className="p-5">
                      <div className="prose prose-sm max-w-none">
                        <p className="mb-3 last:mb-0 leading-relaxed">
                          Hello! 👋 I'm your Science learning companion.
                        </p>
                        <p className="mb-3 last:mb-0 leading-relaxed">
                          I'm here to help you explore the fascinating world of science - from chemistry and physics to biology and beyond. Whether you're studying for exams or just curious about how things work, I'm ready to guide you through any scientific concept.
                        </p>
                        <p className="mb-0 font-semibold">
                          What would you like to learn about today?
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 text-slate-500">
                        <span className="text-sm font-medium">
                          {format(new Date(), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Suggestion prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                  {[
                    "Explain photosynthesis", 
                    "What are chemical reactions?",
                    "How does the digestive system work?",
                    "Tell me about gravity"
                  ].map(prompt => (
                    <Button 
                      key={prompt}
                      variant="outline" 
                      className="text-green-600 border-green-200 hover:bg-green-50 h-auto py-4 px-4 text-sm font-medium bg-white/70"
                      onClick={() => {
                        // Add user message
                        const userMessage = {
                          id: `user-${Date.now()}`,
                          type: "user" as const,
                          content: prompt,
                          timestamp: new Date(),
                        };
                        setMessages([userMessage]);
                        
                        // Send message to AI
                        const sendPromptMessage = async () => {
                          setIsLoading(true);
                          const authToken = getAuthToken();
                          
                          try {
                            const response = await fetch(buildApiUrl("api/learn/science"), {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "x-auth-session": authToken || ""
                              },
                              body: JSON.stringify({
                                question: prompt,
                                include_pdfs: includePdfs
                              }),
                            });

                            if (!response.ok) {
                              throw new Error(`Server responded with status: ${response.status}`);
                            }

                            const data = await response.json();
                            
                            const newAIMessage = {
                              id: `ai-${Date.now()}`,
                              type: "ai" as const,
                              content: data.answer,
                              timestamp: new Date(),
                            };

                            setMessages(prevMessages => [...prevMessages, newAIMessage]);
                          } catch (error) {
                            console.error("Error fetching response:", error);
                            
                            const errorMessage = {
                              id: `ai-error-${Date.now()}`,
                              type: "ai" as const,
                              content: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
                              timestamp: new Date(),
                            };
                            
                            setMessages(prevMessages => [...prevMessages, errorMessage]);
                          } finally {
                            setIsLoading(false);
                          }
                        };
                        
                        sendPromptMessage();
                      }}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
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
              ))
            )}
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
              placeholder="Ask anything about Science..."
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
                variant={includePdfs ? "default" : "outline"}
                size="sm"
                onClick={() => setIncludePdfs(!includePdfs)}
                className={`flex-shrink-0 ${includePdfs ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                title={includePdfs ? "Exclude uploaded PDFs from answers" : "Include uploaded PDFs in answers"}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4 mr-1" />
                PDFs
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
