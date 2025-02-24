import Axios from '../api/axios';
import Cookies from 'js-cookie';

export const logout = async () => {
  try {
    const token = Cookies.get('accessToken');
    const response = await Axios.post('users/logout', null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default { logout };
