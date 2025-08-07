import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Upload,
  FileText,
  File,
  Trash2,
  Download,
  Eye,
  Calendar,
  User,
  FolderOpen,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase, Document } from "../lib/supabase";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Textarea } from "../components/ui/textarea";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: "Processing" | "Complete" | "Error";
  description?: string;
}

const adminCategories = [
  "Competitors",
  "Clients",
  "USP & Vision",
  "Mission & Goals",
  "Quarterly Targets",
  "Market Research",
  "Industry Reports",
  "Team Resources",
  "Strategy Documents",
  "Others",
];

const userCategories = [
  "Prospect Information",
  "Client Materials",
  "Personal Notes",
  "Others",
];

export default function Uploads() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "competitor-analysis-q4.pdf",
      size: 2458000,
      type: "application/pdf",
      category: "Competitors",
      uploadedBy: "Administrator",
      uploadedAt: new Date("2024-01-15"),
      status: "Complete",
      description: "Q4 competitive landscape analysis",
    },
    {
      id: "2",
      name: "client-feedback-summary.txt",
      size: 156000,
      type: "text/plain",
      category: "Clients",
      uploadedBy: "John Smith",
      uploadedAt: new Date("2024-01-20"),
      status: "Complete",
      description: "Summary of client feedback from recent surveys",
    },
    {
      id: "3",
      name: "vision-statement-draft.md",
      size: 45000,
      type: "text/markdown",
      category: "USP & Vision",
      uploadedBy: "Administrator",
      uploadedAt: new Date("2024-01-22"),
      status: "Processing",
    },
    {
      id: "4",
      name: "prospect-research-techcorp.pdf",
      size: 1200000,
      type: "application/pdf",
      category: "Prospect Information",
      uploadedBy: "John Smith",
      uploadedAt: new Date("2024-01-25"),
      status: "Complete",
      description: "Research on TechCorp prospect",
    },
  ]);

  const categories = isAdmin ? adminCategories : userCategories;

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || file.category === filterCategory;
    const matchesRole = isAdmin || file.uploadedBy === user?.name;

    return matchesSearch && matchesCategory && matchesRole;
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFileUpload(droppedFiles);
    },
    [selectedCategory],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFileUpload(selectedFiles);
    }
  };

  const handleFileUpload = async (fileList: File[]) => {
    if (!selectedCategory) {
      alert("Please select a category first");
      return;
    }

    for (const file of fileList) {
      if (
        !["application/pdf", "text/plain", "text/markdown"].includes(file.type)
      ) {
        alert(
          `File type ${file.type} is not supported. Please upload PDF, TXT, or MD files.`,
        );
        continue;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Create new file entry
      const newFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        category: selectedCategory,
        uploadedBy: user?.name || "Unknown",
        uploadedAt: new Date(),
        status: "Processing",
      };

      // Add to files list after upload completes
      setTimeout(() => {
        setFiles((prev) => [{ ...newFile, status: "Complete" }, ...prev]);
        setUploadProgress(0);
      }, 2000);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type === "application/pdf")
      return <FileText className="h-8 w-8 text-red-500" />;
    if (type === "text/markdown")
      return <File className="h-8 w-8 text-blue-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Complete":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        );
      case "Processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "Error":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  const categoryStats = categories.map((category) => ({
    name: category,
    count: files.filter(
      (file) =>
        file.category === category &&
        (isAdmin || file.uploadedBy === user?.name),
    ).length,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? "Document Management" : "My Uploads"}
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? "Upload and organize documents by category for AI analysis"
              : "Upload your documents to assist with prospect analysis"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Files</p>
          <p className="text-2xl font-bold text-primary">
            {filteredFiles.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Documents</span>
              </CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Upload documents to build the knowledge base for AI analysis"
                  : "Upload documents related to your prospects and clients"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-600">
                    Supports PDF, TXT, and MD files (max 10MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={!selectedCategory}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      className="mt-2"
                      disabled={!selectedCategory}
                    >
                      Choose Files
                    </Button>
                  </label>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Uploaded Documents</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No files found
                  </h3>
                  <p className="text-gray-600">
                    Upload some documents to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {file.name}
                          </h3>
                          {getStatusBadge(file.status)}
                          <Badge variant="outline">{file.category}</Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{formatFileSize(file.size)}</span>
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {file.uploadedBy}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {file.uploadedAt.toLocaleDateString()}
                          </span>
                        </div>

                        {file.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {file.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {(isAdmin || file.uploadedBy === user?.name) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Category Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                {isAdmin
                  ? "Knowledge base organization"
                  : "Your document categories"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryStats.map((stat) => (
                  <div
                    key={stat.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {stat.name}
                    </span>
                    <Badge variant="secondary">{stat.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>
                  • Organize documents by category to improve AI analysis
                  accuracy
                </p>
                <p>
                  • Uploaded documents are automatically processed and indexed
                </p>
                <p>
                  • Users can only see their own uploads plus shared knowledge
                  base
                </p>
                <p>• Consider adding descriptions to help with searchability</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>File Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>Supported formats:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>PDF documents</li>
                <li>Text files (.txt)</li>
                <li>Markdown files (.md)</li>
              </ul>
              <Separator />
              <p>
                <strong>Best practices:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use descriptive file names</li>
                <li>Select appropriate categories</li>
                <li>Keep files under 10MB</li>
                <li>Ensure text is readable (not scanned images)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
