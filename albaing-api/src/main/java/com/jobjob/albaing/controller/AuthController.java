package com.jobjob.albaing.controller;

import com.jobjob.albaing.dto.Company;
import com.jobjob.albaing.dto.User;
import com.jobjob.albaing.model.vo.VerificationRequest;
import com.jobjob.albaing.service.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthServiceImpl authService;
    @Autowired
    private VerificationServiceImpl verificationService;
    @Autowired
    private ResumeServiceImpl resumeService;
    @Autowired
    private FileService fileService;

    @PostMapping(value = "/register/person", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> registerUser(
        @RequestPart("user") User user,
        @RequestPart(value = "userProfileImage", required = false) MultipartFile userProfileImage) {
        try {authService.validateUserInput(user);
            if (userProfileImage != null && !userProfileImage.isEmpty()) {
                System.out.println("DEBUG: 파일 업로드 시작 - " + userProfileImage.getOriginalFilename());
                String imageUrl = fileService.uploadFile(userProfileImage);
                System.out.println("DEBUG: 업로드된 이미지 URL = " + imageUrl);
                user.setUserProfileImage(imageUrl);
            } else {
                System.out.println("DEBUG: userProfileImage 파일이 제공되지 않음, 이미 설정된 URL을 유지: " + user.getUserProfileImage());
            }
            Map<String, Object> response = authService.registerUser(user);

            if ("success".equals(response.get("status"))) {
                resumeService.createResumeForUser(user);
                return ResponseEntity.ok(response);
            } else if ("fail".equals(response.get("status"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "fail");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }


    @PostMapping("/login/person")
    public ResponseEntity<Map<String, Object>> loginPerson(@RequestBody User user, HttpSession session) {
        Map<String, Object> result = authService.loginUser(user.getUserEmail(), user.getUserPassword());

        if ("success".equals(result.get("status"))) {
            session.setAttribute("userSession", result.get("user"));
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
    }


    @PostMapping(value = "/register/company", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> registerCompany(
        @RequestPart("company") Company company,
        @RequestPart(value = "companyLogo", required = false) MultipartFile companyLogo) {
        try {
            authService.validateCompanyInput(company);
            if (companyLogo != null && !companyLogo.isEmpty()) {
                System.out.println("DEBUG: 파일 업로드 시작 - " + companyLogo.getOriginalFilename());
                String logoUrl = fileService.uploadFile(companyLogo);
                System.out.println("DEBUG: 업로드된 로고 URL = " + logoUrl);
                company.setCompanyLogo(logoUrl);
            } else {
                System.out.println("DEBUG: companyLogo가 null 또는 비어 있음");
            }
            Map<String, Object> response = authService.registerCompany(company);

            if ("success".equals(response.get("status"))) {
                return ResponseEntity.ok(response);
            } else if ("fail".equals(response.get("status"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "fail");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }


    @PostMapping("/login/company")
    public ResponseEntity<Map<String, Object>> loginCompany(@RequestBody Company company, HttpSession session) {
        Map<String, Object> result = authService.loginCompany(company.getCompanyEmail(), company.getCompanyPassword());

        if ("success".equals(result.get("status"))) {
            session.setAttribute("companySession", result.get("company"));
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {

        session.removeAttribute("userSession");
        session.removeAttribute("companySession");

        session.invalidate(); // 세션 무효화

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "로그아웃 되었습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/checkLogin")
    public ResponseEntity<?> checkLogin(HttpSession session) {
        User loginUser = (User) session.getAttribute("userSession");
        Company loginCompany = (Company) session.getAttribute("companySession");

        if (loginUser != null) {
            return ResponseEntity.ok(loginUser);
        } else if (loginCompany != null) {
            return ResponseEntity.ok(loginCompany);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "로그인 상태가 아닙니다."));
        }
    }

    /**************************** 이메일 인증 ***********************************/
    @PostMapping("/sendCode")
    public ResponseEntity<Map<String, Object>> sendCode(@RequestBody VerificationRequest vr) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = vr.getEmail();
            String code = verificationService.randomCode();
            verificationService.saveEmailCode(email, code);
            verificationService.sendEmail(email, code);
            response.put("status", "success");
            response.put("message", "이메일을 성공적으로 보냈습니다: " + email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "이메일 전송 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 인증번호 일치여부 확인 및 이메일 인증 처리
    @PostMapping("/checkCode")
    public ResponseEntity<Map<String, Object>> checkCode(@RequestBody VerificationRequest vr) {
        Map<String, Object> response = new HashMap<>();

        boolean isValid = verificationService.verifyCodeWithVO(vr);

        if (isValid) {
            verificationService.markEmailAsVerified(vr.getEmail());

            response.put("status", "success");
            response.put("message", "인증번호가 일치합니다.");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "fail");
            response.put("message", "인증번호가 일치하지 않습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }


}