"use client"

import type React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BloomsTaxonomyChart } from "@/components/progress/blooms-taxonomy-chart"
import { ChapterProgressChart } from "@/components/progress/chapter-progress-chart"
import { TimeProgressChart } from "@/components/progress/time-progress-chart"
import { TaxonomyDistributionChart } from "@/components/progress/taxonomy-distribution-chart"

// Subject color mapping
const subjectColors = {
  english: "#4f46e5",
  hindi: "#f97316",
  mathematics: "#06b6d4",
  science: "#10b981",
  "social-science": "#8b5cf6",
}

// Mock data for Bloom's taxonomy levels by subject
const bloomsLevelsBySubject = {
  english: [
    { level: "Knowledge", score: 88, description: "Recalling facts and basic concepts" },
    { level: "Comprehension", score: 82, description: "Understanding ideas and concepts" },
    { level: "Application", score: 75, description: "Using information in new situations" },
    { level: "Analysis", score: 68, description: "Drawing connections among ideas" },
    { level: "Synthesis", score: 62, description: "Creating new patterns or structures" },
    { level: "Evaluation", score: 55, description: "Justifying a decision or course of action" },
  ],
  hindi: [
    { level: "Knowledge", score: 85, description: "Recalling facts and basic concepts" },
    { level: "Comprehension", score: 78, description: "Understanding ideas and concepts" },
    { level: "Application", score: 65, description: "Using information in new situations" },
    { level: "Analysis", score: 58, description: "Drawing connections among ideas" },
    { level: "Synthesis", score: 52, description: "Creating new patterns or structures" },
    { level: "Evaluation", score: 45, description: "Justifying a decision or course of action" },
  ],
  mathematics: [
    { level: "Knowledge", score: 90, description: "Recalling facts and basic concepts" },
    { level: "Comprehension", score: 85, description: "Understanding ideas and concepts" },
    { level: "Application", score: 82, description: "Using information in new situations" },
    { level: "Analysis", score: 75, description: "Drawing connections among ideas" },
    { level: "Synthesis", score: 68, description: "Creating new patterns or structures" },
    { level: "Evaluation", score: 60, description: "Justifying a decision or course of action" },
  ],
  science: [
    { level: "Knowledge", score: 87, description: "Recalling facts and basic concepts" },
    { level: "Comprehension", score: 80, description: "Understanding ideas and concepts" },
    { level: "Application", score: 76, description: "Using information in new situations" },
    { level: "Analysis", score: 70, description: "Drawing connections among ideas" },
    { level: "Synthesis", score: 65, description: "Creating new patterns or structures" },
    { level: "Evaluation", score: 58, description: "Justifying a decision or course of action" },
  ],
  "social-science": [
    { level: "Knowledge", score: 82, description: "Recalling facts and basic concepts" },
    { level: "Comprehension", score: 75, description: "Understanding ideas and concepts" },
    { level: "Application", score: 68, description: "Using information in new situations" },
    { level: "Analysis", score: 62, description: "Drawing connections among ideas" },
    { level: "Synthesis", score: 55, description: "Creating new patterns or structures" },
    { level: "Evaluation", score: 48, description: "Justifying a decision or course of action" },
  ],
}

// Mock data for chapters by subject
const chaptersBySubject = {
  english: [
    { name: "Grammar", progress: 85 },
    { name: "Literature", progress: 78 },
    { name: "Comprehension", progress: 72 },
    { name: "Writing", progress: 65 },
    { name: "Vocabulary", progress: 80 },
  ],
  hindi: [
    { name: "व्याकरण", progress: 75 },
    { name: "साहित्य", progress: 68 },
    { name: "रचना", progress: 62 },
    { name: "पठन", progress: 70 },
    { name: "शब्दावली", progress: 65 },
  ],
  mathematics: [
    { name: "Algebra", progress: 88 },
    { name: "Geometry", progress: 82 },
    { name: "Statistics", progress: 75 },
    { name: "Calculus", progress: 68 },
    { name: "Trigonometry", progress: 78 },
  ],
  science: [
    { name: "Physics", progress: 80 },
    { name: "Chemistry", progress: 75 },
    { name: "Biology", progress: 82 },
    { name: "Earth Science", progress: 70 },
    { name: "Scientific Method", progress: 85 },
  ],
  "social-science": [
    { name: "History", progress: 72 },
    { name: "Geography", progress: 68 },
    { name: "Civics", progress: 65 },
    { name: "Economics", progress: 60 },
    { name: "Current Affairs", progress: 70 },
  ],
}

