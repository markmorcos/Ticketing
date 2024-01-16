import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL: "http://mark-ticketing-app.xyz",
      headers: req.headers,
    });
  }

  return axios.create();
};
