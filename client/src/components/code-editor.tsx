import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const [editor, setEditor] = useState<any>(null);

  useEffect(() => {
    // Dynamically import CodeMirror
    import("codemirror").then((CodeMirror) => {
      if (!editor) {
        const cm = CodeMirror.fromTextArea(
          document.getElementById("code-editor") as HTMLTextAreaElement,
          {
            mode: language,
            theme: "material",
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            indentUnit: 2,
            tabSize: 2,
            lineWrapping: true,
          }
        );

        cm.on("change", (instance) => {
          onChange(instance.getValue());
        });

        setEditor(cm);
      }
    });

    return () => {
      if (editor) {
        editor.toTextArea();
      }
    };
  }, []);

  useEffect(() => {
    if (editor) {
      editor.setOption("mode", language);
    }
  }, [language]);

  return (
    <Card className="relative min-h-[400px] overflow-hidden">
      <textarea
        id="code-editor"
        defaultValue={value}
        className="absolute inset-0 w-full h-full p-4 font-mono"
      />
    </Card>
  );
}
