export type Paper = {
  id: number;
  title: string;
  author: string;
  abstract: string;
  citations: number;
  influence_score: number;
  created_at: Date;
  updated_at: Date;
};

export type PaperResponse = {
  data: {
    papers: Paper[];
  };
};