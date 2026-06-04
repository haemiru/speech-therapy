# Speech-Therapy 작업 로그 (WORK-LOG)

> **이 문서는 무엇인가요?**
> "소리야 놀자(Speech-Therapy)" 프로젝트의 작업 기록입니다.
> - **5/30~31 세션**: 프로젝트 복구·배포 (§1~§6)
> - **6/1 세션**: 보고서 영속화 · git 리모트 정리 · 따라말하기 개선 (§7~§9)
> - **6/4 세션**: 앱 상태 점검 + 안정성 개선 5건 · 줄다리기 리소스 정리 (§10~§11) ⬅️ 최신
> 다음에 돌아와서 "지금까지 뭐 했지?"가 궁금하면 이 문서를 먼저 보면 됩니다.
> **돌아오면 §10 → §11(다음 할 일) 순서로 보면 됩니다.**

**최종 업데이트:** 2026-06-04

---

## 0. 프로젝트 한 줄 소개

- **이름:** 소리야 놀자 (Speech-Therapy)
- **무엇:** 발달장애·언어치료 아동용 게임 웹앱
- **기술:** Next.js 15 + React 19 + TypeScript, Gemini API(AI 학습 보고서)
- **게임 4종:** 입운동 / 혀운동 / 소리열기구(마이크 음량) / 따라말하기(음성인식·TTS)
- **로컬 위치:** `C:\Users\bsuha\Claude-prj\Speech-Therapy`

---

## 1. 작업을 시작한 이유

"현재 프로젝트 상태를 분석해줘"로 시작 → 분석 중 **이 프로젝트가 빌드도 안 되고 배포도 깨진 상태**임을 발견. 그래서 복구 작업으로 이어졌습니다.

---

## 2. 발견한 문제 (4가지)

| # | 문제 | 내용 |
|---|------|------|
| 1 | **빌드 파일 유실** | `package.json`, `tsconfig.json`, `next.config.ts`, 앱 루트(`layout.tsx`·`page.tsx`·`globals.css`), 다수 모듈이 git에 **한 번도 커밋된 적 없어** 사라진 상태. 디스크에도 없어 빌드 불가. |
| 2 | **git 히스토리 단절** | 로컬 `master`와 원격 `SpeechTherapy/main`이 **공통 조상이 전혀 없는 별개 히스토리**. 같은 프로젝트인데 두 갈래로 따로 자람. |
| 3 | **Vercel 프로젝트 삭제됨** | 배포처 `speech-therapy`가 Vercel에서 삭제돼 있었음. |
| 4 | **줄다리기(tug-of-war)가 섞여 있음** | `Claude-prj` 저장소 **루트에 줄다리기 Vite 게임**이 init돼 있고, Speech-Therapy는 그 **하위 폴더**였음. 그래서 Vercel이 루트(줄다리기)를 배포함. |

---

## 3. 수행한 작업 (순서대로)

### 3-1. 유실 파일 복원 (30 → 111개)
- 과거 커밋 `98725199`(구버전, puppy/입운동 시절)에서 **디스크에 없는 파일만 골라** 복원.
- 현재 신버전 소스 30개는 **덮어쓰지 않고 보존**.
- 복원 항목: 빌드 설정 · 앱 루트 · 컴포넌트/훅/스토어/타입/상수/유틸.

### 3-2. 신·구 버전 호환 (타입 에러 23개 → 0)
복원한 구버전 모듈이 신버전 게임 코드의 요구를 못 따라가던 부분을, **페이지 코드에 맞춰 모듈을 확장**(기능 손실 없이):
- `constants/thresholds.ts`: 게임별 상수 추가 (dB range `-50~0`, 풍선 하강률 `0.008`, TTS 속도 `0.9`, 혀 유지 `1000ms` 등 — 사용처 로직에서 역산한 추정치)
- `types/game.ts`: `GamePhase`에 `'waiting'` 추가
- `types/profile.ts`: `TherapistSettings`에 게임별 옵션 필드(optional) 추가
- `components/game/TargetDisplay.tsx`: `RoundType` 8종 전체 매핑
- 검증: `tsc --noEmit` 0 에러, `npm run build` 성공(19 라우트)

