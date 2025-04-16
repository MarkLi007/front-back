import * as api from './api';

export interface Comment {
  id: string;
  paperId: string;
  user_address: string;
  comment: string;
  created_at: Date;
  updated_at: Date;
}

export async function getComments(paperId: string): Promise<Comment[]> {
  return await api.getComments(paperId)
}

export async function addComment(paperId: string, comment: string): Promise<Comment> {
    return await api.addComment(paperId,comment)
}
