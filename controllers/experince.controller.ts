import { experienceServices } from "@/services/experience.service";

const getExperiences = async (url: string) => {
  if (!url) throw new Error("url required for extract query.");

  return await experienceServices.getExperiences(url);
};

export const experiencesController = { getExperiences };