### 3-3. ESLint 추가
- `eslint@9` + `eslint-config-next@15.5.12`, flat config(`eslint.config.mjs`) 생성.
- lint 결과 Error 0(Warning만) → 빌드 통과.

### 3-4. 커밋 & GitHub 정리
- 커밋 `eae34795` — 빌드 인프라·모듈 복원 + ESLint
- 커밋 `1de6f240` — 신버전 게임 호환 상수·타입 확장
- 원격 브랜치 정리:
  - `main` (default·**배포 기준**) ← 완전판으로 교체 (`5e064f07` → `1de6f240`)
  - `main-backup` ← 기존 20커밋 보존 (입운동 응원문구·결과페이지 모바일 fix 등 **완전판에 미이식된 작업**이 여기 있음)
  - `master` ← 초기 3커밋(방치)
- 로컬 `master`의 upstream을 잘못된 `tug-of-war`에서 **`SpeechTherapy/main`** 으로 교정 → 이제 `git push`로 main 반영.

### 3-5. 줄다리기(tug-of-war) 삭제
- 저장소 루트의 줄다리기 전용 파일(`index.html`·`vite.config.js`·`src/`·`public/`·`docs/`(게임기획)·`package.json` 등) + 루트 `node_modules` 일괄 삭제.
- 보존: `.gitignore`(공용), `Speech-Therapy/`, `ebook/`
- 커밋 `c828ccc9` — "줄다리기(tug-of-war) 프로젝트 삭제"
- push 완료 → `main` = `c828ccc9`. 루트가 깨끗해짐(`.gitignore` + `Speech-Therapy/` + `ebook/`만 남음).

### 3-6. Vercel 재연동
- `speech-therapy` 프로젝트 다시 생성(GitHub `haemiru/SpeechTherapy` 연동).
- 환경변수 `GEMINI_API_KEY` 등록 완료.
- **Root Directory = `Speech-Therapy`** 설정 완료 (루트가 아니라 하위 폴더를 빌드하도록).

---

## 4. 현재 상태 (2026-05-31 기준)

- ✅ 코드: 빌드/타입/lint 통과 (로컬·Vercel 빌드 단계 모두 성공 확인)
- ✅ GitHub: `main`이 완전판, 줄다리기 제거됨, 깨끗함
- ✅ Vercel: 프로젝트 재생성, 환경변수·Root Directory 설정됨
- ⚠️ **마지막 배포가 Error** — 빌드는 성공했으나 Vercel이 아직 **Vite 프로젝트로 인식**해서 결과물을 `dist` 폴더에서 찾다 실패:
  ```
  Error: No Output Directory named "dist" found after the Build completed.
  ```

---

## 5. 다음에 할 일 (5/31 시점 기록 — ✅ 대부분 완료, 최신은 §8 참고)

> 아래 5/31에 적었던 남은 작업들은 6/1 세션에서 처리되었습니다. **현재 기준 다음 할 일은 §8을 보세요.**
> (Vercel Framework 문제도 해결되어 배포가 정상 동작 중 — §7-2 참고.)

### 🔴 최우선: Vercel Framework를 Next.js로 변경
Vercel 대시보드 → **speech-therapy → Settings → Build and Deployment → Framework Settings**
1. **Framework Preset**: `Vite` → **`Next.js`** 로 변경
2. **Build Command / Output Directory / Install Command** 의 Override 토글이 켜져 있으면 **모두 OFF** (특히 Output Directory `dist` 제거)
3. 저장 → **Deployments → 최신 배포 → ⋯ → Redeploy** (빌드 캐시 체크 해제 권장)
4. 성공하면 `speech-therapy-nine.vercel.app` 에서 "소리야 놀자 🐶"가 떠야 정상.

### 🟡 선택: 줄다리기 외부 리소스 정리 (사용자 결정 대기 중)
- 로컬 `tug-of-war` 리모트 연결 제거 (`git remote remove tug-of-war`) — 가벼움
- GitHub `haemiru/Tug-of-War` 저장소 삭제 — 영구, 신중
- Vercel에 줄다리기 배포가 따로 있으면 그 프로젝트 삭제

