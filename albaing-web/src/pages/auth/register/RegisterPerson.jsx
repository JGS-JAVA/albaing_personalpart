import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import axios from "axios";
import {AlertModal, ErrorMessage, useModal} from "../../../components";
import KakaoPostcodeModal from "./KakaoPostcodeModal";

const RegisterPerson = () => {

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userBirthdate, setUserBirthdate] = useState("");
    const [userGender, setUserGender] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const [userAddress, setUserAddress] = useState("");
    const [userProfileImage, setUserProfileImage] = useState("");
    const [userProfileImageUrl, setUserProfileImageUrl] = useState(null);
    const [userTermsAgreement, setUserTermsAgreement] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const alertModal = useModal();
    const [detailAddress, setDetailAddress] = useState("");
    const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const nicknameParam = params.get("nickname");
        const email = params.get("email");
        const kakaoId = params.get("kakaoId");
        const naverId = params.get("naverId");
        const genderParam = params.get("gender");
        const birthyearParam = params.get("birthyear"); // YYYY 형식
        const birthdayParam = params.get("birthday"); // MMDD 형식
        const profileImageParam = params.get("profileImage");

        setUserName(nicknameParam || "");
        setUserEmail(email || "");
        setUserProfileImage(profileImageParam || "");
        setUserProfileImageUrl(profileImageParam || "");

        if (email && kakaoId) {
            setEmailVerified(true);
        }

        if (email && naverId) {
            setEmailVerified(true);
        }

        if (genderParam) {
            setUserGender(genderParam.toLowerCase() === "male" || "M" ? "male" : "female");
        }

        if (birthyearParam && birthdayParam) {
            // ✅ 올바르게 YYYY-MM-DD 형식으로 변환
            const formattedBirthdate = `${birthyearParam}-${birthdayParam.substring(0, 2)}-${birthdayParam.substring(2, 4)}`;
            setUserBirthdate(formattedBirthdate);
        } else if (birthdayParam?.length === 4) {
            const currentYear = new Date().getFullYear();
            const formattedBirthdate = `${currentYear}-${birthdayParam.substring(0, 2)}-${birthdayParam.substring(2, 4)}`;
            setUserBirthdate(formattedBirthdate);
        }

    }, []);


    const requestVerificationCode = () => {
        if (!userEmail) {
            setError("이메일을 입력해주세요.");
            return;
        }

        setLoading(true);
        setError("");

        axios
            .post("/api/auth/sendCode", {email: userEmail})
            .then(() => {
                alertModal.openModal({
                    title: '인증번호 발송 완료',
                    message: '인증번호가 이메일로 발송되었습니다..',
                    type: 'success',
                });
            })
            .catch(error => {
                setError(`RegisterPerson : 인증번호 발송 실패: ${error.response?.data?.message || "알 수 없는 오류가 발생했습니다."}`);
                console.error("인증번호 발송 오류:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const verifyCode = () => {
        if (!verificationCode) {
            setError("인증번호를 입력해주세요.");
            return;
        }

        setLoading(true);
        setError("");

        axios
            .post("/api/auth/checkCode", {email: userEmail, code: verificationCode})
            .then(() => {
                setEmailVerified(true);
                alertModal.openModal({
                    title: '인증 완료',
                    message: '이메일 인증이 완료되었습니다.',
                    type: 'success',
                });
            })
            .catch(error => {
                setError(`인증번호 확인 실패: ${error.response?.data?.message || "알 수 없는 오류가 발생했습니다."}`);
                console.error("인증번호 확인 오류:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const validateInputs = () => {
        if (!userEmail) {
            setError("이메일을 입력해주세요.");
            return false;
        }

        if (!emailVerified) {
            setError("이메일 인증을 완료해주세요.");
            return false;
        }

        if (!userPassword) {
            setError("비밀번호를 입력해주세요.");
            return false;
        }

        if (userPassword.length < 8 || !/[0-9]/.test(userPassword) || !/[!@#$%^&*]/.test(userPassword)) {
            setError("비밀번호는 최소 8자 이상이며 숫자와 특수문자를 포함해야 합니다.");
            return false;
        }

        if (userPassword !== confirmPassword) {
            setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
            return false;
        }

        if (!userName) {
            setError("이름을 입력해주세요.");
            return false;
        }

        if (!userPhone) {
            setError("전화번호를 입력해주세요.");
            return false;
        }

        if (!userTermsAgreement) {
            setError("이용약관에 동의해주세요.");
            return false;
        }

        return true;
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Set the file object
            setUserProfileImage(file);
            // Create a URL for previewing the image
            const imageUrl = URL.createObjectURL(file);
            setUserProfileImageUrl(imageUrl); // Assuming you have a separate state for image URL
        }
    };

    const handleSignup = () => {
        if (!validateInputs()) return;

        setLoading(true);
        setError("");

        const params = new URLSearchParams(window.location.search);
        const kakaoId = params.get("kakaoId");
        const naverId = params.get("naverId");

        // Create user object with common properties
        const user = {
            userEmail,
            userPassword,
            userName,
            userBirthdate: userBirthdate ? new Date(userBirthdate).toISOString().split("T")[0] : "",
            userGender,
            userPhone,
            userAddress: `${userAddress} ${detailAddress}`.trim(),
            userTermsAgreement,
            emailVerified: kakaoId || naverId ? true : emailVerified,
            kakaoId: kakaoId || "",
            naverId: naverId || "",
        };

        // Special handling for social login image URLs
        if (typeof userProfileImage === "string" && userProfileImage.startsWith("http")) {
            // Add the URL directly to the user object for social login images
            user.userProfileImage = userProfileImage;
        }

        const formData = new FormData();
        formData.append("user", new Blob([JSON.stringify(user)], {type: "application/json"}));

        // Only append actual file uploads to formData
        if (userProfileImage instanceof File) {
            formData.append("userProfileImage", userProfileImage);
        }

        // Send the request
        sendRequest(formData);
    };

// The sendRequest function remains the same
    const sendRequest = (formData) => {
        axios.post("/api/auth/register/person", formData, {
            headers: {"Content-Type": "multipart/form-data"},
        })
            .then(() => {
                alertModal.openModal({
                    title: "가입 완료",
                    message: "회원가입이 성공적으로 완료되었습니다.",
                    type: "success",
                    onClose: () => navigate("/login"),
                });
            })
            .catch(error => {
                console.error("회원가입 실패:", error.response?.data || error);
                setError(`회원가입 실패: ${error.response?.data?.message || "알 수 없는 오류가 발생했습니다."}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };


    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900">개인 회원가입</h1>
                <p className="mt-2 text-gray-600">알바잉에 가입하고 다양한 일자리를 찾아보세요.</p>
            </div>

            {error && <ErrorMessage message={error}/>}

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="space-y-6">
                    {/* 이메일 인증 섹션 */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">계정 정보</h2>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                이메일 <span className="text-red-500">*</span>
                            </label>
                            <div className="flex">
                                <input
                                    type="email"
                                    id="email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    disabled={emailVerified || loading}
                                    className={`flex-grow p-2 border rounded-l-md ${emailVerified ? 'bg-gray-100' : ''}`}
                                    placeholder="example@email.com"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={requestVerificationCode}
                                    disabled={emailVerified || loading || !userEmail}
                                    className="py-2 px-4 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {loading ? '처리 중...' : emailVerified ? '인증 완료' : '인증번호 발송'}
                                </button>
                            </div>
                        </div>

                        {!emailVerified && userEmail && (
                            <div className="mb-4">
                                <label htmlFor="verificationCode"
                                       className="block text-sm font-medium text-gray-700 mb-1">
                                    인증번호 <span className="text-red-500">*</span>
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        id="verificationCode"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        disabled={loading}
                                        className="flex-grow p-2 border rounded-l-md"
                                        placeholder="인증번호 6자리"
                                    />
                                    <button
                                        type="button"
                                        onClick={verifyCode}
                                        disabled={loading || !verificationCode}
                                        className="py-2 px-4 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {loading ? '확인 중...' : '인증 확인'}
                                    </button>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    이메일로 전송된 6자리 인증번호를 입력하세요.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 mt-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    비밀번호 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={userPassword}
                                    onChange={(e) => setUserPassword(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="최소 8자, 숫자와 특수문자 포함"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    비밀번호는 최소 8자 이상, 숫자와 특수문자를 포함해야 합니다.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword"
                                       className="block text-sm font-medium text-gray-700 mb-1">
                                    비밀번호 확인 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="비밀번호 재입력"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* 기본 정보 섹션 */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    이름 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="이름을 입력하세요"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    전화번호 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={userPhone}
                                    onChange={(e) => setUserPhone(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="예: 010-1234-5678"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                                    생년월일
                                </label>
                                <input
                                    type="date"
                                    id="birthdate"
                                    value={userBirthdate}
                                    onChange={(e) => setUserBirthdate(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                    성별
                                </label>
                                <select
                                    id="gender"
                                    value={userGender}
                                    onChange={(e) => setUserGender(e.target.value)}
                                    className="w-full p-2 border rounded-md bg-white"
                                >
                                    <option value="">선택</option>
                                    <option value="male">남성</option>
                                    <option value="female">여성</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    주소 <span className="text-red-500">*</span>
                                </label>

                                <div className="flex mb-2">
                                    <input
                                        type="text"
                                        id="address"
                                        value={userAddress}
                                        onChange={(e) => setUserAddress(e.target.value)}
                                        className="flex-1 p-2 border rounded-l-md bg-gray-100"
                                        placeholder="주소 검색 버튼을 클릭하세요"
                                        readOnly
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsPostcodeOpen(true)}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-r-md hover:bg-blue-700"
                                    >
                                        주소 검색
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    placeholder="상세 주소를 입력하세요"
                                    value={detailAddress}
                                    onChange={(e) => setDetailAddress(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>

                            <KakaoPostcodeModal
                                isOpen={isPostcodeOpen}
                                onClose={() => setIsPostcodeOpen(false)}
                                onComplete={(selectedAddress) => {
                                    setUserAddress(selectedAddress);
                                }}
                            />

                        </div>
                    </div>

                    {/* 프로필 이미지 섹션 */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">프로필 이미지</h2>

                        <div className="flex items-center space-x-6">
                            <div className="shrink-0">
                                {userProfileImageUrl ? (
                                    <img
                                        src={userProfileImageUrl}
                                        alt="프로필 미리보기"
                                        className="h-24 w-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    프로필 사진 업로드
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange} // Use the handleImageChange function
                                    className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-blue-50 file:text-blue-700
                                    hover:file:bg-blue-100"
                                />
                                {/*
                                {userProfileImageUrl && (
                                    <img src={userProfileImageUrl} alt="Profile Preview"
                                         className="mt-2 w-24 h-24 rounded-full object-cover"/>
                                )}
                                */}
                                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF 파일 (최대 2MB)</p>
                            </div>
                        </div>
                    </div>


                    {/* 이용약관 동의 */}
                    <div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={userTermsAgreement}
                                    onChange={(e) => setUserTermsAgreement(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="terms" className="font-medium text-gray-700">
                                    이용약관에 동의합니다 <span className="text-red-500">*</span>
                                </label>
                                <p className="text-gray-500">
                                    <Link to="/company/terms" className="text-blue-600 hover:text-blue-500"
                                          target="_blank">
                                        이용약관
                                    </Link>과{' '}
                                    <Link to="/company/privacy" className="text-blue-600 hover:text-blue-500"
                                          target="_blank">
                                        개인정보처리방침
                                    </Link>에 동의합니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 가입하기 버튼 */}
                    <div>
                        <button
                            type="button"
                            onClick={handleSignup}
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? '처리 중...' : '가입하기'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center">
                <p className="text-gray-600">
                    이미 계정이 있으신가요?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        로그인
                    </Link>
                </p>
            </div>
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={alertModal.closeModal}
                title={alertModal.modalProps.title || '알림'}
                message={alertModal.modalProps.message}
                confirmText="확인"
                type={alertModal.modalProps.type || 'info'}
            />
        </div>
    );
};

export default RegisterPerson;