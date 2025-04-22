import { useEffect } from 'react';

const KakaoPostcodeModal = ({ isOpen, onClose, onComplete }) => {
    useEffect(() => {
        if (!isOpen) return;
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = () => {
            new window.daum.Postcode({
                oncomplete: function (data) {
                    const fullAddress = data.address;
                    onComplete(fullAddress); onClose();
                },
                width: '100%', height: '100%',
            }).embed(document.getElementById('kakao-postcode-container'));
        };
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center"
            onClick={onClose} // 바깥 클릭 시 닫기
        >
            <div
                className="w-full max-w-md h-[500px] bg-white rounded-lg overflow-hidden relative"
                onClick={(e) => e.stopPropagation()} // 내부 클릭 시 닫히지 않도록 방지
            >
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    ✕
                </button>
                <div id="kakao-postcode-container" style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};

export default KakaoPostcodeModal;
