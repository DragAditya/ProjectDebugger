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
import { Loader2, LogOut, Copy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const { logoutMutation, user } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState("javascript");
  const [targetLanguage, setTargetLanguage] = useState("python");
  const [code, setCode] = useState("");

  const debugMutation = useMutation({
    mutationFn: async (data: { code: string; language: string }) => {
      const res = await apiRequest("POST", "/api/debug", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Code analyzed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to analyze code",
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
      toast({
        title: "Code translated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to translate code",
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
      toast({
        title: "Code explained successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to explain code",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDebug = () => {
    debugMutation.mutate({ code, language });
  };

  const handleTranslate = () => {
    translateMutation.mutate({ 
      code, 
      fromLanguage: language,
      toLanguage: targetLanguage 
    });
  };

  const handleExplain = () => {
    explainMutation.mutate({ code, language });
  };

  // Get the appropriate results to display
  const getResults = () => {
    if (translateMutation.data) return translateMutation.data;
    if (explainMutation.data) return explainMutation.data;
    return debugMutation.data;
  };

  // Clear other results when switching operations
  const clearOtherResults = (keeping: 'debug' | 'translate' | 'explain') => {
    if (keeping !== 'debug') debugMutation.reset();
    if (keeping !== 'translate') translateMutation.reset();
    if (keeping !== 'explain') explainMutation.reset();
  };

  const handleDebugWithReset = () => {
    clearOtherResults('debug');
    handleDebug();
  };

  const handleTranslateWithReset = () => {
    clearOtherResults('translate');
    handleTranslate();
  };

  const handleExplainWithReset = () => {
    clearOtherResults('explain');
    handleExplain();
  };

  const handleCopy = () => {
    const results = getResults();
    const codeToCopy = results?.correctedCode || results?.translatedCode || '';
    navigator.clipboard.writeText(codeToCopy);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Code Debugger</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation?.isPending}
            >
              {logoutMutation?.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Code Input</h2>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
              className="min-h-[400px] font-mono"
            />
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleDebugWithReset}
                disabled={debugMutation.isPending}
              >
                {debugMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Debug Code
              </Button>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={handleTranslateWithReset}
                  disabled={translateMutation.isPending}
                >
                  {translateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Translate Code
                </Button>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={handleExplainWithReset}
                disabled={explainMutation.isPending}
              >
                {explainMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Explain Code
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Results</h2>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <DebugResults 
                results={getResults()} 
                language={targetLanguage}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}