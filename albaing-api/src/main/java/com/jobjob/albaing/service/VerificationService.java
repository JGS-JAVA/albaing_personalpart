package com.jobjob.albaing.service;

import com.jobjob.albaing.model.vo.VerificationRequest;

public interface VerificationService {
    String randomCode();
    void sendEmail(String email, String code);
    void saveEmailCode(String email, String code);
    boolean verifyCodeWithVO(VerificationRequest request);
    void sendVerificationEmail();

    // 추가할 인터페이스 메소드
    void markEmailAsVerified(String email);
    boolean isEmailVerified(String email);
    void removeEmailVerification(String email);
}