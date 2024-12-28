import { API_BASE_URL } from "./config";

export const getImageUrl = (imageName: string): string => {
  return `${API_BASE_URL}/uploads/${imageName}`;
};
