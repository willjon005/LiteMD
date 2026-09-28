import React, { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import '../styles/editor.css';

const githubDarkHighlighting = HighlightStyle.define([
  { tag: tags.keyword, color: '#ff7b72' },
  { tag: tags.operator, color: '#ff7b72' },
  { tag: tags.special(tags.variableName), color: '#ffa657' },
  { tag: tags.typeName, color: '#ffa657' },
  { tag: tags.atom, color: '#79c0ff' },
  { tag: tags.number, color: '#79c0ff' },
  { tag: tags.bool, color: '#79c0ff' },
  { tag: tags.string, color: '#a5d6ff' },
  { tag: tags.character, color: '#a5d6ff' },
  { tag: tags.regexp, color: '#a5d6ff' },
  { tag: tags.escape, color: '#a5d6ff' },
  { tag: tags.comment, color: '#8b949e', fontStyle: 'italic' },
  { tag: tags.meta, color: '#8b949e' },
  { tag: tags.invalid, color: '#f85149' },
  { tag: tags.heading1, color: '#e6edf3', fontWeight: 'bold', fontSize: '1.5em' },
  { tag: tags.heading2, color: '#e6edf3', fontWeight: 'bold', fontSize: '1.3em' },
  { tag: tags.heading3, color: '#e6edf3', fontWeight: 'bold', fontSize: '1.1em' },
  { tag: tags.heading, color: '#e6edf3', fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic', color: '#e6edf3' },
  { tag: tags.strong, fontWeight: 'bold', color: '#e6edf3' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: '#58a6ff', textDecoration: 'underline' },
  { tag: tags.url, color: '#58a6ff' },
  { tag: tags.monospace, color: '#a5d6ff', fontFamily: 'ui-monospace, SFMono-Regular, monospace' },
  { tag: tags.quote, color: '#7d8590', fontStyle: 'italic' },
  { tag: tags.contentSeparator, color: '#30363d' },
  { tag: tags.list, color: '#ff7b72' },
  { tag: tags.function(tags.variableName), color: '#d2a8ff' },
  { tag: tags.definition(tags.variableName), color: '#ffa657' },
  { tag: tags.propertyName, color: '#79c0ff' },
  { tag: tags.className, color: '#ffa657' },
  { tag: tags.labelName, color: '#79c0ff' },
  { tag: tags.namespace, color: '#ff7b72' },
  { tag: tags.macroName, color: '#d2a8ff' },
  { tag: tags.processingInstruction, color: '#8b949e' },
  { tag: tags.angleBracket, color: '#8b949e' },
  { tag: tags.tagName, color: '#7ee787' },
  { tag: tags.attributeName, color: '#79c0ff' },
  { tag: tags.attributeValue, color: '#a5d6ff' },
]);

const githubDarkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0d1117',
    color: '#e6edf3',
  },
  '.cm-content': {
    caretColor: '#58a6ff',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#58a6ff',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'rgba(56, 139, 253, 0.3)',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(110, 118, 129, 0.1)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(110, 118, 129, 0.1)',
  },
  '.cm-gutters': {
    backgroundColor: '#0d1117',
    color: '#484f58',
    borderRight: '1px solid #30363d',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 12px 0 16px',
  },
});

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        highlightSelectionMatches(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        syntaxHighlighting(githubDarkHighlighting),
        githubDarkTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (view && content !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
      });
    }
  }, [content]);

  return <div ref={containerRef} className="editor-container" />;
};

export default Editor;
