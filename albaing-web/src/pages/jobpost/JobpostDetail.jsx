// JobPostDetail.js

import { useEffect, useState, useRef } from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import axios from "axios";
import {AlertModal, ConfirmModal, ErrorMessage, LoadingSpinner, Modal, useModal} from "../../components";
import { useAuth } from "../../contexts/AuthContext";
import apiScrapService from "../../service/apiScrapService";

export default function JobPostDetail() {
    const { jobPostId } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, userType, userData } = useAuth();
    const pageTopRef = useRef(null);

    const [jobPost, setJobPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resumeId, setResumeId] = useState(null);
    const [isScraped, setIsScraped] = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [applicationResult, setApplicationResult] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [companyLogo, setCompanyLogo] = useState("");
    const [scrapedPosts, setScrapedPosts] = useState([]);

    const alertModal = useModal();
    const confirmModal = useModal();
    const resumeConfirmModal = useModal();
    const resultModal = useModal();

    // 지도 렌더링에 필요한 ref
    const mapContainerRef = useRef(null);



    useEffect(() => {
        window.scrollTo(0, 0);
    }, [jobPostId]);

    useEffect(() => {
        if (!jobPostId) {
            setError("잘못된 접근입니다.");
            setLoading(false);
            return;
        }

        loadJobPostData();
    }, [jobPostId, isLoggedIn, userType, userData]);

    // 스크랩된 공고 목록 로드
    useEffect(() => {
        if (isLoggedIn && userType === "personal" && userData && userData.userId) {
            apiScrapService.getScrapsByUser(userData.userId, (posts) => {
                setScrapedPosts(posts);

                if (posts.some(post => post.jobPostId === Number(jobPostId))) {
                    setIsScraped(true);
                }
            });
        } else {
            setScrapedPosts([]);
            setIsScraped(false);
        }
    }, [isLoggedIn, userType, userData, jobPostId]);

    function loadJobPostData() {
        setLoading(true);

        axios.get(`/api/jobs/${jobPostId}`, { withCredentials: true })
            .then((response) => {
                if (response.data) {
                    const jobData = response.data;
                    setJobPost(jobData);

                    if (jobData.companyId) {
                        axios.get(`/api/companies/${jobData.companyId}`, { withCredentials: true })
                            .then((companyResponse) => {
                                if (companyResponse.data) {
                                    setCompanyName(companyResponse.data.companyName || "회사명 미지정");
                                    setCompanyLogo(companyResponse.data.companyLogo || "");
                                }
                            })
                            .catch(() => {
                                // 회사 정보 조회 실패 시 기본값 유지
                            });
                    }

                    // 로그인한 개인 사용자인 경우 스크랩 여부 확인 및 이력서/지원 정보 불러오기
                    if (isLoggedIn && userType === "personal") {
                        const scrapedPosts = JSON.parse(localStorage.getItem("scrapedPosts") || "[]");
                        if (scrapedPosts.includes(Number(jobPostId))) {
                            setIsScraped(true);
                        }
                        fetchResumeAndCheckApplication();
                    }
                } else {
                    setError("공고 정보가 없습니다.");
                }
                setLoading(false);
            })
            .catch(() => {
                setError("채용 공고 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
                setLoading(false);
            });
    }

    // 이력서 및 지원 내역 확인
    function fetchResumeAndCheckApplication() {
        if (!isLoggedIn || userType !== "personal" || !userData) return;

        const userId = userData.userId || userData.data?.userId;
        if (!userId) {
            return;
        }

        axios.get(`/api/resume/user/${userId}`, { withCredentials: true })
            .then((response) => {
                if (response.data && response.data.resumeId) {
                    setResumeId(response.data.resumeId);
                    checkAlreadyApplied(response.data.resumeId);
                } else {
                    setResumeId(null);
                }
            })
            .catch(() => {
                setResumeId(null);
            });
    }

    // 지원 여부 확인
    function checkAlreadyApplied(currentResumeId) {
        if (!currentResumeId || !jobPostId) return;

        axios.get(`/api/applications/resume/${currentResumeId}`, { withCredentials: true })
            .then((response) => {
                if (response.data && Array.isArray(response.data)) {
                    const hasApplied = response.data.some(
                        (application) => Number(application.jobPostId) === Number(jobPostId)
                    );
                    setAlreadyApplied(hasApplied);
                }
            })
            .catch(() => {
                // 조회 실패 시 특별한 처리 없음
            });
    }

    // 지원하기 버튼 클릭 시
    const handleApply = () => {
        if (!isLoggedIn) {
            alertModal.openModal({
                title: '로그인 필요',
                message: '로그인 후 이용 가능합니다.',
                type: 'info'
            });
            return;
        }

        if (userType === "company") {
            alertModal.openModal({
                title: '권한 제한',
                message: '기업 회원은 지원할 수 없습니다.',
                type: 'warning'
            });
            return;
        }

        if (!jobPost?.jobPostStatus || new Date(jobPost.jobPostDueDate) <= new Date()) {
            alertModal.openModal({
                title: '마감된 공고',
                message: '비활성화되거나 마감된 공고입니다.',
                type: 'error'
            });
            return;
        }

        if (!resumeId) {
            resumeConfirmModal.openModal({
                title: '이력서 필요',
                message: '이력서가 없습니다. 작성하러 가시겠습니까?'
            });
            return;
        }

        if (alreadyApplied) {
            alertModal.openModal({
                title: '이미 지원함',
                message: '이미 지원한 공고입니다.',
                type: 'info'
            });
            return;
        }

        confirmModal.openModal({
            title: '지원 확인',
            message: '정말 이 공고에 지원하시겠습니까?'
        });
    };

    // 확인 모달에서 '예'를 선택한 경우
    const confirmApply = () => {
        confirmModal.closeModal();

        if (!isLoggedIn || userType !== "personal" || !resumeId) return;

        const applicationData = {
            jobPostId: Number(jobPostId),
            resumeId: Number(resumeId)
        };

        axios.post("/api/applications", applicationData, { withCredentials: true })
            .then(() => {
                setAlreadyApplied(true);
                setApplicationResult({
                    success: true,
                    message: "지원 성공! 행운을 빕니다."
                });
                resultModal.openModal({
                    type: 'success',
                    result: true
                });
            })
            .catch(() => {
                setApplicationResult({
                    success: false,
                    message: "지원 중 오류가 발생했습니다. 다시 시도해주세요."
                });
                resultModal.openModal({
                    type: 'error',
                    result: false
                });
            });
    };

    // 이력서 작성 페이지로 이동
    const goToResumeCreation = () => {
        resumeConfirmModal.closeModal();
        navigate("/resumes");
    };

    // 스크랩 토글
    const toggleScrap = () => {
        if (!isLoggedIn) {
            alertModal.openModal({
                title: '로그인 필요',
                message: '로그인 후에 이용 가능합니다.',
                type: 'info'
            });
            return;
        }
        if (userType !== "personal") {
            alertModal.openModal({
                title: '권한 제한',
                message: '개인 회원만 스크랩할 수 있습니다.',
                type: 'warning'
            });
            return;
        }

        if (isScraped) {
            // 스크랩 취소
            apiScrapService.removeScrap(userData.userId, jobPostId)
                .then(() => {
                    setIsScraped(false);

                    // localStorage 업데이트
                    let scrapedPosts = JSON.parse(localStorage.getItem("scrapedPosts") || "[]");
                    scrapedPosts = scrapedPosts.filter(id => id !== Number(jobPostId));
                    localStorage.setItem("scrapedPosts", JSON.stringify(scrapedPosts));

                })
                .catch((err) => {
                    console.error("스크랩 삭제 실패", err);
                    alertModal.openModal({
                        title: '오류',
                        message: '스크랩 삭제 중 오류가 발생했습니다.',
                        type: 'error'
                    });
                });
        } else {
            // 스크랩 추가
            apiScrapService.addScrap(userData.userId, jobPostId)
                .then(() => {
                    setIsScraped(true);

                    // localStorage 업데이트
                    let scrapedPosts = JSON.parse(localStorage.getItem("scrapedPosts") || "[]");
                    scrapedPosts.push(Number(jobPostId));
                    localStorage.setItem("scrapedPosts", JSON.stringify(scrapedPosts));

                })
                .catch((err) => {
                    console.error("스크랩 추가 실패", err);
                    alertModal.openModal({
                        title: '오류',
                        message: '스크랩 추가 중 오류가 발생했습니다.',
                        type: 'error'
                    });
                });
        }
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        if (!dateString) return '-';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    useEffect(() => {
        if (!jobPost?.jobPostWorkPlace) return;

        const existingScript = document.getElementById('kakao-map-script');
        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'kakao-map-script';
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&libraries=services&autoload=false`;
            script.async = true;
            document.head.appendChild(script);

            script.onload = () => {
                window.kakao.maps.load(() => {
                    initMap();
                });
            };
        } else {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    initMap();
                });
            }
        }
    }, [jobPost?.jobPostWorkPlace]);

    // 지도 초기화 함수
    const initMap = () => {
        if (!mapContainerRef.current || !jobPost?.jobPostWorkPlace) return;

        const kakao = window.kakao;
        const container = mapContainerRef.current;

        // 지도 생성 옵션
        const options = {
            center: new kakao.maps.LatLng(37.5665, 126.9780), // 초기 서울 좌표
            level: 3
        };

        // 지도 생성
        const map = new kakao.maps.Map(container, options);

        // 주소로 좌표를 검색하기 위해 Geocoder 사용
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.addressSearch(jobPost.jobPostWorkPlace, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                // 지도의 중심을 결과값으로 이동
                map.setCenter(coords);

                // 마커 생성
                new kakao.maps.Marker({
                    map: map,
                    position: coords
                });
            } else {
                console.warn('주소 검색 결과가 없습니다.');
            }
        });
    };

    if (loading) return <LoadingSpinner message="채용 공고를 불러오는 중..." />
    if (error) return <ErrorMessage message={error} />
    if (!jobPost) return <div className="text-center py-10">해당 공고를 찾을 수 없습니다.</div>

    return (
        <div className="bg-gray-50 py-12" ref={pageTopRef}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 스크랩 버튼 */}
                {isLoggedIn && userType === "personal" && (
                    <div className="flex justify-end mb-4">
                        <button
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                                isScraped
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            }`}
                            onClick={toggleScrap}
                            aria-label={isScraped ? "스크랩 취소" : "스크랩하기"}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill={isScraped ? "currentColor" : "none"}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                                />
                            </svg>
                            {isScraped ? "스크랩됨" : "스크랩"}
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="flex items-center p-6 border-b border-gray-200">
                        <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden">
                            {companyLogo ? (
                                <img
                                    src={companyLogo}
                                    alt={`${companyName} logo`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div
                                    className="flex items-center justify-center h-full w-full bg-blue-100 text-blue-600 text-2xl font-bold">
                                    {companyName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="ml-6 flex-1">
                            <Link to={`/companies/${jobPost.companyId}`}>
                                <h1 className="text-2xl font-bold text-gray-900">{companyName || "회사명 미지정"}</h1>
                            </Link>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <span
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {jobPost.jobPostJobCategory || "미분류"}
                                </span>
                                <span
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {jobPost.jobPostWorkPlace ? jobPost.jobPostWorkPlace.split(' ')[0] : "지역 미지정"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 채용 정보 섹션 */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">채용 정보</h2>
                        <div className="flex flex-col sm:flex-row justify-between mb-4">
                            <div className="mb-4 sm:mb-0">
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{jobPost.jobPostTitle || "제목 없음"}</h3>
                                <p className="text-sm text-gray-500">
                                    등록일: {formatDate(jobPost.jobPostCreatedAt)} | 마감일: <span className="text-red-600 font-medium">{formatDate(jobPost.jobPostDueDate)}</span>
                                </p>
                            </div>

                            <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    new Date(jobPost.jobPostDueDate) > new Date() && jobPost.jobPostStatus
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                }`}>
                                    {new Date(jobPost.jobPostDueDate) > new Date() && jobPost.jobPostStatus
                                        ? "채용중"
                                        : "마감됨"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">근무 조건</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-28 text-sm font-medium text-gray-500">고용형태</div>
                                        <div className="flex-1 text-sm text-gray-900">{jobPost.jobPostJobType || "-"}</div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-28 text-sm font-medium text-gray-500">근무기간</div>
                                        <div className="flex-1 text-sm text-gray-900">{jobPost.jobPostWorkingPeriod || "-"}</div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-28 text-sm font-medium text-gray-500">근무요일</div>
                                        <div className="flex-1 text-sm text-gray-900">{jobPost.jobWorkSchedule || "-"}</div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-28 text-sm font-medium text-gray-500">근무시간</div>
                                        <div className="flex-1 text-sm text-gray-900">{jobPost.jobPostShiftHours || "-"}</div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-28 text-sm font-medium text-gray-500">급여</div>
                                        <div className="flex-1 text-sm text-gray-900 font-medium">{jobPost.jobPostSalary || "-"}</div>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">근무 정보</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-28 text-sm font-medium text-gray-500">근무지</div>
                                        <div className="flex-1 text-sm text-gray-900">{jobPost.jobPostWorkPlace || "-"}</div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-28 text-sm font-medium text-gray-500">학력요건</div>
                                        <div className="flex-1 text-sm text-gray-900">{jobPost.jobPostRequiredEducations || "제한 없음"}</div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0 w-28 text-sm font-medium text-gray-500">연락처</div>
                                        <div className="flex-1 text-sm text-gray-900">{jobPost.jobPostContactNumber || "-"}</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 근무지 지도 섹션 */}
                {jobPost.jobPostWorkPlace && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">근무지 지도</h2>
                            <p className="text-sm text-gray-500">
                                {jobPost.jobPostWorkPlace} 근무지 위치 (카카오 지도)
                            </p>
                            <p>
                                <Link to={`/jobs/${jobPostId}/map`}>지도에서 내 주소와 함께 보기</Link>
                            </p>
                        </div>
                        <div className="p-6">
                        {/* 지도 표시 영역 */}
                            <div
                                ref={mapContainerRef}
                                style={{ width: '100%', height: '400px' }}
                            />
                        </div>
                    </div>
                )}

                {/* 상세 내용 섹션 */}
                {jobPost.jobPostOptionalImage && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">상세 내용</h2>
                        </div>
                        <div className="p-6">
                            <img
                                src={jobPost.jobPostOptionalImage}
                                alt="채용공고 상세 이미지"
                                className="w-full h-auto rounded"
                                onError={(e) => {
                                    e.target.onerror = null;
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* 지원하기 버튼 */}
                <div className="flex justify-center mt-6 mb-12">
                    <button
                        onClick={handleApply}
                        className={`py-3 px-10 rounded-full text-lg shadow-lg transition duration-200 ${
                            alreadyApplied
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : new Date(jobPost.jobPostDueDate) > new Date() && jobPost.jobPostStatus
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-gray-400 text-white cursor-not-allowed"
                        }`}
                        disabled={alreadyApplied || !(new Date(jobPost.jobPostDueDate) > new Date() && jobPost.jobPostStatus)}
                    >
                        {alreadyApplied ? "지원 완료" : new Date(jobPost.jobPostDueDate) > new Date() && jobPost.jobPostStatus ? "지원하기" : "마감된 공고"}
                    </button>
                </div>
            </div>

            {/* 모달들 */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={alertModal.closeModal}
                title={alertModal.modalProps.title || '알림'}
                message={alertModal.modalProps.message}
                confirmText="확인"
                type={alertModal.modalProps.type || 'info'}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={confirmModal.closeModal}
                onConfirm={confirmApply}
                title="지원 확인"
                message="정말 이 공고에 지원하시겠습니까?"
                confirmText="예"
                cancelText="아니오"
            />

            <ConfirmModal
                isOpen={resumeConfirmModal.isOpen}
                onClose={resumeConfirmModal.closeModal}
                onConfirm={goToResumeCreation}
                title="이력서 확인"
                message="이력서가 없습니다. 작성하러 가시겠습니까?"
                confirmText="예"
                cancelText="아니오"
            />

            <Modal
                isOpen={resultModal.isOpen}
                onClose={resultModal.closeModal}
                title={applicationResult?.success ? "지원 완료" : "지원 실패"}
                size="sm"
            >
                <div className={`mb-6 ${applicationResult?.success ? "text-green-600" : "text-red-600"}`}>
                    <p>{applicationResult?.message}</p>
                </div>
                <div className="flex justify-end">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        onClick={resultModal.closeModal}
                    >
                        확인
                    </button>
                </div>
            </Modal>
        </div>
    );
}
