import { Link } from "react-router-dom";

export default function Find() {
    return (
        <div className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">계정 정보 찾기</h2>

            <div className="space-y-4">
                <Link
                    to="/find/id"
                    className="flex items-center justify-between w-full p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all border border-blue-200"
                >
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-lg">아이디 찾기</h3>
                            <p className="text-sm text-gray-600">이름과 전화번호로 아이디를 찾을 수 있습니다.</p>
                        </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>

                <Link
                    to="/find/password"
                    className="flex items-center justify-between w-full p-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-200"
                >
                    <div className="flex items-center">
                        <div className="bg-indigo-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-lg">비밀번호 재설정</h3>
                            <p className="text-sm text-gray-600">본인 확인 후 비밀번호를 재설정할 수 있습니다.</p>
                        </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600 text-sm">
                    계정이 없으신가요? <Link to="/register" className="text-blue-600 font-medium hover:underline">회원가입</Link>
                </p>
                <p className="text-center text-gray-600 text-sm mt-2">
                    <Link to="/login" className="text-blue-600 font-medium hover:underline">로그인 페이지로 돌아가기</Link>
                </p>
            </div>
        </div>
    );
}