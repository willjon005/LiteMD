import React, { useRef } from 'react';
import '../styles/editor.css';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <textarea
      ref={textareaRef}
      className="editor"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
    />
  );
};

export default Editor;
