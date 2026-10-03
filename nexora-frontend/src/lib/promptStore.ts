export type PromptItem = {
  id: string;
  promptId: number;
  question: string;
  answer: string;
};

let selectedPrompts: PromptItem[] = [];

export const setSelectedPrompts = (prompts: PromptItem[]) => {
  selectedPrompts = prompts.slice(0, 3);
};

export const getSelectedPrompts = (): PromptItem[] => {
  return selectedPrompts;
};

export const clearSelectedPrompts = () => {
  selectedPrompts = [];
};