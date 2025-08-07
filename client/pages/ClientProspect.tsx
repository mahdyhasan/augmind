import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Building2,
  Globe,
  Linkedin,
  User,
  Mail,
  Briefcase,
  Zap,
  Target,
  TrendingUp,
  Users,
  MessageSquare,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";

interface ProspectData {
  companyName: string;
  website: string;
  linkedinCompany: string;
  kdmName: string;
  kdmRole: string;
  kdmEmail: string;
  kdmLinkedin: string;
  additionalInfo: string;
}

interface AnalysisResult {
  id: string;
  timestamp: Date;
  prospect: ProspectData;
  question: string;
  insights: {
    approach: string;
    alignment: string;
    currentPartners: string;
    persuasion: string;
    needs: string;
    emailFormat: string;
    pitchingFormat: string;
  };
}

const quickPrompts = [
  "How should we approach this prospect?",
  "How can we align our services with their needs?",
  "Who might they be working with currently?",
  "How should we convince the key decision maker?",
  "What are they likely looking for in a solution?",
  "What should be the email format for initial outreach?",
  "What should be our pitching format and strategy?",
  "What are their potential pain points we can address?",
  "What's the best timing for our approach?",
  "How can we differentiate from their current providers?",
];

export default function ClientProspect() {
  const [prospectData, setProspectData] = useState<ProspectData>({
    companyName: "",
    website: "",
    linkedinCompany: "",
    kdmName: "",
    kdmRole: "",
    kdmEmail: "",
    kdmLinkedin: "",
    additionalInfo: "",
  });

  const [customQuestion, setCustomQuestion] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);

  const handleInputChange = (field: keyof ProspectData, value: string) => {
    setProspectData((prev) => ({ ...prev, [field]: value }));
  };

  const generateStrategy = async (question: string) => {
    if (!prospectData.companyName || !question.trim()) return;

    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const mockInsights = {
        approach: `For ${prospectData.companyName}, I recommend a consultative approach. Start by researching their recent initiatives and industry challenges. Position yourself as a strategic partner rather than a vendor. Initial contact should be through ${prospectData.kdmName} via LinkedIn with a personalized message referencing their company's recent developments.`,

        alignment: `Based on ${prospectData.companyName}'s profile, align your messaging around digital transformation and operational efficiency. Emphasize ROI and measurable outcomes. If they're in a growth phase, focus on scalability solutions. For established companies, emphasize optimization and competitive advantage.`,

        currentPartners: `${prospectData.companyName} likely works with established consulting firms or technology partners. Research their recent announcements, partnerships, and vendor relationships. Look for gaps in their current service portfolio where you can add unique value. They may be looking to diversify their vendor base for better service or cost optimization.`,

        persuasion: `To convince ${prospectData.kdmName} (${prospectData.kdmRole}), focus on business outcomes relevant to their role. Present case studies from similar companies in their industry. Offer a pilot project or assessment to demonstrate value with minimal risk. Address their specific challenges and show clear ROI projections.`,

        needs: `${prospectData.companyName} is likely looking for: 1) Proven expertise in their industry, 2) Scalable solutions that grow with their business, 3) Strong support and partnership approach, 4) Competitive pricing with clear value proposition, 5) Innovation and forward-thinking strategies, 6) Reliable implementation and change management support.`,

        emailFormat: `Subject: Strategic Partnership Opportunity for ${prospectData.companyName}\n\nDear ${prospectData.kdmName},\n\nI noticed ${prospectData.companyName}'s recent [specific achievement/announcement]. Your focus on [relevant business area] aligns perfectly with our expertise.\n\nWe've helped similar companies in [industry] achieve [specific results]. I'd love to share how we could support ${prospectData.companyName}'s [specific goals].\n\nWould you be open to a brief 15-minute conversation next week?\n\nBest regards,\n[Your name]`,

        pitchingFormat: `1. Opening Hook: Reference their recent company news/achievements\n2. Credibility: Share relevant case study or industry expertise\n3. Value Proposition: Clearly state how you solve their specific challenges\n4. Proof Points: Quantifiable results from similar clients\n5. Call to Action: Specific next step (demo, assessment, pilot)\n6. Follow-up: Clear timeline and expectations\n\nKeep it conversational, focus on their business, not your services. Prepare for objections and have concrete examples ready.`,
      };

      const analysis: AnalysisResult = {
        id: Date.now().toString(),
        timestamp: new Date(),
        prospect: { ...prospectData },
        question: question,
        insights: mockInsights,
      };

      setAnalyses((prev) => [analysis, ...prev]);
      setIsAnalyzing(false);
      setCustomQuestion("");
      setSelectedPrompt("");
    }, 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    generateStrategy(prompt);
  };

  const handleCustomQuestion = () => {
    generateStrategy(customQuestion);
  };

  const isFormValid = prospectData.companyName && prospectData.kdmName;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Client Prospect Assistant
        </h1>
        <p className="text-gray-600">
          Get AI-powered strategies for engaging with potential clients
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Prospect Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
              <CardDescription>
                Enter details about the prospect company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={prospectData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  placeholder="e.g., TechCorp Solutions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    value={prospectData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    placeholder="https://company.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinCompany">Company LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="linkedinCompany"
                    value={prospectData.linkedinCompany}
                    onChange={(e) =>
                      handleInputChange("linkedinCompany", e.target.value)
                    }
                    placeholder="https://linkedin.com/company/..."
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Key Decision Maker</span>
              </CardTitle>
              <CardDescription>
                Information about the primary contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kdmName">Name *</Label>
                  <Input
                    id="kdmName"
                    value={prospectData.kdmName}
                    onChange={(e) =>
                      handleInputChange("kdmName", e.target.value)
                    }
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kdmRole">Role/Title</Label>
                  <Input
                    id="kdmRole"
                    value={prospectData.kdmRole}
                    onChange={(e) =>
                      handleInputChange("kdmRole", e.target.value)
                    }
                    placeholder="CEO, CTO, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kdmEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="kdmEmail"
                    value={prospectData.kdmEmail}
                    onChange={(e) =>
                      handleInputChange("kdmEmail", e.target.value)
                    }
                    placeholder="john@company.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kdmLinkedin">LinkedIn Profile</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="kdmLinkedin"
                    value={prospectData.kdmLinkedin}
                    onChange={(e) =>
                      handleInputChange("kdmLinkedin", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={prospectData.additionalInfo}
                  onChange={(e) =>
                    handleInputChange("additionalInfo", e.target.value)
                  }
                  placeholder="Any additional context, recent news, challenges, or opportunities..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Quick Strategy Questions</span>
              </CardTitle>
              <CardDescription>
                Click on any question to get instant insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto p-3"
                    onClick={() => handleQuickPrompt(prompt)}
                    disabled={!isFormValid || isAnalyzing}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{prompt}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Custom Question</span>
              </CardTitle>
              <CardDescription>Ask your own strategic question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="What specific strategy question do you have about this prospect?"
                rows={3}
              />
              <Button
                onClick={handleCustomQuestion}
                disabled={!isFormValid || !customQuestion.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Get Strategy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analysis Results */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Strategy Insights</span>
              </CardTitle>
              <CardDescription>
                AI-generated strategies and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyses.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Fill in the prospect information and ask a question to get
                    started
                  </p>
                  {!isFormValid && (
                    <Badge variant="destructive">
                      Company name and decision maker name are required
                    </Badge>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-6">
                    {analyses.map((analysis) => (
                      <div key={analysis.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">
                            {analysis.prospect.companyName}
                          </h3>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {analysis.timestamp.toLocaleTimeString()}
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-blue-900 font-medium">
                            Question:
                          </p>
                          <p className="text-sm text-blue-800">
                            {analysis.question}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              Approach Strategy
                            </h4>
                            <p className="text-sm text-gray-700">
                              {analysis.insights.approach}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              Service Alignment
                            </h4>
                            <p className="text-sm text-gray-700">
                              {analysis.insights.alignment}
                            </p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              Email Format
                            </h4>
                            <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                              {analysis.insights.emailFormat}
                            </pre>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              Pitching Strategy
                            </h4>
                            <pre className="text-xs text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                              {analysis.insights.pitchingFormat}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