// Mock data for recent achievements by subject
const achievementsBySubject = {
  english: [
    { id: 1, title: "Grammar Master", description: "Completed advanced grammar module", date: "3 days ago" },
    { id: 2, title: "Essay Expert", description: "Wrote a perfect essay", date: "1 week ago" },
    { id: 3, title: "Vocabulary Champion", description: "Learned 50 new words", date: "2 weeks ago" },
  ],
  hindi: [
    { id: 1, title: "कविता विशेषज्ञ", description: "Mastered Hindi poetry", date: "2 days ago" },
    { id: 2, title: "व्याकरण विजेता", description: "Completed Hindi grammar", date: "1 week ago" },
    { id: 3, title: "लेखन कौशल", description: "Improved writing skills", date: "2 weeks ago" },
  ],
  mathematics: [
    { id: 1, title: "Algebra Ace", description: "Solved complex equations", date: "1 day ago" },
    { id: 2, title: "Geometry Genius", description: "Mastered geometric proofs", date: "5 days ago" },
    { id: 3, title: "Calculus Champion", description: "Completed calculus module", date: "2 weeks ago" },
  ],
  science: [
    { id: 1, title: "Physics Phenom", description: "Mastered Newton's laws", date: "2 days ago" },
    { id: 2, title: "Chemistry Whiz", description: "Balanced complex equations", date: "1 week ago" },
    { id: 3, title: "Biology Expert", description: "Completed cell biology", date: "3 weeks ago" },
  ],
  "social-science": [
    { id: 1, title: "History Buff", description: "Mastered world history timeline", date: "4 days ago" },
    { id: 2, title: "Geography Guru", description: "Mapped world countries", date: "1 week ago" },
    { id: 3, title: "Civics Scholar", description: "Understood government structures", date: "2 weeks ago" },
  ],
}

// Subject name mapping
const subjectNames = {
  english: "English",
  hindi: "Hindi",
  mathematics: "Mathematics",
  science: "Science",
  "social-science": "Social Science",
}

export default function SubjectProgressPage({ params }: { params: { subject: string } }) {
  const subject = params.subject
  const subjectName = subjectNames[subject as keyof typeof subjectNames] || "Subject"
  const subjectColor = subjectColors[subject as keyof typeof subjectColors] || "#4f46e5"

  const bloomsLevels =
    bloomsLevelsBySubject[subject as keyof typeof bloomsLevelsBySubject] || bloomsLevelsBySubject.english
  const chapters = chaptersBySubject[subject as keyof typeof chaptersBySubject] || chaptersBySubject.english
  const achievements =
    achievementsBySubject[subject as keyof typeof achievementsBySubject] || achievementsBySubject.english

  return (
    <div className="p-6 space-y-8 pb-20">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/home/progress">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Overview
          </Link>
        </Button>
      </div>

      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: subjectColor }}>
          {subjectName} Progress
        </h1>
        <p className="text-gray-500">Track your learning journey in {subjectName}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="taxonomy">Bloom's Taxonomy</TabsTrigger>
          <TabsTrigger value="chapters">Chapters</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Subject Overview Card */}
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-2" style={{ backgroundColor: subjectColor }}></div>
            <CardHeader className="pb-2">
              <CardTitle>{subjectName} Overview</CardTitle>
              <CardDescription>Your learning journey in {subjectName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <TimeProgressChart color={subjectColor} />
              </div>
            </CardContent>
          </Card>

          {/* Taxonomy Distribution */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Cognitive Development</CardTitle>
              <CardDescription>Your progress across Bloom's taxonomy levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <TaxonomyDistributionChart data={bloomsLevels} color={subjectColor} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Your latest learning milestones in {subjectName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="p-2 rounded-full" style={{ backgroundColor: `${subjectColor}20` }}>
                      <Award className="h-5 w-5" style={{ color: subjectColor }} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                      <p className="text-xs text-gray-400">{achievement.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxonomy" className="space-y-6">
          {/* Bloom's Taxonomy Visualization */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Bloom's Taxonomy</CardTitle>
              <CardDescription>Your cognitive development in {subjectName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <BloomsTaxonomyChart data={bloomsLevels} color={subjectColor} />
              </div>
            </CardContent>
          </Card>

          {/* Taxonomy Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bloomsLevels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-none shadow-md">
                  <div
                    className="h-2"
                    style={{
                      backgroundColor: `${subjectColor}${80 - index * 10}`,
                    }}
                  ></div>
                  <CardHeader className="pb-2">
                    <CardTitle>{level.level}</CardTitle>
                    <CardDescription>{level.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mastery</span>
                        <span className="font-medium">{level.score}%</span>
                      </div>
                      <Progress
                        value={level.score}
                        className="h-2"
                        style={
                          {
                            "--progress-background": `${subjectColor}${80 - index * 10}`,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chapters" className="space-y-6">
          {/* Chapter Progress Chart */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Chapter Progress</CardTitle>
              <CardDescription>Your progress across different chapters in {subjectName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChapterProgressChart chapters={chapters} color={subjectColor} />
              </div>
            </CardContent>
          </Card>

          {/* Chapter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter, index) => (
              <motion.div
                key={chapter.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card className="overflow-hidden border-none shadow-md">
                  <div className="h-2" style={{ backgroundColor: subjectColor }}></div>
                  <CardHeader className="pb-2">
                    <CardTitle>{chapter.name}</CardTitle>
                    <CardDescription>Chapter progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span className="font-medium">{chapter.progress}%</span>
                      </div>
                      <Progress
                        value={chapter.progress}
                        className="h-2"
                        style={
                          {
                            "--progress-background": subjectColor,
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
