import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import CodeEditor from "@/components/code-editor";
import DebugResults from "@/components/debug-results";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const { logoutMutation, user } = useAuth();
  const { toast } = useToast();
  const [language, setLanguage] = useState("javascript");
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

  const handleDebug = () => {
    debugMutation.mutate({ code, language });
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
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
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
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
            />
            <Button
              className="w-full"
              onClick={handleDebug}
              disabled={debugMutation.isPending}
            >
              {debugMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Debug Code
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Debug Results</h2>
            <DebugResults results={debugMutation.data} />
          </div>
        </div>
      </main>
    </div>
  );
}