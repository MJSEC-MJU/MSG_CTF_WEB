import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { signIn } from '../api/SigninApi';
import { loginSchema } from '../hook/validationYup';
import './Login.css';

const Login = ({ setIsLoggedIn }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(
    () => localStorage.getItem('errorMessage') || ''
  );
  const [fieldErrors, setFieldErrors] = useState({ loginId: '', password: '' });
  const navigate = useNavigate();

  const setLoginTime = () => {
    localStorage.setItem('loginTime', Date.now());
  };

  useEffect(() => {
    // 초기 마운트 시 1회 체크
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const accessToken = Cookies.get('accessToken');

    if (!accessToken && isLoggedIn === 'true') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('errorMessage');
      return;
    }

    if (accessToken && isLoggedIn === 'true') {
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('errorMessage', errorMessage);
  }, [errorMessage]);

  const handleLogin = async (e) => {
    e.preventDefault(); //  폼 제출 기본 동작 막기 (Enter 포함)
    setFieldErrors({ loginId: '', password: '' });
    setErrorMessage('');

    try {
      // 클라단 유효성
      await loginSchema.validate(
        { ID: loginId, password },
        { abortEarly: false }
      );

      // 서버 로그인
      const data = await signIn({ loginId, password }); // { message, accessToken, refreshToken } 예상

      // 서버가 accessToken을 JSON 바디로 주는 경우, 쿠키에 저장 (HttpOnly가 아닌 점은 프론트 판정용으로만 사용)
      if (data?.accessToken) {
        // 로그인 판정용/헤더 가드용 쿠키
        Cookies.set('accessToken', data.accessToken, {
          sameSite: 'lax',
          secure: true,         // HTTPS 환경 권장
          // expires: 1/24,     // 필요시 만료시간 설정(시간 단위 = 일). 예: 1시간 -> 1/24
          path: '/',
        });
      }

      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn?.(true);
      setLoginTime();

      // Header 등 즉시 갱신
      window.dispatchEvent(new Event('auth:changed'));

      navigate('/');
    } catch (err) {
      // 1) Yup 필드 유효성 에러
      if (err?.inner) {
        const errorsObj = { loginId: '', password: '' };
        err.inner.forEach((e) => {
          if (e.path === 'ID') errorsObj.loginId = e.message;
          if (e.path === 'password') errorsObj.password = e.message;
        });
        setFieldErrors(errorsObj);
        return;
      }

      // 2) 서버/네트워크 에러
      const status = err?.response?.status;
      const code   = err?.response?.data?.code;
      const msg    = err?.response?.data?.message || err?.message || '로그인 실패';

      // ErrorCode 매핑 (백엔드 enum 기준)
      switch (code) {
        // ID 관련
        case 'EMPTY_LOGIN_ID':
        case 'INVALID_ID_LENGTH_MIN':
        case 'INVALID_ID_LENGTH_MAX':
        case 'INVALID_ID_CHARACTERS':
        case 'INVALID_ID_WHITESPACE':
        case 'INVALID_LOGIN_ID':
          setFieldErrors((p) => ({ ...p, loginId: msg }));
          break;

        // PW 관련
        case 'EMPTY_PASSWORD':
        case 'INVALID_PASSWORD_LENGTH_MIN':
        case 'INVALID_PASSWORD_LENGTH_MAX':
        case 'INVALID_PASSWORD_WHITESPACE':
        case 'INVALID_PASSWORD_FORMAT':
        case 'INVALID_PASSWORD':
          setFieldErrors((p) => ({ ...p, password: msg }));
          break;

        // 이메일 인증 등 글로벌 블로킹
        case 'EMAIL_VERIFICATION_PENDING':
        case 'FAILED_VERIFICATION':
        case 'AUTH_ATTEMPT_EXCEEDED':
          setErrorMessage(msg);
          break;

        // 인증/권한/기타
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
        default:
          // 상태 코드만 오는 경우도 처리
          if (status === 401) {
            setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
          } else if (status === 403) {
            setErrorMessage('권한이 없습니다.');
          } else if (status === 400) {
            setErrorMessage(msg || '잘못된 요청입니다.');
          } else {
            setErrorMessage(msg || '로그인 중 오류가 발생했습니다.');
          }
      }
    }
  };

  return (
    <div className="PageContainer">
      <div className="RightTrapezoidWrapper">
        <div className="RightTrapezoid" />
      </div>

      <h1 className="Tag">SUPER<br />TASTY</h1>

      <div className="ContentWrapper">
        {/*  폼으로 감싸면 인풋에서 Enter 시 자동 제출됨 */}
        <form className="InputWrapper" onSubmit={handleLogin}>
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
            autoComplete="username"
            // onKeyDown={e => e.key === 'Enter' && handleLogin(e)} // (폼이라 필요없음)
          />
          {fieldErrors.loginId && <p className="FieldError">{fieldErrors.loginId}</p>}

          <label className="Label"><br />Password</label>
          <input
            type="password"
            className="Input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {fieldErrors.password && <p className="FieldError">{fieldErrors.password}</p>}

          {/* 글로벌 에러가 있다면 버튼 위에 표시 */}
          {errorMessage && <p className="FieldError" style={{ marginTop: 8 }}>{errorMessage}</p>}

          <div className="ButtonWrapper">
            {/*  type="submit" → Enter로 제출 */}
            <button className="Button" type="submit">Log In</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
