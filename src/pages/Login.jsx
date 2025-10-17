import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../api/SigninApi';
import { loginSchema } from '../hook/validationYup';
import Modal2 from '../components/Modal2';
import './Login.css';

const SESSION_TIMEOUT = 3600;

const Login = ({ setIsLoggedIn }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(
    () => localStorage.getItem('errorMessage') || ''
  );
  const [isError, setIsError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ loginId: '', password: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const setLoginTime = () => {
    localStorage.setItem('loginTime', Date.now());
  };

  const checkSessionTimeout = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return;

    const currentTime = Date.now();
    const elapsedTime = (currentTime - loginTime) / 1000;

    if (elapsedTime > SESSION_TIMEOUT) {
      localStorage.removeItem('loginTime');
      localStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    // 이미 로그인되어 있으면 홈으로 리다이렉트
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/');
      return;
    }

    const interval = setInterval(() => {
      checkSessionTimeout();
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, setIsLoggedIn]);

  useEffect(() => {
    localStorage.setItem('errorMessage', errorMessage);
  }, [errorMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({ loginId: '', password: '' });
    setIsError(false);

    try {
      await loginSchema.validate(
        { ID: loginId, password },
        { abortEarly: false }
      );

      const data = await signIn({ loginId, password });

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
      setIsError(true);
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
