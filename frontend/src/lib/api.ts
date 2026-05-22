import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.99.102:8000/api",
  timeout: 2000,
  headers: {
    Accept: "application/json",
  },
});