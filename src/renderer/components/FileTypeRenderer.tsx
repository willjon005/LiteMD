import React from 'react';
import MarkdownViewer from './MarkdownViewer';
import Editor from './Editor';

interface FileTypeRendererProps {
  content: string;
  mimeType: string;
  fileName: string;
  mode: 'view' | 'edit';
  onChange: (content: string) => void;
}

const FileTypeRenderer: React.FC<FileTypeRendererProps> = ({
  content,
  mimeType,
  fileName,
  mode,
  onChange
}) => {
  const isText = mimeType.startsWith('text/') || mimeType === 'application/json';

  if (isText && mode === 'edit') {
    return <Editor content={content} onChange={onChange} />;
  }

  if (mimeType === 'text/markdown') {
    return <MarkdownViewer content={content} />;
  }

  if (mimeType === 'application/pdf') {
    return <div className="placeholder">PDF viewing is not implemented yet.</div>;
  }

  if (isText) {
    return (
      <div className="plain-text">
        <pre>{content}</pre>
      </div>
    );
  }

  return (
    <div className="placeholder">
      <p>Cannot display {fileName}</p>
      <p className="placeholder-detail">Unsupported file type ({mimeType})</p>
    </div>
  );
};

export default FileTypeRenderer;
