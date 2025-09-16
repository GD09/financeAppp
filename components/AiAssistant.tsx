import React, { useState, useRef, useEffect } from 'react';
import type { Transaction } from '../types';
import { getFinancialInsight } from '../services/geminiService';
import { SparklesIcon, PaperAirplaneIcon } from './icons/Icons';
import { TransactionType } from '../types';

interface AiAssistantProps {
  transactions: Transaction[];
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ transactions }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestionPrompts = [
    "What are my top 3 spending categories?",
    "How much did I spend on groceries this month?",
    "Suggest some ways I can save money.",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const formatAIResponse = (text: string): string => {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map(line => {
        const trimmedLine = line.trim();
        const isListItem = trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ');
        let output = '';

        if (isListItem) {
            if (!inList) {
                output += '<ul class="list-disc pl-5 space-y-1">';
                inList = true;
            }
            output += `<li>${trimmedLine.substring(2)}</li>`;
        } else {
            if (inList) {
                output += '</ul>';
                inList = false;
            }
            if (trimmedLine) {
                output += `<p class="mb-2">${line}</p>`;
            }
        }
        return output;
    });

    if (inList) {
        processedLines.push('</ul>');
    }

    return processedLines.join('');
  }
  
  const handleSubmit = async (currentPrompt: string, isSystemRequest: boolean = false) => {
    if (!currentPrompt.trim() || isLoading) return;

    const newMessages: Message[] = [...messages];
    if (!isSystemRequest) {
      newMessages.push({ sender: 'user', text: currentPrompt });
    }
    setMessages(newMessages);
    setPrompt('');
    setIsLoading(true);

    try {
      const aiResponse = await getFinancialInsight(currentPrompt, transactions);
      setMessages([...newMessages, { sender: 'ai', text: formatAIResponse(aiResponse) }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'ai', text: 'Sorry, I ran into an issue. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    const prompt = "Summarize my expenses based on the provided transaction data. Highlight my top spending categories, identify any potential areas for savings, and mention any unusual or large expenses.";
    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
    
    if (expenseTransactions.length === 0) {
      setMessages([...messages, { sender: 'ai', text: "You don't have any expense transactions to summarize." }]);
      return;
    }
    
    // Pass the filtered transactions to the AI
    handleSubmit(prompt, true);
  };


  return (
    <div className="bg-transparent flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            <p className="mb-4">Ask me anything about your finances! Try one of these prompts:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestionPrompts.map(p => (
                    <button key={p} onClick={() => handleSubmit(p)} className="text-sm p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-left text-gray-700 dark:text-gray-300">
                        {p}
                    </button>
                ))}
            </div>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow ${msg.sender === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
              <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text }}></div>
            </div>
          </div>
        ))}
         {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-xs md:max-w-md p-3 rounded-xl bg-gray-200 dark:bg-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 mb-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
        >
          <SparklesIcon className="h-5 w-5 text-accent" />
          Generate Expense Summary
        </button>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(prompt);}} className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !prompt.trim()} className="bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistant;