### 🟢 선택: 정리
- 로컬 git에 `dangling tree` 다수(`git fsck`) → `git gc` 로 정리 가능. 배포엔 영향 없음.
- 게임 상수 추정치(풍선 하강률 등)는 실제 플레이로 난이도 점검 필요(원본 아님).
- `main-backup`에서 미이식 작업(입운동 응원문구 등) 필요 시 cherry-pick.

---

## 6. 참고 정보 (빠른 조회용)

### 커밋
| SHA | 내용 |
|-----|------|
| `eae34795` | 빌드 인프라·모듈 복원 + ESLint |
| `1de6f240` | 신버전 게임 호환 상수·타입 확장 |
| `c828ccc9` | 줄다리기(tug-of-war) 삭제 (현재 main HEAD) |

### GitHub (haemiru/SpeechTherapy)
- `main` — default·배포 기준·완전판 (= `c828ccc9`)
- `main-backup` — 옛 20커밋 백업
- `master` — 초기 3커밋
- 로컬 `master` ↔ `SpeechTherapy/main` 추적 (동기화됨)

### Vercel
- 프로젝트: `speech-therapy` (계정 junominu-3970)
- 도메인: `speech-therapy-nine.vercel.app`
- Root Directory: `Speech-Therapy` (설정됨)
- Framework: ⚠️ Vite → **Next.js 로 바꿔야 함**
- 환경변수: `GEMINI_API_KEY` (등록됨, 값은 `.env.local`)

### 로컬 명령어
```bash
# Speech-Therapy 폴더에서
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
git push         # main에 반영 → Vercel 자동 배포
```

### 주의 — 이 저장소의 특이 구조
`Claude-prj` 폴더 자체가 하나의 git 저장소이고, 여러 프로젝트(Speech-Therapy, ebook 등)가 하위 폴더로 섞여 있습니다. 그래서 **Vercel Root Directory는 반드시 `Speech-Therapy`** 여야 하고, GitHub `SpeechTherapy/main`과 로컬 `master`는 무관 히스토리였던 것을 강제로 맞춘 상태입니다.

---

# 📌 2026-06-01 세션 (§7~§8)

## 7. 6/1 세션에 한 작업

### 7-1. AI 보고서 영속화 (재방문 시 사라지던 문제)
- **증상:** 보고서를 생성·확인한 뒤 홈으로 갔다가 다시 보고서 탭에 들어오면 내용이 사라짐.
- **원인:** 보고서가 페이지 컴포넌트의 로컬 `useState`에만 있어, 페이지 이탈(언마운트) 시 소실 → 재진입 시 `idle`로 초기화.
- **해결:** 다른 데이터(기록·강아지·프로필)처럼 **zustand persist 스토어(localStorage)** 로 저장.
  - 신규 `src/stores/useReportStore.ts` (`report` + `setReport`/`clearReport`, persist + skipHydration)
  - `HydrationGuard`에 `useReportStore.rehydrate()` 추가
  - `report/page.tsx`: 로컬 state → 스토어 사용, 마운트 시 저장된 보고서 있으면 결과 화면으로 시작, "다시 생성"은 `clearReport()`
- 커밋 `777b6420`

### 7-2. ⚠️ git 리모트 구조 정리 (중요 — 배포 방법 확정)
커밋/푸시 과정에서 리모트 설정이 꼬여 있던 것을 발견·정리:
- **`origin`이 무관한 저장소를 가리키고 있었음** → 모노레포 git의 `origin`이 실수로 `haemiru/othello`(별개 오델로 게임)로 설정돼 있었음. `git push origin`이 othello로 갈 뻔했으나 무관 히스토리라 거부되어 발견. → **`git remote remove origin`으로 제거함.**
  - othello 프로젝트 자체는 `Claude-prj/othello/`의 **독립 repo**로 멀쩡히 존재(자체 origin). 손대지 않음.
