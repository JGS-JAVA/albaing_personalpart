package com.jobjob.albaing.service;

import com.jobjob.albaing.dto.User;

import java.util.Date;
import java.util.Map;

public interface UserService {

    // 유저 회원탈퇴
    void deleteUser(Long userId);

    // 사용자 정보 조회
    User getUserById(Long userId);

    // 사용자 정보 조회
    User getUserByEmail(String userEmail);

    // 사용자 정보 수정
    void updateUser(User user);

}
