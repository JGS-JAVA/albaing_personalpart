package com.jobjob.albaing.service;

import com.jobjob.albaing.dto.Company;
import com.jobjob.albaing.dto.User;

import java.util.Map;

public interface AuthService {

    /**
     * @return 로그인 결과 (성공 시 유저 정보 포함)
     */
    Map<String, Object> loginUser(String userEmail, String userPassword);

    Map<String, Object> loginCompany(String companyEmail, String companyPassword);

    /**
     * ✅ 유저 회원가입
     * @param user 회원가입할 유저 객체..
     */
    Map<String, Object> registerUser(User user);

    Map<String, Object> registerCompany(Company company);

    boolean isUserExist(String email);

    boolean isCompanyExist(String email);

    boolean isUserPhoneExist(String userPhone);

    boolean isCompanyPhoneExist(String companyPhone);

    User getUserByEmail(String email);

    void validateUserInput(User user);

    // ✅ 기업 입력값 검증
    void validateCompanyInput(Company company);
}
