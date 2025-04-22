import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {useAuth} from "../../../contexts/AuthContext";

export default function Login() {
    const [userType, setUserType] = useState('personal');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const credentials = userType === 'personal'
            ? { userEmail: email, userPassword: password }
            : { companyEmail: email, companyPassword: password };

        login(credentials, userType)
            .then(result => {
                if (result.success) {
                    if (userType === 'personal' && result.data.user.userIsAdmin) {
                        navigate('/admin', { replace: true });
                    } else if (userType === 'company') {
                        navigate(`/company/manage/${result.data.company.companyId}`, { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                } else {
                    setError(result.message);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const AUTH_URL = "http://localhost:8080";

    const handleKakaoLogin = () => {
        window.location.href = AUTH_URL + "/oauth/kakao/login"
    };

    const handleNaverLogin = () => {
        window.location.href = AUTH_URL + "/oauth/naver/login"
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                    로그인
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="flex mb-6 border-b border-gray-200">
                    <button
                        className={`flex-1 py-2 text-center font-medium ${
                            userType === 'personal'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setUserType('personal')}
                        type="button"
                    >
                        개인 회원
                    </button>
                    <button
                        className={`flex-1 py-2 text-center font-medium ${
                            userType === 'company'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setUserType('company')}
                        type="button"
                    >
                        기업 회원
                    </button>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                            이메일
                        </label>
                        <div className="mt-2">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                placeholder={userType === 'personal' ? '개인 회원 이메일' : '기업 회원 이메일'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                비밀번호
                            </label>
                        </div>
                        <div className="mt-2">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                                placeholder="비밀번호를 입력하세요"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mt-2 flex justify-end">
                            <Link to="/find" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                비밀번호를 잊으셨나요?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </div>
                </form>

                <div className="mt-8">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">또는</span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                        <button
                            type="button"
                            onClick={handleKakaoLogin}
                            className="flex w-full items-center justify-center gap-3 rounded-md bg-yellow-400 px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
                        >
                            <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 0C4.48 0 0 3.39 0 7.56C0 10.19 1.63 12.49 4.06 13.91V18.19L8.06 15.62C8.69 15.73 9.35 15.78 10 15.78C15.52 15.78 20 12.39 20 8.22C20 4.05 15.52 0 10 0Z" fill="#000000"/>
                            </svg>
                            카카오 계정으로 계속하기
                        </button>
                        <button
                            type="button"
                            onClick={handleNaverLogin}
                            className="flex w-full items-center justify-center gap-3 rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.5859 10.129L6.41406 0H0V20H6.41406V9.871L13.5859 20H20V0H13.5859V10.129Z" fill="white"/>
                            </svg>
                            네이버 계정으로 계속하기
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-500">
                    아직 회원이 아니신가요?{' '}
                    <Link
                        to="/register"
                        className="font-semibold text-blue-600 hover:text-blue-500"
                    >
                        회원가입
                    </Link>
                </p>

                {userType === 'personal' ? (
                    <p className="mt-2 text-center text-sm text-gray-500">
                        기업 회원이신가요?{' '}
                        <button
                            onClick={() => setUserType('company')}
                            className="font-semibold text-blue-600 hover:text-blue-500"
                            type="button"
                        >
                            기업 회원 로그인
                        </button>
                    </p>
                ) : (
                    <p className="mt-2 text-center text-sm text-gray-500">
                        개인 회원이신가요?{' '}
                        <button
                            onClick={() => setUserType('personal')}
                            className="font-semibold text-blue-600 hover:text-blue-500"
                            type="button"
                        >
                            개인 회원 로그인
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}