import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  MessageCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Building,
  FileText,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PresetQuestion {
  id: string;
  title: string;
  prompt: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

const categories = [
  'Strategy',
  'Competition',
  'Clients',
  'Branding',
  'Finance',
  'HR',
  'Marketing',
  'Operations',
  'Growth',
  'Innovation'
];

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Strategy': <Target className="h-4 w-4" />,
  'Competition': <TrendingUp className="h-4 w-4" />,
  'Clients': <Users className="h-4 w-4" />,
  'Branding': <Lightbulb className="h-4 w-4" />,
  'Finance': <FileText className="h-4 w-4" />,
  'HR': <Users className="h-4 w-4" />,
  'Marketing': <Building className="h-4 w-4" />,
  'Operations': <Settings className="h-4 w-4" />,
  'Growth': <TrendingUp className="h-4 w-4" />,
  'Innovation': <Lightbulb className="h-4 w-4" />
};

export default function PresetQuestions() {
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<PresetQuestion[]>([
    {
      id: '1',
      title: 'Market Analysis',
      prompt: 'Analyze the current market trends in our industry and identify key opportunities',
      category: 'Strategy',
      description: 'Comprehensive market analysis for strategic planning',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      usageCount: 45
    },
    {
      id: '2',
      title: 'Competitive Positioning',
      prompt: 'How should we position ourselves against our main competitors?',
      category: 'Competition',
      description: 'Strategic positioning analysis',
      isActive: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      usageCount: 32
    },
    {
      id: '3',
      title: 'USP Development',
      prompt: 'Help me identify and articulate our unique selling proposition',
      category: 'Branding',
      description: 'Unique value proposition development',
      isActive: true,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      usageCount: 28
    },
    {
      id: '4',
      title: 'Client Retention',
      prompt: 'What strategies can we implement to improve client retention rates?',
      category: 'Clients',
      description: 'Client relationship and retention strategies',
      isActive: true,
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04'),
      usageCount: 39
    },
    {
      id: '5',
      title: 'Growth Strategy',
      prompt: 'Outline a 12-month growth strategy for our business',
      category: 'Growth',
      description: 'Long-term growth planning and strategy',
      isActive: false,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      usageCount: 15
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PresetQuestion | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    category: '',
    description: '',
    isActive: true
  });

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.prompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryStats = categories.map(category => ({
    name: category,
    count: questions.filter(q => q.category === category).length,
    activeCount: questions.filter(q => q.category === category && q.isActive).length
  }));

  const handleCreateQuestion = () => {
    if (!formData.title || !formData.prompt || !formData.category) return;

    const newQuestion: PresetQuestion = {
      id: Date.now().toString(),
      title: formData.title,
      prompt: formData.prompt,
      category: formData.category,
      description: formData.description,
      isActive: formData.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };

    setQuestions(prev => [newQuestion, ...prev]);
    resetForm();
  };

  const handleEditQuestion = () => {
    if (!editingQuestion || !formData.title || !formData.prompt || !formData.category) return;

    setQuestions(prev => prev.map(q => 
      q.id === editingQuestion.id 
        ? {
            ...q,
            title: formData.title,
            prompt: formData.prompt,
            category: formData.category,
            description: formData.description,
            isActive: formData.isActive,
            updatedAt: new Date()
          }
        : q
    ));

    resetForm();
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleToggleActive = (questionId: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, isActive: !q.isActive, updatedAt: new Date() }
        : q
    ));
  };

  const openEditDialog = (question: PresetQuestion) => {
    setEditingQuestion(question);
    setFormData({
      title: question.title,
      prompt: question.prompt,
      category: question.category,
      description: question.description || '',
      isActive: question.isActive
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      prompt: '',
      category: '',
      description: '',
      isActive: true
    });
    setEditingQuestion(null);
    setIsDialogOpen(false);
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="p-6 flex items-center justify-center min-h-full">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to manage preset questions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Preset Questions</h1>
          <p className="text-gray-600">Manage predefined questions for users to quick-start AI conversations</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingQuestion(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? 'Edit Preset Question' : 'Create New Preset Question'}
              </DialogTitle>
              <DialogDescription>
                {editingQuestion 
                  ? 'Update the preset question details'
                  : 'Add a new preset question for users to select from'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Question Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Market Analysis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center space-x-2">
                            {categoryIcons[category]}
                            <span>{category}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Question Prompt</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Enter the full prompt that will be sent to the AI..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of what this question helps with"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isActive">Make this question active (visible to users)</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={editingQuestion ? handleEditQuestion : handleCreateQuestion}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingQuestion ? 'Update' : 'Create'} Question
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center space-x-2">
                          {categoryIcons[category]}
                          <span>{category}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Card key={question.id} className={`${!question.isActive ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                        <div className="flex items-center space-x-2">
                          {categoryIcons[question.category]}
                          <Badge variant="outline">{question.category}</Badge>
                          {question.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{question.prompt}</p>
                      
                      {question.description && (
                        <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Used {question.usageCount} times</span>
                        <span>•</span>
                        <span>Updated {question.updatedAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(question.id)}
                      >
                        <Eye className={`h-4 w-4 ${question.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredQuestions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Create your first preset question to get started'
                    }
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Questions by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryStats.map((stat) => (
                  <div key={stat.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {categoryIcons[stat.name]}
                      <span className="text-sm font-medium">{stat.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="secondary">{stat.activeCount}</Badge>
                      <span className="text-xs text-gray-500">/{stat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Questions</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Questions</span>
                <span className="font-medium">{questions.filter(q => q.isActive).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Usage</span>
                <span className="font-medium">{questions.reduce((sum, q) => sum + q.usageCount, 0)}</span>
              </div>
              <Separator />
              <div className="text-xs text-gray-600">
                <p className="mb-2">Top performing questions:</p>
                <div className="space-y-1">
                  {questions
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .slice(0, 3)
                    .map((q, index) => (
                      <div key={q.id} className="flex justify-between">
                        <span className="truncate">{q.title}</span>
                        <span>{q.usageCount}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>• Write clear, specific prompts that give context to the AI</p>
              <p>• Group related questions by category for easy discovery</p>
              <p>• Test questions before making them active</p>
              <p>• Review usage statistics to identify popular questions</p>
              <p>• Keep prompts focused on business strategy and decision-making</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
