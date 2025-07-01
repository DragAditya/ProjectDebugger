import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import DebugResults from "@/components/debug-results";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Copy, Code, Zap, MessageSquare, User, Settings, ArrowRight, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";

const languages = [
  { value: "javascript", label: "JavaScript", icon: "🟨" },
  { value: "python", label: "Python", icon: "🐍" },
  { value: "java", label: "Java", icon: "☕" },
  { value: "cpp", label: "C++", icon: "⚡" },
  { value: "typescript", label: "TypeScript", icon: "🔷" },
  { value: "go", label: "Go", icon: "🐹" },
  { value: "rust", label: "Rust", icon: "🦀" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      duration: 0.6,
      bounce: 0.3
    }
  }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      duration: 0.5,
      bounce: 0.2
    }
  }
};

export default function HomePage() {
  const { logoutMutation, user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [language, setLanguage] = useState("javascript");
  const [targetLanguage, setTargetLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<"debug" | "translate" | "explain">("debug");

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "🔒 Authentication required",
        description: "Please sign in to access the dashboard",
        variant: "destructive",
      });
      setLocation("/auth");
    }
  }, [user, authLoading, setLocation, toast]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  const debugMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      const res = await apiRequest("POST", "/api/debug", data);
      return res.json();
    },
    onSuccess: () => {
      setActiveTab("debug");
      toast({
        title: "✅ Code analyzed successfully",
        description: "Found issues and provided fixes",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to analyze code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const translateMutation = useMutation({
    mutationFn: async (data: { code: string; fromLanguage: string; toLanguage: string }) => {
      const res = await apiRequest("POST", "/api/translate", data);
      return res.json();
    },
    onSuccess: () => {
      setActiveTab("translate");
      toast({
        title: "✅ Code translated successfully",
        description: `Converted from ${language} to ${targetLanguage}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to translate code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const explainMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      const res = await apiRequest("POST", "/api/explain", data);
      return res.json();
    },
    onSuccess: () => {
      setActiveTab("explain");
      toast({
        title: "✅ Code explained successfully",
        description: "Generated detailed explanation",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to explain code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getResults = () => {
    switch (activeTab) {
      case "translate":
        return translateMutation.data;
      case "explain":
        return explainMutation.data;
      default:
        return debugMutation.data;
    }
  };

  const clearOtherResults = (keeping: 'debug' | 'translate' | 'explain') => {
    if (keeping !== 'debug') debugMutation.reset();
    if (keeping !== 'translate') translateMutation.reset();
    if (keeping !== 'explain') explainMutation.reset();
  };

  const handleDebugWithReset = () => {
    if (!code.trim()) {
      toast({
        title: "⚠️ No code provided",
        description: "Please enter some code to debug",
        variant: "destructive",
      });
      return;
    }
    clearOtherResults('debug');
    debugMutation.mutate({ code, language });
  };

  const handleTranslateWithReset = () => {
    if (!code.trim()) {
      toast({
        title: "⚠️ No code provided",
        description: "Please enter some code to translate",
        variant: "destructive",
      });
      return;
    }
    if (language === targetLanguage) {
      toast({
        title: "⚠️ Same language selected",
        description: "Please select different source and target languages",
        variant: "destructive",
      });
      return;
    }
    clearOtherResults('translate');
    translateMutation.mutate({ code, fromLanguage: language, toLanguage: targetLanguage });
  };

  const handleExplainWithReset = () => {
    if (!code.trim()) {
      toast({
        title: "⚠️ No code provided",
        description: "Please enter some code to explain",
        variant: "destructive",
      });
      return;
    }
    clearOtherResults('explain');
    explainMutation.mutate({ code, language });
  };

  const handleCopy = () => {
    const results = getResults();
    const codeToCopy = results?.correctedCode || results?.translatedCode || '';
    if (codeToCopy) {
      navigator.clipboard.writeText(codeToCopy);
      toast({
        title: "📋 Code copied to clipboard",
        duration: 1500,
      });
    }
  };

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Developer';
  const isLoading = debugMutation.isPending || translateMutation.isPending || explainMutation.isPending;

  const selectedLanguage = languages.find(l => l.value === language);
  const selectedTargetLanguage = languages.find(l => l.value === targetLanguage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 safe-top">
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.h1 
                className="text-heading gradient-text font-bold"
                whileHover={{ scale: 1.05 }}
                onClick={() => setLocation("/")}
                style={{ cursor: "pointer" }}
              >
                ALTER
              </motion.h1>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Welcome, {username}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/chat")}
                className="btn btn-ghost btn-sm touch-target"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="btn btn-outline btn-sm touch-target"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Logout</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile user info */}
          <div className="sm:hidden mt-3 flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Welcome back, {username}</span>
          </div>
        </div>
      </header>

      <main className="container-mobile py-6 space-mobile">
        {/* Hero Section */}
        <motion.div 
          className="text-center space-y-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border/30">
              AI-Powered Analysis
            </span>
          </div>
          <h1 className="text-display font-bold">
            Debug, Translate & Understand Code
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform your development workflow with AI-powered code analysis that finds bugs, translates between languages, and explains complex logic.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Input Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="card-mobile">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-primary" />
                  <span>Code Input</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Language</label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="input-mobile">
                        <SelectValue>
                          <div className="flex items-center space-x-2">
                            <span>{selectedLanguage?.icon}</span>
                            <span>{selectedLanguage?.label}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center space-x-2">
                              <span>{lang.icon}</span>
                              <span>{lang.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Language (for translation)</label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="input-mobile">
                        <SelectValue>
                          <div className="flex items-center space-x-2">
                            <span>{selectedTargetLanguage?.icon}</span>
                            <span>{selectedTargetLanguage?.label}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center space-x-2">
                              <span>{lang.icon}</span>
                              <span>{lang.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Code Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Code</label>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Enter your ${selectedLanguage?.label || language} code here...

Example:
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`}
                    className="textarea-mobile code-mobile min-h-[300px] font-mono text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleDebugWithReset}
                    disabled={isLoading}
                    className="btn btn-primary btn-lg w-full touch-target"
                  >
                    {debugMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4" />
                    )}
                    Debug & Fix Code
                  </Button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={handleTranslateWithReset}
                      disabled={isLoading}
                      variant="outline"
                      className="btn btn-outline btn-md touch-target"
                    >
                      {translateMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="mr-2 h-4 w-4" />
                      )}
                      Translate
                    </Button>

                    <Button
                      onClick={handleExplainWithReset}
                      disabled={isLoading}
                      variant="outline"
                      className="btn btn-outline btn-md touch-target"
                    >
                      {explainMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquare className="mr-2 h-4 w-4" />
                      )}
                      Explain
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="card-mobile">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <span>AI Analysis Results</span>
                  </CardTitle>
                  {getResults() && (
                    <Button
                      onClick={handleCopy}
                      size="sm"
                      variant="outline"
                      className="btn btn-outline btn-sm touch-target"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + (getResults()?.id || 'empty')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <div className="text-center">
                          <p className="font-medium text-foreground">
                            {debugMutation.isPending && "Analyzing code..."}
                            {translateMutation.isPending && "Translating..."}
                            {explainMutation.isPending && "Generating explanation..."}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            This usually takes a few seconds
                          </p>
                        </div>
                      </div>
                    ) : getResults() ? (
                      <DebugResults
                        results={getResults()}
                        language={activeTab === "translate" ? targetLanguage : language}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                          <Code className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-2">Ready to analyze</h3>
                          <p className="text-muted-foreground text-sm max-w-sm">
                            Enter your code and choose an action to get started. 
                            Our AI will help you debug, translate, or explain your code.
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Tips Section */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="card-mobile bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Pro Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div>
                  <strong className="text-foreground">🐛 Debug:</strong> Paste problematic code to find bugs, security issues, and performance improvements.
                </div>
                <div>
                  <strong className="text-foreground">🔄 Translate:</strong> Convert code between languages while maintaining functionality and best practices.
                </div>
                <div>
                  <strong className="text-foreground">📖 Explain:</strong> Get detailed explanations of complex algorithms and code patterns.
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}