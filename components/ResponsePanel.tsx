import React from 'react';
import { Message } from '../types';
import { BotIcon, UserIcon, SproutIcon } from './Icons';
import ReactMarkdown from 'react-markdown';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';

interface ResponsePanelProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  seasonTheme: Theme;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ 
  messages, isLoading, error, seasonTheme
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const SproutingSeedLoader = () => (
    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
        <SproutIcon />
        <span className="text-sm font-medium animate-pulse">{t('typing')}</span>
    </div>
  );

  return (
    <div className={`flex-grow bg-black/5 dark:bg-white/5 p-4 md:p-6 rounded-2xl shadow-inner overflow-y-auto h-96 transition-colors duration-300`}>
      {messages.length === 0 && !isLoading && !error && (
        <div className="flex items-center justify-center h-full">
          <p className={`${seasonTheme.textMuted}`}>{t('start_prompt')}</p>
        </div>
      )}

      <div className="space-y-6">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.isUser ? 'justify-end' : ''}`}>
            {!msg.isUser && (
              <div className={`flex-shrink-0 h-10 w-10 rounded-full ${seasonTheme.primaryBg} flex items-center justify-center text-white`}>
                <BotIcon />
              </div>
            )}
            <div className={`max-w-xl p-4 rounded-2xl shadow ${
              msg.isUser
                ? `${seasonTheme.secondaryBg} text-white rounded-br-none`
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
            }`}>
              {msg.imagePreview && (
                <div className="mb-2">
                    <p className="font-semibold text-sm mb-2 italic">"{msg.originalQuery}"</p>
                    <img src={msg.imagePreview} alt="User upload" className="max-h-40 rounded-lg" />
                </div>
              )}
              <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                  {isLoading && !msg.isUser && index === messages.length - 1 && <SproutingSeedLoader />}
              </div>
              <p className="text-xs text-right mt-2 opacity-70">{msg.timestamp}</p>
            </div>
             {msg.isUser && (
              <div className={`flex-shrink-0 h-10 w-10 rounded-full ${seasonTheme.secondaryBg} flex items-center justify-center text-white`}>
                <UserIcon />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && !isLoading && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
          <p><strong>{t('system_error')}</strong> {error}</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ResponsePanel;