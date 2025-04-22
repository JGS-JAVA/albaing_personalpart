package com.jobjob.albaing.service;

import com.jobjob.albaing.dto.User;
import com.jobjob.albaing.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserMapper userMapper;


    @Override
    public void deleteUser(Long userId) {
        userMapper.deleteUser(userId);
    }

    // 사용자 정보 조회
    @Override
    public User getUserById(Long userId) {
        return userMapper.getUserById(userId);
    }

    // 사용자 정보 조회
    @Override
    public User getUserByEmail(String userEmail) {
        return userMapper.getUserByEmail(userEmail);
    }

    // 사용자 정보 수정
    @Override
    public void updateUser(User user) {
        userMapper.updateUser(user);
    }





}
