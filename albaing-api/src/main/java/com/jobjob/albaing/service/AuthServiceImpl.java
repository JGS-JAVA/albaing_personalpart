package com.jobjob.albaing.service;

import com.jobjob.albaing.dto.Company;
import com.jobjob.albaing.dto.User;
import com.jobjob.albaing.mapper.CompanyMapper;
import com.jobjob.albaing.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private CompanyMapper companyMapper;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    @Autowired
    @Lazy
    private VerificationServiceImpl verificationService;

    @Override
    public Map<String, Object> loginUser(String userEmail, String userPassword) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> param = new HashMap<>();
        param.put("userEmail", userEmail);

        User loggedInUser = userMapper.loginUser(param);

        if (loggedInUser == null) {
            result.put("status", "fail");
            result.put("message", "존재하지 않는 사용자입니다.");
            return result;
        }

        if (!passwordEncoder.matches(userPassword, loggedInUser.getUserPassword())) {
            result.put("status", "fail");
            result.put("message", "이메일 또는 비밀번호가 올바르지 않습니다.");
            return result;
        }

        result.put("status", "success");
        result.put("user", loggedInUser);
        return result;
    }

    @Override
    public Map<String, Object> loginCompany(String companyEmail, String companyPassword) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> param = new HashMap<>();
        param.put("companyEmail", companyEmail);

        Company loggedInCompany = companyMapper.loginCompany(param);

        if (loggedInCompany == null) {
            result.put("status", "fail");
            result.put("message", "존재하지 않는 기업 계정입니다.");
            return result;
        }

        if (!passwordEncoder.matches(companyPassword, loggedInCompany.getCompanyPassword())) {
            result.put("status", "fail");
            result.put("message", "이메일 또는 비밀번호가 올바르지 않습니다.");
            return result;
        }

        // 기업 승인 상태 확인
        if (loggedInCompany.getCompanyApprovalStatus() == Company.ApprovalStatus.approving) {
            result.put("status", "fail");
            result.put("message", "승인 대기 중인 기업 계정입니다. 관리자 승인이 완료된 후 로그인 가능합니다.");
            return result;
        } else if (loggedInCompany.getCompanyApprovalStatus() != Company.ApprovalStatus.approved) {
            result.put("status", "fail");
            result.put("message", "로그인이 허용되지 않는 기업 상태입니다.");
            return result;
        }

        result.put("status", "success");
        result.put("company", loggedInCompany);
        return result;
    }

    @Override
    public Map<String, Object> registerUser(User user) {
        Map<String, Object> response = new HashMap<>();

        // ✅ 이메일 중복 체크
        if (isUserExist(user.getUserEmail())) {
            response.put("status", "fail");
            response.put("message", "이미 가입한 이메일입니다.");
            return response;
        }

        // ✅ 전화번호 중복 체크
        if (isUserPhoneExist(user.getUserPhone())) {
            response.put("status", "fail");
            response.put("message", "이미 가입한 전화번호입니다.");
            return response;
        }

        if (user.getUserEmail() == null || user.getUserEmail().trim().isEmpty()) {
            response.put("status", "fail");
            response.put("message", "이메일은 필수 입력값입니다.");
            return response;
        }
        if (user.getUserPassword() == null || user.getUserPassword().trim().isEmpty()) {
            response.put("status", "fail");
            response.put("message", "비밀번호는 필수 입력값입니다.");
            return response;
        }
        if (user.getUserName() == null || user.getUserName().trim().isEmpty()) {
            response.put("status", "fail");
            response.put("message", "이름은 필수 입력값입니다.");
            return response;
        }

        if (user.getKakaoId() != null && !user.getKakaoId().trim().isEmpty()) {
            verificationService.markEmailAsVerified(user.getUserEmail());
        }

        if (user.getNaverId() != null && !user.getNaverId().trim().isEmpty()) {
            verificationService.markEmailAsVerified(user.getUserEmail());
        }

        if (!verificationService.isEmailVerified(user.getUserEmail())) {
            response.put("status", "fail");
            response.put("message", "이메일 인증이 완료되지 않았습니다. 인증을 먼저 완료해주세요.");
            return response;
        }

        try {
            // 기본값 설정
            if (user.getUserCreatedAt() == null) {
                user.setUserCreatedAt(LocalDateTime.now());
            }
            if (user.getUserUpdatedAt() == null) {
                user.setUserUpdatedAt(LocalDateTime.now());
            }
            if (user.getUserIsAdmin() == null) {
                user.setUserIsAdmin(false);
            }

            // 비밀번호 암호화 후 저장
            String encodedPassword = passwordEncoder.encode(user.getUserPassword());
            user.setUserPassword(encodedPassword);

            // **DEBUG: 프로필 이미지 확인**
            System.out.println("DEBUG: 저장될 userProfileImage = " + user.getUserProfileImage());

            // 회원가입 실행
            userMapper.registerUser(user);

            // 회원가입 완료 후 이메일 인증 정보 삭제
            verificationService.removeEmailVerification(user.getUserEmail());

            response.put("status", "success");
            response.put("message", "회원가입이 성공적으로 완료되었습니다.");
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "회원가입 중 오류가 발생했습니다: " + e.getMessage());

            e.printStackTrace();
        }

        return response;
    }

    @Override
    public Map<String, Object> registerCompany(Company company) {
        Map<String, Object> response = new HashMap<>();

        // ✅ 이메일 중복 체크
        if (isCompanyExist(company.getCompanyEmail())) {
            response.put("status", "fail");
            response.put("message", "이미 가입한 이메일입니다.");
            return response;
        }

        // ✅ 전화번호 중복 체크
        if (isCompanyPhoneExist(company.getCompanyPhone())) {
            response.put("status", "fail");
            response.put("message", "이미 가입한 전화번호입니다.");
            return response;
        }

        if (company.getCompanyEmail() == null || company.getCompanyEmail().trim().isEmpty()) {
            response.put("status", "fail");
            response.put("message", "이메일은 필수 입력값입니다.");
            return response;
        }
        if (company.getCompanyPassword() == null || company.getCompanyPassword().trim().isEmpty()) {
            response.put("status", "fail");
            response.put("message", "비밀번호는 필수 입력값입니다.");
            return response;
        }
        if (company.getCompanyName() == null || company.getCompanyName().trim().isEmpty()) {
            response.put("status", "fail");
            response.put("message", "회사명은 필수 입력값입니다.");
            return response;
        }

        // ✅ 이메일 인증 여부 확인
        if (!verificationService.isEmailVerified(company.getCompanyEmail())) {
            response.put("status", "fail");
            response.put("message", "이메일 인증이 완료되지 않았습니다.");
            return response;
        }

        try {
            // ✅ 기본값 설정
            LocalDateTime now = LocalDateTime.now();
            company.setCompanyCreatedAt(now);
            company.setCompanyUpdatedAt(now);

            if (company.getCompanyApprovalStatus() == null) {
                company.setCompanyApprovalStatus(Company.ApprovalStatus.approving);
            }

            // ✅ 비밀번호 암호화 후 저장
            String encodedPassword = passwordEncoder.encode(company.getCompanyPassword());
            company.setCompanyPassword(encodedPassword);

            // **DEBUG: 저장될 companyLogo 확인**
            System.out.println("DEBUG: 저장될 companyLogo = " + company.getCompanyLogo());

            // ✅ 회원가입 실행
            companyMapper.registerCompany(company);

            // ✅ 이메일 인증 정보 삭제
            verificationService.removeEmailVerification(company.getCompanyEmail());

            response.put("status", "success");
            response.put("message", "기업 회원가입이 성공적으로 완료되었습니다.");
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "기업 회원가입 중 오류가 발생했습니다: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }



    @Override
    public boolean isUserExist(String email) {
        return userMapper.isUserExist(email);
    }

    @Override
    public boolean isCompanyExist(String email) {
        return companyMapper.isCompanyExist(email);
    }

    @Override
    public boolean isUserPhoneExist(String userPhone) {
        return userMapper.isUserPhoneExist(userPhone);
    }

    @Override
    public boolean isCompanyPhoneExist(String companyPhone) {
        return companyMapper.isCompanyPhoneExist(companyPhone);
    }

    @Override
    public User getUserByEmail(String email) { // KakaoAPIController 에서 필요
        return userMapper.getUserByEmail(email);
    }

    @Override
    public void validateUserInput(User user) {
        if (user.getUserEmail() == null || user.getUserEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("이메일은 필수 입력 사항입니다.");
        }
        if (user.getUserPassword() == null || user.getUserPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("비밀번호는 필수 입력 사항입니다.");
        }
        if (user.getUserName() == null || user.getUserName().trim().isEmpty()) {
            throw new IllegalArgumentException("이름은 필수 입력 사항입니다.");
        }

        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        if (!user.getUserEmail().matches(emailRegex)) {
            throw new IllegalArgumentException("유효하지 않은 이메일 형식입니다.");
        }

        String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$";
        if (!user.getUserPassword().matches(passwordRegex)) {
            throw new IllegalArgumentException("비밀번호는 최소 8자 이상이며, 숫자와 특수문자를 포함해야 합니다.");
        }

        String nameRegex = "^[가-힣]{2,}$";
        if (!user.getUserName().matches(nameRegex)) {
            throw new IllegalArgumentException("이름은 최소 2자 이상 한글이어야 합니다.");
        }

        if (user.getUserBirthdate() != null && user.getUserBirthdate().after(new Date())) {
            throw new IllegalArgumentException("생년월일은 미래 날짜일 수 없습니다.");
        }

        String phoneRegex = "^01[016789]-?\\d{3,4}-?\\d{4,}$";
        if (!user.getUserPhone().matches(phoneRegex)) {
            throw new IllegalArgumentException("유효하지 않은 전화번호 형식입니다.");
        }
    }

    // ✅ 기업 입력값 검증..
    @Override
    public void validateCompanyInput(Company company) {
        if (company.getCompanyRegistrationNumber() == null || company.getCompanyRegistrationNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("사업자 등록번호는 필수 입력 사항입니다.");
        }
        if (company.getCompanyEmail() == null || company.getCompanyEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("이메일은 필수 입력 사항입니다.");
        }
        if (company.getCompanyPassword() == null || company.getCompanyPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("비밀번호는 필수 입력 사항입니다.");
        }
        if (company.getCompanyOwnerName() == null || company.getCompanyOwnerName().trim().isEmpty()) {
            throw new IllegalArgumentException("대표자 이름은 필수 입력 사항입니다.");
        }
        if (company.getCompanyName() == null || company.getCompanyName().trim().isEmpty()) {
            throw new IllegalArgumentException("상호명은 필수 입력 사항입니다.");
        }
        if (company.getCompanyOpenDate() == null) {
            throw new IllegalArgumentException("개업일은 필수 입력 사항입니다.");
        }
        if (company.getCompanyLocalAddress() == null || company.getCompanyLocalAddress().trim().isEmpty()) {
            throw new IllegalArgumentException("사업장 주소는 필수 입력 사항입니다.");
        }

        String emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        if (!company.getCompanyEmail().matches(emailRegex)) {
            throw new IllegalArgumentException("유효하지 않은 이메일 형식입니다.");
        }

        String passwordRegex = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$";
        if (!company.getCompanyPassword().matches(passwordRegex)) {
            throw new IllegalArgumentException("비밀번호는 최소 8자 이상이며, 숫자와 특수문자를 포함해야 합니다.");
        }

        String phoneRegex = "^(?:0(2|[3-6][1-5]|70))-?\\d{3,4}-?\\d{4}$";
        if (!company.getCompanyPhone().matches(phoneRegex)) {
            throw new IllegalArgumentException("유효하지 않은 전화번호 형식입니다.");
        }

        String registrationNumberRegex = "^\\d{3}-\\d{2}-\\d{5}$";
        if (!company.getCompanyRegistrationNumber().matches(registrationNumberRegex)) {
            throw new IllegalArgumentException("유효하지 않은 사업자 등록번호 형식입니다. (예: 123-45-67890)");
        }
    }
}
