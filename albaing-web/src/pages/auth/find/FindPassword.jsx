import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function FindPassword() {
    const [userType, setUserType] = useState("user");
    const [email, setEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleVerification = () => {
        setError("");
        setLoading(true);

        const endpoint = userType === "user"
            ? "/api/auth/verify/user"
            : "/api/auth/verify/company";
        const requestData = userType === "user"
            ? { userEmail: email, userName, userPassword: password }
            : { companyEmail: email, companyPassword: password };
        axios.post(endpoint, requestData)
            .then(() => {
                navigate("/change/password", { state: { email, userType } });
            })
            .catch(() => {
                setError("계정 정보가 일치하지 않습니다. 다시 확인해주세요.");
                setLoading(false);
            });
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <div className="flex items-center mb-6">
                <Link to="/find" className="text-gray-500 hover:text-gray-700 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h2 className="text-2xl font-bold text-gray-800">비밀번호 재설정</h2>
            </div>

            <div className="mb-6">
                <p className="text-gray-600 text-sm">본인 확인을 위해 정보를 입력해주세요.</p>
            </div>

            <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">회원 유형</label>
                <div className="flex space-x-4">
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-lg cursor-pointer ${
                        userType === "user" ? "bg-blue-100 border-2 border-blue-500 text-blue-700" : "bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}>
                        <input
                            type="radio"
                            name="userType"
                            value="user"
                            checked={userType === "user"}
                            onChange={() => setUserType("user")}
                            className="sr-only"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${userType === "user" ? "text-blue-600" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        개인회원
                    </label>
                    <label className={`flex-1 flex items-center justify-center p-3 rounded-lg cursor-pointer ${
                        userType === "company" ? "bg-blue-100 border-2 border-blue-500 text-blue-700" : "bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}>
                        <input
                            type="radio"
                            name="userType"
                            value="company"
                            checked={userType === "company"}
                            onChange={() => setUserType("company")}
                            className="sr-only"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${userType === "company" ? "text-blue-600" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        기업회원
                    </label>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="이메일을 입력하세요"
                />
            </div>

            {userType === "user" && (
                <div className="mb-4">
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                        이름
                    </label>
                    <input
                        type="text"
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="이름을 입력하세요"
                    />
                </div>
            )}

            <div className="mb-5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    현재 비밀번호
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="현재 비밀번호를 입력하세요"
                />
            </div>

            <button
                onClick={handleVerification}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        확인 중...
                    </>
                ) : "본인 확인"}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                </div>
            )}

            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-center space-x-6">
                <Link to="/find/id" className="text-blue-600 font-medium hover:text-blue-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    아이디 찾기
                </Link>
                <Link to="/login" className="text-gray-600 font-medium hover:text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    로그인
                </Link>
            </div>
        </div>
    );
}