import React from 'react';
import { marked } from 'marked';
import '../styles/editor.css';

interface MarkdownViewerProps {
  content: string;
}

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
