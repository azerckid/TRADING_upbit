# 업비트 자동 거래 웹 애플리케이션

업비트 API를 활용한 암호화폐 자동 거래 웹 애플리케이션입니다. 실시간 가격 정보를 조회하고, 판매/구매 설정을 통해 자동 거래를 관리할 수 있습니다.

## 주요 기능

- 📊 **실시간 가격 조회**: 비트코인, 이더리움 등 주요 암호화폐의 실시간 가격 정보 표시
- 💰 **평가손익 계산**: 보유 코인의 매수평균가와 현재가를 비교한 평가손익 표시
- ⚙️ **판매 설정**: 매수평균가 대비 특정 % 이상일 때 자동 판매 설정
- 🛒 **구매 설정**: 매수평균가 대비 특정 % 이하일 때 자동 구매 설정
- ⏰ **스케줄링**: 시간/분 단위로 거래 실행 간격 설정
- 📱 **반응형 UI**: Shadcn UI 컴포넌트를 활용한 모던한 사용자 인터페이스
- 🔄 **자동 갱신**: 2분마다 가격 정보 자동 갱신

## 기술 스택

- **프레임워크**: React Router v7
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Shadcn UI
- **아이콘**: Lucide React
- **API**: 업비트 API, CoinGecko API

## 프로젝트 구조

```
app/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # Shadcn UI 컴포넌트
│   ├── interval-selector.tsx      # 실행 간격 선택 컴포넌트
│   ├── trading-settings-table.tsx  # 거래 설정 테이블 컴포넌트
│   └── crypto-price-table.tsx     # 가격 정보 테이블 컴포넌트
├── routes/             # 페이지 라우트
│   ├── home.tsx        # 메인 페이지 (전체 코인 가격 조회)
│   ├── _layout.tsx     # 공통 레이아웃 (사이드바 포함)
│   ├── crypto.$market.tsx         # 개별 코인 상세 페이지
│   ├── crypto.$market.sell.tsx    # 판매 설정 페이지
│   └── crypto.$market.buy.tsx     # 구매 설정 페이지
├── utils/              # 유틸리티 함수
│   ├── upbit-api.ts    # 업비트 API 연동
│   ├── coingecko-api.ts # CoinGecko API 연동
│   └── cron.ts         # Cron 형식 변환 유틸리티
├── constants.ts         # 상수 정의
└── types/              # TypeScript 타입 정의
```

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

의존성 패키지를 설치합니다:

```bash
npm install
```

### 개발 서버 실행

개발 서버를 시작합니다:

```bash
npm run dev
```

애플리케이션은 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

프로덕션 빌드를 생성합니다:

```bash
npm run build
```

빌드된 애플리케이션을 실행합니다:

```bash
npm start
```

### 타입 체크

TypeScript 타입 체크를 실행합니다:

```bash
npm run typecheck
```

## 주요 페이지

### 홈 페이지 (`/`)
- 전체 코인 가격 정보를 테이블 형식으로 표시
- 변동률 기준 정렬 기능
- 평가손익 정보 표시
- 2분마다 자동 갱신

### 코인 상세 페이지 (`/crypto/:market`)
- 개별 코인의 상세 정보 표시
- 현재가, 변동률, 매수평균가, 평가손익 등

### 판매 설정 페이지 (`/crypto/:market/sell`)
- 여러 판매 설정 생성 및 관리
- 실행 간격 설정 (시간/분 단위)
- 코인 수량 및 매수평균가 대비 % 설정

### 구매 설정 페이지 (`/crypto/:market/buy`)
- 여러 구매 설정 생성 및 관리
- 실행 간격 설정 (시간/분 단위)
- 구매 금액 및 매수평균가 대비 % 설정

## 지원하는 코인

현재 다음 코인들을 지원합니다:

- 비트코인 (BTC)
- 이더리움 (ETH)
- 니어프로토콜 (NEAR)
- 도지코인 (DOGE)
- SUI
- XRP
- SHIB
- SOL

## 환경 변수

업비트 API 사용을 위해 다음 환경 변수가 필요할 수 있습니다:

```env
UPBIT_ACCESS_KEY=your_access_key
UPBIT_SECRET_KEY=your_secret_key
```

**주의**: 실제 거래 기능은 아직 구현되지 않았습니다. 현재는 설정 저장만 가능합니다.

## 라이선스

이 프로젝트는 개인 사용 목적으로 개발되었습니다.

---

Built with ❤️ using React Router, TypeScript, and Tailwind CSS.
