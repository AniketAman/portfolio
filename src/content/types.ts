export type ResumeLink = {
  label: string;
  url: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  highlights: string[];
  links: ResumeLink[];
};

export type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  details: string[];
};

export type Skills = {
  languages: string[];
  frontend: string[];
  backend: string[];
  product: string[];
};

export type Education = {
  school: string;
  degree: string;
  period: string;
};

export type Profile = {
  name: string;
  role: string;
  location: string;
  email: string;
  website: string;
  github: string;
  linkedin: string;
  summary: string;
};

export type ResumeData = {
  profile: Profile;
  about: string[];
  experience: ExperienceItem[];
  projects: Project[];
  skills: Skills;
  education: Education;
  currentFocus: string[];
};
