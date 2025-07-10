"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Copy, ThumbsUp, ThumbsDown, Volume2, Send, Mic, Paperclip, Loader2, Calendar, ChevronLeft, ChevronRight, FileText, BookOpen, MessageCircle } from "lucide-react"
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
import { format, parse, addDays, subDays, isValid } from "date-fns"
import { arrayBuffer } from "stream/consumers"

// Define the Message type
type Message = {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  conversation_id?: string // Optional: if your API uses conversation IDs
}

export default function EnglishLearningPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoadingResponse, setIsLoadingResponse] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    const fetchChatHistory = async () => {
      setIsLoadingHistory(true)
      setError(null)
      setMessages([])
      setCurrentPage(1)
      setHasMore(false)

      const authToken = getAuthToken()
      const formattedDate = format(currentChatDate, "yyyy-MM-dd")

      try {
        const response = await fetch(buildApiUrl(`${API_ENDPOINTS.GET_HISTORY}/english?time=${formattedDate}&page=1`), {
          headers: {
            "Content-Type": "application/json",
            ...(authToken && { "x-auth-session": authToken }),
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setMessages([])
            setHasMore(false)
          } else {
            throw new Error(`Failed to fetch chat history: ${response.status} ${response.statusText}`)
          }
        } else {
          const data = await response.json()
          
          // Handle paginated response structure
          const historyItems = data.history || []
          setHasMore(data.has_more || false)
          setCurrentPage(data.page || 1)

          if (historyItems.length === 0) {
            setMessages([])
            return
          }

          // Process messages similar to before but using the new structure
          const hasSessions = historyItems[0]?.session_id !== undefined
          let processedMessages: Message[]

          if (hasSessions) {
            const sessionGroups: { [key: string]: Array<any> } = {}
            historyItems.forEach((item: any) => {
              if (!sessionGroups[item.session_id]) {
                sessionGroups[item.session_id] = []
              }
              sessionGroups[item.session_id].push(item)
            })
            
            const tempFormattedMessages: Message[] = []
            Object.values(sessionGroups).forEach(session => {
              const sortedSession = session.sort((a, b) => 
                new Date(a.time || a.timestamp).getTime() - new Date(b.time || b.timestamp).getTime()
              )
              sortedSession.forEach(item => {
                tempFormattedMessages.push({
                  id: item.id || item._id || new Date(item.time || item.timestamp).getTime().toString(),
                  type: item.is_ai ? "ai" : "user",
                  content: item.message || item.content,
                  timestamp: new Date(item.time || item.timestamp),
                  conversation_id: item.session_id
                })
              })
            })
            processedMessages = tempFormattedMessages
          } else {
            processedMessages = historyItems.map((item: any) => ({
              id: item.id || item._id || new Date(item.time || item.timestamp).getTime().toString(),
              type: item.is_ai ? "ai" : "user",
              content: item.message || item.content,
              timestamp: new Date(item.time || item.timestamp),
            }))
          }
          
          // Sort messages chronologically: oldest first, newest last
          processedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          setMessages(processedMessages)
        }
      } catch (err: any) {
        console.error("Error fetching chat history:", err)
        setError(err.message || "An unexpected error occurred while fetching history.")
        setMessages([])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchChatHistory()
  }, [currentChatDate, router])
  
  useEffect(() => {
    const formattedDate = format(currentChatDate, "yyyy-MM-dd")
    router.replace(`${pathname}?date=${formattedDate}`, { scroll: false })
  }, [currentChatDate, pathname, router])

  // Load more messages function
  const loadMoreMessages = async () => {
    if (!hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    setError(null)

    const authToken = getAuthToken()
    const formattedDate = format(currentChatDate, "yyyy-MM-dd")
    const nextPage = currentPage + 1

    try {
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.GET_HISTORY}/english?time=${formattedDate}&page=${nextPage}`), {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "x-auth-session": authToken }),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch more chat history: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const historyItems = data.history || []
      setHasMore(data.has_more || false)
      setCurrentPage(data.page || nextPage)

      if (historyItems.length > 0) {
        // Process new messages
        const hasSessions = historyItems[0]?.session_id !== undefined
        let processedMessages: Message[]

        if (hasSessions) {
          const sessionGroups: { [key: string]: Array<any> } = {}
          historyItems.forEach((item: any) => {
            if (!sessionGroups[item.session_id]) {
              sessionGroups[item.session_id] = []
            }
            sessionGroups[item.session_id].push(item)
          })
          
          const tempFormattedMessages: Message[] = []
          Object.values(sessionGroups).forEach(session => {
            const sortedSession = session.sort((a, b) => 
              new Date(a.time || a.timestamp).getTime() - new Date(b.time || b.timestamp).getTime()
            )
            sortedSession.forEach(item => {
              tempFormattedMessages.push({
                id: item.id || item._id || new Date(item.time || item.timestamp).getTime().toString(),
                type: item.is_ai ? "ai" : "user",
                content: item.message || item.content,
                timestamp: new Date(item.time || item.timestamp),
                conversation_id: item.session_id
              })
            })
          })
          processedMessages = tempFormattedMessages
        } else {
          processedMessages = historyItems.map((item: any) => ({
            id: item.id || item._id || new Date(item.time || item.timestamp).getTime().toString(),
            type: item.is_ai ? "ai" : "user",
            content: item.message || item.content,
            timestamp: new Date(item.time || item.timestamp),
          }))
        }
        
        // Sort new messages chronologically
        processedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        
        // Prepend older messages to existing ones (since we're loading older history)
        setMessages(prevMessages => [...processedMessages, ...prevMessages])
      }
    } catch (err: any) {
      console.error("Error loading more messages:", err)
      setError(err.message || "An unexpected error occurred while loading more messages.")
      toast({ 
        title: "Error loading more messages", 
        description: err.message, 
        variant: "destructive" 
      })
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    const currentInput = inputMessage;
    setInputMessage("")
    setIsLoadingResponse(true)
    setError(null)

    const authToken = getAuthToken()

    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.LEARN_ENGLISH), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "x-auth-session": authToken }),
        },
        body: JSON.stringify({
          question: currentInput,
          include_pdfs: includePdfs
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status} ${response.statusText}`)
      }

      const aiMessageResponse = await response.json()
      
      setMessages((prevMessages) => [...prevMessages, { 
        id: aiMessageResponse.id || `ai-${Date.now()}`,
        type: "ai",
        content: aiMessageResponse.answer || aiMessageResponse.content,
        timestamp: new Date(aiMessageResponse.timestamp || Date.now()),
      }])
    } catch (err: any) {
      console.error("Error sending message:", err)
      setError(err.message || "An unexpected error occurred while sending the message.")
      setMessages(prev => prev.filter(m => m.id !== userMessage.id)); 
      setInputMessage(currentInput); 
      toast({ title: "Error sending message", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingResponse(false)
    }
  }
  
  const handleDateChange = (days: number) => {
    setCurrentChatDate(prevDate => days > 0 ? addDays(prevDate, days) : subDays(prevDate, Math.abs(days)));
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({ title: "Copied to clipboard!" })
  }

  // Ensure necessary imports are at the top of your file if not already:
// import { toast } from "@/components/ui/use-toast"; 
// import { getAuthToken } from "@/lib/auth"; 

const handleSpeak = async (content: string) => {
  const authToken = getAuthToken(); // Make sure getAuthToken is defined and imported

  if (!authToken) {
      // Make sure toast is defined and imported if you use it
      if (typeof toast === 'function') {
          toast({ title: "Authentication required for TTS", variant: "destructive" });
      } else {
          console.error("Authentication required for TTS (toast function not available)");
      }
      return;
  }

  // --- State Variables ---
  let audioContext: AudioContext | null = null;
  let scriptProcessor: ScriptProcessorNode | null = null;

  const audioChunkQueue: Float32Array[] = []; // Queue of decoded PCM data for playback
  let currentChunkIndex = 0; // Index of the PCM chunk currently being played from audioChunkQueue
  let samplesPlayedInCurrentChunk = 0; // Samples played from the current PCM chunk

  let isStreamFetchingComplete = false; // True when the server has sent all its data (reader.read() done)
  let hasAllLogicalWavsBeenProcessed = false; // True when all assembled logical WAVs are decoded & queued
  let isFinalSilencePlaying = false; // True when we are playing out the last bit of silence after all audio
  let finalSilenceSamplesPlayed = 0; // Counter for final silence

  const serverSampleRate = 24000; // Expected from WAV files
  let targetSampleRate = 44100; // Default, will be set by AudioContext

  let lastPlayedAudioSampleValue = 0.0; // For fading between actual audio and silence
  let intermediateSilenceSamplesPlayed = 0; // For fading when waiting for next chunk
  const FADE_DURATION_SAMPLES = 512; // Adjusted fade duration

  // Buffer for assembling logical WAVs from network chunks
  let networkDataBuffer = new Uint8Array(0);
  const RIFF_MARKER = new Uint8Array([0x52, 0x49, 0x46, 0x46]); // "RIFF" ASCII

  // --- Logging ---
  let statusLogInterval: NodeJS.Timeout | null = null;
  const startStatusLogging = () => {
      statusLogInterval = setInterval(() => {
          if (audioContext && !isFinalSilencePlaying && !hasAllLogicalWavsBeenProcessed) {
              console.log(
                  `TTS Status: AudioContext=${audioContext.state}, ` +
                  `QueueChunks=${audioChunkQueue.length}, CurrentPlayingChunkIdx=${currentChunkIndex}, ` +
                  `SamplesInCurrent=${samplesPlayedInCurrentChunk}/${audioChunkQueue[currentChunkIndex]?.length || 0}, ` +
                  `StreamFetchingDone=${isStreamFetchingComplete}, AllLogicalWavsProcessed=${hasAllLogicalWavsBeenProcessed}`
              );
          } else if (isFinalSilencePlaying) {
               console.log(`TTS Status: Playing final silence (${finalSilenceSamplesPlayed} samples)`);
          }
      }, 2000);
  };
  const stopStatusLogging = () => {
      if (statusLogInterval) clearInterval(statusLogInterval);
      statusLogInterval = null;
  };

  // --- Cleanup ---
  const cleanupAudioNodes = () => {
      console.log("Cleanup: Attempting to clean up audio nodes.");
      stopStatusLogging();
      if (scriptProcessor) {
          try {
              scriptProcessor.disconnect();
              scriptProcessor.onaudioprocess = null; // Important to remove the event listener
              console.log("Cleanup: ScriptProcessor disconnected.");
          } catch (e) {
              console.warn("Cleanup: Error disconnecting ScriptProcessor:", e);
          }
          scriptProcessor = null;
      }
      // Optionally close AudioContext if it's truly done for the page
      // if (audioContext && audioContext.state !== 'closed') {
      //     audioContext.close().then(() => console.log("Cleanup: AudioContext closed."))
      //         .catch(e => console.warn("Cleanup: Error closing AudioContext:", e));
      //     audioContext = null; // Ensure it's marked as null after attempting to close
      // }
  };
  
  // Function to signal all operations should stop
  const initiateFullStop = () => {
      console.log("Initiating full stop of audio playback and fetching.");
      isStreamFetchingComplete = true; 
      hasAllLogicalWavsBeenProcessed = true; 
      isFinalSilencePlaying = true; // This will trigger cleanup via onaudioprocess
      // If scriptProcessor might not run again (e.g. context closed), call cleanup directly
      if (!scriptProcessor || (audioContext && audioContext.state === 'closed')) {
          cleanupAudioNodes();
      }
  };

  // --- Main TTS Request ---
  try {
              const response = await fetch(buildApiUrl(API_ENDPOINTS.LEARN_TTS), {
          method: "POST",
          headers: { "X-Auth-Session": authToken, "Content-Type": "application/json" },
          body: JSON.stringify({ text: content }),
      });

      if (!response.ok) throw new Error(`TTS request failed: ${response.status} ${response.statusText}`);
      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      targetSampleRate = audioContext.sampleRate;
      
      const bufferSize = 4096; // Standard buffer size
      scriptProcessor = audioContext.createScriptProcessor(bufferSize, 0, 1); // Mono output

      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          if (!scriptProcessor || !audioContext) return; // Already cleaned up

          const outputBuffer = audioProcessingEvent.outputBuffer;
          const outputChannel = outputBuffer.getChannelData(0);

          for (let i = 0; i < outputBuffer.length; i++) {
              if (isFinalSilencePlaying) {
                  outputChannel[i] = 0;
                  finalSilenceSamplesPlayed++;
                  if (finalSilenceSamplesPlayed >= Math.floor(targetSampleRate * 0.5)) { // 0.5 seconds of silence
                      if (scriptProcessor) { // Check again before cleanup
                         console.log("Final silence period ended. Cleaning up audio nodes now.");
                         cleanupAudioNodes(); // This will set scriptProcessor to null
                      }
                      return; // Stop further processing in this callback for this event
                  }
                  continue; // Fill rest of this buffer with silence
              }

              // Try to play from the current chunk in the playback queue
              if (currentChunkIndex < audioChunkQueue.length) {
                  const currentPCMChunk = audioChunkQueue[currentChunkIndex];
                  if (samplesPlayedInCurrentChunk < currentPCMChunk.length) {
                      const sample = currentPCMChunk[samplesPlayedInCurrentChunk];
                      outputChannel[i] = sample;
                      lastPlayedAudioSampleValue = sample;
                      samplesPlayedInCurrentChunk++;
                      intermediateSilenceSamplesPlayed = 0; // Reset intermediate silence counter
                  } else {
                      // Finished current PCM chunk, advance to the next
                      currentChunkIndex++;
                      samplesPlayedInCurrentChunk = 0;
                      i--; // Crucial: Decrement i to re-process this output sample slot with the new chunk state
                      continue;
                  }
              } else {
                  // No more PCM chunks in the audioChunkQueue *right now*
                  if (hasAllLogicalWavsBeenProcessed) {
                      // All logical WAVs from server have been fetched AND processed (decoded & queued)
                      // AND all those queued PCM chunks have been played out. Start final silence.
                      console.log("All audio data processed and played from queue. Transitioning to final silence.");
                      isFinalSilencePlaying = true;
                      outputChannel[i] = 0; // Start final silence immediately for this sample
                      finalSilenceSamplesPlayed = 1; 
                      lastPlayedAudioSampleValue = 0; // Since we're moving to definitive silence
                  } else {
                      // Still waiting for more logical WAVs to be fetched/decoded or for the queue to populate
                      // Fade out current sound or play sustained silence if already faded
                      if (intermediateSilenceSamplesPlayed < FADE_DURATION_SAMPLES) {
                          const fadeRatio = intermediateSilenceSamplesPlayed / FADE_DURATION_SAMPLES;
                          outputChannel[i] = lastPlayedAudioSampleValue * (1 - fadeRatio);
                      } else {
                          outputChannel[i] = 0; // Sustained intermediate silence
                      }
                      intermediateSilenceSamplesPlayed++;
                  }
              }
          }
      };
      scriptProcessor.connect(audioContext.destination);

      // --- WAV Parsing Logic (using AudioContext.decodeAudioData with manual fallback) ---
      const parseFullWavSegment = async (wavSegmentArrayBuffer: ArrayBuffer): Promise<Float32Array> => {
          if (!audioContext) return new Float32Array(0); // Safety check
          try {
              // Ensure a fresh ArrayBuffer copy for decodeAudioData
              const bufferCopy = wavSegmentArrayBuffer.slice(0);
              const audioBuffer = await audioContext.decodeAudioData(bufferCopy);
              
              let pcmData = audioBuffer.getChannelData(0); // Assuming mono input from server WAVs
              if (audioBuffer.sampleRate !== targetSampleRate) {
                  pcmData = resampleAudio(pcmData, audioBuffer.sampleRate, targetSampleRate);
              }
              // console.log(`AudioContext decoded segment: ${pcmData.length} samples (orig SR: ${audioBuffer.sampleRate}Hz)`);
              return pcmData;
          } catch (e) {
              console.warn("AudioContext decode failed for assembled WAV segment, trying manual parse:", e);
              try {
                  return parseWavManually(new Uint8Array(wavSegmentArrayBuffer));
              } catch (manualError) {
                  console.error("Manual WAV parsing also failed for assembled WAV segment:", manualError);
                  return new Float32Array(0); // Return empty on double failure
              }
          }
      };
      
      const parseWavManually = (chunkBytes: Uint8Array): Float32Array => {
          // This is your robust manual WAV parser.
          // Ensure it correctly finds 'fmt ' and 'data' and handles sample conversion.
          try {
              const dataView = new DataView(chunkBytes.buffer, chunkBytes.byteOffset, chunkBytes.byteLength);
              if (chunkBytes.length < 44) throw new Error("ManualParse: Chunk too small for WAV header");
              if (new TextDecoder().decode(chunkBytes.slice(0, 4)) !== "RIFF") throw new Error("ManualParse: Invalid RIFF");
              if (new TextDecoder().decode(chunkBytes.slice(8, 12)) !== "WAVE") throw new Error("ManualParse: Invalid WAVE");

              let offset = 12;
              let audioSegmentSampleRate = serverSampleRate; // Default, can be overridden by fmt chunk
              let foundDataChunk = false;

              while (offset < chunkBytes.length - 8) { // -8 for chunk ID and size
                  const chunkId = new TextDecoder().decode(chunkBytes.slice(offset, offset + 4));
                  const chunkSize = dataView.getUint32(offset + 4, true); // Little-endian size
                  const chunkDataStart = offset + 8;

                  if (chunkId === "fmt ") {
                      const audioFormat = dataView.getUint16(chunkDataStart, true);
                      const numChannels = dataView.getUint16(chunkDataStart + 2, true);
                      audioSegmentSampleRate = dataView.getUint32(chunkDataStart + 4, true);
                      const bitsPerSample = dataView.getUint16(chunkDataStart + 14, true);
                      if (audioFormat !== 1 || numChannels !== 1 || bitsPerSample !== 16) {
                           throw new Error(`ManualParse: Unsupported WAV fmt. Format: ${audioFormat}, Channels: ${numChannels}, Bits: ${bitsPerSample}`);
                      }
                  } else if (chunkId === "data") {
                      foundDataChunk = true;
                      const dataPayloadSize = Math.min(chunkSize, chunkBytes.length - chunkDataStart);
                      const actualPcmDataSize = Math.floor(dataPayloadSize / 2) * 2; // Align to 16-bit samples
                      const numPcmSamples = actualPcmDataSize / 2;
                      const pcmSamples = new Float32Array(numPcmSamples);

                      for (let i = 0; i < numPcmSamples; i++) {
                          const bytePos = chunkDataStart + i * 2;
                          if (bytePos + 2 <= chunkBytes.length) { // Ensure we don't read past the end of chunkBytes
                              pcmSamples[i] = dataView.getInt16(bytePos, true) / 32768.0; // Signed 16-bit to float
                          } else {
                              console.warn("ManualParse: Attempted to read past buffer end in data chunk processing.");
                              break; 
                          }
                      }
                      
                      // console.log(`Manual WAV parsed ${numPcmSamples} samples at ${audioSegmentSampleRate}Hz`);
                      return (audioSegmentSampleRate !== targetSampleRate)
                          ? resampleAudio(pcmSamples, audioSegmentSampleRate, targetSampleRate)
                          : pcmSamples;
                  }
                  offset += 8 + chunkSize;
                  if (chunkSize % 2 === 1) offset++; // RIFF chunks are word-aligned (size includes padding byte if odd)
              }
              if (!foundDataChunk) throw new Error("ManualParse: No 'data' chunk found in WAV segment");
              return new Float32Array(0); // Should be unreachable if 'data' is always present
          } catch (error) {
              console.error("Critical error during manual WAV parsing:", error);
              throw error; // Re-throw to be caught by parseFullWavSegment
          }
      };

      const resampleAudio = (samples: Float32Array, fromRate: number, toRate: number): Float32Array => {
          if (fromRate === toRate) return samples;
          const ratio = toRate / fromRate;
          const newLength = Math.floor(samples.length * ratio);
          const resampled = new Float32Array(newLength);
          for (let i = 0; i < newLength; i++) {
              const srcIndexFloat = i / ratio;
              const srcIndexInt = Math.floor(srcIndexFloat);
              const fraction = srcIndexFloat - srcIndexInt;
              const s0 = samples[srcIndexInt];
              const s1 = samples[srcIndexInt + 1]; 
              if (s1 !== undefined) { // Check if s1 is within bounds
                  resampled[i] = s0 * (1 - fraction) + s1 * fraction;
              } else { // Handle edge case for the very last sample
                  resampled[i] = s0;
              }
          }
          return resampled;
      };
      
      // --- Appending Decoded PCM Data to Playback Queue ---
      const appendDecodedPcmToQueue = (newPcmSamples: Float32Array) => {
          if (newPcmSamples.length === 0) return;
          audioChunkQueue.push(newPcmSamples);
          // console.log(`Appended decoded PCM segment. Queue size: ${audioChunkQueue.length}`);
      };
      
      // --- Function to find next "RIFF" ---
      const findNextRiff = (buffer: Uint8Array, startIndex: number): number => {
          for (let i = startIndex; i <= buffer.length - RIFF_MARKER.length; i++) {
              let match = true;
              for (let j = 0; j < RIFF_MARKER.length; j++) {
                  if (buffer[i + j] !== RIFF_MARKER[j]) {
                      match = false;
                      break;
                  }
              }
              if (match) return i;
          }
          return -1; // Not found
      };

      // --- REVISED: Server Stream Processing (RIFF-based Assembly) ---
      const processServerStream = async () => {
          console.log("Starting to process server stream (RIFF-based assembly)...");
          startStatusLogging();

          try {
              while (!isStreamFetchingComplete) { // Loop until server stream is done or stopped
                  const { done, value } = await reader.read();

                  if (value) {
                      const newData = new Uint8Array(value.buffer); // Assuming value.buffer is ArrayBuffer
                      const combined = new Uint8Array(networkDataBuffer.length + newData.length);
                      combined.set(networkDataBuffer);
                      combined.set(newData, networkDataBuffer.length);
                      networkDataBuffer = combined;
                  }

                  // Process complete logical WAVs from the networkDataBuffer
                  let searchOffset = 0; // Where to start searching for RIFF in the current networkDataBuffer
                  while (searchOffset < networkDataBuffer.length) { // Keep processing as long as there's data to check
                      const riffStartIndex = findNextRiff(networkDataBuffer, searchOffset);

                      if (riffStartIndex === -1) { // No RIFF found in the rest of the current buffer
                          if (done) { // Stream ended, process any remaining data as the last segment
                              if (networkDataBuffer.length > searchOffset) {
                                  const lastWavData = networkDataBuffer.subarray(searchOffset);
                                  console.log(`Stream done, processing remaining buffer (${lastWavData.length} bytes) as last WAV segment.`);
                                  if (lastWavData.length > 0) {
                                      const pcm = await parseFullWavSegment(lastWavData.buffer.slice(lastWavData.byteOffset, lastWavData.byteOffset + lastWavData.byteLength));
                                      if (pcm.length > 0) appendDecodedPcmToQueue(pcm);
                                  }
                              }
                              networkDataBuffer = new Uint8Array(0); // Clear buffer
                          }
                          // If not done, it means the current networkDataBuffer (from searchOffset) is partial.
                          // We need to keep this data and wait for more.
                          // The data before searchOffset (if searchOffset > 0) has already been processed or is not a RIFF start.
                          // So, we effectively keep networkDataBuffer.subarray(searchOffset) by breaking here.
                          if (searchOffset > 0) {
                              networkDataBuffer = networkDataBuffer.subarray(searchOffset);
                          }
                          break; // Break inner loop to get more data from reader.read()
                      }

                      // Found a RIFF at riffStartIndex.
                      // Now find the *next* RIFF to define the end of this logical WAV segment.
                      // Start search for next RIFF *after* the current one's marker.
                      const nextRiffSearchStart = riffStartIndex + RIFF_MARKER.length;
                      const nextRiffStartIndex = findNextRiff(networkDataBuffer, nextRiffSearchStart);

                      if (nextRiffStartIndex !== -1) {
                          // Found another RIFF, so the segment is from riffStartIndex up to nextRiffStartIndex
                          const wavSegmentData = networkDataBuffer.subarray(riffStartIndex, nextRiffStartIndex);
                          console.log(`Assembled logical WAV (RIFF to RIFF): ${wavSegmentData.length} bytes`);
                          if (wavSegmentData.length > 0) {
                              const pcm = await parseFullWavSegment(wavSegmentData.buffer.slice(wavSegmentData.byteOffset, wavSegmentData.byteOffset + wavSegmentData.byteLength));
                              if (pcm.length > 0) appendDecodedPcmToQueue(pcm);
                          }
                          // Remove processed segment and continue scanning from the start of the next RIFF
                          networkDataBuffer = networkDataBuffer.subarray(nextRiffStartIndex);
                          searchOffset = 0; // Restart search from beginning of the new (shorter) buffer
                      } else {
                          // No *next* RIFF found yet in the current buffer.
                          if (done) { // Stream ended, so this RIFF segment is the last one
                              const lastWavData = networkDataBuffer.subarray(riffStartIndex);
                              console.log(`Assembled final logical WAV (RIFF to end-of-stream): ${lastWavData.length} bytes`);
                              if (lastWavData.length > 0) {
                                   const pcm = await parseFullWavSegment(lastWavData.buffer.slice(lastWavData.byteOffset, lastWavData.byteOffset + lastWavData.byteLength));
                                   if (pcm.length > 0) appendDecodedPcmToQueue(pcm);
                              }
                              networkDataBuffer = new Uint8Array(0); // Clear buffer
                              break; // Break inner loop as all data is processed
                          } else {
                              // This RIFF segment is incomplete or the next RIFF hasn't arrived.
                              // Keep the current buffer from this RIFF onwards and wait for more data.
                              networkDataBuffer = networkDataBuffer.subarray(riffStartIndex);
                              searchOffset = 0; // Next network chunk will append to this partial RIFF segment
                              break; // Break inner loop to get more data from reader.read()
                          }
                      }
                  } // end while (searchOffset < networkDataBuffer.length) for processing networkDataBuffer

                  if (done) {
                      isStreamFetchingComplete = true;
                      console.log("Server stream fetching fully finished (reader done).");
                      break; // Exit main reader loop
                  }
              } // end while (!isStreamFetchingComplete) for reader
          } catch (error: any) {
              console.error("Error during server stream processing (RIFF assembly):", error);
              if (typeof toast === 'function') toast({ title: "Audio stream error", description: error.message, variant: "destructive" });
              initiateFullStop();
          } finally {
              hasAllLogicalWavsBeenProcessed = true; // Mark that no more new logical WAVs will be formed
              console.log(`RIFF-based stream processing loop finished. Queued PCM chunks: ${audioChunkQueue.length}.`);
              // stopStatusLogging(); // Or let onaudioprocess stop it
          }
      };
      
      // --- Start Playback ---
      if (audioContext.state === 'suspended') {
          await audioContext.resume().catch(e => {
              console.error("Failed to resume AudioContext:", e);
              if (typeof toast === 'function') toast({ title: "Audio Error", description: "Could not start audio playback.", variant: "destructive" });
              initiateFullStop(); // Stop if context can't resume
              throw e; 
          });
      }
      
      console.log("Audio pipeline initialized. Starting RIFF-based stream processing...");
      processServerStream(); 
      
  } catch (err: any) {
      console.error("Overall error setting up TTS:", err);
      if (typeof toast === 'function') toast({ title: "TTS Service Error", description: err.message, variant: "destructive" });
      initiateFullStop();
      if (!audioContext) { // If context failed to initialize, cleanup might be needed
          cleanupAudioNodes();
      }
  }

  // Optionally, return a function that can be called to stop the playback externally
  // return initiateFullStop;
};

