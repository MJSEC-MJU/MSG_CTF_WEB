import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  ID: yup
    .string()
    .trim()
    .required('아이디를 입력해주세요.')
    .min(4, '아이디는 최소 4자 이상이어야 합니다.')
    .max(20, '아이디는 20자 이하로 입력해주세요.')
    .matches(/^[a-zA-Z0-9]+$/, '아이디는 영문과 숫자만 사용할 수 있습니다.')
    .matches(/^\S+$/, '아이디에 공백을 포함할 수 없습니다.'),
  password: yup
    .string()
    .trim()
    .required('비밀번호를 입력해주세요.')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(32, '비밀번호는 32자 이하로 입력해주세요.')
    .matches(/^\S+$/, '비밀번호에 공백을 포함할 수 없습니다.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      '비밀번호는 소문자, 대문자, 숫자 및 특수문자(!@#$%^&*)를 모두 포함해야 합니다.'
    ),
});

export const signupSchema = yup.object().shape({
  loginId: yup
    .string()
    .trim()
    .required('로그인 아이디를 입력해주세요.')
    .min(4, '로그인 아이디는 최소 4자 이상이어야 합니다.')
    .max(20, '로그인 아이디는 20자 이하로 입력해주세요.')
    .matches(
      /^[a-zA-Z0-9]+$/,
      '로그인 아이디는 영문과 숫자만 사용할 수 있습니다.'
    )
    .matches(/^\S+$/, '로그인 아이디에 공백을 포함할 수 없습니다.'),
  univ: yup.string().trim().required('학교명을 입력해주세요.'),
  email: yup
    .string()
    .trim()
    .required('이메일을 입력해주세요.')
    .email('유효한 이메일 형식이 아닙니다.'),
  password: yup
    .string()
    .trim()
    .required('비밀번호를 입력해주세요.')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .max(32, '비밀번호는 32자 이하로 입력해주세요.')
    .matches(/^\S+$/, '비밀번호에 공백을 포함할 수 없습니다.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      '비밀번호는 소문자, 대문자, 숫자 및 특수문자(!@#$%^&*)를 모두 포함해야 합니다.'
    ),
});
