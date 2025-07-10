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

    // Topics for Hindi learning based on the date
    const topics = [
      "हिंदी व्याकरण",
      "हिंदी साहित्य",
      "कविता और काव्य",
      "निबंध लेखन",
      "पत्र लेखन",
      "कहानी लेखन",
      "मुहावरे और लोकोक्तियां",
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
      content: `क्या आप मुझे ${topic.toLowerCase()} के बारे में सिखा सकते हैं?`,
      timestamp: new Date(date),
    })

    // AI response
    messages.push({
      id: `${dateString}-2`,
      type: "ai",
      content: `मैं आपको ${topic.toLowerCase()} के बारे में सिखाने में खुशी होगी! आज आप किस विशेष पहलू पर ध्यान केंद्रित करना चाहेंगे?`,
      timestamp: new Date(date),
    })

    // Follow-up user question
    messages.push({
      id: `${dateString}-3`,
      type: "user",
      content: `मैं अपनी परीक्षाओं की तैयारी कर रहा हूं और मुझे अपने ${topic.toLowerCase()} कौशल में सुधार करने की आवश्यकता है। क्या आप मुझे बुनियादी अवधारणाओं को समझा सकते हैं?`,
      timestamp: new Date(date),
    })

    // Detailed AI response
    let aiResponse = ""

    switch (topic) {
      case "हिंदी व्याकरण":
        aiResponse = `हिंदी व्याकरण भाषा का आधार है। आइए कुछ महत्वपूर्ण अवधारणाओं पर चर्चा करें:

1. **वर्ण और वर्णमाला**:
   - स्वर: अ, आ, इ, ई, उ, ऊ, ऋ, ए, ऐ, ओ, औ
   - व्यंजन: क से ज्ञ तक
   - अयोगवाह: अं, अः

2. **शब्द भेद**:
   - संज्ञा: व्यक्ति, वस्तु, स्थान, भाव आदि के नाम (जैसे: राम, कुर्सी, दिल्ली, प्रेम)
   - सर्वनाम: संज्ञा के स्थान पर प्रयुक्त होने वाले शब्द (जैसे: मैं, तुम, वह, यह)
   - विशेषण: संज्ञा या सर्वनाम की विशेषता बताने वाले शब्द (जैसे: अच्छा, बुरा, लाल)
   - क्रिया: कार्य या भाव बताने वाले शब्द (जैसे: खाना, पढ़ना, सोना)

3. **वाक्य रचना**:
   - कर्ता + कर्म + क्रिया का क्रम
   - उदाहरण: "राम ने फल खाया।"

4. **काल**:
   - वर्तमान काल: जब कार्य वर्तमान में हो रहा हो
   - भूतकाल: जब कार्य पहले हो चुका हो
   - भविष्यकाल: जब कार्य आगे होगा

क्या आप इनमें से किसी विशेष विषय पर अधिक जानकारी चाहते हैं?`
        break

      case "हिंदी साहित्य":
        aiResponse = `हिंदी साहित्य का इतिहास बहुत समृद्ध है। आइए इसके मुख्य काल और प्रमुख रचनाकारों पर नज़र डालें:

1. **आदिकाल (वीरगाथा काल)**:
   - समय: 1050 ई. से 1375 ई. तक
   - प्रमुख रचनाकार: चंदबरदाई, जगनिक
   - प्रमुख रचनाएँ: पृथ्वीराज रासो, खुमान रासो

2. **भक्तिकाल (स्वर्ण युग)**:
   - समय: 1375 ई. से 1700 ई. तक
   - निर्गुण भक्ति धारा: कबीर, नानक, दादू, रैदास
   - सगुण भक्ति धारा: 
     - राम भक्ति शाखा: तुलसीदास, रामानंद
     - कृष्ण भक्ति शाखा: सूरदास, मीराबाई, रसखान

3. **रीतिकाल**:
   - समय: 1700 ई. से 1900 ई. तक
   - प्रमुख रचनाकार: बिहारी, केशवदास, घनानंद, पद्माकर
   - विशेषता: श्रृंगार रस की प्रधानता

4. **आधुनिक काल**:
   - भारतेंदु युग: भारतेंदु हरिश्चंद्र
   - द्विवेदी युग: महावीर प्रसाद द्विवेदी
   - छायावाद: जयशंकर प्रसाद, सूर्यकांत त्रिपाठी 'निराला', सुमित्रानंदन पंत, महादेवी वर्मा
   - प्रगतिवाद: नागार्जुन, त्रिलोचन
   - प्रयोगवाद: अज्ञेय
   - नई कविता: धर्मवीर भारती, केदारनाथ सिंह

क्या आप किसी विशेष काल या रचनाकार के बारे में अधिक जानना चाहते हैं?`
        break

      default:
        aiResponse = `${topic.toLowerCase()} हिंदी भाषा सीखने का एक महत्वपूर्ण हिस्सा है। आइए इसके कुछ मुख्य बिंदुओं पर चर्चा करें:

1. **मूल अवधारणाएँ**: 
   ${topic.toLowerCase()} की बुनियादी समझ आपको मजबूत नींव प्रदान करेगी।

2. **व्यावहारिक अनुप्रयोग**: 
   वास्तविक जीवन में ${topic.toLowerCase()} का उपयोग करना सीखना महत्वपूर्ण है।

3. **सामान्य चुनौतियाँ**: 
   कई छात्र ${topic.toLowerCase()} के कुछ पहलुओं में कठिनाई का अनुभव करते हैं, लेकिन अभ्यास से आप इन्हें दूर कर सकते हैं।

4. **प्रभावी रणनीतियाँ**: 
   ${topic.toLowerCase()} में सुधार के लिए कई सिद्ध तरीके हैं।

क्या आप इनमें से किसी बिंदु पर अधिक जानकारी चाहते हैं?`
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
      content: "यह बहुत उपयोगी है! क्या आप मुझे कुछ अभ्यास के लिए प्रश्न दे सकते हैं?",
      timestamp: new Date(date),
    })

    // AI response with exercises
    messages.push({
      id: `${dateString}-6`,
      type: "ai",
      content: `मुझे खुशी है कि आपको यह जानकारी उपयोगी लगी! यहां कुछ अभ्यास प्रश्न हैं:

### अभ्यास प्रश्न:

1. **पहचानें और सुधारें**:
   निम्नलिखित वाक्यों में त्रुटियों को पहचानें और सुधारें।
   - "राम ने खाना खाकर स्कूल गया"
   - "मेरे को यह किताब पसंद है"
   - "वह बहुत तेज़ दौड़ता"

2. **रिक्त स्थान भरें**:
   निम्नलिखित वाक्यों में उचित शब्द भरें:
   - मैं कल _______ (आया/आई) हूँ।
   - राम और श्याम _______ (खेलता है/खेलते हैं)।
   - वह _______ (अपना/अपनी) किताब लाई।

3. **वाक्य निर्माण**:
   निम्नलिखित शब्दों का उपयोग करके वाक्य बनाएँ:
   - विद्यालय, छात्र, परिश्रम
   - प्रकृति, सुंदरता, आनंद
   - मित्रता, विश्वास, जीवन

4. **अनुच्छेद लेखन**:
   अपनी पसंदीदा पुस्तक या फिल्म पर एक छोटा अनुच्छेद (5-6 वाक्य) लिखें, जिसमें स्पष्ट संगठन और उचित व्याकरण पर ध्यान दें।

क्या आप इन अभ्यासों को पूरा करने के बाद मुझे अपने उत्तर दिखाना चाहेंगे?`,
      timestamp: new Date(date),
    })

    return messages
  } catch (error) {
    console.error("Error generating chat for date:", error)
    return []
  }
}