// Helper functions (ensure these are defined in your scope or imported)
// function getAuthToken() { /* ... your implementation ... */ return "dummy_token"; }
// function toast(options: { title: string, description?: string, variant?: string }) { 
//   console.log(`Toast: ${options.title} - ${options.description || ''}`); 
// }
  const handleFeedback = (messageId: string, isPositive: boolean) => {
    console.log(`Feedback for message ${messageId}: ${isPositive ? "Positive" : "Negative"}`)
    toast({ title: `Feedback ${isPositive ? "sent" : "recorded"}!` })
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50/30">
      {/* Chat Area */}
      <ScrollArea className="flex-grow">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Load More Button */}
          {hasMore && !isLoadingHistory && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={loadMoreMessages}
                disabled={isLoadingMore}
                className="bg-white/70 hover:bg-white border-blue-200 shadow-sm"
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

          {/* Loading State */}
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg mb-4">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <p className="text-slate-600 font-medium">Loading your conversation...</p>
            </div>
          ) : error && messages.length === 0 ? (
            <Card className="p-8 bg-red-50/80 border-red-200 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-red-700">
                <div className="p-3 bg-red-100 rounded-full">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Unable to load conversation</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </Card>
          ) : messages.length === 0 && !isLoadingResponse ? (
            // Show initial AI message instead of empty card
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-start"
              >
                <Card className="max-w-[85%] shadow-lg border-0 bg-white/90 backdrop-blur-sm text-slate-800 border-slate-200">
                  <div className="p-5">
                    <div className="prose prose-sm max-w-none">
                      <p className="mb-3 last:mb-0 leading-relaxed">
                        Hello! 👋 I'm your English learning companion.
                      </p>
                      <p className="mb-3 last:mb-0 leading-relaxed">
                        I'm here to help you master the English language - from grammar and vocabulary to literature and writing. Whether you're preparing for exams or want to improve your communication skills, I'm ready to guide you through any English concept.
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
              </motion.div>
              
              {/* Suggestion prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                {[
                  "Explain past perfect tense", 
                  "Help me write an essay",
                  "Common English idioms",
                  "Shakespeare's writing style"
                ].map(prompt => (
                  <Button 
                    key={prompt}
                    variant="outline" 
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 h-auto py-4 px-4 text-sm font-medium bg-white/70"
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
                        setIsLoadingResponse(true);
                        const authToken = getAuthToken();
                        
                        try {
                          const response = await fetch(buildApiUrl(API_ENDPOINTS.LEARN_ENGLISH), {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              ...(authToken && { "x-auth-session": authToken }),
                            },
                            body: JSON.stringify({
                              question: prompt,
                              include_pdfs: includePdfs
                            }),
                          });

                          if (!response.ok) {
                            throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
                          }

                          const aiMessageResponse = await response.json();
                          
                          setMessages(prevMessages => [...prevMessages, { 
                            id: aiMessageResponse.id || `ai-${Date.now()}`,
                            type: "ai" as const,
                            content: aiMessageResponse.answer || aiMessageResponse.content,
                            timestamp: new Date(aiMessageResponse.timestamp || Date.now()),
                          }]);
                        } catch (err: any) {
                          console.error("Error sending message:", err);
                          setMessages(prev => [...prev, {
                            id: `ai-error-${Date.now()}`,
                            type: "ai" as const,
                            content: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
                            timestamp: new Date(),
                          }]);
                        } finally {
                          setIsLoadingResponse(false);
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
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[85%] shadow-lg border-0 ${
                    message.type === "user"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                      : "bg-white/90 backdrop-blur-sm text-slate-800 border-slate-200"
                  }`}
                >
                  <div className="p-5">
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                          code: ({ node, inline, className, children, ...props }: any) => {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <div className="bg-slate-900 text-slate-100 p-4 my-3 rounded-lg overflow-x-auto text-sm">
                                <pre><code className={className} {...props}>{String(children).replace(/\n$/, '')}</code></pre>
                              </div>
                            ) : (
                              <code className={`px-2 py-1 rounded text-sm font-mono ${
                                message.type === "user" 
                                  ? "bg-white/20 text-blue-100" 
                                  : "bg-slate-100 text-slate-800"
                              }`} {...props}>
                                {String(children).replace(/\n$/, '')}
                              </code>
                            );
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <div className={`flex items-center justify-between mt-4 pt-3 border-t ${
                      message.type === "user" 
                        ? "border-white/20 text-blue-100" 
                        : "border-slate-200 text-slate-500"
                    }`}>
                      <span className="text-sm font-medium">
                        {format(new Date(message.timestamp), "h:mm a")}
                      </span>
                      {message.type === "ai" && (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-slate-100" 
                            onClick={() => handleCopy(message.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-slate-100" 
                            onClick={() => handleSpeak(message.content)}
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600" 
                            onClick={() => handleFeedback(message.id, true)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600" 
                            onClick={() => handleFeedback(message.id, false)}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
          
          {/* AI Typing Indicator */}
          {isLoadingResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
                <div className="p-5 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-medium">AI is thinking</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Error Banner */}
      {error && messages.length > 0 && (
        <div className="p-4 bg-red-50 border-t border-red-200 text-center">
          <p className="text-sm text-red-700 font-medium">Error: {error}</p>
        </div>
      )}

      {/* Modern Input Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 shadow-lg">
        <div className="p-6">
          <div className="max-w-4xl mx-auto flex items-end gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="flex-shrink-0 hover:bg-blue-50 border-blue-200"
            >
              <Paperclip className="h-5 w-5 text-slate-500" />
            </Button>
            <div className="flex-grow relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about English grammar, vocabulary, literature..."
                className="resize-none border-blue-200 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white/90 backdrop-blur-sm rounded-xl pr-16"
                rows={1}
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="flex-shrink-0 hover:bg-blue-50 border-blue-200"
            >
              <Mic className="h-5 w-5 text-slate-500" />
            </Button>
            <Button 
              variant={includePdfs ? "default" : "outline"}
              size="sm"
              onClick={() => setIncludePdfs(!includePdfs)}
              className={`flex-shrink-0 ${
                includePdfs 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md' 
                  : 'text-blue-600 border-blue-200 hover:bg-blue-50 bg-white/70'
              }`}
              title={includePdfs ? "Exclude uploaded PDFs from answers" : "Include uploaded PDFs in answers"}
            >
              <FileText className="h-4 w-4 mr-2" />
              PDFs
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg flex-shrink-0" 
              size="icon" 
              onClick={handleSendMessage}
              disabled={isLoadingResponse || inputMessage.trim() === ""}
            >
              <Send className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
