"use client"

import type React from "react"

import { useState } from "react"
import { Languages, Award, TrendingUp, Clock, BarChart3, Star, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CreateAssessmentModal, type Topic } from "@/components/assessment/create-assessment-modal"

export default function HindiAssessmentPage() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sample data for Hindi assessments
  const assessments = [
    {
      id: 1,
      date: "2023-04-12",
      name: "व्याकरण परीक्षा",
      topic: "व्याकरण",
      difficulty: "Medium",
      score: 82,
      totalMarks: 100,
    },
    {
      id: 2,
      date: "2023-03-28",
      name: "पठन बोध मूल्यांकन",
      topic: "पठन बोध",
      difficulty: "Easy",
      score: 95,
      totalMarks: 100,
    },
    {
      id: 3,
      date: "2023-03-18",
      name: "लेखन कौशल परीक्षण",
      topic: "लेखन",
      difficulty: "Hard",
      score: 76,
      totalMarks: 100,
    },
    {
      id: 4,
      date: "2023-03-08",
      name: "साहित्य विश्लेषण",
      topic: "Multiple",
      difficulty: "Hard",
      score: 84,
      totalMarks: 100,
    },
    {
      id: 5,
      date: "2023-02-22",
      name: "शब्दावली परीक्षण",
      topic: "शब्दावली",
      difficulty: "Medium",
      score: 88,
      totalMarks: 100,
    },
  ]

  // Available topics for Hindi
  const availableTopics: Topic[] = [
    { id: "vyakaran", name: "व्याकरण" },
    { id: "pathanbodh", name: "पठन बोध" },
    { id: "lekhan", name: "लेखन" },
    { id: "shabdavali", name: "शब्दावली" },
    { id: "sahitya", name: "साहित्य" },
    { id: "kavita", name: "कविता" },
    { id: "kahani", name: "कहानी" },
    { id: "nibandh", name: "निबंध" },
    { id: "patra", name: "पत्र लेखन" },
  ]

  // Calculate statistics
  const averageScore = Math.round(
    assessments.reduce((sum, assessment) => sum + assessment.score, 0) / assessments.length,
  )
  const totalAssessments = assessments.length
  const highestScore = Math.max(...assessments.map((assessment) => assessment.score))

  // Topic mastery data
  const topicMastery = [
    { topic: "व्याकरण", progress: 82 },
    { topic: "पठन बोध", progress: 95 },
    { topic: "लेखन", progress: 76 },
    { topic: "शब्दावली", progress: 88 },
    { topic: "साहित्य", progress: 84 },
  ]

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-blue-100 text-blue-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get score color based on performance
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-orange-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-orange-600 flex items-center">
            <Languages className="mr-2" /> हिंदी मूल्यांकन
          </h1>
          <p className="text-gray-600 mt-1">अपनी प्रगति का अनुसरण करें और अपने हिंदी कौशल में सुधार करें</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-orange-600 hover:bg-orange-700" onClick={() => setIsModalOpen(true)}>
          नया मूल्यांकन लें
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="overview">अवलोकन</TabsTrigger>
          <TabsTrigger value="history">मूल्यांकन इतिहास</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">औसत अंक</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold text-orange-600">{averageScore}%</div>
                  <TrendingUp className="ml-auto text-green-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">{averageScore >= 80 ? "उत्कृष्ट प्रदर्शन!" : "सुधार जारी रखें!"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">मूल्यांकन लिए गए</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold text-orange-600">{totalAssessments}</div>
                  <BarChart3 className="ml-auto text-orange-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {totalAssessments > 3 ? "बढ़िया निरंतरता!" : "अधिक मूल्यांकन लें!"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">उच्चतम अंक</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="text-4xl font-bold text-orange-600">{highestScore}%</div>
                  <Award className="ml-auto text-yellow-500" />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {highestScore >= 90 ? "असाधारण उपलब्धि!" : "आप और ऊंचाई तक पहुंच सकते हैं!"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topicMastery.map((topic, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{topic.topic}</CardTitle>
                  <CardDescription>आपका प्रवीणता स्तर</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-orange-600">{topic.progress}%</span>
                    <div className="flex">
                      {Array.from({ length: Math.floor(topic.progress / 20) }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                      {Array.from({ length: 5 - Math.floor(topic.progress / 20) }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-gray-300" />
                      ))}
                    </div>
                  </div>
                  <Progress
                    value={topic.progress}
                    className="h-2 mb-4"
                    style={
                      {
                        backgroundColor: "rgba(234, 88, 12, 0.2)",
                        "--progress-color": "rgba(234, 88, 12, 1)",
                      } as React.CSSProperties
                    }
                  />
                  <p className="text-sm text-gray-600">
                    {topic.progress >= 90
                      ? "उत्कृष्ट प्रवीणता!"
                      : topic.progress >= 75
                        ? "अच्छी समझ!"
                        : topic.progress >= 60
                          ? "प्रगति कर रहे हैं!"
                          : "सुधार की आवश्यकता है"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full text-orange-600 border-orange-200 hover:bg-orange-50">
                    {topic.topic} का अभ्यास करें
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>अनुशंसित अभ्यास</CardTitle>
              <CardDescription>अपने हिंदी कौशल में सुधार के लिए इन क्षेत्रों पर ध्यान दें</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topicMastery
                  .sort((a, b) => a.progress - b.progress)
                  .slice(0, 2)
                  .map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-orange-700">{topic.topic}</h4>
                        <p className="text-sm text-gray-600">वर्तमान प्रवीणता: {topic.progress}%</p>
                      </div>
                      <Button className="bg-orange-600 hover:bg-orange-700">अभी अभ्यास करें</Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
            <h3 className="text-xl font-bold text-orange-700 mb-2">अपनी अगली चुनौती के लिए तैयार हैं?</h3>
            <p className="text-orange-600 mb-4">
              अपने ज्ञान का परीक्षण करने और हिंदी में अपनी प्रगति को ट्रैक करने के लिए एक नया मूल्यांकन लें।
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setIsModalOpen(true)}>
              नया मूल्यांकन शुरू करें
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>मूल्यांकन इतिहास</CardTitle>
              <CardDescription>आपके पिछले हिंदी मूल्यांकन और परिणाम</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <Card key={assessment.id} className="overflow-hidden border-l-4 border-l-orange-500">
                    <div className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg text-orange-700">{assessment.name}</h4>
                        <div className="flex items-center mt-2 md:mt-0">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500">{formatDate(assessment.date)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">विषय</p>
                          <p className="font-medium">{assessment.topic}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">कठिनाई स्तर</p>
                          <Badge className={`${getDifficultyColor(assessment.difficulty)} font-medium`}>
                            {assessment.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">अंक</p>
                          <p className={`font-bold text-lg ${getScoreColor(assessment.score)}`}>
                            {assessment.score}/{assessment.totalMarks}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                          <Eye className="h-4 w-4 mr-2" />
                          मूल्यांकन देखें
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subject="hindi"
        subjectColor="orange"
        availableTopics={availableTopics}
      />
    </div>
  )
}
