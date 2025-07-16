import React, { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { python } from "@codemirror/lang-python";
import { defaultKeymap } from "@codemirror/commands";
import { basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark"; // <-- 1. Add this import

export default function PythonEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  // Initialize the editor
  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const state = EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          oneDark, // <-- 2. Add the theme to the extensions
          python(),
          keymap.of(defaultKeymap),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const doc = update.state.doc.toString();
              onChange(doc);
            }
          }),
        ],
      });

      const view = new EditorView({
        state,
        parent: editorRef.current,
      });

      viewRef.current = view;

      // Cleanup on unmount
      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }
  }, [onChange]);

  // Synchronize external value changes with the editor
  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (value !== currentDoc) {
        viewRef.current.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: value },
        });
      }
    }
  }, [value]);

  return (
    <div
      ref={editorRef}
      style={{
        border: "1px solid #334155", // Adjusted border for the new theme
        borderRadius: "0.375rem", // 6px
        overflow: "hidden", // Ensures the theme's background respects the border radius
      }}
    />
  );
}
