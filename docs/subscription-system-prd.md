# 블로그 구독 시스템 PRD (Product Requirements Document)

## 📋 프로젝트 개요

### 1.1 프로젝트 목표
- **목적**: AI/개발 블로그 독자들을 위한 무료 이메일 구독 알림 시스템 구현
- **가치 제안**: 새 글 발행 시 자동 이메일 알림으로 독자 참여도 및 재방문율 향상
- **성공 지표**: 구독자 수, 이메일 오픈율, 블로그 재방문율 증가

### 1.2 대상 사용자
- **주요 사용자**: AI/개발 분야에 관심 있는 한국어 독자
- **사용자 특성**: 기술 블로그를 정기적으로 읽는 개발자, 학생, 기술 관심자
- **사용 시나리오**: 새 글 알림 구독 → 이메일 수신 → 블로그 방문

### 1.3 비즈니스 요구사항
- 무료 구독 모델 (수익화 없음)
- 개인정보보호법(PIPA) 준수
- 구독 취소 용이성
- 확장 가능한 아키텍처

---

## 🎯 기능 요구사항

### 2.1 핵심 기능

#### 2.1.1 구독 기능
- **이메일 구독 폼**: 사용자 이메일 입력 및 검증
- **이중 옵트인**: 구독 확인 이메일 발송 및 확인
- **구독 상태 관리**: 활성/비활성 상태 트래킹
- **중복 구독 방지**: 이미 구독된 이메일 처리

#### 2.1.2 알림 기능
- **자동 이메일 발송**: 새 글 발행 시 구독자에게 알림
- **이메일 템플릿**: 한국어 템플릿, 모바일 최적화
- **발송 실패 처리**: 반송 메일 및 실패 로그 관리
- **발송 스케줄링**: 적절한 시간대 발송

#### 2.1.3 구독 해지 기능
- **원클릭 구독 해지**: 이메일 내 해지 링크
- **구독 해지 페이지**: 해지 확인 및 피드백 수집
- **데이터 삭제**: PIPA 준수 개인정보 완전 삭제

### 2.2 관리 기능

#### 2.2.1 구독자 관리
- **구독자 목록**: 이메일, 구독일, 상태 조회
- **통계 대시보드**: 구독자 수, 증감 추이, 지역별 분포
- **세그멘테이션**: 구독일, 활성도별 분류

#### 2.2.2 이메일 관리
- **발송 기록**: 발송 일시, 대상자 수, 성공/실패율
- **템플릿 관리**: 이메일 템플릿 편집 및 미리보기
- **성과 분석**: 오픈율, 클릭율, 구독 해지율

---

## 🏗️ 기술 아키텍처

### 3.1 시스템 아키텍처

#### 3.1.1 기술 스택
```yaml
Frontend:
  - Next.js 13+ (App Router)
  - TypeScript
  - Tailwind CSS
  - React Hook Form

Backend:
  - Next.js API Routes
  - Vercel Functions
  - TypeScript

Database:
  - Vercel Postgres
  - Prisma ORM

Email Service:
  - Resend (한국 최적화)

Deployment:
  - Vercel Platform
  - GitHub Actions (CI/CD)

Monitoring:
  - Vercel Analytics
  - Custom Email Metrics
```

#### 3.1.2 데이터베이스 스키마
```sql
-- 구독자 테이블
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, unsubscribed
  confirmed_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  subscription_token VARCHAR(255) UNIQUE,
  unsubscribe_token VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB -- 추가 정보 저장
);

-- 이메일 캠페인 테이블
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL, -- 블로그 포스트 slug
  subject VARCHAR(200) NOT NULL,
  preview_text VARCHAR(150),
  template_data JSONB,
  sent_at TIMESTAMP,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 이메일 발송 기록 테이블
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES email_campaigns(id),
  subscriber_id UUID REFERENCES subscribers(id),
  email_address VARCHAR(254) NOT NULL,
  status VARCHAR(20) NOT NULL, -- sent, delivered, opened, clicked, bounced, complained
  resend_id VARCHAR(100), -- Resend 메시지 ID
  error_message TEXT,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_email_logs_campaign ON email_logs(campaign_id);
CREATE INDEX idx_email_logs_subscriber ON email_logs(subscriber_id);
```

### 3.2 API 설계

#### 3.2.1 구독 API
```typescript
// POST /api/subscribe
interface SubscribeRequest {
  email: string;
}

interface SubscribeResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    status: 'pending';
  };
}

// POST /api/confirm
interface ConfirmRequest {
  token: string;
}

// POST /api/unsubscribe
interface UnsubscribeRequest {
  token: string;
}
```

