import { getData, saveData } from "../services/storage";

export const useStorage = () => {
  return {
    saveData,
    getData,
  };
};