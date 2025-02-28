import { CodeEditor } from "@/components/code-editor";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DebugResultsProps {
  results: {
    id?: string;
    error?: string;
    correctedCode?: string;
    explanation?: string;
    translatedCode?: string;
  } | null;
  language: string;
}

export default function DebugResults({ results, language }: DebugResultsProps) {
  const { toast } = useToast();

  if (!results) {
    return <div className="text-muted-foreground">No results to display</div>;
  }

  if (results.error) {
    return <div className="text-destructive">{results.error}</div>;
  }

  const displayCode = results.correctedCode || results.translatedCode || '';
  const explanation = results.explanation || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    toast({
      title: "Code copied to clipboard",
    });
  };

  return (
    <div className="space-y-4">
      {displayCode && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Code</h3>
          <div className="rounded-md border relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <div style={{ 
              maxHeight: `${Math.min(displayCode.split('\n').length + 1, 20) * 24}px`, 
              minHeight: "80px" 
            }}>
              <CodeEditor 
                value={displayCode} 
                language={language} 
                readOnly={true}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {explanation && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Explanation</h3>
          <div className="rounded-md border bg-muted p-4 text-sm">
            <pre className="whitespace-pre-wrap">{explanation}</pre>
          </div>
        </div>
      )}
    </div>
  );
}