#### 3.2.2 관리 API
```typescript
// GET /api/admin/subscribers
interface SubscribersResponse {
  subscribers: Subscriber[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

// POST /api/admin/send-campaign
interface SendCampaignRequest {
  title: string;
  slug: string;
  subject: string;
  previewText: string;
  templateData: Record<string, any>;
}
```

### 3.3 보안 설계

#### 3.3.1 보안 요구사항
- **XSS 방지**: 모든 사용자 입력 검증 및 이스케이핑
- **CSRF 방지**: Next.js 내장 CSRF 토큰 활용
- **Rate Limiting**: 구독 요청 제한 (IP당 5회/시간)
- **데이터 암호화**: 개인정보 암호화 저장
- **토큰 보안**: 구독/해지 토큰 무작위 생성

#### 3.3.2 개인정보보호
- **PIPA 준수**: 개인정보 수집/이용 동의 절차
- **데이터 최소화**: 필요 최소한 정보만 수집
- **보관 기간**: 구독 해지 후 즉시 삭제
- **접근 제한**: 관리자만 구독자 정보 접근

---

## 🎨 UI/UX 설계

### 4.1 구독 폼 컴포넌트

#### 4.1.1 디자인 원칙
- **접근성**: WCAG 2.1 AA 준수
- **반응형**: 모바일 우선 설계
- **일관성**: 기존 블로그 디자인과 조화
- **사용성**: 3클릭 이내 구독 완료

#### 4.1.2 컴포넌트 구조
```typescript
interface SubscriptionFormProps {
  className?: string;
  placement?: 'footer' | 'sidebar' | 'inline' | 'popup';
  variant?: 'default' | 'compact' | 'featured';
}

// 상태 관리
interface FormState {
  email: string;
  isLoading: boolean;
  isSubscribed: boolean;
  error: string;
}
```

#### 4.1.3 사용자 경험 플로우
1. **이메일 입력**: 플레이스홀더 텍스트, 실시간 유효성 검사
2. **구독 제출**: 로딩 상태 표시, 즉각적 피드백
3. **확인 안내**: 성공 메시지, 이메일 확인 안내
4. **이메일 확인**: 확인 링크 클릭 → 구독 완료
5. **환영 메시지**: 구독 완료 페이지

### 4.2 이메일 템플릿

#### 4.2.1 템플릿 종류
- **구독 확인 이메일**: 이중 옵트인 확인 링크
- **새 글 알림 이메일**: 제목, 요약, 읽기 링크
- **환영 이메일**: 구독 완료 후 환영 메시지
- **구독 해지 확인**: 해지 처리 완료 안내

#### 4.2.2 이메일 디자인
- **모바일 최적화**: 반응형 HTML 템플릿
- **브랜딩**: 블로그 로고, 컬러 스키마 일관성
- **콜투액션**: 명확한 버튼, 링크 배치
- **접근성**: 고대비, 스크린 리더 호환

---

## 🚀 구현 계획

### 5.1 개발 단계 (8주 계획)

#### Phase 1: 기반 구조 (1-2주)
- [x] **Week 1**: 데이터베이스 설계 및 마이그레이션
- [x] **Week 2**: 기본 API 구조 및 인증 시스템

#### Phase 2: 핵심 기능 (3-4주)
- [x] **Week 3**: 구독 폼 UI 컴포넌트 구현
- [ ] **Week 4**: 구독/해지 API 및 이메일 서비스 연동

#### Phase 3: 고급 기능 (5-6주)
- [ ] **Week 5**: 이메일 템플릿 및 자동 발송 시스템
- [ ] **Week 6**: 관리자 대시보드 및 통계 기능

#### Phase 4: 테스트 및 배포 (7-8주)
- [ ] **Week 7**: 종합 테스트, 성능 최적화, 보안 점검
- [ ] **Week 8**: 프로덕션 배포 및 모니터링 설정

### 5.2 현재 구현 상태

#### ✅ 완료된 작업
- [x] 기술 아키텍처 설계 완료
- [x] 데이터베이스 스키마 설계 완료
- [x] 보안 요구사항 정의 완료
- [x] 구독 폼 UI 컴포넌트 구현 완료
- [x] XSS 보안 검토 및 강화 완료

#### 🔄 진행 중인 작업
- [ ] API 엔드포인트 구현 준비

#### 📋 다음 단계
1. **즉시 필요**: `/api/subscribe` API 엔드포인트 구현
2. **단기**: Resend 이메일 서비스 설정 및 연동
3. **중기**: 이메일 템플릿 개발 및 자동 발송 시스템
4. **장기**: 관리자 대시보드 및 고급 기능

