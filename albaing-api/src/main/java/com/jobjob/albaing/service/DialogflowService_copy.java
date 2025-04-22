package com.jobjob.albaing.service;

import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.dialogflow.v2.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;


@Service
public class DialogflowService_copy {

    private static final Logger logger = LoggerFactory.getLogger(DialogflowService_copy.class);

    @Value("${dialogflow.project-id}")
    private String projectId;

    @Value("${google.application.credentials}")
    private Resource credentialsFile;

    public String detectIntent(String sessionId, String message) {
        logger.info("프로젝트 ID: {}", projectId);
        logger.info("세션 ID: {}, 메시지: {}", sessionId, message);

        try {
            logger.info("인증 정보 로드 시도");
            GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsFile.getInputStream());
            logger.info("인증 정보 로드 성공");

            logger.info("SessionsClient 생성 시도");
            SessionsSettings settings = SessionsSettings.newBuilder()
                    .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
                    .build();
            SessionsClient sessionsClient = SessionsClient.create(settings);
            logger.info("SessionsClient 생성 성공");

            SessionName session = SessionName.of(projectId, sessionId);
            logger.info("세션 생성 성공: {}", session.toString());

            TextInput textInput = TextInput.newBuilder()
                    .setText(message)
                    .setLanguageCode("ko-KR")
                    .build();
            logger.info("텍스트 입력 생성 성공");

            QueryInput queryInput = QueryInput.newBuilder()
                    .setText(textInput)
                    .build();
            logger.info("쿼리 입력 생성 성공");

            DetectIntentRequest request = DetectIntentRequest.newBuilder()
                    .setSession(session.toString())
                    .setQueryInput(queryInput)
                    .build();
            logger.info("요청 생성 성공");

            try {
                logger.info("Dialogflow 요청 전송 시도");
                DetectIntentResponse response = sessionsClient.detectIntent(request);
                logger.info("Dialogflow 응답 수신 성공");

                // 여기에서 queryResult 선언 - 원래 코드에서는 이 선언이 너무 늦게 되어 있었음
                QueryResult queryResult = response.getQueryResult();

                String fulfillmentText = queryResult.getFulfillmentText();
                // action 변수 선언 및 할당
                String action = queryResult.getAction();

                if (fulfillmentText == null || fulfillmentText.isEmpty()) {
                    logger.warn("Dialogflow에서 빈 응답을 받았습니다");

                    // Action 기반으로 대체 응답 제공
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

                logger.info("인식된 인텐트: {}", queryResult.getIntent().getDisplayName());
                logger.info("인텐트 감지 신뢰도: {}", queryResult.getIntentDetectionConfidence());
                logger.info("쿼리 텍스트: '{}'", queryResult.getQueryText());
                logger.info("fulfillmentText: '{}'", queryResult.getFulfillmentText());

                // fulfillmentMessages 체크 (중요)
                logger.info("fulfillmentMessages 수: {}", queryResult.getFulfillmentMessagesCount());
                for (int i = 0; i < queryResult.getFulfillmentMessagesCount(); i++) {
                    logger.info("Message {}: {}", i, queryResult.getFulfillmentMessages(i));
                }

                // 전체 응답 구조 로깅
                logger.info("전체 응답 구조: {}", response);

                // 매치된 인텐트가 없는 경우 확인
                if (queryResult.getIntent().getDisplayName().isEmpty() ||
                        queryResult.getIntentDetectionConfidence() < 0.7) {
                    logger.warn("인텐트가 명확하게 감지되지 않았습니다");
                }

                logger.info("응답 텍스트: {}", fulfillmentText);

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