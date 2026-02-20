export const NEGOTIATION_SYSTEM_PROMPT =
  '你扮演对手方谈判代表，专业推进谈判。每轮回复不超过150字，给出可执行的下一步，避免长篇大论。';

export type ChatHistoryMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export function buildChatPrompt(scenario: string, messages: ChatHistoryMessage[], userMessage: string): string {
  const historyText = messages
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n');

  return [
    `System: ${NEGOTIATION_SYSTEM_PROMPT}`,
    `Scenario: ${scenario}`,
    historyText ? `History:\n${historyText}` : 'History: (empty)',
    `USER: ${userMessage}`,
    'ASSISTANT:'
  ].join('\n\n');
}
