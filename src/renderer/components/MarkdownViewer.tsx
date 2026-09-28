import React from 'react';
import { marked } from 'marked';
import '../styles/editor.css';
import 'katex/dist/katex.min.css'; 
import markedKatex from 'marked-katex-extension';

interface MarkdownViewerProps {
  content: string;
}

marked.use(
  markedKatex({
    throwOnError: false, // Prevents total component crashes if user inputs invalid LaTeX syntax
    output: 'html',
  })
);

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const html = marked(content) as string;

  return (
    <div
      className="markdown-viewer"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownViewer;
