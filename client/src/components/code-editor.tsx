import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { basicSetup, minimalSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  adaptiveHeight?: boolean;
}

const languageExtensions: Record<string, any> = {
  javascript,
  python,
  java,
  cpp
};

export default function CodeEditor({ value, onChange, language, readOnly = false, adaptiveHeight = false }: CodeEditorProps) {
  const [editor, setEditor] = useState<EditorView | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Calculate line count to set height
    const lineCount = value.split('\n').length;
    if (adaptiveHeight && container) {
      // Set a min-height of 3 lines and max based on content
      const lineHeight = 22; // Approximate line height in pixels
      const padding = 32; // Padding for the container
      const height = Math.max(3 * lineHeight, Math.min(30 * lineHeight, lineCount * lineHeight)) + padding;
      container.style.height = `${height}px`;
    }

    const startState = EditorState.create({
      doc: value,
      extensions: [
        readOnly ? minimalSetup : basicSetup,
        languageExtensions[language](),
        EditorState.readOnly.of(readOnly),
        readOnly ? [] : lineNumbers(),
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
    <Card className={`relative ${adaptiveHeight ? '' : 'min-h-[400px]'} overflow-hidden`}>
      <div 
        ref={containerRef}
        className="w-full p-4 font-mono overflow-x-auto"
        style={{ height: adaptiveHeight ? 'auto' : '400px' }}
      />
    </Card>
  );
}