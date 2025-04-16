import { getToken } from './auth';

const BASE_URL = 'http://localhost:3001/api';

export interface PaperData {
  title: string;
  author: string;
  abstract: string;
}

export interface CommentData {
  id: number;
  user_address: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalData {
  id: number;
  parameter_name:string;
  new_value:string;
  votes_for:number;
  votes_against:number;
  executed:boolean;
}

export interface DiffData {
  paperId: number;
  verA: string;
  verB: string;
  diff: string;
}

export const getHotPapers = async (): Promise<PaperData[]> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/paper/hot`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

export const getLatestPapers = async (): Promise<PaperData[]> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/paper/latest`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

export const getComments = async (paperId: number): Promise<CommentData[]> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/comments/${paperId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

export const addComment = async (paperId: number, comment: string): Promise<CommentData> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/comments/${paperId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ comment }),
  });
    const data = await response.json();
    return data;
};

export const getPaperCitations = async (paperId: number): Promise<number> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/paper/citations/${paperId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

export const getPaperInfluence = async (paperId: number): Promise<number> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/paper/influence/${paperId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

export const getProposals = async (): Promise<ProposalData[]> => {
  const token = getToken();
  const response = await fetch(`${BASE_URL}/proposals`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
    const data = await response.json();
    return data;
};

export const getDiff = async (paperId: number,verA:string,verB:string): Promise<DiffData> => {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/diff?paperId=${paperId}&verA=${verA}&verB=${verB}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await response.json();
    return data;
};

export const updatePaper = async (paperData: any): Promise<any> => {
    const token = getToken();
    const response = await fetch(`${BASE_URL}/paper`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paperData),
    });
    const data = await response.json();
    return data;
};