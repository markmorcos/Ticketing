import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL: "http://www.mark-ticketing-app.xyz",
      headers: req.headers,
      sec,
    });
  }

  return axios.create();
};
