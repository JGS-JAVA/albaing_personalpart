import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function FindId() {
    const [userType, setUserType] = useState("user");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleFindId = () => {
        setError("");
        setEmail("");
        setLoading(true);

        const endpoint =
            userType === "user"
                ? `/api/auth/find/user/id?userName=${name}&userPhone=${phone}`
                : `/api/auth/find/company/id?companyName=${name}&companyPhone=${phone}`;

        axios
            .get(endpoint)
            .then(response => {

                const email = userType === "user" ? response.data.userEmail : response.data.companyEmail;

                if (email) {
                    setEmail(email);
                } else {
                    setEmail("찾은 이메일 없음");
                }
                setLoading(false);
            })
            .catch(() => {
                setError("정보를 찾을 수 없습니다. 입력한 정보를 확인해주세요.");
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
                <h2 className="text-2xl font-bold text-gray-800">아이디 찾기</h2>
            </div>

            <div className="mb-6">
                <p className="text-gray-600 text-sm">이름과 전화번호를 입력하여 아이디를 찾을 수 있습니다.</p>
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {userType === "user" ? "이름" : "회사명"}
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={userType === "user" ? "이름을 입력하세요" : "회사명을 입력하세요"}
                />
            </div>

            <div className="mb-5">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                </label>
                <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
                />
            </div>

            <button
                onClick={handleFindId}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        찾는 중...
                    </>
                ) : "아이디 찾기"}
            </button>

            {email && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-800 mb-2">찾은 아이디</h3>
                    <p className="text-blue-900 font-medium break-all">{email}</p>
                </div>
            )}

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
                <Link to="/find/password" className="text-blue-600 font-medium hover:text-blue-700 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    비밀번호 찾기
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