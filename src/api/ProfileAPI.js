import { Axios } from './Axios';
import Cookies from 'js-cookie';

const getProfile = async () => {
  const token = Cookies.get('accessToken');
  const response = await Axios.get('users/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export { getProfile };
