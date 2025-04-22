package com.jobjob.albaing.service;

import com.jobjob.albaing.dto.Company;
import com.jobjob.albaing.dto.User;

public interface FindService {

    User findUserEmail(String userName, String userPhone);

    Company findCompanyEmail(String companyName, String companyPhone);

    boolean verifyUserCredentials(String email, String password);

    boolean verifyCompanyCredentials(String email, String password);

    void resetUserPassword(String userEmail, String newPassword);

    void resetCompanyPassword(String companyEmail, String newPassword);

}
