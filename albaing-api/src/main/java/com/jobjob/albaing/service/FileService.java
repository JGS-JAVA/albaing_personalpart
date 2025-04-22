package com.jobjob.albaing.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    /**
     * 업로드된 파일을 저장하고 저장된 파일 경로(URL)를 반환합니다.
     *
     * @param file 업로드할 MultipartFile 객체
     * @return 저장된 파일의 경로 (URL)
     */
    String uploadFile(MultipartFile file);
}