---

## 📊 성공 지표 및 모니터링

### 6.1 핵심 지표 (KPI)
- **구독 전환율**: 방문자 대비 구독율 >2%
- **이메일 도달율**: >98% (Resend 서비스 활용)
- **이메일 오픈율**: >25% (업계 평균 대비)
- **클릭율**: >5% (이메일 내 링크 클릭)
- **구독 해지율**: <5% (월별 기준)

### 6.2 모니터링 시스템
- **실시간 알림**: 시스템 오류, 발송 실패 시 즉시 알림
- **일일 리포트**: 구독자 수, 발송 성과, 오류 현황
- **주간 분석**: 트렌드 분석, 개선 사항 도출
- **월간 검토**: 전체 성과 평가, 전략 조정

### 6.3 품질 보증
- **자동화 테스트**: API, UI 컴포넌트 단위 테스트
- **E2E 테스트**: 구독부터 해지까지 전체 플로우
- **보안 스캔**: 정기적인 취약점 점검
- **성능 테스트**: 대용량 이메일 발송 시나리오

---

## 🔧 운영 및 유지보수

### 7.1 데이터베이스 관리
- **백업 정책**: 일일 자동 백업, 주간 검증
- **성능 튜닝**: 인덱스 최적화, 쿼리 성능 모니터링
- **용량 관리**: 구독자 증가에 따른 확장 계획

### 7.2 이메일 서비스 관리
- **도메인 인증**: SPF, DKIM, DMARC 설정
- **평판 관리**: 발송 패턴 최적화, 스팸 방지
- **비용 최적화**: 사용량 모니터링, 효율적 발송

### 7.3 컴플라이언스
- **PIPA 준수**: 개인정보 처리방침 업데이트
- **동의 관리**: 구독 동의 내역 로깅
- **감사 대응**: 개인정보 처리 현황 투명성

---

## 💰 비용 구조

### 8.1 초기 비용
- **개발 비용**: $0 (직접 개발)
- **서비스 설정**: $0 (무료 티어 활용)

### 8.2 운영 비용 (월별 예상)
- **Vercel Hosting**: $0 (Hobby 플랜)
- **Vercel Postgres**: $0 (무료 티어, ~10GB)
- **Resend Email**: $0 (무료 티어, 3,000통/월)
- **도메인**: $1/월 (기존 도메인 활용)

**총 운영비**: **$1/월** (구독자 100명 기준)

### 8.3 확장 시나리오
- **구독자 1,000명**: ~$20/월
- **구독자 10,000명**: ~$80/월
- **기업용 기능 추가**: ~$200/월

---

## ⚠️ 리스크 및 대응방안

### 9.1 기술적 리스크
- **이메일 도달율 저하**: Resend + 도메인 인증으로 대응
- **대용량 발송 지연**: 배치 처리 + 큐 시스템 도입
- **데이터베이스 성능**: 인덱스 최적화 + 캐싱 전략

### 9.2 운영 리스크
- **스팸 신고 증가**: 이중 옵트인 + 쉬운 구독 해지
- **개인정보 유출**: 데이터 암호화 + 접근 제한
- **서비스 장애**: 모니터링 + 자동 복구 시스템

### 9.3 비즈니스 리스크
- **구독자 증가 정체**: A/B 테스트 + 콘텐츠 품질 향상
- **구독 해지율 증가**: 피드백 수집 + 발송 빈도 조정
- **법적 규제 변화**: 컴플라이언스 모니터링 + 정책 업데이트

---

## 📈 향후 확장 계획

### 10.1 단기 확장 (3-6개월)
- **세그먼트 마케팅**: 관심사별 구독자 분류
- **A/B 테스트**: 제목, 발송 시간 최적화
- **모바일 앱 푸시**: PWA를 통한 추가 알림 채널

### 10.2 중기 확장 (6-12개월)
- **개인화 추천**: AI 기반 관심 글 추천
- **소셜 연동**: 카카오톡, 슬랙 알림 연동
- **국제화**: 영어 버전 지원

### 10.3 장기 확장 (1-2년)
- **커뮤니티 기능**: 구독자 간 소통 플랫폼
- **프리미엄 구독**: 유료 콘텐츠 모델 검토
- **API 개방**: 서드파티 연동 지원

---

## 📞 연락처 및 책임자

- **프로젝트 담당**: 블로그 운영자
- **기술 문의**: [기술 문의 이메일]
- **개인정보 문의**: [개인정보보호 담당자]

---

*문서 작성일: 2024년 12월*
*최종 업데이트: 2024년 12월*
*버전: 1.0*