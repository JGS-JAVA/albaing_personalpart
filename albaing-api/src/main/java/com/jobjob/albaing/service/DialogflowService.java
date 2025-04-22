package com.jobjob.albaing.service;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.dialogflow.v2.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

import com.google.cloud.dialogflow.v2.SessionsSettings;
import org.springframework.core.io.Resource;
// 커밋하기
@Service
public class DialogflowService {
    private static final Logger logger = LoggerFactory.getLogger(DialogflowService.class);

    @Value("${dialogflow.project-id}")
    private String projectId;
    @Value("${google.application.credentials}")
    private Resource credentialsFile;

    public String detectIntent(String sessionId, String message) {
        try {
            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsFile.getInputStream());
            SessionsSettings settings = SessionsSettings.newBuilder()
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .build();
            SessionsClient sessionsClient = SessionsClient.create(settings);
            SessionName session = SessionName.of(projectId, sessionId);
            TextInput textInput = TextInput.newBuilder()
                    .setText(message)
                    .setLanguageCode("ko-KR")
                    .build();
            QueryInput queryInput = QueryInput.newBuilder()
                    .setText(textInput)
                    .build();
            DetectIntentRequest request = DetectIntentRequest.newBuilder()
                    .setSession(session.toString())
                    .setQueryInput(queryInput)
                    .build();

            try {
                DetectIntentResponse response = sessionsClient.detectIntent(request);
                QueryResult queryResult = response.getQueryResult();
                String fulfillmentText = queryResult.getFulfillmentText();
                String action = queryResult.getAction();

                if (fulfillmentText == null || fulfillmentText.isEmpty()) {
                    logger.warn("Dialogflow에서 빈 응답을 받았습니다");

                    if (action != null && !action.isEmpty()) {
                        switch (action) {
                            case "login":
                                fulfillmentText = "로그인 하시려면 우측 상단을 확인하세요.";
                                break;
                            case "signup":
                                fulfillmentText = "회원가입은 오른쪽 상단의 '회원가입' 버튼을 클릭하시면 됩니다.";
                                break;
                            default:
                                fulfillmentText = "'" + queryResult.getIntent().getDisplayName() +
                                        "' 인텐트를 인식했지만 응답이 없습니다. 다른 질문을 해주세요.";
                        }
                        logger.info("Action 기반 응답 생성: {}", fulfillmentText);
                    } else {
                        fulfillmentText = "'" + queryResult.getIntent().getDisplayName() +
                                "' 인텐트를 인식했지만 응답이 없습니다. 다른 질문을 해주세요.";
                    }
                    // 이 문장은 앞선 조건문에서 설정한 fulfillmentText 값을 덮어씌움 - 의도한 것인지 확인 필요
                    // fulfillmentText = "응답이 없습니다. 다른 질문을 해주세요.";
                }

                for (int i = 0; i < queryResult.getFulfillmentMessagesCount(); i++) {
                    logger.info("Message {}: {}", i, queryResult.getFulfillmentMessages(i));
                }

                // 매치된 인텐트가 없는 경우 확인
                if (queryResult.getIntent().getDisplayName().isEmpty() ||
                        queryResult.getIntentDetectionConfidence() < 0.7) {
                }
                sessionsClient.close();
                return fulfillmentText;
            } catch (Exception e) {
                logger.error("Dialogflow 요청 중 오류 발생", e);
                throw e;
            }
        } catch (IOException e) {
            logger.error("인증 또는 SessionsClient 생성 중 오류 발생: {}", e.getMessage(), e);
            return "Dialogflow 연결 중 오류가 발생했습니다: " + e.getMessage();
        } catch (Exception e) {
            logger.error("예상치 못한 오류", e);
            return "예상치 못한 오류가 발생했습니다: " + e.getMessage();
        }
    }
}