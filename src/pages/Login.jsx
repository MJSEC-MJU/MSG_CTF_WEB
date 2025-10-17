import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { signIn } from '../api/SigninApi';
import { loginSchema } from '../hook/validationYup';
import Modal2 from '../components/Modal2';
import './Login.css';

const Login = ({ setIsLoggedIn }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(
    () => localStorage.getItem('errorMessage') || ''
  );
  const [fieldErrors, setFieldErrors] = useState({ loginId: '', password: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const setLoginTime = () => {
    localStorage.setItem('loginTime', Date.now());
  };

  useEffect(() => {
    // 초기 마운트 시에만 체크 (한 번만)
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const accessToken = Cookies.get('accessToken');

    // 토큰이 없는데 localStorage에 isLoggedIn이 남아있으면 정리
    if (!accessToken && isLoggedIn === 'true') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('errorMessage');
      return;
    }

    // 토큰도 있고 로그인 상태면 홈으로 리다이렉트
    if (accessToken && isLoggedIn === 'true') {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열: 마운트 시 1회만 실행

  useEffect(() => {
    localStorage.setItem('errorMessage', errorMessage);
  }, [errorMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({ loginId: '', password: '' });

    try {
      await loginSchema.validate(
        { ID: loginId, password },
        { abortEarly: false }
      );

      await signIn({ loginId, password });

      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      setLoginTime();
      setIsModalVisible(true);
      setErrorMessage('');
      navigate('/');
    } catch (err) {
      if (err.inner) {
        const errorsObj = { loginId: '', password: '' };
        err.inner.forEach((error) => {
          if (error.path === 'ID') errorsObj.loginId = error.message;
          if (error.path === 'password') errorsObj.password = error.message;
        });
        setFieldErrors(errorsObj);
      } else {
        setErrorMessage(err.message || '로그인 실패');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    navigate('/');
  };

  return (
    <div className="PageContainer">
      <div className="RightTrapezoidWrapper">
        <div className="RightTrapezoid" />
      </div>

      <h1 className="Tag">SUPER<br />TASTY</h1>
      <div className="ContentWrapper">
        <div className="InputWrapper">
          <div className="PatternWrapper">
            <div className="Pattern" />
            <div className="PatternReverse" />
            <div className="Pattern" />
            <div className="PatternReverse" />
            <div className="Pattern" />
            <div className="PatternReverse" />
          </div>

          <label className="Label">ID</label>
          <input
            type="text"
            className="Input"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
          {fieldErrors.loginId && <p className="FieldError">{fieldErrors.loginId}</p>}

          <label className="Label"><br />Password</label>
          <input
            type="password"
            className="Input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {fieldErrors.password && <p className="FieldError">{fieldErrors.password}</p>}

          <div className="ButtonWrapper">
            <button className="Button" onClick={handleLogin}>Log In</button>
          </div>
        </div>
      </div>

      {isModalVisible && <Modal2 onClose={handleModalClose} content="로그인 성공" />}
    </div>
  );
};

export default Login;
