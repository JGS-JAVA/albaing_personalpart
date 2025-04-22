import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ userTypeRequired }) => {
    const { isLoggedIn, userType, userData, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isLoggedIn) {
        console.error('로그인이 필요한 페이지 접근 시도');
        return <Navigate to="/login" replace />;
    }

    if (userTypeRequired === 'admin') {
        const isAdmin = userType === 'personal' && userData?.userIsAdmin === true;

        if (!isAdmin) {
            console.error('관리자 권한이 필요한 페이지 접근 시도');
            return <Navigate to="/" replace />;
        }

        return <Outlet />;
    }

    if (userTypeRequired && userType !== userTypeRequired) {
        console.error(`인증된 사용자 타입(${userType})이 요구되는 타입(${userTypeRequired})과 일치하지 않음`);
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;