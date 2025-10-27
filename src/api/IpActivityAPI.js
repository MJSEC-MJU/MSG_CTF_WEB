// src/api/IpActivityAPI.js
import { Axios } from './Axios';

const BASE = '/admin/ip-activity';

export const fetchIpActivity = async (params = {}) => {
  const qs = new URLSearchParams();
  if (params.ipAddress) qs.set('ipAddress', params.ipAddress);
  if (params.activityType) qs.set('activityType', params.activityType);
  if (typeof params.isSuspicious === 'boolean') qs.set('isSuspicious', String(params.isSuspicious));
  if (params.hoursBack) qs.set('hoursBack', String(params.hoursBack));
  if (params.limit) qs.set('limit', String(params.limit));
  const url = qs.toString() ? `${BASE}?${qs.toString()}` : BASE;
  const res = await Axios.get(url);
  return res.data; // { message, data: [...], meta: {...} }
};
