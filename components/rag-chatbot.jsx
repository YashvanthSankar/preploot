'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Upload, 
  Send, 
  File, 
  Bot, 
  User,
  Paperclip,
  Loader2,
  FileText,
  Download,
  Maximize,
  Minimize,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function RAGChatbot() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'upload'
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUploadedFiles = async () => {
    try {
      const response = await fetch(`/api/user/${session.user.id}/files`);
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  // Load uploaded files when opened
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      loadUploadedFiles();
    }
  }, [isOpen, session]);

  const handleFileUpload = async (files) => {
    if (!session?.user?.id) return;
    
    const formData = new FormData();
    const file = files[0];
    
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      toast.error('Please upload PDF or DOCX files only');
      return;
    }
    
    formData.append('file', file);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/user/${session.user.id}/upload/pdf`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`${file.name} uploaded successfully!`);
        await loadUploadedFiles();
        setActiveTab('chat');
        
        // Add a system message about the upload
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          content: `📄 Uploaded: ${file.name}. You can now ask questions about this document!`,
          timestamp: new Date()
        }]);
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session?.user?.id) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/user/${session.user.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage
        }),
      });
      
      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.answer || data.error,
        sources: data.context_used || [],
        timestamp: new Date(),
        isError: !response.ok
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const handleChatButtonClick = () => {
    if (!session) {
      toast.error('Please login to use Preploot AI');
      router.push('/login');
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0 }}
      >
        <Button
          onClick={handleChatButtonClick}
          className="h-14 px-6 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 shadow-2xl border-4 border-background text-white font-semibold transition-all duration-300 hover:shadow-purple-500/25"
          size="lg"
          title="Preploot AI Assistant - Click to chat!"
        >
          <MessageCircle className="h-6 w-6 mr-3" />
          <span className="text-sm text-white font-bold">
            Preploot AI ✨
          </span>
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && session && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={isFullscreen 
              ? "fixed inset-0 z-50 p-4" 
              : "fixed bottom-6 right-6 z-50 w-96 h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]"
            }
          >
            <Card className={`h-full flex flex-col shadow-2xl border-2 bg-background/95 backdrop-blur-sm ${
              isFullscreen ? "max-w-7xl mx-auto" : ""
            }`}>
              {/* Header */}
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-6 w-6 text-purple-600" />
                    <CardTitle className="text-lg bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                      Preploot AI Assistant
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/chat')}
                      className="h-8 w-8 p-0"
                      title="Open in full page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="h-8 w-8 p-0"
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsOpen(false);
                        setIsFullscreen(false);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant={activeTab === 'chat' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('chat')}
                    className="flex-1"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Chat
                  </Button>
                  <Button
                    variant={activeTab === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('upload')}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0 overflow-hidden">
                {activeTab === 'chat' ? (
                  // Chat Tab
                  <div className="flex flex-col h-full">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Upload documents and ask questions!</p>
                          <p className="text-sm mt-2">I can help you analyze PDFs and DOCX files.</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-xl px-4 py-3 shadow-sm ${
                                message.type === 'user'
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                  : message.type === 'system'
                                  ? 'bg-gray-100 text-gray-600 text-sm'
                                  : message.isError
                                  ? 'bg-red-50 text-red-600 border border-red-200'
                                  : 'bg-gradient-to-r from-green-50 to-blue-50 text-gray-800 border border-green-200'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                {message.type === 'bot' && (
                                  <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                                )}
                                {message.type === 'user' && (
                                  <User className="h-4 w-4 mt-1 flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {/* Loading indicator */}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4" />
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask about your documents..."
                            className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={isLoading}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveTab('upload')}
                            className="absolute right-1 top-1 h-6 w-6 p-0"
                          >
                            <Paperclip className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {messages.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearChat}
                          className="mt-2 text-xs"
                        >
                          Clear Chat
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  // Upload Tab
                  <div className="h-full p-4">
                    {/* Drag & Drop Area */}
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center transition-colors
                        ${isDragging 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted-foreground/25 hover:border-primary/50'
                        }
                      `}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm font-medium mb-2">
                        Drag & drop files here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Supports PDF and DOCX files
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <File className="h-4 w-4 mr-2" />
                            Choose Files
                          </>
                        )}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                        className="hidden"
                      />
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Uploaded Documents ({uploadedFiles.length})
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {uploadedFiles.map((file, idx) => {
                            const fileName = file.name || file;
                            const fileType = file.type || (typeof fileName === 'string' ? fileName.split('.').pop()?.toLowerCase() : '');
                            return (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm flex-1 truncate">{fileName}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {fileType === 'pdf' ? 'PDF' : fileType === 'docx' ? 'DOCX' : fileType?.toUpperCase() || 'FILE'}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}