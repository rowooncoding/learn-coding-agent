# Agent Todo List

에이전트 작업 흐름을 염두에 두고 만든 간단한 todo list 웹 앱입니다.  
가볍게 할 일을 추가하고, 완료 상태를 바꾸고, 필터링해서 볼 수 있도록 구성했습니다.

## 현재 기능

- 새 todo 추가
- todo 완료/미완료 토글
- todo 삭제
- 전체 / 진행중 / 완료 필터
- `zustand` 전역 스토어 기반 상태 관리
- `localStorage` 영속 저장
- 모바일 대응 UI
- Codex 작업 규칙을 위한 [`AGENTS.md`](/Users/rowoon/study-sub-agent/AGENTS.md) 포함

## 기술 스택

- React
- TypeScript
- Vite
- Zustand

## 상태 저장 방식

- 앱 데이터는 브라우저 `localStorage`에 저장됩니다.
- 저장 키는 `todo-store`입니다.

## 실행 방법

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

## 프로젝트 구조

```text
src/
  App.tsx
  App.css
  index.css
  store/
    useTodoStore.ts
AGENTS.md
README.md
```

## 메모

- 이 프로젝트는 개인용 todo app을 기준으로 단순한 흐름을 유지합니다.
- 복잡한 백엔드나 인증 없이 빠르게 쓰는 경험을 우선합니다.
