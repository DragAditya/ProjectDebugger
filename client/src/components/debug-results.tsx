import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import CodeEditor from "./code-editor";

interface DebugResultsProps {
  results?: {
    issues?: string[];
    explanation?: string;
    correctedCode?: string;
    translatedCode?: string;
    overview?: string;
    detailedExplanation?: string;
    keyComponents?: string[];
  };
  language?: string;
}

export default function DebugResults({ results, language = "javascript" }: DebugResultsProps) {
  if (!results) {
    return (
      <Card className="min-h-[400px]">
        <CardContent className="p-4 h-full flex items-center justify-center text-muted-foreground">
          Debug results will appear here
        </CardContent>
      </Card>
    );
  }

  // Handle translation results
  if (results.translatedCode) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Translated Code</h3>
          <div className="mb-4">
            <CodeEditor
              value={results.translatedCode}
              onChange={() => {}}
              language={language}
              readOnly
            />
          </div>
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Translation Notes</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {results.explanation}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle explanation results
  if (results.overview) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Code Overview</h3>
          <p className="text-sm text-muted-foreground mb-4">{results.overview}</p>

          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Detailed Explanation</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {results.detailedExplanation}
            </p>
          </div>

          {results.keyComponents && results.keyComponents.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Key Components</h4>
              <ul className="space-y-1">
                {results.keyComponents.map((component, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {component}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Handle debug results
  if (results.correctedCode) {
    return (
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Corrected Code</h3>
          <div className="mb-4">
            <CodeEditor
              value={results.correctedCode}
              onChange={() => {}}
              language={language}
              readOnly
            />
          </div>

          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              {results.issues && results.issues.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {results.issues && results.issues.length > 0 ? "Issues Found" : "No Issues Found"}
            </h4>
            <ul className="space-y-2 mb-4">
              {results.issues && results.issues.map((issue, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {issue}
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Explanation</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {typeof results.explanation === 'object' 
                  ? JSON.stringify(results.explanation, null, 2)
                  : results.explanation || 'No explanation available'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}