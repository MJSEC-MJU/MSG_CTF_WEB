// src/api/IpWhitelistAPI.js
import { Axios } from './Axios';

const BASE = '/admin/ip-whitelist';

export const fetchWhitelist = async () => {
  const res = await Axios.get(BASE);
  return res.data; // { message, data: [...] }
};

export const addWhitelistIp = async ({ ipAddress, reason }) => {
  const res = await Axios.post(BASE, { ipAddress, reason });
  return res.data; // { message, data: {...} }
};

export const removeWhitelistIp = async (ipAddress) => {
  const res = await Axios.delete(`${BASE}/${encodeURIComponent(ipAddress)}`);
  return res.data; // { message, data: {...} }
};

export const checkWhitelistIp = async (ipAddress) => {
  const res = await Axios.get(`${BASE}/${encodeURIComponent(ipAddress)}`);
  return res.data; // { message, data: {...} | { ipAddress, isWhitelisted: false } }
};
