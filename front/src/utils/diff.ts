
import * as api from './api';

export interface DiffChunk {
  value: string;
  added?: boolean;
  removed?: boolean;
}


export async function getDiff(paperId: string, verA: string, verB: string): Promise<DiffChunk[]> {
  try {
    return await api.getDiff(paperId, verA, verB);
  } catch (error) {
    console.error("Error fetching diff:", error);
    throw error;
  }
}
