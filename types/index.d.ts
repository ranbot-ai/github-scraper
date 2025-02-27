export interface IOrgInfo {
  name: string;
  picImageURL: string;
  description: string;
  topLanguages: string[];
  peopleCount: number;
  followers: number;
  location: string;
  website: string;
  socialLinks: string[];
  repositories?: IOrgRepoInfo[];
  totalRepositoriesCount?: number;
}

export interface IUserInfo {
  name: string;
  nickname: string;
  picImageURL: string;
  followers: number;
  following: number;
  location: string;
  website: string;
  currentCompany: string;
  position: string;
  organizations?: {
    name: string;
    link: string;
    orgImageURL: string;
  }[];
  repositories?: IOrgRepoInfo[];
  totalRepositoriesCount?: number;
}

export interface IOrgRepoInfo {
  name: string;
  link: string;
  description?: string;
  programmingLanguage?: string;
  stars?: string;
  forks?: string;
  docsPulls?: string;
}
