import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
}

const languageExtensions: Record<string, any> = {
  javascript,
  python,
  java,
  cpp
};

export default function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const [editor, setEditor] = useState<EditorView | null>(null);

  useEffect(() => {
    const container = document.getElementById("code-editor-container");
    if (!container) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        languageExtensions[language](),
        EditorState.readOnly.of(readOnly),
        EditorView.updateListener.of(update => {
          if (update.docChanged && !readOnly) {
            onChange(update.state.doc.toString());
          }
        })
      ]
    });

    const view = new EditorView({
      state: startState,
      parent: container
    });

    setEditor(view);

    return () => {
      view.destroy();
    };
  }, [language, readOnly]); // Recreate editor when language or readOnly changes

  useEffect(() => {
    if (editor && value !== editor.state.doc.toString()) {
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: value
        }
      });
    }
  }, [value, editor]);

  return (
    <Card className="relative min-h-[400px] overflow-hidden">
      <div 
        id="code-editor-container" 
        className="absolute inset-0 w-full h-full p-4 font-mono"
      />
    </Card>
  );
}