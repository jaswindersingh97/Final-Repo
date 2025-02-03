import {jwtDecode} from 'jwt-decode';

const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.exp * 1000 > Date.now(); // exp is in seconds
  } catch {
    return false;
  }
};

export default isTokenValid;
