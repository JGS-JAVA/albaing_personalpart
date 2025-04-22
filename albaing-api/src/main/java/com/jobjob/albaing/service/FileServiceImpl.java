package com.jobjob.albaing.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;
import java.io.File;


@Service
public class FileServiceImpl implements FileService {
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    @Override
    public String uploadFile(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("파일이 비어 있습니다.");
            }

            // 디렉토리 생성 (없다면)
            Files.createDirectories(Paths.get(uploadDir));

            // 원본 파일명에서 확장자 추출
            String originalFilename = file.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // 중복 방지를 위한 UUID 적용 파일명 생성
            String newFileName = UUID.randomUUID() + extension;
            String filePath = uploadDir + newFileName;

            // 파일 저장
            file.transferTo(new File(filePath));

            System.out.println("DEBUG: 파일 저장 완료 - " + filePath);
            return filePath; // 저장된 파일 경로 반환
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류 발생: " + e.getMessage(), e);
        }
    }
}
