// API Configuration
export const API_CONFIG = {
  // Base URL for the API - can be changed here for different environments
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:80",
  
  // Alternative base URL without port (for some endpoints)
  BASE_URL_NO_PORT: process.env.NEXT_PUBLIC_API_BASE_URL_NO_PORT || "http://localhost",
} as const

// Utility functions for building API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`
}

export const buildApiUrlNoPort = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${API_CONFIG.BASE_URL_NO_PORT}/${cleanEndpoint}`
}

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: "login",
  REGISTER: "register",
  GET_OTP: "getotp",
  FORGOT_PASSWORD: "forgotpassword",
  UPDATE_PASSWORD: "updatepassword",
  
  // Assessment endpoints
  ASSESSMENTS: "assessments",
  ASSESSMENT: "assessment",
  ASSESSMENT_API: "api/assessment",
  GENERATE_PDF_ASSESSMENT: "generate-pdf-assessment",
  PDF_ASSESSMENTS: "pdf-assessments",
  
  // Learning endpoints
  LEARN_ENGLISH: "api/learn/english",
  LEARN_SCIENCE: "api/learn/science",
  LEARN_TTS: "api/learn/tts/stream",
  
  // File/PDF endpoints
  PDF_LIST: "api/pdf/list",
  PDF_UPLOAD: "api/pdf/upload",
  PDF_STATUS: "api/pdf/{id}/status",
  PDF_LEARN: "api/pdf/{id}/learn",
  PDF_API: "api/pdf/{id}",
  
  // History endpoints
  GET_HISTORY: "get-history",
} as const 