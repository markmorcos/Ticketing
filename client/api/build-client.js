import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL: "https://www.mark-ticketing-app.xyz",
      headers: req.headers,
    });
  }

  return axios.create();
};
