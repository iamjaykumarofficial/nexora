export type LookingForOption = {
  id: string;
  title: string;
  subtitle: string;
};

let selectedLookingFor: LookingForOption[] = [];

export const setSelectedLookingFor = (options: LookingForOption[]) => {
  selectedLookingFor = options.slice(0, 3);
};

export const getSelectedLookingFor = (): LookingForOption[] => {
  return selectedLookingFor;
};

export const clearSelectedLookingFor = () => {
  selectedLookingFor = [];
};