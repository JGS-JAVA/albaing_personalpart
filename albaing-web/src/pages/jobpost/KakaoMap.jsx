import {useEffect, useState, useRef} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import axios from "axios";
import {AlertModal, ConfirmModal, ErrorMessage, LoadingSpinner, Modal, useModal} from "../../components";
import {useAuth} from "../../contexts/AuthContext";
import apiScrapService from "../../service/apiScrapService";

export default function KakaoMap() {
    const {jobPostId} = useParams();
    const navigate = useNavigate();
    const {isLoggedIn, userType, userData} = useAuth();
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
    const [userAddress, setUserAddress] = useState("");

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
        loadUserData();
    }, [jobPostId, isLoggedIn, userType, userData]);

    // 사용자 주소 정보 로드
    function loadUserData() {
        if (isLoggedIn && userType === "personal" && userData && userData.userId) {
            // 사용자가 개인 회원이고 로그인되어 있을 때만 주소 정보 가져오기
            setUserAddress(userData.userAddress || "");
        }
    }

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

        axios.get(`/api/jobs/${jobPostId}`, {withCredentials: true})
            .then((response) => {
                if (response.data) {
                    const jobData = response.data;
                    setJobPost(jobData);

                    if (jobData.companyId) {
                        axios.get(`/api/companies/${jobData.companyId}`, {withCredentials: true})
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
    }, [jobPost?.jobPostWorkPlace, userAddress]);

    // 두 지점 간의 거리를 계산하는 함수 (미터 단위)
    const calculateDistance = (point1, point2) => {
        // 지구의 반지름 (미터)
        const R = 6371000;

        // 위도와 경도를 라디안으로 변환
        const lat1 = degToRad(point1.getLat());
        const lon1 = degToRad(point1.getLng());
        const lat2 = degToRad(point2.getLat());
        const lon2 = degToRad(point2.getLng());

        // Haversine 공식
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        return distance;
    };

    // 각도를 라디안으로 변환하는 함수
    const degToRad = (deg) => {
        return deg * (Math.PI / 180);
    };

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

        // 지도에 표시할 마커들의 위치를 담을 배열
        const positions = [];

        // 주소로 좌표를 검색하기 위해 Geocoder 사용
        const geocoder = new kakao.maps.services.Geocoder();

        // 채용 공고 위치를 마커로 표시
        geocoder.addressSearch(jobPost.jobPostWorkPlace, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const jobPostCoords = new kakao.maps.LatLng(result[0].y, result[0].x);
                positions.push(jobPostCoords);

                // 일자리 위치 마커 생성
                const jobPostMarker = new kakao.maps.Marker({
                    map: map,
                    position: jobPostCoords,
                    title: '근무지'
                });

                // 마커에 커스텀 오버레이 추가
                const jobPostOverlay = new kakao.maps.CustomOverlay({
                    map: map,
                    position: jobPostCoords,
                    content: '<div style="padding:5px; background-color:#fff; border:1px solid #ddd; border-radius:3px; box-shadow:0 1px 2px rgba(0,0,0,0.2); font-size:12px; position:relative; bottom:40px;">근무지</div>',
                    yAnchor: 1
                });

                // 사용자 주소가 있는 경우 처리
                if (isLoggedIn && userType === "personal" && userAddress) {
                    geocoder.addressSearch(userAddress, (userResult, userStatus) => {
                        if (userStatus === kakao.maps.services.Status.OK) {
                            const userCoords = new kakao.maps.LatLng(userResult[0].y, userResult[0].x);
                            positions.push(userCoords);

                            // 사용자 위치 마커 생성 (파란색)
                            const userMarker = new kakao.maps.Marker({
                                map: map,
                                position: userCoords,
                                title: '자택 위치',
                                image: new kakao.maps.MarkerImage(
                                    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                                    new kakao.maps.Size(24, 35)
                                )
                            });

                            // 사용자 위치 오버레이
                            const userOverlay = new kakao.maps.CustomOverlay({
                                map: map,
                                position: userCoords,
                                content: '<div style="padding:5px; background-color:#fff; border:1px solid #ddd; border-radius:3px; box-shadow:0 1px 2px rgba(0,0,0,0.2); font-size:12px; position:relative; bottom:40px;">자택 위치</div>',
                                yAnchor: 1
                            });

                            // 두 위치 사이의 거리 계산 (미터 단위)
                            // km로 변환하고 소수점 2자리까지 표시
                            // 두 위치 사이에 점선 그리기
                            const distance = calculateDistance(jobPostCoords, userCoords);
                            const distanceInKm = (distance / 1000).toFixed(2);
                            const linePath = [
                                jobPostCoords,
                                userCoords
                            ];

                            const polyline = new kakao.maps.Polyline({
                                path: linePath,
                                strokeWeight: 2,
                                strokeColor: '#3B82F6', // 파란색 선
                                strokeOpacity: 0.8,
                                strokeStyle: 'dashed'
                            });

                            polyline.setMap(map);

                            // 거리 정보를 표시할 중간 지점 계산
                            const midLat = (jobPostCoords.getLat() + userCoords.getLat()) / 2;
                            const midLng = (jobPostCoords.getLng() + userCoords.getLng()) / 2;
                            const midPoint = new kakao.maps.LatLng(midLat, midLng);

                            // 거리 정보 오버레이 생성
                            const distanceOverlay = new kakao.maps.CustomOverlay({
                                map: map,
                                position: midPoint,
                                content: `<div style="padding:5px 10px; background-color:rgba(255,255,255,0.9); border:1px solid #ddd; border-radius:3px; box-shadow:0 1px 2px rgba(0,0,0,0.2); font-size:12px; font-weight:bold; color:#3B82F6;">${distanceInKm} km</div>`,
                                yAnchor: 0.5,
                                xAnchor: 0.5
                            });

                            // 두 위치가 모두 보이도록 지도 범위 설정
                            const bounds = new kakao.maps.LatLngBounds();
                            positions.forEach(position => {
                                bounds.extend(position);
                            });
                            map.setBounds(bounds, 100); // 여백 100px
                        } else {
                            // 사용자 주소 검색 실패시 직장 위치만 중심으로 설정
                            map.setCenter(jobPostCoords);
                        }
                    });
                } else {
                    // 사용자 주소가 없는 경우 직장 위치만 중심으로 설정
                    map.setCenter(jobPostCoords);
                }
            } else {
                console.warn('주소 검색 결과가 없습니다.');
            }
        });
    };

    if (loading) return <LoadingSpinner message="채용 공고를 불러오는 중..."/>
    if (error) return <ErrorMessage message={error}/>
    if (!jobPost) return <div className="text-center py-10">해당 공고를 찾을 수 없습니다.</div>

    return (
        <div className="bg-gray-50 py-12" ref={pageTopRef}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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


            </div>

            {/* 근무지 지도 섹션 */}
            {jobPost.jobPostWorkPlace && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">자택과 근무지 지도</h2>
                        <p className="text-sm text-gray-500">
                            근무지 위치: {jobPost.jobPostWorkPlace}
                        </p>
                        {userAddress && isLoggedIn && userType === "personal" && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    자택 위치: {userAddress}
                                </p>

                            </div>
                        )}
                    </div>
                    <div className="p-6">
                        {/* 지도 표시 영역 */}
                        <div
                            ref={mapContainerRef}
                            style={{width: '100%', height: '400px'}}
                        />
                    </div>
                </div>
            )}

            {/* 모달들 */}
            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={alertModal.closeModal}
                title={alertModal.modalProps.title || '알림'}
                message={alertModal.modalProps.message}
                confirmText="확인"
                type={alertModal.modalProps.type || 'info'}
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