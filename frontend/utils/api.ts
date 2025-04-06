import axios, { AxiosError } from 'axios';

export const fetchPreview = async (text: string) => {
  try {
    const response = await axios.post("http://localhost:5000/api/generate-preview", {
      prompt: text,
    });

    return response.data; // Return the response data directly
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // If it's an Axios error, handle it accordingly
      console.error("Error generating preview:", error.response?.data || error.message);
    } else {
      // For unknown error types, provide a generic message
      console.error("Unknown error:", error);
    }

    // Return a fallback value in case of error
    return { videoUrl: "" };
  }
};
