package com.jobjob.albaing.model.vo;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;


@Getter
@NoArgsConstructor
@Setter
@ToString
public class VerificationData {
    private String email;       // 이메일
    private String code;        // 인증 코드
    private LocalDateTime expiryTime; // 인증 코드 만료 시간
    private boolean verified;   // 인증 여부

    // 생성자
    public VerificationData(String email, String code) {
        this.email = email;
        this.code = code;
        this.expiryTime = LocalDateTime.now().plusMinutes(10); // 10분 후 만료
        this.verified = false;
    }

    // 이메일 인증 완료 생성자
    public VerificationData(String email, boolean verified) {
        this.email = email;
        this.verified = verified;
        this.expiryTime = LocalDateTime.now().plusMinutes(10); // 10분 후 만료
    }

    // 인증 코드 만료 여부 확인
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }

}
