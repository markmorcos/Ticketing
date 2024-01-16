import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      baseURL: "http://159.223.249.202/",
      headers: req.headers,
    });
  }

  return axios.create();
};