- **올바른 배포 푸시 방법 확정:** 모노레포 루트(`C:\Users\bsuha\Claude-prj`)에서
  ```bash
  git push SpeechTherapy master:main
  ```
  - 로컬 모노레포 `master` → 원격 `SpeechTherapy/main`(fast-forward). 이게 **Vercel 자동 배포를 트리거하는 유일한 올바른 명령.**
  - 원격 `SpeechTherapy/master` 브랜치(과거 subtree split 잔재, 루트=Speech-Therapy 구조)는 **배포와 무관 — 건드리지 말 것.** `git subtree push`도 불필요(히스토리 갈라져 거부됨).
- **Vercel 배포는 정상 동작 중** — 라이브 사이트(`speech-therapy-nine.vercel.app`)에서 게임을 실제로 플레이·테스트함. (5/31의 Framework=Vite 문제는 해결된 상태.)

### 7-3. '따라 말하기' 게임 대폭 개선
사용자 피드백: "들려주는 소리도 부정확하고, 정확히 따라해도 인식이 안 됨." → 단계적으로 4가지 원인을 잡음.

| 원인 | 수정 | 파일 | 커밋 |
|------|------|------|------|
| TTS가 **영어 기본 음성**으로 한국어를 읽어 발음이 뭉개짐 | ko 음성을 명시 선택(Google>Microsoft>기타), `voiceschanged` 비동기 로드 처리 | `useTTS.ts` | `f1c29646` |
| TTS와 마이크를 **동시에 시작** → 인식 창이 TTS 소리에 일찍 소진 | **먼저 들려주고(TTS 종료 후) 마이크·타이머 시작** | `follow-speech/play/page.tsx` | `f1c29646` |
| 인식이 첫 침묵에 끊김 / 후보 1개만 사용 | `continuous=true`로 라운드 내내 듣기, `maxAlternatives=5`로 후보 중 최대 유사도 채택, 끊기면 250ms 후 자동 재시작 | `useSpeechRecognition.ts` | `f1c29646`·`a3195124` |
| **단음절('바')을 ASR이 '뽀삐빠'로 늘려 인식** → 유사도 17%로 탈락 | **된소리/거센소리 평음 정규화**(ㅃ→ㅂ 등) + **부분 매칭(containment)**: 긴 인식 결과 안에 목표 음절이 있으면 높은 점수 | `koreanJamo.ts` | `1bbd7232` |

- **진단 패널** 추가: `follow-speech/play?debug=1` 로 접속하면 화면에 `listening / results / transcript / similarity / error` 표시 (평소엔 숨김). 인식 디버깅용.
- 검증: `바→뽀삐빠` 100%, 정확/유사 발음 통과, 완전 다른 음절은 50%로 기준(60%) 미만 유지.
- **확인됨:** 진단 패널상 `results>0`, `error: —` → 인식·TTS 모두 정상 동작. 유사도 보정으로 단음절도 통과.

---

## 8. 다음에 할 일 (2026-06-01 기준) ⬅️ 돌아오면 여기부터

현재 4종 게임 모두 동작하고 배포도 정상. 아래는 선택적 개선/정리 항목.

### 🟡 따라 말하기 — 단음절 안정화 (선택)
- 단음절(레벨1: '가','나','바'…)은 ASR이 본질적으로 인식 편차가 큼. 유사도 보정으로 많이 완화했으나 더 안정화하려면:
  - 레벨1 단어를 두 글자 의성어('바바','가가')나 짧은 의미 단어로 교체 (`constants/wordBank.ts`)
  - 또는 레벨1만 판정 임계값을 낮추기 (`settings.followSpeechThreshold`, 현재 0.6)
- 안정화가 끝나면 **진단 패널(`?debug=1`) 관련 코드는 유지해도 무방**(쿼리 없으면 숨김). 완전히 빼고 싶으면 `follow-speech/play/page.tsx`의 `debug` state·패널 블록과 `useSpeechRecognition`의 `lastErrorCode`/`resultCount` 제거.

### 🟡 줄다리기(tug-of-war) 외부 리소스 정리 (5/31부터 미결)
- 로컬 `tug-of-war` 리모트 제거(`git remote remove tug-of-war`), GitHub `haemiru/Tug-of-War` 저장소·Vercel 배포 정리 여부 — **사용자 결정 대기.**

