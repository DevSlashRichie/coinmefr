'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatInterfaceProps = {
  initialMessage?: string;
  title?: string;
  /* apiKey: string; */
  systemPrompt?: string;
  additionalContext?: string;
};

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant that provides clear and concise responses.`;

const ChatInterface = ({
  initialMessage = 'Hello! How can I help you today?',
  title = 'AI Assistant',
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  additionalContext = '',
}: ChatInterfaceProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
    dangerouslyAllowBrowser: true,
  });

  console.log('API Key present:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);

  // Combine system prompt with additional context if provided
  const fullSystemPrompt = additionalContext
    ? `${systemPrompt}\n\nAdditional Context: ${additionalContext}`
    : systemPrompt;

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: fullSystemPrompt,
    },
    {
      role: 'assistant',
      content: initialMessage,
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleUserInput = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    const currentInput = userInput;
    console.log('User input:', currentInput);
    setUserInput('');

    // Add user message to chat
    const newUserMessage: ChatMessage = { role: 'user', content: currentInput };
    setChatHistory((prev) => [...prev, newUserMessage]);

    try {
      // Prepare messages for API call
      const messages = chatHistory.filter((msg) => msg.role !== 'system').concat(newUserMessage);

      console.log('Messages being sent to API:', messages);
      console.log('System prompt being used:', fullSystemPrompt);

      // Make API call
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Hay un error aquí, debería ser 'gpt-4' o 'gpt-3.5-turbo'
        messages: [{ role: 'system', content: fullSystemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
      });

      console.log('API Response:', chatCompletion);

      const responseContent = chatCompletion.choices[0]?.message?.content || 'No response generated.';

      // Add assistant's response to chat
      setChatHistory((prev) => [...prev, { role: 'assistant', content: responseContent }]);
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        response: err.response,
      });
      setError('Sorry, there was an error processing your message. Please try again.');

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleUserInput();
    }
  };

  return (
    <div className="relative flex flex-col h-full min-h-fit w-full max-w-4xl mx-auto bg-gray-50">
      <div className="sticky top-0 flex w-full items-center justify-between p-4 border-b bg-white shadow z-20">
        <MessageCircle className="w-6 h-6" />
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="w-6 h-6" /> {/* Spacer for alignment */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map(
          (message, index) =>
            message.role !== 'system' && (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 shadow'
                  }`}
                >
                  <div className="text-sm mb-1 opacity-75">{message.role === 'user' ? 'You' : title}</div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            )
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="sticky p-4 border-t bg-white bottom-0">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Type a message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleUserInput}
            disabled={isLoading}
            className="flex items-center justify-center p-2 w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
