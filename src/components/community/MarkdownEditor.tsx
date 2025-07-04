import React, { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Eye,
  EyeOff,
  Type
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your post...",
  disabled = false,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length + selectedText.length + after.length,
        start + before.length + selectedText.length + after.length
      );
    }, 0);
  }, [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('_', '_');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)');
          break;
      }
    }
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertMarkdown('**', '**'),
      shortcut: 'Ctrl+B'
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertMarkdown('_', '_'),
      shortcut: 'Ctrl+I'
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertMarkdown('[', '](url)'),
      shortcut: 'Ctrl+K'
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertMarkdown('\n- ', '')
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertMarkdown('\n1. ', '')
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertMarkdown('\n> ', '')
    },
    {
      icon: Code,
      label: 'Code',
      action: () => insertMarkdown('`', '`')
    }
  ];

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'write' | 'preview')}>
        <div className="flex items-center justify-between border-b p-2">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {activeTab === 'write' && (
            <div className="flex items-center gap-1">
              {toolbarButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  disabled={disabled}
                  className="h-8 w-8 p-0"
                  title={`${button.label} (${button.shortcut || ''})`}
                >
                  <button.icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="write" className="m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[200px] border-0 focus-visible:ring-0 resize-none"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div className="min-h-[200px] p-4 prose prose-sm max-w-none dark:prose-invert">
            {value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">Nothing to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {activeTab === 'write' && (
        <div className="border-t bg-gray-50 dark:bg-gray-800 p-2 text-xs text-gray-500">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">**bold**</Badge>
            <Badge variant="outline" className="text-xs">_italic_</Badge>
            <Badge variant="outline" className="text-xs">[link](url)</Badge>
            <Badge variant="outline" className="text-xs">- list</Badge>
            <Badge variant="outline" className="text-xs">`code`</Badge>
            <Badge variant="outline" className="text-xs">&gt; quote</Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;