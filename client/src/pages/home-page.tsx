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
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Copy, Code, Zap, MessageSquare, User, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const { logoutMutation, user } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState("javascript");
  const [targetLanguage, setTargetLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState<"debug" | "translate" | "explain">("debug");

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

  return (
    <motion.div 
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header 
        className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50"
        variants={itemVariants}
      >
        <div className="container-fluid py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <motion.h1 
              className="text-2xl font-bold gradient-text"
              variants={fadeInScale}
            >
              ALTER
            </motion.h1>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Welcome back, {username}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="glass border-border/50 hover:border-destructive/50 hover:text-destructive"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      <main className="container-fluid py-8">
        <motion.div 
          className="grid lg:grid-cols-2 gap-8"
          variants={containerVariants}
        >
          {/* Input Section */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-primary" />
                  <span>Code Input</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language Selection */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Source Language
                    </label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="modern-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Target Language (for translation)
                    </label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger className="modern-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Code Input */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Your Code
                  </label>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Enter your ${language} code here...

Example:
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`}
                    className="min-h-[400px] font-mono text-sm code-block resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid gap-3">
                  <Button
                    onClick={handleDebugWithReset}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {debugMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4" />
                    )}
                    Debug & Fix Code
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleTranslateWithReset}
                      disabled={isLoading}
                      variant="outline"
                      className="btn-secondary"
                    >
                      {translateMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Code className="mr-2 h-4 w-4" />
                      )}
                      Translate
                    </Button>

                    <Button
                      onClick={handleExplainWithReset}
                      disabled={isLoading}
                      variant="outline"
                      className="btn-secondary"
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
          <motion.div className="space-y-6" variants={itemVariants}>
            <Card className="modern-card">
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
                      className="glass border-primary/30 hover:border-primary/50"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
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
                        <p className="text-muted-foreground">
                          {debugMutation.isPending && "Analyzing code for bugs and issues..."}
                          {translateMutation.isPending && `Translating from ${language} to ${targetLanguage}...`}
                          {explainMutation.isPending && "Generating detailed code explanation..."}
                        </p>
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
                          <h3 className="font-medium text-lg mb-2">Ready to analyze your code</h3>
                          <p className="text-muted-foreground text-sm max-w-sm">
                            Enter your code above and choose an action to get started. 
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
        </motion.div>
      </main>
    </motion.div>
  );
}