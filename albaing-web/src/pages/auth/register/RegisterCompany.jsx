import {useEffect, useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {ErrorMessage} from "../../../components";
import {AlertModal, useModal} from '../../../components';

const RegisterCompany = () => {
    const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState("");
    const [companyOwnerName, setCompanyOwnerName] = useState("");
    const [companyOpenDate, setCompanyOpenDate] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [companyEmail, setCompanyEmail] = useState("");
    const [companyPassword, setCompanyPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [companyPhone, setCompanyPhone] = useState("");
    const [companyLocalAddress, setCompanyLocalAddress] = useState("");
    const [companyLogo, setCompanyLogo] = useState("");
    const [companyLogoUrl, setCompanyLogoUrl] = useState(null);
    const [companyDescription, setCompanyDescription] = useState("");
    const [termsAgreement, setTermsAgreement] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const alertModal = useModal();

    useEffect(() => {
        const storedCompanyRegistrationNumber = localStorage.getItem("companyRegistrationNumber") || '';
        const storedCompanyOwnerName = localStorage.getItem("companyOwnerName") || '';
        const storedCompanyOpenDate = localStorage.getItem("companyOpenDate") || '';

        // 사업자등록번호 변환 함수
        const formatCompanyRegistrationNumber = (number) => {
            if (!number) return '';
            return number.replace(/^(\d{3})(\d{2})(\d{5})$/, "$1-$2-$3");
        };

        setCompanyRegistrationNumber(formatCompanyRegistrationNumber(storedCompanyRegistrationNumber));
        setCompanyOwnerName(storedCompanyOwnerName);
        setCompanyOpenDate(storedCompanyOpenDate);
    }, []);

    const requestVerificationCode = () => {
        if (!companyEmail) { setError("이메일을 입력해주세요.");  return;  }
        setLoading(true); setError("");
        axios.post("/api/auth/sendCode", { email: companyEmail })
            .then(response => {
                alertModal.openModal({
                    title: '인증번호 발송',
                    message: '인증번호가 이메일로 발송되었습니다.',
                    type: 'success'
                });
            })
            .catch(error => {
                setError(`인증번호 발송 실패: ${error.response?.data?.message || "알 수 없는 오류가 발생했습니다."}`);
                console.error("인증번호 발송 오류:", error);
            })
            .finally(() => { setLoading(false); });
    };

    const verifyCode = () => {
        if (!verificationCode) { setError("인증번호를 입력해주세요."); return; }
        setLoading(true); setError("");
        axios.post("/api/auth/checkCode", { email: companyEmail, code: verificationCode })
            .then(response => {
                setEmailVerified(true);
                alertModal.openModal({
                    title: '인증 완료',
                    message: '이메일 인증이 완료되었습니다.',
                    type: 'success'
                });
            })
            .catch(error => {
                setError(`인증번호 확인 실패: ${error.response?.data?.message || "알 수 없는 오류가 발생했습니다."}`);
                console.error("인증번호 확인 오류:", error);
            })
            .finally(() => { setLoading(false); });
    };

    const validateInputs = () => {
        if (!companyEmail) {
            setError("이메일을 입력해주세요."); return false;
        }
        if (!emailVerified) {
            setError("이메일 인증을 완료해주세요."); return false;
        }
        if (!companyPassword) {
            setError("비밀번호를 입력해주세요.");
            return false;
        }
        if (companyPassword.length < 8) {
            setError("비밀번호는 최소 8자 이상이어야 합니다.");  return false;
        }
        if (!/[0-9]/.test(companyPassword) || !/[!@#$%^&*]/.test(companyPassword)) {
            setError("비밀번호는 숫자와 특수문자를 포함해야 합니다."); return false;
        }
        if (companyPassword !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");  return false;
        }
        if (!companyName) {
            setError("회사명을 입력해주세요.");
            return false;
        }
        if (!companyRegistrationNumber) {
            setError("사업자 등록번호를 입력해주세요.");  return false;
        }
        const regNumPattern = /^\d{3}-\d{2}-\d{5}$/;
        if (!regNumPattern.test(companyRegistrationNumber)) {
            setError("사업자 등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)"); return false;
        }
        if (!companyOwnerName) {
            setError("대표자 이름을 입력해주세요.");
            return false;
        }
        if (!companyPhone) {
            setError("전화번호를 입력해주세요."); return false;
        }
        if (!companyLocalAddress) {
            setError("회사 주소를 입력해주세요.");
            return false;
        }
        if (!termsAgreement) {
            setError("이용약관에 동의해주세요.");
            return false;
        }
        return true;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCompanyLogo(file);
            const imageUrl = URL.createObjectURL(file);
            setCompanyLogoUrl(imageUrl);
        }
    };

    const handleSignup = () => {
        if (!validateInputs()) return;

        setLoading(true);
        setError("");

        // 기업 정보 객체 생성
        const company = {
            companyEmail, companyPassword,
            companyName,  companyRegistrationNumber,
            companyOwnerName, companyPhone,
            companyLocalAddress, companyDescription,
            companyOpenDate, termsAgreement
        };

        const formData = new FormData();

        // JSON 문자열로 변환하여 추가
        formData.append("company", new Blob([JSON.stringify(company)], { type: "application/json" }));

        // 로고 이미지가 있을 경우 추가
        if (companyLogo) {
            formData.append("companyLogo", companyLogo);
        }

        axios.post("/api/auth/register/company", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
        })
            .then(response => {
                alertModal.openModal({
                    title: '가입 완료',
                    message: '회원가입이 성공적으로 완료되었습니다.',
                    type: 'success',
                    onClose: () => navigate("/login")
                });
            })
            .catch(error => {
                setError(`회원가입 실패: ${error.response?.data?.message || "알 수 없는 오류가 발생했습니다."}`);
                console.error("회원가입 오류:", error);
            })
            .finally(() => { setLoading(false); });
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900">기업 회원가입</h1>
                <p className="mt-2 text-gray-600">알바잉에 가입하고 인재를 모집해보세요.</p>
            </div>
            {error && <ErrorMessage message={error} />}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="space-y-6">
                    {/* 이메일 인증 섹션 */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">계정 정보</h2>
                        <div className="mb-4">
                            <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                기업 이메일 <span className="text-red-500">*</span>
                            </label>
                            <div className="flex">
                                <input
                                    type="email"
                                    id="companyEmail"
                                    value={companyEmail}
                                    onChange={(e) => setCompanyEmail(e.target.value)}
                                    disabled={emailVerified || loading}
                                    className={`flex-grow p-2 border rounded-l-md ${emailVerified ? 'bg-gray-100' : ''}`}
                                    placeholder="company@example.com"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={requestVerificationCode}
                                    disabled={emailVerified || loading || !companyEmail}
                                    className="py-2 px-4 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {loading ? '처리 중...' : emailVerified ? '인증 완료' : '인증번호 발송'}
                                </button>
                            </div>
                        </div>
                        {!emailVerified && companyEmail && (
                            <div className="mb-4">
                                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
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
                                <label htmlFor="companyPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    비밀번호 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="companyPassword"
                                    value={companyPassword}
                                    onChange={(e) => setCompanyPassword(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="최소 8자, 숫자와 특수문자 포함"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    비밀번호는 최소 8자 이상, 숫자와 특수문자를 포함해야 합니다.
                                </p>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
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
                    {/* 기업 정보 섹션 */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">기업 정보</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                    회사명 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="회사명을 입력하세요"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="companyRegistrationNumber"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    사업자등록번호 <span className="text-red-500">*</span>
                                </label>

                                <input
                                    type="text"
                                    id="companyRegistrationNumber"
                                    value={companyRegistrationNumber}
                                    onChange={(e) => setCompanyRegistrationNumber(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="000-00-00000"
                                    disabled
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    하이픈(-)을 포함한 형식으로 입력해주세요. (예: 123-45-67890)
                                </p>
                            </div>

                            <div>
                                <label htmlFor="companyOwnerName"
                                       className="block text-sm font-medium text-gray-700 mb-1">
                                    대표자명 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="companyOwnerName"
                                    value={companyOwnerName}
                                    onChange={(e) => setCompanyOwnerName(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="대표자 이름을 입력하세요"
                                    disabled
                                />
                            </div>

                            <div>
                                <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                    전화번호 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="companyPhone"
                                    value={companyPhone}
                                    onChange={(e) => setCompanyPhone(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="예: 02-1234-5678"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="companyLocalAddress"
                                       className="block text-sm font-medium text-gray-700 mb-1">
                                    회사 주소 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="companyLocalAddress"
                                    value={companyLocalAddress}
                                    onChange={(e) => setCompanyLocalAddress(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="회사 주소를 입력하세요"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="companyOpenDate"
                                       className="block text-sm font-medium text-gray-700 mb-1">
                                    설립일
                                </label>
                                <input
                                    type="text"
                                    id="companyOpenDate"
                                    value={companyOpenDate}
                                    disabled
                                    className="w-full p-2 border rounded-md bg-gray-100 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 추가 정보 섹션 */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">추가 정보</h2>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="companyLogo" className="block text-sm font-medium text-gray-700 mb-1">
                                    회사 로고
                                </label>
                                <div className="flex items-center space-x-6">
                                    <div className="shrink-0">
                                        {companyLogoUrl ? (
                                            <img
                                                src={companyLogoUrl}
                                                alt="로고 미리보기"
                                                className="h-24 w-24 object-contain border rounded-md"
                                            />
                                        ) : (
                                            <div className="h-24 w-24 bg-gray-200 border rounded-md flex items-center justify-center">
                                                <span className="text-gray-400">No Logo</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">PNG, JPG 파일 (최대 2MB)</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    회사 소개
                                </label>
                                <textarea
                                    id="companyDescription"
                                    value={companyDescription}
                                    onChange={(e) => setCompanyDescription(e.target.value)}
                                    rows={4}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="회사에 대한 간략한 소개를 입력하세요"
                                ></textarea>
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
                                    checked={termsAgreement}
                                    onChange={(e) => setTermsAgreement(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="terms" className="font-medium text-gray-700">
                                    이용약관에 동의합니다 <span className="text-red-500">*</span>
                                </label>
                                <p className="text-gray-500">
                                    <Link to="/company/terms" className="text-blue-600 hover:text-blue-500" target="_blank">
                                        이용약관
                                    </Link>과{' '}
                                    <Link to="/company/privacy" className="text-blue-600 hover:text-blue-500" target="_blank">
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

export default RegisterCompany;