### 🟢 기타
- `main-backup`의 미이식 작업(입운동 응원문구 등) 필요 시 cherry-pick.
- 게임 상수 추정치(풍선 하강률 등) 실플레이 난이도 점검.

---

## 9. 참고 정보 갱신 (6/1 기준)

### 이번 세션 커밋 (로컬 `master`, 원격 `SpeechTherapy/main`)
| SHA | 내용 |
|-----|------|
| `777b6420` | 보고서 persist 스토어 영속화 |
| `f1c29646` | 따라말하기 TTS 음성 품질·인식 정확도 |
| `a3195124` | 인식 안정성(continuous) + 진단 패널 |
| `1bbd7232` | 단음절 유사도 보정(된소리 정규화+부분 매칭) — 현재 main HEAD |

### git 리모트 (모노레포 `Claude-prj`)
- `SpeechTherapy` → `haemiru/SpeechTherapy` — **배포용. `git push SpeechTherapy master:main`**
- `tug-of-war` → `haemiru/Tug-of-War` — 정리 미결
- ~~`origin`~~ → 6/1에 제거(과거 othello 잘못 설정). othello는 `Claude-prj/othello/` 독립 repo로 별개.

### ⭐ 배포 한 줄 요약
모노레포 루트에서 `git push SpeechTherapy master:main` → Vercel(`speech-therapy-nine.vercel.app`) 자동 배포. (Root Directory=`Speech-Therapy`, 환경변수 `GEMINI_API_KEY`)

---

# 📌 2026-06-04 세션 (§10~§11)

## 10. 6/4 세션에 한 작업

"앱 상태 분석 + 추가 개선점 점검" 요청으로 시작. 빌드/타입/lint·핵심 훅·API 라우트를 직접 검증하고, 자동 점검 결과의 **거짓 양성과 실제 문제를 구분**한 뒤 실제 가치 있는 항목만 수정.

### 10-0. 점검 결과 — 거짓 양성으로 판명된 것 (다시 의심하지 말 것)
- **"API 키가 repo에 커밋됨"** → ❌ 사실 아님. `.env.local`은 git 추적 대상 아님(`git ls-files`에 없음), `.gitignore`에 `.env*.local`로 정상 제외. 키 안전.
- **"FaceLandmarker 초기화 race"** → ❌ `landmarkerRef`/`initializingRef` 가드로 정상 동작.
- **"마이크 AudioContext 누수"** → ❌ `useMicrophoneVolume`의 unmount cleanup에서 stream·context 모두 정리됨.

### 10-1. 안정성 개선 5건 (커밋 4개)
| # | 내용 | 파일 | 커밋 |
|---|------|------|------|
| 1 | **강아지 별점 음수 가드** — 임상 원칙(퇴행 금지)을 `addStars`에 `Math.max(0,...)`로 코드 강제 | `stores/usePuppyStore.ts` | `646e70d0` |
| 2 | **보고서 API 견고성** — `totalRounds=0` NaN 방지 + records 500개 제한 + 클라이언트 에러 메시지 일반화(Gemini 내부 에러 본문 비노출) | `app/api/report/route.ts` | `c8acbaf6` |
| 3 | **따라말하기 타이머 정리 + TTS 미지원 안내** — 라운드 전환 타이머를 `timersRef`에 모아 unmount 시 일괄 정리. TTS만 안 되는 브라우저용 안내 문구 추가 | `follow-speech/play/page.tsx` | `bf2db308` |
| 4 | **나머지 3개 게임 타이머 정리** — 입·혀·소리열기구도 #3과 동일 패턴(카운트다운·라운드 전환·휴식·결과 이동 타이머) unmount 정리 | `mouth-opening`·`sound-balloon`·`tongue-exercises`/play/page.tsx | `fe378bd3` ⚠️**미푸시** |

