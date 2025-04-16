
import { api } from "./api";
import { getToken } from "./auth";


export const addPaper = async (data: {
  title: string;
  author: string;
  abstract: string;
  content: string;
}) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.post("/api/paper", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding paper:", error);
    throw error;
  }
};

export const getMyPapers = async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No token found");
      }
  
      const response = await api.get("/api/paper/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting my papers:", error);
      throw error;
    }
  };
