import { expect, test } from '@playwright/test'

/* Customer journeys on a phone, in Arabic (default) — requires `npm run seed`. */

test('home renders in Arabic RTL with hreflang and working language switch', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/ar$/)
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('رحلتك تبدأ من هنا')
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en$/)
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /og\.jpg/)
  await page.getByRole('link', { name: 'عرض الموقع بالإنجليزية' }).click()
  await expect(page).toHaveURL(/\/en$/)
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
})

test('request wizard: validation, Arabic digits, submit, success, then tracking', async ({ page }) => {
  await page.goto('/ar/request/umrah-visa')
  await page.getByRole('button', { name: 'التالي' }).click()
  await expect(page.getByText('اكتب الاسم الكامل')).toBeVisible()

  await page.getByLabel('الاسم الكامل').fill('سالم اختبار')
  await page.getByLabel('رقم الهاتف').fill('٧٧٧٠٠١٢٣٤')
  await page.getByRole('button', { name: 'التالي' }).click()

  await page.getByLabel('الجنسية').selectOption('YE')
  await page.getByLabel('عدد المسافرين').fill('٢')
  await page.getByLabel('تاريخ السفر المتوقع').fill('2030-02-01')
  await expect(page.getByText(/هـ/)).toBeVisible() // Hijri date shown
  await page.getByRole('button', { name: 'التالي' }).click()

  // Documents step (optional for Umrah) → review
  await page.getByRole('button', { name: 'التالي' }).click()
  await expect(page.getByText('راجع بياناتك قبل الإرسال.')).toBeVisible()
  await page.getByRole('button', { name: 'إرسال الطلب' }).click()
  await expect(page.getByText('يلزم الموافقة لإرسال الطلب')).toBeVisible()
  await page.getByRole('checkbox').last().check()
  await page.getByRole('button', { name: 'إرسال الطلب' }).click()

  await expect(page.getByRole('heading', { name: 'استلمنا طلبك' })).toBeVisible({ timeout: 30_000 })
  const ref = (await page.locator('text=/EV-\\d{2}-[A-Z0-9]{6}/').first().textContent())!.trim()
  expect(ref).toMatch(/^EV-\d{2}-[A-Z0-9]{6}$/)

  // Saved on the device → My requests shows it with its live status.
  await page.goto('/ar/my-requests')
  await expect(page.getByText(ref)).toBeVisible()
  await expect(page.getByText('جديد').first()).toBeVisible()

  // Tracking with the wrong digits reveals nothing; the right ones show the timeline.
  await page.goto('/ar/track')
  await page.getByLabel('رقم المرجع').fill(ref.toLowerCase())
  await page.getByLabel('آخر 4 أرقام من هاتفك').fill('0000')
  await page.getByRole('button', { name: 'اعرض حالة الطلب' }).click()
  await expect(page.getByText(/لم نجد طلباً/)).toBeVisible()
  await page.getByLabel('آخر 4 أرقام من هاتفك').fill('1234')
  await page.getByRole('button', { name: 'اعرض حالة الطلب' }).click()
  await expect(page.getByText('مراحل الطلب')).toBeVisible()
})

test('trip booking respects seats and lands on the receipt', async ({ page }) => {
  await page.goto('/ar/trips')
  await expect(page.getByRole('heading', { name: 'الرحلات المتاحة' })).toBeVisible()
  await page.goto('/ar/trips/mukalla-aden-bus')
  await page.locator('#book').getByLabel('الاسم الكامل').fill('Trip Tester')
  await page.locator('#book').getByLabel('رقم الهاتف').fill('+967733001122')
  await page.locator('#book').getByRole('button', { name: '+1' }).click()
  await page.locator('#book').getByRole('checkbox').check()
  await page.locator('#book').getByRole('button', { name: 'احجز مقعدك' }).click()
  await expect(page.getByRole('heading', { name: 'استلمنا طلبك' })).toBeVisible({ timeout: 30_000 })
  await expect(page.getByText('باص المكلا ← عدن')).toBeVisible()
})

test('full trip cannot be booked', async ({ page }) => {
  await page.goto('/ar/trips/mukalla-salalah-bus')
  await expect(page.getByText('اكتملت المقاعد').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'احجز مقعدك' })).toHaveCount(0)
})

test('contact form validates then sends', async ({ page }) => {
  await page.goto('/ar/contact')
  await page.getByRole('button', { name: 'إرسال الرسالة' }).click()
  await expect(page.getByText('اكتب اسمك')).toBeVisible()
  await page.getByLabel('الاسم').fill('زائر')
  await page.getByLabel('رقم الهاتف أو الواتساب').fill('771234567')
  await page.getByLabel('رسالتك').fill('أريد الاستفسار عن رحلات جدة')
  await page.locator('#contact-form').getByRole('checkbox').check()
  await page.getByRole('button', { name: 'إرسال الرسالة' }).click()
  await expect(page.getByText('وصلت رسالتك')).toBeVisible()
})

test('security: private collections are closed to the public', async ({ request }) => {
  for (const c of ['requests', 'customers', 'payments', 'request-documents', 'page-views', 'contact-messages', 'audit-logs'])
    expect((await request.get(`/api/${c}?limit=1`)).status(), c).toBe(403)
  expect((await request.get('/api/requests/export?type=requests')).status()).toBe(403)
})

test('SEO endpoints', async ({ request }) => {
  const sm = await request.get('/sitemap.xml')
  expect(sm.ok()).toBeTruthy()
  const xml = await sm.text()
  expect(xml).toContain('/ar/services/umrah-visa')
  expect(xml).toContain('hreflang="en"')
  expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /admin')
})
