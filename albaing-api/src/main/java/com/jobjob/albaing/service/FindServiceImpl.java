package com.jobjob.albaing.service;

import com.jobjob.albaing.dto.Company;
import com.jobjob.albaing.dto.User;
import com.jobjob.albaing.mapper.CompanyMapper;
import com.jobjob.albaing.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class FindServiceImpl implements FindService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CompanyMapper companyMapper;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public User findUserEmail(String userName, String userPhone) {
        return userMapper.findUserEmail(userName, userPhone);
    }

    @Override
    public Company findCompanyEmail(String companyName, String companyPhone) {
        return companyMapper.findCompanyEmail(companyName, companyPhone);
    }

    @Override
    public boolean verifyUserCredentials(String email, String password) {
        User user = userMapper.getUserByEmail(email);
        return user != null && passwordEncoder.matches(password, user.getUserPassword());
    }

    @Override
    public boolean verifyCompanyCredentials(String email, String password) {
        Company company = companyMapper.getCompanyByEmail(email);
        return company != null && passwordEncoder.matches(password, company.getCompanyPassword());
    }

    @Override
    public void resetUserPassword(String userEmail, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword); // 암호화 추가
        userMapper.updateUserPassword(userEmail, encodedPassword);
    }

    @Override
    public void resetCompanyPassword(String companyEmail, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        companyMapper.updateCompanyPassword(companyEmail, encodedPassword);
    }
}
