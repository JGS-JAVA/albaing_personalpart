package com.jobjob.albaing.controller;

import com.jobjob.albaing.dto.Company;
import com.jobjob.albaing.dto.User;
import com.jobjob.albaing.service.FindServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class FindController {

    @Autowired
    private FindServiceImpl findService;

    @GetMapping("/find/user/id")
    public User findUserEmail(@RequestParam("userName") String userName,
                              @RequestParam("userPhone") String userPhone) {
        return findService.findUserEmail(userName, userPhone);
    }

    @GetMapping("/find/company/id")
    public Company findCompanyEmail(@RequestParam("companyName") String companyName, @RequestParam("companyPhone") String companyPhone) {
        return findService.findCompanyEmail(companyName, companyPhone);
    }

    @PostMapping("/verify/user")
    public ResponseEntity<?> verifyUser(@RequestBody User request) {
        boolean isValid = findService.verifyUserCredentials(request.getUserEmail(), request.getUserPassword());
        return isValid ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패");
    }

    @PostMapping("/verify/company")
    public ResponseEntity<?> verifyCompany(@RequestBody Company request) {
        boolean isValid = findService.verifyCompanyCredentials(request.getCompanyEmail(), request.getCompanyPassword());
        return isValid ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패");
    }


    @PostMapping("/update/user/password")
    public ResponseEntity<?> updateUserPassword(@RequestBody Map<String, String> request) {
        System.out.println("🔹 Received request: " + request);
        String email = request.get("userEmail");
        String newPassword = request.get("newPassword");
        if (email == null || newPassword == null) {
            return ResponseEntity.badRequest().body("잘못된 요청 데이터입니다.");
        }
        findService.resetUserPassword(email, newPassword);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }


    @PostMapping("/update/company/password")
    public ResponseEntity<?> updateCompanyPassword(@RequestBody Map<String, String> request) {
        String email = request.get("companyEmail");
        String newPassword = request.get("newPassword");

        if (email == null || newPassword == null) {
            return ResponseEntity.badRequest().body("잘못된 요청 데이터입니다.");
        }

        findService.resetCompanyPassword(email, newPassword);
        return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
    }




}
