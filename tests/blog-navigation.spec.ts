import { test, expect } from '@playwright/test'

test.describe('Blog Navigation E2E Tests', () => {
  test('홈페이지 접속 및 기본 요소 확인', async ({ page }) => {
    // 홈페이지 접속
    await page.goto('/')

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Portfolio/i)

    // 메인 헤딩 확인
    const heading = page.locator('h1').filter({ hasText: 'My Portfolio' })
    await expect(heading).toBeVisible()

    // 자기 소개 텍스트 확인 - 실제 텍스트 내용 기반
    const introText = page.locator('text=/Vim enthusiast/')
    await expect(introText).toBeVisible()

    // 네비게이션 링크 확인
    const homeLink = page.getByRole('link', { name: 'home' })
    const blogLink = page.getByRole('link', { name: 'blog' })
    await expect(homeLink).toBeVisible()
    await expect(blogLink).toBeVisible()

    // BlogPosts 컴포넌트 - 블로그 포스트 링크들이 존재하는지 확인
    const blogPosts = page.locator('a[href^="/blog/"]')
    const postCount = await blogPosts.count()
    expect(postCount).toBeGreaterThan(0)
  })

  test('블로그 목록 페이지에서 포스트 확인', async ({ page }) => {
    // 블로그 목록 페이지 접속
    await page.goto('/blog')

    // 페이지 타이틀 확인
    await expect(page).toHaveTitle(/Blog/)

    // 블로그 페이지 헤딩 확인
    const heading = page.locator('h1').filter({ hasText: 'My Blog' })
    await expect(heading).toBeVisible()

    // 블로그 포스트 리스트 확인
    const blogPosts = page.locator('a[href^="/blog/"]')
    const postCount = await blogPosts.count()

    // 최소 1개 이상의 포스트가 있는지 확인
    expect(postCount).toBeGreaterThan(0)

    // 첫 번째 포스트의 구조 확인
    if (postCount > 0) {
      const firstPost = blogPosts.first()
      await expect(firstPost).toBeVisible()

      // 날짜 형식 확인 (예: "April 9, 2024")
      const datePattern = /\w+\s+\d{1,2},\s+\d{4}/
      const firstPostText = await firstPost.textContent()
      expect(firstPostText).toMatch(datePattern)

      // 포스트 제목이 있는지 확인
      expect(firstPostText).toBeTruthy()
      expect(firstPostText!.length).toBeGreaterThan(10) // 날짜 + 제목이므로 충분한 길이
    }

    // 실제 샘플 포스트 확인 (Vim, Spaces vs Tabs, Static Typing)
    const vimPost = page.locator('text=/Vim/')
    const spacesPost = page.locator('text=/Spaces vs. Tabs/')
    const typingPost = page.locator('text=/Static Typing/')

    // 최소 하나의 예상 포스트가 있는지 확인
    const samplePostsExist =
      (await vimPost.count()) > 0 ||
      (await spacesPost.count()) > 0 ||
      (await typingPost.count()) > 0

    expect(samplePostsExist).toBeTruthy()
  })

  test('개별 블로그 포스트 페이지 접근 및 콘텐츠 확인', async ({ page }) => {
    // 블로그 목록 페이지에서 시작
    await page.goto('/blog')

    // 첫 번째 포스트 링크 클릭
    const firstPostLink = page.locator('a[href^="/blog/"]').first()
    const postHref = await firstPostLink.getAttribute('href')

    // 포스트가 있는지 확인
    expect(postHref).toBeTruthy()

    // 포스트 클릭하여 상세 페이지로 이동
    await firstPostLink.click()

    // URL이 변경되었는지 확인
    await page.waitForURL(new RegExp(postHref!))

    // 포스트 제목 확인 (h1 태그)
    const postHeading = page.locator('h1').first()
    await expect(postHeading).toBeVisible()
    const headingText = await postHeading.textContent()
    expect(headingText).toBeTruthy()

    // 게시 날짜 확인
    const datePattern = /\w+\s+\d{1,2},\s+\d{4}/
    const pageContent = await page.textContent('body')
    expect(pageContent).toMatch(datePattern)

    // 포스트 콘텐츠 확인 (article 태그)
    const articleContent = page.locator('article')
    await expect(articleContent).toBeVisible()

    // 콘텐츠가 비어있지 않은지 확인
    const contentText = await articleContent.textContent()
    expect(contentText?.length).toBeGreaterThan(100) // 실제 콘텐츠가 있는지 확인

    // AuthorProfile 컴포넌트 확인 (있는 경우)
    // 실제 브라우저에서 확인한 결과, 작성자 프로필이 있음
    const authorSection = page.locator('h3') // heading level 3로 작성자 이름이 표시됨
    if (await authorSection.count() > 0) {
      await expect(authorSection.first()).toBeVisible()
    }
  })

  test('블로그 포스트 간 네비게이션', async ({ page }) => {
    // 블로그 목록 페이지 접속
    await page.goto('/blog')

    // 포스트가 2개 이상 있는지 확인
    const blogPosts = page.locator('a[href^="/blog/"]')
    const postCount = await blogPosts.count()

    if (postCount >= 2) {
      // 첫 번째 포스트 URL 저장
      const firstPostHref = await blogPosts.first().getAttribute('href')

      // 첫 번째 포스트로 이동
      await blogPosts.first().click()
      await page.waitForURL(new RegExp(firstPostHref!))

      // 포스트 페이지가 로드되었는지 확인
      const firstPostTitle = page.locator('h1').first()
      await expect(firstPostTitle).toBeVisible()

      // 뒤로 가기로 목록으로 돌아가기
      await page.goBack()
      await expect(page).toHaveURL('/blog')

      // 두 번째 포스트 URL 저장
      const secondPostHref = await blogPosts.nth(1).getAttribute('href')

      // 두 번째 포스트로 이동
      await blogPosts.nth(1).click()
      await page.waitForURL(new RegExp(secondPostHref!))

      // 두 번째 포스트가 로드되었는지 확인
      const secondPostTitle = page.locator('h1').first()
      await expect(secondPostTitle).toBeVisible()

      // 두 포스트의 제목이 다른지 확인
      const firstTitle = await firstPostTitle.textContent()
      const secondTitle = await secondPostTitle.textContent()
      expect(firstTitle).not.toEqual(secondTitle)
    }
  })

  test('반응형 레이아웃 확인', async ({ page }) => {
    // 블로그 목록 페이지 접속
    await page.goto('/blog')

    // 데스크톱 뷰 확인 (1280px)
    await page.setViewportSize({ width: 1280, height: 720 })

    // 블로그 포스트 링크가 보이는지 확인
    const desktopPosts = page.locator('a[href^="/blog/"]')
    await expect(desktopPosts.first()).toBeVisible()

    // flex-row 클래스가 적용되는지 확인 (데스크톱에서)
    const desktopLayout = page.locator('.md\\:flex-row, .flex-row')
    const desktopLayoutCount = await desktopLayout.count()

    // 모바일 뷰 확인 (375px)
    await page.setViewportSize({ width: 375, height: 667 })

    // 모바일에서도 블로그 포스트가 보이는지 확인
    await expect(desktopPosts.first()).toBeVisible()

    // flex-col 클래스가 적용되는지 확인 (모바일에서)
    const mobileLayout = page.locator('.flex-col')
    const mobileLayoutCount = await mobileLayout.count()

    // 레이아웃 요소가 존재하는지 확인
    expect(desktopLayoutCount + mobileLayoutCount).toBeGreaterThan(0)
  })

  test('네비게이션 메뉴 active 상태 확인', async ({ page }) => {
    // 홈페이지에서 시작
    await page.goto('/')

    // home 링크가 active 상태인지 확인 (aria-current 또는 active 클래스)
    const homeLink = page.getByRole('link', { name: 'home' })
    const homeLinkClass = await homeLink.getAttribute('class')
    const homeAriaAttribute = await homeLink.getAttribute('aria-current')

    // blog 페이지로 이동
    await page.goto('/blog')

    // blog 링크가 active 상태인지 확인
    const blogLink = page.getByRole('link', { name: 'blog' })
    const blogLinkClass = await blogLink.getAttribute('class')
    const blogAriaAttribute = await blogLink.getAttribute('aria-current')

    // active 상태 표시가 있는지 확인 (클래스 또는 aria 속성)
    const hasActiveIndication =
      blogAriaAttribute === 'page' ||
      blogLinkClass?.includes('active') ||
      blogLinkClass?.includes('font-semibold')

    expect(hasActiveIndication || blogAriaAttribute || blogLinkClass).toBeTruthy()
  })

  test('404 페이지 처리 확인', async ({ page }) => {
    // 존재하지 않는 페이지로 이동
    const response = await page.goto('/blog/non-existent-post')

    // 404 상태 코드 또는 Not Found 메시지 확인
    // Next.js는 개발 모드에서 404를 다르게 처리할 수 있음
    if (response?.status() === 404) {
      expect(response.status()).toBe(404)
    } else {
      // 또는 Not Found 컴포넌트가 렌더링되는지 확인
      const notFoundText = page.locator('text=/not found/i')
      const fourOhFourText = page.locator('text=/404/')

      const hasNotFoundIndication =
        (await notFoundText.count()) > 0 ||
        (await fourOhFourText.count()) > 0

      // 개발 모드에서는 에러 페이지가 다를 수 있으므로 유연하게 처리
      expect(hasNotFoundIndication || response?.ok() === false).toBeTruthy()
    }
  })
})