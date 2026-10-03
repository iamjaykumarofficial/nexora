export type PhotoItem = {
  id: string;
  uri: string;
};

let selectedPhotos: PhotoItem[] = [];

export const setSelectedPhotos = (
  photos: PhotoItem[]
): void => {
  selectedPhotos = [...photos];
};

export const getSelectedPhotos = (): PhotoItem[] => {
  return [...selectedPhotos];
};

export const clearSelectedPhotos = (): void => {
  selectedPhotos = [];
};