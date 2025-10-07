import { Axios } from "./Axios";
import Cookies from "js-cookie";

const API_BASE_URL = "/challenges/all";

// page는 0-based, size는 페이지당 개수
export const fetchProblems = async (page = 0, size = 10) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) {
      return { problems: [], totalPages: 1 };
    }

    const response = await Axios.get(API_BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, size },
    });

    if (response?.data?.code !== "SUCCESS") {
      return { problems: [], totalPages: 1 };
    }

    return {
      problems: response.data.data.content ?? [],
      totalPages: response.data.data.totalPages ?? 1,
    };
  } catch {
    return { problems: [], totalPages: 1 };
  }
};
