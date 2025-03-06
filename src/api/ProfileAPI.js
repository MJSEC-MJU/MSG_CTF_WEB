import { Axios } from './Axios';

const getProfile = async () => {
  const response = await Axios.get('users/profile');
  return response.data;
};

export { getProfile };
