'use client';

import { Message } from '@/lib/actions';
import { FormProps } from './Form';

const INITIAL_MESSAGES = [
  "ComfyUI 工作流托管服务是按什么计费的？",
  '无法激活 Conda 环境',
  '如何登录任务 worker 节点',
  '为什么没有 cuda 环境和 nvcc 命令',
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
      Typesense + 无问芯穹: AI 驱动的对话式搜索
      </h2>
      <p className="mt-4 text-gray-700 text-center max-w-lg text-balance">
        本页面展示了基于 Typesense 实现的 AI 驱动的对话式搜索功能，数据源来自 {' '}
        <a
          href="https://paulgraham.com/articles.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 underline underline-offset-2"
        >
          无问芯穹技术文档
        </a>
        。
      </p>
      <div className="grid xs:grid-cols-2 gap-2 mt-14">
        {INITIAL_MESSAGES.map((message, i) => (
          <SuggestionButton key={i} message={message} onClick={handleClick} />
        ))}
      </div>
    </div>
  );
}