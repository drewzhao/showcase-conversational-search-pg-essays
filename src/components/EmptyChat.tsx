'use client';

import { Message } from '@/lib/actions';
import { FormProps } from './Form';

const INITIAL_MESSAGES = [
  "What is the Maker's Schedule?",
  'What are the characteristics of a good startup idea?',
  'What are the advantages and disadvantages of a startup being located in Silicon Valley?',
  'Perspective on the role of hacker culture in society',
];

function SuggestionButton({
  message,
  onClick,
}: {
  message: string;
  onClick: (message: string) => void;
}) {
  return (
    <button
      className="rounded-lg bg-gray-100 py-3 xs:py-2 px-4 text-xs text-left text-gray-900 hover:bg-gray-200 transition-colors"
      onClick={() => onClick(message)}
    >
      {message}
    </button>
  );
}

export default function EmptyChat({ onRequest }: FormProps) {
  const handleClick = (message: string) => {
    const userMessage: Message = { message, sender: 'user', sources: [] };
    onRequest(userMessage);
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center">
      <h2 className="text-2xl font-semibold text-center">
        Conversational Search on PG Essays
      </h2>
      <p className="mt-4 text-gray-700 text-center max-w-lg text-balance">
        This demo showcases the AI powered conversational search capabilities of
        Typesense with{' '}
        <a
          href="https://paulgraham.com/articles.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 underline underline-offset-2"
        >
          Paul Graham's essays
        </a>
        .
      </p>
      <div className="grid xs:grid-cols-2 gap-2 mt-14">
        {INITIAL_MESSAGES.map((message, i) => (
          <SuggestionButton key={i} message={message} onClick={handleClick} />
        ))}
      </div>
    </div>
  );
}