import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function ChangePassword() {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, userType } = location.state || {};

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        hasMinLength: false,
        hasNumber: false,
        hasSpecial: false,
        hasLetter: false
    });

    // 이메일과 유저타입 체크
    useEffect(() => {
        if (!email || !userType) {
            setError("잘못된 접근입니다. 다시 시도해주세요.");
            setTimeout(() => {
                navigate("/find");
            }, 3000);
        }
    }, [email, userType, navigate]);

    // 비밀번호 강도 체크
    useEffect(() => {
        const checkPasswordStrength = () => {
            const hasMinLength = newPassword.length >= 8;
            const hasNumber = /\d/.test(newPassword);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
            const hasLetter = /[a-zA-Z]/.test(newPassword);

            let score = 0;
            if (hasMinLength) score += 1;
            if (hasNumber) score += 1;
            if (hasSpecial) score += 1;
            if (hasLetter) score += 1;

            setPasswordStrength({
                score,
                hasMinLength,
                hasNumber,
                hasSpecial,
                hasLetter
            });
        };

        checkPasswordStrength();
    }, [newPassword]);

    const handleChangePassword = () => {
        // 기본 유효성 검증
        if (newPassword.length < 8) {
            setError("비밀번호는 8자 이상이어야 합니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        const endpoint = userType === "user" ? "/api/auth/update/user/password" : "/api/auth/update/company/password";
        const requestData = {
            ...(userType === "user" ? { userEmail: email } : { companyEmail: email }),
            newPassword,
        };

        axios.post(endpoint, requestData)
            .then(() => {
                setMessage("비밀번호가 성공적으로 변경되었습니다.");
                setTimeout(() => navigate("/login"), 2000);
            })
            .catch((error) => {
                setError("비밀번호 변경 실패. 다시 시도해주세요.");
                setLoading(false);
            });
    };

    // 비밀번호 강도에 따른 색상
    const getStrengthColor = () => {
        const { score } = passwordStrength;
        if (score === 0) return "bg-gray-200";
        if (score === 1) return "bg-red-500";
        if (score === 2) return "bg-orange-500";
        if (score === 3) return "bg-yellow-500";
        if (score === 4) return "bg-green-500";
    };

    // 비밀번호 강도 텍스트
    const getStrengthText = () => {
        const { score } = passwordStrength;
        if (score === 0) return "비밀번호 입력";
        if (score === 1) return "매우 약함";
        if (score === 2) return "약함";
        if (score === 3) return "보통";
        if (score === 4) return "강함";
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <div className="flex items-center mb-6">
                <Link to="/find/password" className="text-gray-500 hover:text-gray-700 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h2 className="text-2xl font-bold text-gray-800">새 비밀번호 설정</h2>
            </div>

            {error ? (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                </div>
            ) : (
                <div className="mb-6">
                    <p className="text-gray-600 text-sm">
                        <span className="font-medium text-blue-700">{email}</span> 계정의 새 비밀번호를 설정해주세요.
                    </p>
                </div>
            )}

            <div className="mb-5">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    새 비밀번호
                </label>
                <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="새 비밀번호를 입력하세요"
                />

                {/* 비밀번호 강도 표시기 */}
                {newPassword && (
                    <div className="mt-2">
                        <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                            <div
                                className={`h-full ${getStrengthColor()}`}
                                style={{ width: `${passwordStrength.score * 25}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{getStrengthText()}</span>
                            <span>{passwordStrength.score}/4</span>
                        </div>

                        <ul className="mt-3 space-y-1 text-sm">
                            <li className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${passwordStrength.hasMinLength ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {passwordStrength.hasMinLength ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    )}
                                </svg>
                                8자 이상
                            </li>
                            <li className={`flex items-center ${passwordStrength.hasLetter ? 'text-green-600' : 'text-gray-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${passwordStrength.hasLetter ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {passwordStrength.hasLetter ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    )}
                                </svg>
                                영문자 포함
                            </li>
                            <li className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {passwordStrength.hasNumber ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    )}
                                </svg>
                                숫자 포함
                            </li>
                            <li className={`flex items-center ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${passwordStrength.hasSpecial ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {passwordStrength.hasSpecial ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    )}
                                </svg>
                                특수문자 포함
                            </li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    새 비밀번호 확인
                </label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-500 bg-red-50'
                            : confirmPassword
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-300'
                    }`}
                    placeholder="새 비밀번호를 다시 입력하세요"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">비밀번호가 일치하지 않습니다.</p>
                )}
            </div>

            <button
                onClick={handleChangePassword}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || passwordStrength.score < 2}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        변경 중...
                    </>
                ) : "비밀번호 변경"}
            </button>

            {message && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center text-green-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {message}
                    </div>
                    <p className="text-sm text-green-600 mt-1">잠시 후 로그인 페이지로 이동합니다.</p>
                </div>
            )}

            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-center">
                <Link to="/login" className="text-gray-600 font-medium hover:text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    로그인 페이지로 돌아가기
                </Link>
            </div>
        </div>
    );
}