export type ProfileBasics = {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  lookingForGender?: string;
  height?: string;
  exercise?: string;
  education?: string;
  drinking?: string;
  smoking?: string;
  zodiac?: string;
  religion?: string;
  bio?: string;
};

export type SelectedInterest = {
  id: number;
  name: string;
};

let profileBasics: ProfileBasics = {};
let selectedInterests: SelectedInterest[] = [];

export const setProfileBasics = (value: ProfileBasics) => {
  profileBasics = {
    ...profileBasics,
    ...value,
  };
};

export const getProfileBasics = (): ProfileBasics => {
  return profileBasics;
};

export const setSelectedInterests = (value: SelectedInterest[]) => {
  selectedInterests = [...value];
};

export const getSelectedInterests = (): SelectedInterest[] => {
  return [...selectedInterests];
};

export const clearProfileStore = () => {
  profileBasics = {};
  selectedInterests = [];
};
