package com.jobjob.albaing.dto;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long companyId;

    private String companyName;
    private String companyRegistrationNumber;
    private String companyOwnerName;
    private Date companyOpenDate;
    private String companyPassword;
    private String companyEmail;
    private String companyPhone;
    private String companyLocalAddress;
    private ApprovalStatus companyApprovalStatus;
    private LocalDateTime companyCreatedAt;
    private LocalDateTime companyUpdatedAt;
    private String companyLogo;
    private String companyDescription;
    private String newPassword;

    public enum ApprovalStatus {
        approved, approving, hidden
    }

}
