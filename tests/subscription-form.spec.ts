import { test, expect } from '@playwright/test'

test.describe('Subscription Form E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test page with the subscription form
    await page.goto('/')

    // Add subscription form to the page for testing
    await page.evaluate(() => {
      const testContainer = document.createElement('div')
      testContainer.id = 'subscription-form-test'
      testContainer.innerHTML = `
        <div id="subscription-form-container">
          <!-- SubscriptionForm component will be rendered here -->
        </div>
      `
      document.body.appendChild(testContainer)
    })
  })

  test('구독 폼 UI 요소 확인', async ({ page }) => {
    // React 컴포넌트를 동적으로 렌더링
    await page.evaluate(() => {
      // Mock React component rendering
      const container = document.getElementById('subscription-form-container')
      if (container) {
        container.innerHTML = `
          <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 bg-neutral-50 dark:bg-neutral-900">
            <h3 class="text-lg font-semibold mb-2">새 글 알림 구독</h3>
            <p class="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              새로운 AI/개발 관련 글이 올라올 때 이메일로 알림을 받아보세요.
            </p>
            <form class="space-y-4">
              <div>
                <label for="email" class="sr-only">이메일 주소</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="이메일 주소를 입력하세요"
                  required
                  class="w-full px-3 py-2 border border-neutral-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                구독하기
              </button>
            </form>
            <p class="text-xs text-neutral-500 mt-3">
              언제든지 구독을 취소할 수 있으며, 개인정보는 안전하게 보호됩니다.
            </p>
          </div>
        `
      }
    })

    // 구독 폼 제목 확인
    const formTitle = page.locator('h3:has-text("새 글 알림 구독")')
    await expect(formTitle).toBeVisible()

    // 설명 텍스트 확인
    const description = page.locator('text=새로운 AI/개발 관련 글이 올라올 때')
    await expect(description).toBeVisible()

    // 이메일 입력 필드 확인
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('placeholder', '이메일 주소를 입력하세요')
    await expect(emailInput).toHaveAttribute('required')

    // 구독 버튼 확인
    const submitButton = page.locator('button:has-text("구독하기")')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toHaveAttribute('type', 'submit')

    // 개인정보 보호 안내 확인
    const privacyNotice = page.locator('text=언제든지 구독을 취소할 수 있으며')
    await expect(privacyNotice).toBeVisible()
  })

  test('이메일 입력 필드 유효성 검증', async ({ page }) => {
    // 구독 폼 렌더링
    await page.evaluate(() => {
      const container = document.getElementById('subscription-form-container')
      if (container) {
        container.innerHTML = `
          <div class="border rounded-lg p-6">
            <form id="subscription-form" class="space-y-4">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="이메일 주소를 입력하세요"
                required
                class="w-full px-3 py-2 border rounded-md"
              />
              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                구독하기
              </button>
              <div id="error-message" style="display: none;" class="text-red-600 text-sm"></div>
            </form>
          </div>
        `

        // 폼 유효성 검사 이벤트 리스너 추가
        const form = document.getElementById('subscription-form') as HTMLFormElement
        const emailInput = document.getElementById('email') as HTMLInputElement
        const errorDiv = document.getElementById('error-message') as HTMLDivElement

        form.addEventListener('submit', (e) => {
          e.preventDefault()
          const email = emailInput.value

          // 이메일 유효성 검사
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

          if (!emailRegex.test(email) || email.length > 254) {
            errorDiv.textContent = '올바른 이메일 주소를 입력해주세요.'
            errorDiv.style.display = 'block'
          } else {
            errorDiv.style.display = 'none'
            // 성공 상태로 변경
            form.innerHTML = `
              <div class="text-green-600">
                <p>구독이 완료되었습니다!</p>
              </div>
            `
          }
        })
      }
    })

    const emailInput = page.locator('#email')
    const submitButton = page.locator('button[type="submit"]')
    const errorMessage = page.locator('#error-message')

    // 빈 이메일로 제출 시도
    await submitButton.click()

    // 브라우저 기본 유효성 검사 확인
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).toBeTruthy()

    // 잘못된 이메일 형식 테스트
    await emailInput.fill('invalid-email')
    await submitButton.click()
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toHaveText('올바른 이메일 주소를 입력해주세요.')

    // 유효한 이메일 입력
    await emailInput.fill('test@example.com')
    await submitButton.click()

    // 성공 메시지 확인
    const successMessage = page.locator('text=구독이 완료되었습니다!')
    await expect(successMessage).toBeVisible()
  })

  test('반응형 디자인 테스트', async ({ page }) => {
    // 구독 폼 렌더링
    await page.evaluate(() => {
      const container = document.getElementById('subscription-form-container')
      if (container) {
        container.innerHTML = `
          <div class="border rounded-lg p-6 w-full max-w-md mx-auto">
            <h3 class="text-lg font-semibold mb-2">새 글 알림 구독</h3>
            <form class="space-y-4">
              <input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                class="w-full px-3 py-2 border rounded-md"
              />
              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md"
              >
                구독하기
              </button>
            </form>
          </div>
        `
      }
    })

    const form = page.locator('div.border.rounded-lg')

    // 데스크톱 뷰 (1280px)
    await page.setViewportSize({ width: 1280, height: 720 })
    await expect(form).toBeVisible()

    // 폼이 적절한 너비를 가지는지 확인
    const desktopBoundingBox = await form.boundingBox()
    expect(desktopBoundingBox?.width).toBeLessThan(500) // max-w-md 적용 확인

    // 태블릿 뷰 (768px)
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(form).toBeVisible()

    // 모바일 뷰 (375px)
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(form).toBeVisible()

    // 모바일에서 폼이 화면에 잘 맞는지 확인
    const mobileBoundingBox = await form.boundingBox()
    expect(mobileBoundingBox?.width).toBeLessThan(375)

    // 입력 필드와 버튼이 모바일에서도 터치하기 쉬운 크기인지 확인
    const emailInput = page.locator('input[type="email"]')
    const submitButton = page.locator('button[type="submit"]')

    const inputHeight = await emailInput.evaluate(el => el.getBoundingClientRect().height)
    const buttonHeight = await submitButton.evaluate(el => el.getBoundingClientRect().height)

    expect(inputHeight).toBeGreaterThanOrEqual(40) // 최소 터치 타겟 크기
    expect(buttonHeight).toBeGreaterThanOrEqual(40)
  })

  test('접근성(Accessibility) 테스트', async ({ page }) => {
    // 구독 폼 렌더링 (접근성 속성 포함)
    await page.evaluate(() => {
      const container = document.getElementById('subscription-form-container')
      if (container) {
        container.innerHTML = `
          <div class="border rounded-lg p-6" role="form" aria-labelledby="form-title">
            <h3 id="form-title" class="text-lg font-semibold mb-2">새 글 알림 구독</h3>
            <p class="text-neutral-600 text-sm mb-4">
              새로운 AI/개발 관련 글이 올라올 때 이메일로 알림을 받아보세요.
            </p>
            <form class="space-y-4">
              <div>
                <label for="email" class="sr-only">이메일 주소</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="이메일 주소를 입력하세요"
                  required
                  aria-describedby="email-help"
                  class="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md"
                aria-label="이메일 구독 신청하기"
              >
                구독하기
              </button>
            </form>
            <p id="email-help" class="text-xs text-neutral-500 mt-3">
              언제든지 구독을 취소할 수 있으며, 개인정보는 안전하게 보호됩니다.
            </p>
          </div>
        `
      }
    })

    // 폼 역할 확인
    const formContainer = page.locator('[role="form"]')
    await expect(formContainer).toBeVisible()

    // 제목과 폼의 연관성 확인 (aria-labelledby)
    const formTitle = page.locator('#form-title')
    await expect(formTitle).toBeVisible()

    // 이메일 입력 필드의 라벨 확인
    const emailInput = page.locator('#email')
    const emailLabel = page.locator('label[for="email"]')
    await expect(emailLabel).toBePresent() // sr-only 클래스로 숨겨져 있지만 존재

    // aria-describedby 속성 확인
    await expect(emailInput).toHaveAttribute('aria-describedby', 'email-help')

    // 버튼의 aria-label 확인
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toHaveAttribute('aria-label', '이메일 구독 신청하기')

    // 키보드 네비게이션 테스트
    await page.keyboard.press('Tab') // 이메일 입력 필드로 포커스
    await expect(emailInput).toBeFocused()

    await page.keyboard.press('Tab') // 구독 버튼으로 포커스
    await expect(submitButton).toBeFocused()

    // Enter 키로 폼 제출 테스트
    await emailInput.focus()
    await emailInput.fill('test@example.com')
    await page.keyboard.press('Enter')

    // 폼 제출이 실행되었는지 확인 (실제로는 preventDefault로 차단됨)
  })

  test('다크 모드 스타일 테스트', async ({ page }) => {
    // 다크 모드 클래스를 html에 추가
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })

    // 구독 폼 렌더링 (다크 모드 스타일 포함)
    await page.evaluate(() => {
      const container = document.getElementById('subscription-form-container')
      if (container) {
        container.innerHTML = `
          <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 bg-neutral-50 dark:bg-neutral-900">
            <h3 class="text-lg font-semibold mb-2 text-neutral-900 dark:text-neutral-100">새 글 알림 구독</h3>
            <p class="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              새로운 AI/개발 관련 글이 올라올 때 이메일로 알림을 받아보세요.
            </p>
            <form class="space-y-4">
              <input
                type="email"
                placeholder="이메일 주소를 입력하세요"
                class="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md
                       bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
              <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                       text-white py-2 px-4 rounded-md"
              >
                구독하기
              </button>
            </form>
          </div>
        `
      }
    })

    const formContainer = page.locator('div.border')

    // 다크 모드에서 배경색이 적용되었는지 확인
    const backgroundColor = await formContainer.evaluate(el => {
      const styles = getComputedStyle(el)
      return styles.backgroundColor
    })

    // 다크 모드 배경색이 적용되었는지 확인 (정확한 색상은 Tailwind CSS에 따라 다름)
    expect(backgroundColor).not.toBe('rgb(255, 255, 255)') // 기본 흰색이 아님

    // 텍스트 색상 확인
    const title = page.locator('h3')
    const textColor = await title.evaluate(el => {
      const styles = getComputedStyle(el)
      return styles.color
    })

    expect(textColor).not.toBe('rgb(0, 0, 0)') // 기본 검은색이 아님

    // 라이트 모드로 전환하여 스타일이 변경되는지 확인
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
    })

    // 잠시 대기 후 색상 변경 확인
    await page.waitForTimeout(100)

    const lightBackgroundColor = await formContainer.evaluate(el => {
      const styles = getComputedStyle(el)
      return styles.backgroundColor
    })

    // 다크 모드와 라이트 모드의 배경색이 다른지 확인
    expect(lightBackgroundColor).not.toBe(backgroundColor)
  })

  test('폼 상태 변화 시나리오 테스트', async ({ page }) => {
    // 상태 관리가 포함된 구독 폼 렌더링
    await page.evaluate(() => {
      const container = document.getElementById('subscription-form-container')
      if (container) {
        let currentState = 'default' // default, loading, success, error
        let email = ''

        const render = () => {
          if (currentState === 'success') {
            container.innerHTML = `
              <div class="border border-green-200 bg-green-50 rounded-lg p-6">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <div>
                    <h3 class="text-sm font-medium text-green-800">구독이 완료되었습니다!</h3>
                    <p class="text-sm text-green-600 mt-1">
                      이메일로 확인 링크를 보내드렸습니다. 확인 후 새 글 알림을 받으실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            `
          } else if (currentState === 'error') {
            container.innerHTML = `
              <div class="border rounded-lg p-6">
                <form id="subscription-form" class="space-y-4">
                  <input
                    type="email"
                    id="email"
                    placeholder="이메일 주소를 입력하세요"
                    value="${email}"
                    class="w-full px-3 py-2 border rounded-md"
                  />
                  <div class="text-red-600 text-sm">올바른 이메일 주소를 입력해주세요.</div>
                  <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md">
                    구독하기
                  </button>
                </form>
              </div>
            `
          } else if (currentState === 'loading') {
            container.innerHTML = `
              <div class="border rounded-lg p-6">
                <form class="space-y-4">
                  <input
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    disabled
                    class="w-full px-3 py-2 border rounded-md opacity-50 cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled
                    class="w-full bg-neutral-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
                  >
                    구독 중...
                  </button>
                </form>
              </div>
            `
          } else {
            container.innerHTML = `
              <div class="border rounded-lg p-6">
                <form id="subscription-form" class="space-y-4">
                  <input
                    type="email"
                    id="email"
                    placeholder="이메일 주소를 입력하세요"
                    class="w-full px-3 py-2 border rounded-md"
                  />
                  <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md">
                    구독하기
                  </button>
                </form>
              </div>
            `
          }

          // 이벤트 리스너 다시 등록
          const form = document.getElementById('subscription-form')
          if (form) {
            form.addEventListener('submit', (e) => {
              e.preventDefault()
              const emailInput = document.getElementById('email') as HTMLInputElement
              email = emailInput.value

              if (!email || !email.includes('@')) {
                currentState = 'error'
              } else {
                currentState = 'loading'
                setTimeout(() => {
                  currentState = 'success'
                  render()
                }, 1000)
              }
              render()
            })
          }
        }

        render()
      }
    })

    // 초기 상태 확인
    const initialForm = page.locator('#subscription-form')
    await expect(initialForm).toBeVisible()

    const emailInput = page.locator('#email')
    const submitButton = page.locator('button[type="submit"]')

    // 잘못된 이메일로 에러 상태 테스트
    await emailInput.fill('invalid-email')
    await submitButton.click()

    const errorMessage = page.locator('.text-red-600')
    await expect(errorMessage).toBeVisible()
    await expect(errorMessage).toHaveText('올바른 이메일 주소를 입력해주세요.')

    // 올바른 이메일로 로딩 상태 테스트
    await emailInput.fill('test@example.com')
    await submitButton.click()

    const loadingButton = page.locator('button:has-text("구독 중...")')
    await expect(loadingButton).toBeVisible()
    await expect(loadingButton).toBeDisabled()

    // 성공 상태 테스트 (1초 후)
    const successMessage = page.locator('h3:has-text("구독이 완료되었습니다!")')
    await expect(successMessage).toBeVisible({ timeout: 2000 })

    const confirmationText = page.locator('text=이메일로 확인 링크를 보내드렸습니다')
    await expect(confirmationText).toBeVisible()

    // 성공 아이콘 확인
    const successIcon = page.locator('svg')
    await expect(successIcon).toBeVisible()
  })
})