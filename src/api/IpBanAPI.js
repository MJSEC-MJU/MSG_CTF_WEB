// src/api/IpBanAPI.js
import { Axios } from './Axios';

const BASE = '/api/admin/ip-ban';

export const fetchIpBans = async () => {
  const res = await Axios.get(BASE);
  return res.data; // { message, data: [...] }
};

export const fetchIpBanByAddress = async (ipAddress) => {
  const res = await Axios.get(`${BASE}/${encodeURIComponent(ipAddress)}`);
  return res.data; // { message, data: {...} | null }
};

export const createIpBan = async ({ ipAddress, reason, banType, durationMinutes }) => {
  const payload = { ipAddress, reason, banType, durationMinutes };
  const res = await Axios.post(BASE, payload);
  return res.data; // { message, data }
};

export const unbanIp = async (ipAddress) => {
  const res = await Axios.delete(`${BASE}/${encodeURIComponent(ipAddress)}`);
  return res.data; // { message, data: null }
};

export const extendIpBan = async (ipAddress, additionalMinutes) => {
  const payload = { additionalMinutes };
  const res = await Axios.put(`${BASE}/${encodeURIComponent(ipAddress)}/extend`, payload);
  return res.data; // { message, data: { ipAddress, previousExpiresAt, newExpiresAt } }
};

export const rebuildIpBanCache = async () => {
  const res = await Axios.post(`${BASE}/rebuild-cache`);
  return res.data; // { message, data: { loadedCount, timestamp } }
};
