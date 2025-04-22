import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertModal, useModal } from "../../../components";

const BusinessValidation = () => {
    const [companyRegistrationNumber, setCompanyRegistrationNumber] = useState('');
    const [companyOwnerName, setCompanyOwnerName] = useState('');
    const [companyOpenDate, setCompanyOpenDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const navigate = useNavigate();
    const modal = useModal();

    const validateBusinessNumber = () => {
        if (!companyRegistrationNumber || !companyOpenDate || !companyOwnerName) {
            modal.openModal({
                title: '입력 오류',
                message: '모든 필드를 입력해주세요.',
                type: 'warning'
            });
            return;
        }

        setLoading(true);

        const data = {
            "businesses": [
                {
                    "b_no": companyRegistrationNumber,
                    "start_dt": companyOpenDate,
                    "p_nm": companyOwnerName
                }
            ]
        };

        axios.post(
            "https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=0rsV2ZpVVbhRdzdow1XYlJ90OFql0qQm1sn7RnDySfIL6euWd5uVi7XFviZDtCZGB2iykgpDi%2BtccmdqSNmY8g%3D%3D",
            data,
            { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } }
        )
            .then(response => {
                const valid = response.data.data[0]['valid'];
                if (valid === '01') {
                    setIsVerified(true);
                    localStorage.setItem("companyRegistrationNumber", companyRegistrationNumber);
                    localStorage.setItem("companyOwnerName", companyOwnerName);
                    localStorage.setItem("companyOpenDate", companyOpenDate);
                    modal.openModal({
                        title: '인증 성공',
                        message: '사업자 인증에 성공했습니다. 이제 다음 단계로 진행할 수 있습니다.',
                        type: 'success'
                    });
                } else {
                    modal.openModal({
                        title: '인증 실패',
                        message: '사업자 정보가 일치하지 않거나 회원가입이 불가능합니다.',
                        type: 'warning'
                    });
                }
            })
            .catch(error => {
                modal.openModal({
                    title: '오류 발생',
                    message: '사업자 번호 인증 중 오류가 발생했습니다. 다시 시도해주세요.',
                    type: 'error'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const goToNextStep = () => {
        if (!isVerified) {
            modal.openModal({
                title: '인증 필요',
                message: '계속하기 전에 사업자 정보 인증이 필요합니다.',
                type: 'warning'
            });
            return;
        }
        navigate('/register/company');
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">사업자 등록번호 인증</h2>

            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                <p className="text-blue-800 text-sm">
                    <span className="font-semibold">안내:</span> 사업자 등록번호, 개업일, 대표자 이름을 정확히 입력해주세요.
                    인증 후 기업 회원가입이 가능합니다.
                </p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="companyRegistrationNumber" className="block text-sm font-medium text-gray-700">
                        사업자 등록번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="companyRegistrationNumber"
                        value={companyRegistrationNumber}
                        onChange={(e) => setCompanyRegistrationNumber(e.target.value)}
                        placeholder="사업자 번호 (숫자만 입력: 1234567890)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                    <p className="text-xs text-gray-500">하이픈(-) 없이 10자리 숫자만 입력하세요</p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="companyOpenDate" className="block text-sm font-medium text-gray-700">
                        개업일 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="companyOpenDate"
                        value={companyOpenDate}
                        onChange={(e) => setCompanyOpenDate(e.target.value)}
                        placeholder="개업일 (YYYYMMDD: 20230101)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                    <p className="text-xs text-gray-500">사업자등록증에 표시된 개업일을 8자리로 입력하세요</p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="companyOwnerName" className="block text-sm font-medium text-gray-700">
                        대표자 이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="companyOwnerName"
                        value={companyOwnerName}
                        onChange={(e) => setCompanyOwnerName(e.target.value)}
                        placeholder="대표자 이름을 입력하세요"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    />
                </div>

                <div className="pt-4 space-y-4">
                    <button
                        onClick={validateBusinessNumber}
                        className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                인증 처리 중...
                            </>
                        ) : "인증 확인"}
                    </button>

                    <button
                        onClick={goToNextStep}
                        className={`w-full py-3 px-4 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isVerified ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!isVerified}
                    >
                        다음 단계로
                    </button>
                </div>
            </div>

            <AlertModal
                isOpen={modal.isOpen}
                onClose={modal.closeModal}
                title={modal.modalProps.title || '알림'}
                message={modal.modalProps.message}
                confirmText="확인"
                type={modal.modalProps.type || 'info'}
            />
        </div>
    );
};

export default BusinessValidation;