> **타이머 정리 패턴(향후 새 게임에도 적용):** 페이지에 `timersRef = useRef<Set<...>>(new Set())` + `track(id)` 헬퍼를 두고, 모든 `setTimeout`/`setInterval`을 `track(...)`으로 감싼 뒤 init useEffect cleanup에서 `timers.forEach(id => {clearTimeout(id); clearInterval(id);}); timers.clear();`로 일괄 정리. 자체 종료 시엔 `timersRef.current.delete(id)`.

### 10-2. 줄다리기(tug-of-war) 외부 리소스 정리 (5/31부터 미결 항목 처리)
사용자 확인: "줄다리기와 별개 프로젝트" → 정리 진행.
- ✅ **로컬 리모트 제거** — 모노레포 `Claude-prj`에서 `git remote remove tug-of-war` 완료. 이제 리모트는 `SpeechTherapy` 하나만 남음(깨끗).
- ✅ **Vercel** — 현재 로그인 계정(`junominus-projects`)에 프로젝트 0개 → 정리할 줄다리기 배포 없음(해당 없음). (Speech-Therapy 배포는 별도 계정 `junominu-3970`)
- ⏳ **GitHub `haemiru/Tug-of-War` 영구 삭제** — 사용자가 "영구 삭제" 선택했으나, `gh` 토큰에 `delete_repo` 스코프가 없어 **미완료**. 진행하려면 ↓ §11 참고.

---

## 11. 다음에 할 일 (2026-06-04 기준) ⬅️ 돌아오면 여기부터

### 🔴 바로 마무리할 것 (이번 세션 잔여)
1. **게임 타이머 커밋 푸시** — `fe378bd3`가 로컬에만 있음. 모노레포 루트에서:
   ```bash
   git push SpeechTherapy master:main
   ```
   (원격 main은 현재 `bf2db308`. 위 명령으로 `fe378bd3`까지 배포됨)
2. **GitHub Tug-of-War 저장소 영구 삭제** — 사용자가 영구 삭제로 결정함. `gh` 권한 부족 상태라 둘 중 하나:
   - 권한 추가 후 CLI: `gh auth refresh -h github.com -s delete_repo` (브라우저 인증, 사용자 직접) → 그 다음 `gh repo delete haemiru/Tug-of-War --yes`
   - 또는 웹: github.com/haemiru/Tug-of-War → Settings → Danger Zone → Delete this repository

### 🟡 따라 말하기 — 단음절 안정화 (§8에서 이어짐, 선택)
- 레벨1 단음절('가','바')은 ASR 인식 편차 큼. 더 안정화하려면 두 글자 의성어('바바')로 교체(`constants/wordBank.ts`)하거나 레벨1만 임계값 하향(`settings.followSpeechThreshold`, 현재 0.6).
- 진단 패널(`?debug=1`) 코드는 쿼리 없으면 숨겨지므로 유지해도 무방.

### 🟢 기타 (선택)
- **게임 상수 추정치 실플레이 점검** — 풍선 하강률(`SOUND_BALLOON_DESCENT_RATE = 0.008`) 등 역산값이라 기기·브라우저별 난이도 편차 가능. 코드 버그는 아님.
- **접근성(aria-label)** — 아동·터치 중심이라 우선순위 낮음.
- `main-backup`의 미이식 작업(입운동 응원문구 등) 필요 시 cherry-pick.

---

## 12. 참고 정보 갱신 (6/4 기준)

### 이번 세션 커밋 (로컬 `master`)
| SHA | 내용 | 푸시 |
|-----|------|------|
| `646e70d0` | 강아지 별점 음수 가드 | ✅ |
| `c8acbaf6` | 보고서 API 견고성 | ✅ |
| `bf2db308` | 따라말하기 타이머 정리 + TTS 미지원 안내 (= 현재 원격 main HEAD) | ✅ |
| `fe378bd3` | 입·혀·소리열기구 라운드 타이머 정리 | ⚠️ **미푸시** |

### git 리모트 (모노레포 `Claude-prj`) — 6/4 갱신
- `SpeechTherapy` → `haemiru/SpeechTherapy` — **배포용. `git push SpeechTherapy master:main`**
- ~~`tug-of-war`~~ → 6/4에 로컬 리모트 제거 완료
- ~~`origin`~~ → 6/1에 제거(othello 잘못 설정)