export default function HindiLearningPage() {
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
          content: `# हिंदी सीखने में आपका स्वागत है!

मैं आपकी हिंदी सीखने में सहायता करने वाला सहायक हूँ। मैं आपकी इन विषयों में मदद कर सकता हूँ:

- हिंदी व्याकरण और वर्तनी
- शब्द भंडार विकास
- निबंध और पत्र लेखन
- पठन और समझ
- साहित्य विश्लेषण
- उच्चारण और बोलना
- परीक्षा की तैयारी

आज आप किस विषय के बारे में सीखना चाहेंगे?`,
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
        content: generateHindiResponse(inputValue),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, newAIMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateHindiResponse = (query: string) => {
    // Simple logic to generate responses based on keywords in the query
    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes("व्याकरण") || lowerQuery.includes("grammar")) {
      return `## हिंदी व्याकरण

हिंदी व्याकरण स्पष्ट संचार का आधार है। यहां कुछ मुख्य अवधारणाएं हैं:

### शब्द भेद
- **संज्ञा**: व्यक्ति, स्थान, वस्तु के नाम (जैसे: राम, दिल्ली, कुर्सी)
- **सर्वनाम**: संज्ञा के स्थान पर प्रयुक्त (जैसे: मैं, तुम, वह)
- **विशेषण**: संज्ञा की विशेषता बताने वाले (जैसे: अच्छा, लाल, बड़ा)
- **क्रिया**: कार्य बताने वाले शब्द (जैसे: खाना, पढ़ना, जाना)

### वाक्य रचना
- कर्ता + कर्म + क्रिया का क्रम
- उदाहरण: "राम ने फल खाया।"

क्या आप कुछ उदाहरणों के साथ अभ्यास करना चाहेंगे?`
    } else if (lowerQuery.includes("साहित्य") || lowerQuery.includes("literature")) {
      return `## हिंदी साहित्य

हिंदी साहित्य का इतिहास बहुत समृद्ध है। यहां प्रमुख काल और रचनाकार हैं:

### भक्तिकाल (स्वर्ण युग)
1. **निर्गुण भक्ति धारा**: कबीर, नानक, रैदास
2. **सगुण भक्ति धारा**: 
   - **राम भक्ति**: तुलसीदास (रामचरितमानस)
   - **कृष्ण भक्ति**: सूरदास (सूरसागर), मीराबाई

### आधुनिक काल
1. **छायावाद**: जयशंकर प्रसाद, निराला, पंत, महादेवी वर्मा
2. **प्रेमचंद युग**: मुंशी प्रेमचंद (गोदान, गबन)
3. **नई कविता**: अज्ञेय, मुक्तिबोध, नागार्जुन

क्या आप किसी विशेष काल या रचनाकार के बारे में अधिक जानना चाहेंगे?`
    } else if (lowerQuery.includes("लेखन") || lowerQuery.includes("writing")) {
      return `## हिंदी लेखन

हिंदी में लेखन कौशल विकसित करने के लिए यहां कुछ महत्वपूर्ण बिंदु हैं:

### निबंध लेखन
1. **प्रारूप**:
   - प्रस्तावना: विषय का परिचय
   - मुख्य भाग: विचारों का विस्तार
   - उपसंहार: निष्कर्ष और समापन

2. **निबंध के प्रकार**:
   - वर्णनात्मक
   - विचारात्मक
   - भावात्मक
   - कल्पनात्मक

### पत्र लेखन
1. **औपचारिक पत्र**: आवेदन, शिकायत, कार्यालयी
2. **अनौपचारिक पत्र**: मित्र, परिवार को

क्या आप किसी विशेष प्रकार के लेखन पर अभ्यास करना चाहेंगे?`
    } else {
      return `हिंदी सीखने के बारे में आपके प्रश्न के लिए धन्यवाद।

हिंदी भारत की सबसे अधिक बोली जाने वाली भाषाओं में से एक है, जिसका समृद्ध इतिहास और साहित्य है। अपने कौशल में सुधार के लिए, मैं निम्नलिखित सुझाव देता हूं:

1. **नियमित अभ्यास**: भाषा सीखने की कुंजी नियमित अभ्यास है
2. **विविध सामग्री पढ़ें**: हिंदी समाचार पत्र, पत्रिकाएं, कहानियां और कविताएं
3. **सुनना और बोलना**: हिंदी फिल्में, गाने और रेडियो कार्यक्रम सुनें
4. **व्याकरण पर ध्यान दें**: सही वाक्य संरचना और शब्द रूपों का अभ्यास करें

क्या आप हिंदी सीखने के किसी विशेष पहलू पर ध्यान केंद्रित करना चाहते हैं? मैं व्याकरण, शब्दावली, लेखन, या किसी अन्य क्षेत्र में अधिक विशिष्ट मार्गदर्शन प्रदान कर सकता हूं।`
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
      title: "क्लिपबोर्ड पर कॉपी किया गया",
      description: "सामग्री आपके क्लिपबोर्ड पर कॉपी कर दी गई है।",
    })
  }

  const handleSpeak = (content: string) => {
    // Text-to-speech functionality would be implemented here
    toast({
      title: "जल्द आ रहा है",
      description: "टेक्स्ट-टू-स्पीच सुविधा जल्द ही उपलब्ध होगी।",
    })
  }

  const handleFeedback = (isPositive: boolean) => {
    // Feedback functionality would be implemented here
    toast({
      title: "प्रतिक्रिया दर्ज की गई",
      description: `आपकी ${isPositive ? "सकारात्मक" : "नकारात्मक"} प्रतिक्रिया के लिए धन्यवाद।`,
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
                    <AvatarFallback>{message.type === "ai" ? "AI" : "आप"}</AvatarFallback>
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
              placeholder="हिंदी के बारे में कुछ भी पूछें..."
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
          <p className="text-xs text-gray-500 mt-2">भेजने के लिए Enter दबाएं, नई पंक्ति के लिए Shift+Enter</p>
        </div>
      </div>
    </div>
  )
}
