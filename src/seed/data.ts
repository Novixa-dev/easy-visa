import { bi, rich, richBi } from './helpers'

/* ------------------------------------------------------------------ */
/*  Shared form-field building blocks                                  */
/* ------------------------------------------------------------------ */
const f = {
  nationality: (required = true) => ({ name: 'nationality', type: 'destination', required, width: 'half', label: bi('الجنسية', 'Nationality') }),
  residence: () => ({
    name: 'residence',
    type: 'destination',
    width: 'half',
    label: bi('بلد الإقامة الحالي', 'Current country of residence'),
    help: bi('إن كنت مقيماً خارج اليمن', 'If you live outside Yemen'),
  }),
  travelers: (name = 'travelers', label = bi('عدد المسافرين', 'Number of travellers')) => ({ name, type: 'number', required: true, width: 'half', min: 1, max: 50, label }),
  travelDate: (required = true, hijri = false) => ({
    name: 'travelDate',
    type: 'date',
    required,
    width: 'half',
    futureOnly: true,
    showHijri: hijri,
    label: bi('تاريخ السفر المتوقع', 'Expected travel date'),
    help: bi('تقريبي، يمكن تعديله لاحقاً', 'Approximate; you can change it later'),
  }),
  purpose: () => ({
    name: 'purpose',
    type: 'select',
    required: true,
    width: 'half',
    label: bi('الغرض من السفر', 'Purpose of travel'),
    options: [
      { value: 'tourism', label: bi('سياحة', 'Tourism') },
      { value: 'family', label: bi('زيارة عائلية', 'Family visit') },
      { value: 'business', label: bi('عمل', 'Business') },
      { value: 'medical', label: bi('علاج', 'Medical treatment') },
      { value: 'study', label: bi('دراسة', 'Study') },
      { value: 'other', label: bi('أخرى', 'Other') },
    ],
  }),
  visaTypeText: () => ({
    name: 'visaType',
    type: 'text',
    width: 'half',
    label: bi('نوع التأشيرة إن كنت تعرفه', 'Visa type, if you know it'),
    placeholder: bi('اتركه فارغاً إن لم تكن متأكداً', 'Leave empty if unsure'),
  }),
}

const passportSlot = (required: boolean) => ({
  key: 'passport',
  required,
  label: bi('صورة صفحة بيانات الجواز', 'Passport data page'),
  help: bi('صورة واضحة تظهر فيها كل البيانات والأرقام', 'A clear photo where all details are readable'),
})

const passportReq = [
  { item: bi('جواز سفر ساري المفعول', 'A valid passport'), note: bi('يُفضّل ألا تقل صلاحيته عن 6 أشهر', 'Ideally valid for at least 6 months') },
  { item: bi('صورة شخصية حديثة بخلفية بيضاء', 'A recent personal photo with a white background') },
]

/* ------------------------------------------------------------------ */
/*  Services                                                           */
/* ------------------------------------------------------------------ */
export const services = [
  {
    category: 'visas',
    slug: 'umrah-visa',
    icon: 'kaaba',
    featured: true,
    title: bi('تأشيرة العمرة', 'Umrah visa'),
    summary: bi('نساعدك في تجهيز طلب تأشيرة العمرة ومتابعته حتى صدور القرار.', 'We help you prepare your Umrah visa request and follow it up until a decision is made.'),
    audience: bi('للأفراد والعائلات والمجموعات الراغبين في أداء العمرة.', 'For individuals, families and groups planning to perform Umrah.'),
    body: richBi(
      [
        { p: 'نستقبل طلبك ونراجع بياناتك ومستنداتك، ثم نوضّح لك الخيارات المتاحة حالياً والمدة التقريبية والتكلفة قبل أي التزام.' },
        { p: 'أنواع التأشيرات وشروطها تحددها الجهات الرسمية وقد تتغير، لذلك نؤكد معك التفاصيل المحدّثة عند مراجعة طلبك.' },
      ],
      [
        { p: 'We receive your request, review your details and documents, then explain the options currently available, the approximate timing and the cost before you commit.' },
        { p: 'Visa types and conditions are set by the official authorities and can change, so we confirm the up-to-date details with you when we review your request.' },
      ],
    ),
    requirements: passportReq,
    notes: bi('تقديم الطلب لا يعني صدور التأشيرة؛ القرار النهائي للجهات المختصة.', 'Submitting a request does not mean the visa is issued; the final decision belongs to the authorities.'),
    faqs: [
      { question: bi('هل يمكن التقديم لعائلة كاملة في طلب واحد؟', 'Can I apply for a whole family in one request?'), answer: bi('نعم، اكتب عدد المسافرين في النموذج وسنطلب بقية البيانات عند المراجعة.', 'Yes. Enter the number of travellers in the form and we will ask for the rest when we review it.') },
    ],
    formFields: [
      f.nationality(),
      f.travelers(),
      f.travelDate(true, true),
      {
        name: 'umrahType',
        type: 'radio',
        width: 'full',
        label: bi('كيف تخطط للسفر؟', 'How do you plan to travel?'),
        options: [
          { value: 'individual', label: bi('بشكل فردي أو مع العائلة', 'On my own or with family') },
          { value: 'group', label: bi('مع مجموعة', 'With a group') },
          { value: 'unsure', label: bi('لم أقرر بعد', 'Not decided yet') },
        ],
      },
      f.residence(),
    ],
    documentSlots: [passportSlot(false), { key: 'photo', required: false, label: bi('صورة شخصية', 'Personal photo'), help: bi('بخلفية بيضاء', 'White background') }],
  },
  {
    category: 'visas',
    slug: 'family-visit-visa',
    icon: 'family',
    featured: true,
    title: bi('تأشيرة الزيارة العائلية', 'Family visit visa'),
    summary: bi('مساعدة في إجراءات تأشيرة زيارة الأهل والأقارب وتجهيز الطلب.', 'Help with the procedures and paperwork for visiting family and relatives.'),
    audience: bi('لمن لديه قريب مقيم في بلد آخر ويرغب في زيارته.', 'For anyone with a relative living in another country they want to visit.'),
    body: richBi(
      [{ p: 'تختلف متطلبات الزيارة العائلية حسب الدولة وصلة القرابة ووضع المستضيف. أرسل لنا التفاصيل الأساسية وسنخبرك بما يلزم لحالتك.' }],
      [{ p: 'Family visit requirements depend on the country, the relationship and the host’s status. Send us the basics and we will tell you what your case needs.' }],
    ),
    requirements: passportReq,
    formFields: [
      { name: 'destination', type: 'destination', required: true, width: 'half', label: bi('الدولة المراد زيارتها', 'Country you want to visit') },
      f.nationality(),
      f.travelers('applicants', bi('عدد المتقدمين', 'Number of applicants')),
      {
        name: 'relation',
        type: 'select',
        width: 'half',
        label: bi('صلة القرابة بالمستضيف', 'Relationship to the host'),
        options: [
          { value: 'parent', label: bi('أب أو أم', 'Parent') },
          { value: 'spouse', label: bi('زوج أو زوجة', 'Spouse') },
          { value: 'child', label: bi('ابن أو ابنة', 'Child') },
          { value: 'sibling', label: bi('أخ أو أخت', 'Sibling') },
          { value: 'other', label: bi('قرابة أخرى', 'Other relative') },
        ],
      },
      f.travelDate(false),
    ],
    documentSlots: [passportSlot(false)],
  },
  {
    category: 'visas',
    slug: 'oman-visa',
    icon: 'passport',
    featured: true,
    title: bi('تأشيرة سلطنة عُمان', 'Oman visa'),
    summary: bi('طلبات تأشيرات سلطنة عُمان بأنواعها حسب المتاح وقت الطلب.', 'Requests for Sultanate of Oman visas, depending on what is available at the time.'),
    body: richBi(
      [{ p: 'نراجع غرض سفرك وجنسيتك ونوضح لك نوع التأشيرة المناسب والمتطلبات الحالية قبل البدء.' }],
      [{ p: 'We review your purpose of travel and nationality, then explain the suitable visa type and the current requirements before we start.' }],
    ),
    requirements: passportReq,
    formFields: [f.nationality(), f.residence(), f.purpose(), f.visaTypeText(), f.travelers(), f.travelDate()],
    documentSlots: [passportSlot(false)],
  },
  {
    category: 'visas',
    slug: 'other-countries-visa',
    icon: 'globe',
    title: bi('تأشيرات دول أخرى', 'Visas for other countries'),
    summary: bi('أخبرنا بوجهتك وسنوضح لك إمكانية التقديم والمتطلبات.', 'Tell us your destination and we will explain whether and how you can apply.'),
    body: richBi(
      [{ p: 'نستقبل طلبات تأشيرات لعدة دول. نتحقق من إمكانية التقديم لحالتك أولاً، ثم نرسل لك قائمة المتطلبات والتكلفة.' }],
      [{ p: 'We take visa requests for several countries. We first check whether your case can apply, then send you the requirements and the cost.' }],
    ),
    requirements: passportReq,
    formFields: [
      { name: 'destination', type: 'destination', required: true, width: 'half', label: bi('دولة الوجهة', 'Destination country') },
      f.nationality(),
      f.residence(),
      f.purpose(),
      f.visaTypeText(),
      f.travelers(),
      f.travelDate(),
    ],
    documentSlots: [passportSlot(false)],
  },
  {
    category: 'visas',
    slug: 'travel-consultation',
    icon: 'chat',
    title: bi('استشارة سفر وتأشيرات', 'Travel & visa consultation'),
    summary: bi('غير متأكد من الخدمة المناسبة؟ اسألنا قبل أن تبدأ.', 'Not sure which service you need? Ask us before you start.'),
    body: richBi(
      [{ p: 'اكتب سؤالك أو وضعك، وسيرد عليك أحد موظفينا بالخيارات المناسبة والخطوات التالية.' }],
      [{ p: 'Write your question or situation and one of our team will reply with suitable options and next steps.' }],
    ),
    formFields: [
      {
        name: 'topic',
        type: 'select',
        required: true,
        label: bi('موضوع الاستشارة', 'Topic'),
        options: [
          { value: 'visa', label: bi('تأشيرة', 'A visa') },
          { value: 'umrah', label: bi('العمرة', 'Umrah') },
          { value: 'booking', label: bi('حجز طيران أو فندق أو نقل', 'Flight, hotel or transport booking') },
          { value: 'other', label: bi('موضوع آخر', 'Something else') },
        ],
      },
      { name: 'question', type: 'textarea', required: true, label: bi('سؤالك', 'Your question'), placeholder: bi('اشرح وضعك باختصار', 'Briefly describe your situation') },
    ],
    documentSlots: [],
  },
  {
    category: 'travel',
    slug: 'flight-booking',
    icon: 'plane',
    featured: true,
    title: bi('حجز تذاكر الطيران', 'Flight bookings'),
    summary: bi('أرسل خط سيرك ونرسل لك أفضل الخيارات والأسعار المتاحة.', 'Send your itinerary and we send you the best available options and fares.'),
    body: richBi(
      [{ p: 'هذا طلب عرض سعر وليس شراءً فورياً للتذكرة. نبحث في الرحلات المتاحة ونتواصل معك لتأكيد الخيار قبل الإصدار.' }],
      [{ p: 'This is a request for a quote, not an instant ticket purchase. We search the available flights and contact you to confirm before issuing.' }],
    ),
    formFields: [
      {
        name: 'tripType',
        type: 'radio',
        required: true,
        label: bi('نوع الرحلة', 'Trip type'),
        options: [
          { value: 'oneway', label: bi('ذهاب فقط', 'One way') },
          { value: 'round', label: bi('ذهاب وعودة', 'Round trip') },
        ],
      },
      { name: 'from', type: 'text', required: true, width: 'half', label: bi('من (مدينة أو مطار)', 'From (city or airport)'), placeholder: bi('مثال: المكلا – الريان', 'e.g. Mukalla – Riyan') },
      { name: 'to', type: 'text', required: true, width: 'half', label: bi('إلى (مدينة أو مطار)', 'To (city or airport)'), placeholder: bi('مثال: جدة', 'e.g. Jeddah') },
      { name: 'departureDate', type: 'date', required: true, width: 'half', futureOnly: true, label: bi('تاريخ الذهاب', 'Departure date') },
      { name: 'returnDate', type: 'date', required: true, width: 'half', futureOnly: true, afterField: 'departureDate', label: bi('تاريخ العودة', 'Return date'), showWhen: { field: 'tripType', equals: 'round' } },
      { name: 'adults', type: 'number', required: true, width: 'half', min: 1, max: 9, label: bi('البالغون (12 سنة فأكثر)', 'Adults (12+)') },
      { name: 'children', type: 'number', width: 'half', min: 0, max: 9, label: bi('الأطفال (2–11)', 'Children (2–11)') },
      { name: 'infants', type: 'number', width: 'half', min: 0, max: 4, label: bi('الرضّع (أقل من سنتين)', 'Infants (under 2)') },
      {
        name: 'cabin',
        type: 'select',
        width: 'half',
        label: bi('درجة السفر', 'Cabin class'),
        options: [
          { value: 'economy', label: bi('سياحية', 'Economy') },
          { value: 'business', label: bi('رجال الأعمال', 'Business') },
          { value: 'any', label: bi('لا يهم', 'No preference') },
        ],
      },
      { name: 'airline', type: 'text', label: bi('شركة طيران مفضلة', 'Preferred airline') },
    ],
    documentSlots: [],
  },
  {
    category: 'travel',
    slug: 'land-transport',
    icon: 'bus',
    title: bi('النقل البري', 'Land transport'),
    summary: bi('حجوزات رحلات الباصات الداخلية والدولية.', 'Bookings for domestic and international bus trips.'),
    body: richBi(
      [{ p: 'نحجز لك مقاعد في رحلات النقل البري داخل اليمن وإلى الدول المجاورة حسب المتاح.' }],
      [{ p: 'We book seats on land trips within Yemen and to neighbouring countries, depending on availability.' }],
    ),
    formFields: [
      {
        name: 'tripCategory',
        type: 'radio',
        required: true,
        label: bi('نوع الرحلة', 'Trip type'),
        options: [
          { value: 'domestic', label: bi('داخلية', 'Domestic') },
          { value: 'international', label: bi('دولية', 'International') },
        ],
      },
      { name: 'origin', type: 'text', required: true, width: 'half', label: bi('من', 'From'), placeholder: bi('مثال: المكلا', 'e.g. Mukalla') },
      { name: 'destinationCity', type: 'text', required: true, width: 'half', label: bi('إلى', 'To'), placeholder: bi('مثال: سيئون', 'e.g. Seiyun') },
      { name: 'travelDate', type: 'date', required: true, width: 'half', futureOnly: true, label: bi('تاريخ السفر', 'Travel date') },
      { name: 'passengers', type: 'number', required: true, width: 'half', min: 1, max: 50, label: bi('عدد الركاب', 'Passengers') },
      {
        name: 'departureTime',
        type: 'select',
        width: 'half',
        label: bi('وقت المغادرة المفضل', 'Preferred departure time'),
        options: [
          { value: 'morning', label: bi('صباحاً', 'Morning') },
          { value: 'afternoon', label: bi('ظهراً', 'Afternoon') },
          { value: 'evening', label: bi('مساءً', 'Evening') },
          { value: 'any', label: bi('لا يهم', 'Any time') },
        ],
      },
    ],
    documentSlots: [],
  },
  {
    category: 'travel',
    slug: 'hotel-booking',
    icon: 'hotel',
    title: bi('حجز الفنادق', 'Hotel bookings'),
    summary: bi('حجوزات فنادق في مكة والمدينة وغيرها حسب ميزانيتك.', 'Hotel bookings in Makkah, Madinah and elsewhere, to fit your budget.'),
    body: richBi(
      [{ p: 'أخبرنا بالمدينة والتواريخ وعدد الأشخاص، وسنرسل لك خيارات مناسبة مع الأسعار المتاحة وقت الطلب.' }],
      [{ p: 'Tell us the city, dates and number of guests, and we will send you suitable options with the prices available at the time.' }],
    ),
    formFields: [
      { name: 'city', type: 'text', required: true, width: 'half', label: bi('المدينة', 'City'), placeholder: bi('مثال: مكة المكرمة', 'e.g. Makkah') },
      { name: 'hotelName', type: 'text', width: 'half', label: bi('اسم فندق محدد (اختياري)', 'A specific hotel (optional)') },
      { name: 'checkIn', type: 'date', required: true, width: 'half', futureOnly: true, showHijri: true, label: bi('تاريخ الدخول', 'Check-in') },
      { name: 'checkOut', type: 'date', required: true, width: 'half', futureOnly: true, afterField: 'checkIn', label: bi('تاريخ الخروج', 'Check-out') },
      { name: 'rooms', type: 'number', required: true, width: 'half', min: 1, max: 20, label: bi('عدد الغرف', 'Rooms') },
      { name: 'adults', type: 'number', required: true, width: 'half', min: 1, max: 40, label: bi('البالغون', 'Adults') },
      { name: 'children', type: 'number', width: 'half', min: 0, max: 20, label: bi('الأطفال', 'Children') },
      { name: 'roomPreference', type: 'text', width: 'half', label: bi('تفضيلات الغرفة', 'Room preference'), placeholder: bi('مثال: قريب من الحرم، إطلالة', 'e.g. close to the Haram, a view') },
    ],
    documentSlots: [],
  },
]

export const categories = [
  { slug: 'visas', sortOrder: 1, title: bi('التأشيرات', 'Visas'), intro: bi('عمرة، زيارة عائلية، عُمان ودول أخرى. نراجع طلبك ونوضح لك المتطلبات الحالية قبل البدء.', 'Umrah, family visits, Oman and other countries. We review your request and explain the current requirements before we start.') },
  { slug: 'travel', sortOrder: 2, title: bi('السفر والحجوزات', 'Travel & bookings'), intro: bi('طيران وفنادق ونقل بري. أرسل تفاصيل رحلتك ونرسل لك الخيارات المتاحة.', 'Flights, hotels and land transport. Send your trip details and we send you the available options.') },
]

export const destinations: [string, string, string][] = [
  ['YE', 'اليمن', 'Yemen'],
  ['SA', 'المملكة العربية السعودية', 'Saudi Arabia'],
  ['OM', 'سلطنة عُمان', 'Oman'],
  ['AE', 'الإمارات العربية المتحدة', 'United Arab Emirates'],
  ['QA', 'قطر', 'Qatar'],
  ['KW', 'الكويت', 'Kuwait'],
  ['BH', 'البحرين', 'Bahrain'],
  ['EG', 'مصر', 'Egypt'],
  ['JO', 'الأردن', 'Jordan'],
  ['TR', 'تركيا', 'Türkiye'],
  ['MY', 'ماليزيا', 'Malaysia'],
  ['ID', 'إندونيسيا', 'Indonesia'],
  ['IN', 'الهند', 'India'],
  ['ET', 'إثيوبيا', 'Ethiopia'],
  ['DJ', 'جيبوتي', 'Djibouti'],
  ['SD', 'السودان', 'Sudan'],
  ['SO', 'الصومال', 'Somalia'],
  ['CN', 'الصين', 'China'],
  ['GB', 'المملكة المتحدة', 'United Kingdom'],
  ['DE', 'ألمانيا', 'Germany'],
  ['US', 'الولايات المتحدة', 'United States'],
]

export const settings = {
  siteName: bi('إيزي فيزا', 'Easy Visa'),
  tagline: bi('وجهتك.. أسهل معنا', 'Your destination, made easier'),
  footerAbout: bi(
    'Easy Visa مكتب خدمات سفر وتأشيرات في المكلا، حضرموت. نستقبل طلباتك ونتابعها معك بوضوح من البداية حتى النهاية.',
    'Easy Visa is a travel and visa services office in Mukalla, Hadhramaut. We receive your requests and follow them up with you clearly from start to finish.',
  ),
  primaryWhatsapp: '+967780007578',
  contacts: [
    { label: bi('التأشيرات والاستفسارات', 'Visas & enquiries'), phone: '+967780007578', whatsapp: true, calls: true },
    { label: bi('الحجوزات', 'Bookings'), phone: '+967734406857', whatsapp: true, calls: true },
  ],
  city: bi('المكلا، حضرموت، اليمن', 'Mukalla, Hadhramaut, Yemen'),
  consentText: bi(
    'أوافق على أن تستخدم Easy Visa بياناتي لمراجعة طلبي والتواصل معي.',
    'I agree that Easy Visa may use my details to review my request and contact me.',
  ),
  whatsappTemplates: {
    afterSubmit: bi('مرحباً Easy Visa، أرسلت طلب {service} عبر الموقع.\nرقم المرجع: {reference}\nالاسم: {name}', 'Hello Easy Visa, I sent a {service} request on the website.\nReference: {reference}\nName: {name}'),
    statusUpdate: bi(
      'مرحباً {name}،\nتحديث بخصوص طلبك رقم {reference} ({service}):\nالحالة الآن: {status}\n{message}\n\nيمكنك متابعة طلبك من هنا: {trackUrl}\nفريق Easy Visa',
      'Hello {name},\nAn update on your request {reference} ({service}):\nCurrent status: {status}\n{message}\n\nTrack your request here: {trackUrl}\nThe Easy Visa team',
    ),
  },
  announcement: { enabled: false },
  // Placeholder accounts: replace with the real ones from Settings → Payments before launch.
  bankAccounts: [
    {
      bankName: bi('اسم البنك (عدّله من الإعدادات)', 'Bank name (edit in Settings)'),
      accountName: 'Easy Visa',
      accountNumber: '0000000000',
      currency: 'YER',
      note: bi('اكتب رقم المرجع في خانة الملاحظات عند التحويل.', 'Write your reference number in the transfer note.'),
      active: true,
    },
    {
      bankName: bi('شركة الصرافة (عدّلها من الإعدادات)', 'Exchange company (edit in Settings)'),
      accountName: 'Easy Visa',
      accountNumber: '0000000000',
      currency: 'SAR',
      active: true,
    },
  ],
  paymentInstructions: bi(
    'بعد التحويل ارفع صورة الإيصال هنا. نتحقق من وصول المبلغ ثم نحدّث حالة الدفع، عادةً خلال يوم عمل.',
    'After transferring, upload the receipt here. We check the money arrived, then update the payment status, usually within one working day.',
  ),
}

export const companies = [
  { key: 'land', type: 'bus', name: bi('شريك النقل البري (عدّل الاسم)', 'Land transport partner (edit name)'), description: bi('رحلات باصات داخلية ودولية.', 'Domestic and international bus trips.') },
  { key: 'air', type: 'airline', name: bi('شركة الطيران الشريكة (عدّل الاسم)', 'Partner airline (edit name)'), description: bi('رحلات من مطار الريان.', 'Flights from Riyan airport.') },
  { key: 'umrah', type: 'agent', name: bi('وكيل العمرة المعتمد (عدّل الاسم)', 'Approved Umrah agent (edit name)'), description: bi('باقات عمرة متكاملة.', 'Complete Umrah packages.') },
]

const at = (days: number, hour: number, min = 0) => {
  const d = new Date(Date.now() + days * 86400_000)
  d.setUTCHours(hour - 3, min, 0, 0) // Asia/Aden = UTC+3
  return d.toISOString()
}

export const trips = () => [
  {
    slug: 'mukalla-seiyun-bus',
    type: 'bus',
    company: 'land',
    service: 'land-transport',
    title: bi('باص المكلا ← سيئون', 'Mukalla → Seiyun bus'),
    from: bi('المكلا', 'Mukalla'),
    to: bi('سيئون', 'Seiyun'),
    departureAt: at(2, 6, 30),
    duration: bi('نحو 5 ساعات', 'About 5 hours'),
    meetingPoint: bi('محطة النقل البري – المكلا', 'Land transport station – Mukalla'),
    seatsTotal: 40,
    seatsHeldOffline: 34,
    maxSeatsPerBooking: 6,
    features: [{ item: bi('مقاعد مكيفة', 'Air-conditioned seats') }, { item: bi('حقيبة واحدة لكل راكب', 'One bag per passenger') }],
  },
  {
    slug: 'mukalla-aden-bus',
    type: 'bus',
    company: 'land',
    service: 'land-transport',
    title: bi('باص المكلا ← عدن', 'Mukalla → Aden bus'),
    from: bi('المكلا', 'Mukalla'),
    to: bi('عدن', 'Aden'),
    departureAt: at(4, 7),
    duration: bi('نحو 10 ساعات', 'About 10 hours'),
    meetingPoint: bi('محطة النقل البري – المكلا', 'Land transport station – Mukalla'),
    seatsTotal: 45,
    seatsHeldOffline: 12,
    features: [{ item: bi('مقاعد مكيفة', 'Air-conditioned seats') }, { item: bi('توقف للاستراحة', 'Rest stops') }],
  },
  {
    slug: 'mukalla-jeddah-bus',
    type: 'bus',
    company: 'land',
    service: 'land-transport',
    featured: true,
    title: bi('رحلة برية المكلا ← جدة', 'Overland trip Mukalla → Jeddah'),
    from: bi('المكلا', 'Mukalla'),
    to: bi('جدة', 'Jeddah'),
    departureAt: at(9, 5),
    duration: bi('نحو يومين', 'About two days'),
    meetingPoint: bi('مكتب Easy Visa – المكلا', 'Easy Visa office – Mukalla'),
    seatsTotal: 50,
    seatsHeldOffline: 18,
    details: bi('يلزم وجود تأشيرة سارية للمملكة العربية السعودية قبل موعد الرحلة.', 'A valid Saudi visa is required before the departure date.'),
    features: [{ item: bi('باص حديث مكيف', 'Modern air-conditioned coach') }, { item: bi('حقيبتان لكل راكب', 'Two bags per passenger') }],
  },
  {
    slug: 'umrah-package-10-days',
    type: 'umrah',
    company: 'umrah',
    service: 'umrah-visa',
    featured: true,
    title: bi('باقة عمرة 10 أيام', '10-day Umrah package'),
    from: bi('المكلا', 'Mukalla'),
    to: bi('مكة المكرمة والمدينة المنورة', 'Makkah & Madinah'),
    departureAt: at(20, 6),
    returnAt: at(30, 18),
    duration: bi('10 أيام', '10 days'),
    meetingPoint: bi('مكتب Easy Visa – المكلا', 'Easy Visa office – Mukalla'),
    seatsTotal: 30,
    seatsHeldOffline: 8,
    maxSeatsPerBooking: 8,
    details: bi('السعر النهائي يعتمد على نوع الغرفة ورسوم التأشيرة وقت الحجز.', 'The final price depends on the room type and visa fees at booking time.'),
    features: [
      { item: bi('متابعة إجراءات التأشيرة', 'Visa paperwork follow-up') },
      { item: bi('النقل ذهاباً وعودة', 'Return transport') },
      { item: bi('سكن في مكة والمدينة', 'Accommodation in Makkah and Madinah') },
      { item: bi('مرشد مرافق للمجموعة', 'Group guide') },
    ],
  },
  {
    slug: 'mukalla-salalah-bus',
    type: 'bus',
    company: 'land',
    service: 'land-transport',
    title: bi('باص المكلا ← صلالة', 'Mukalla → Salalah bus'),
    from: bi('المكلا', 'Mukalla'),
    to: bi('صلالة، عُمان', 'Salalah, Oman'),
    departureAt: at(12, 6),
    duration: bi('نحو 18 ساعة', 'About 18 hours'),
    seatsTotal: 45,
    seatsHeldOffline: 45,
    features: [{ item: bi('مقاعد مكيفة', 'Air-conditioned seats') }],
  },
  {
    slug: 'riyan-cairo-flight',
    type: 'flight',
    company: 'air',
    service: 'flight-booking',
    title: bi('رحلة طيران الريان ← القاهرة', 'Flight Riyan → Cairo'),
    from: bi('المكلا (الريان)', 'Mukalla (Riyan)'),
    to: bi('القاهرة', 'Cairo'),
    departureAt: at(15, 10, 30),
    duration: bi('نحو 4 ساعات', 'About 4 hours'),
    meetingPoint: bi('مطار الريان الدولي', 'Riyan International Airport'),
    seatsTotal: 20,
    seatsHeldOffline: 5,
    maxSeatsPerBooking: 6,
    features: [{ item: bi('حقيبة 23 كجم', '23 kg baggage') }],
  },
]

export const demoMessages = [
  { name: 'ياسر باعباد', phone: '+967771112233', subject: 'trip', message: 'هل يوجد باص إلى جدة بداية الشهر القادم؟ ونحتاج 4 مقاعد.', status: 'new' },
  { name: 'Sara Ahmed', phone: '+966551112233', subject: 'visa', message: 'What documents are needed for a family visit visa for my mother?', status: 'replied', locale: 'en' },
]

export const homepage = {
  hero: {
    title: bi('رحلتك تبدأ من هنا.', 'Your journey starts here.'),
    subtitle: bi(
      'خدمات التأشيرات والسفر والحجوزات بطريقة سهلة وواضحة. أرسل طلبك من جوالك، واحصل على رقم مرجع لمتابعته.',
      'Visa, travel and booking services, made simple and clear. Send your request from your phone and get a reference number to follow it.',
    ),
  },
  pillars: [
    { icon: 'passport', title: bi('تأشيرات', 'Visas'), text: bi('عمرة، زيارة، عُمان ودول أخرى', 'Umrah, visits, Oman and more') },
    { icon: 'chat', title: bi('استشارات', 'Advice'), text: bi('نوضح لك المتطلبات قبل أن تبدأ', 'We explain requirements before you start') },
    { icon: 'ticket', title: bi('حجوزات', 'Bookings'), text: bi('طيران، فنادق، نقل بري', 'Flights, hotels, land transport') },
    { icon: 'checklist', title: bi('متابعة', 'Follow-up'), text: bi('رقم مرجع وتتبع لحالة طلبك', 'A reference and status tracking') },
  ],
  steps: [
    { title: bi('اختر الخدمة', 'Choose a service'), text: bi('تصفح الخدمات واقرأ المتطلبات الأساسية.', 'Browse the services and read the basic requirements.') },
    { title: bi('أرسل طلبك', 'Send your request'), text: bi('املأ نموذجاً قصيراً وارفع المستندات إن لزم.', 'Fill in a short form and upload documents if needed.') },
    { title: bi('نراجع ونتواصل معك', 'We review and contact you'), text: bi('نؤكد التفاصيل والسعر معك على واتساب أو بالاتصال.', 'We confirm the details and price with you on WhatsApp or by phone.') },
    { title: bi('تابع طلبك', 'Track your request'), text: bi('اعرف حالة طلبك في أي وقت برقم المرجع.', 'Check your request status any time with your reference.') },
  ],
  promises: [
    { title: bi('وضوح قبل الالتزام', 'Clarity before you commit'), text: bi('نؤكد معك المتطلبات والتكلفة قبل البدء بأي إجراء.', 'We confirm the requirements and cost with you before starting anything.') },
    { title: bi('كل طلب له رقم ومتابعة', 'Every request is tracked'), text: bi('تحصل على رقم مرجع، وترى مراحل طلبك من صفحة التتبع.', 'You get a reference number and can see each stage on the tracking page.') },
    { title: bi('تواصل مباشر', 'Direct contact'), text: bi('تتواصل مع فريقنا على واتساب أو بالهاتف دون تعقيد.', 'Reach our team on WhatsApp or by phone, without the hassle.') },
    { title: bi('خصوصية مستنداتك', 'Your documents stay private'), text: bi('تُحفظ مستنداتك بشكل خاص، ولا يطّلع عليها إلا الموظفون المخولون.', 'Your documents are stored privately and only authorised staff can see them.') },
  ],
  aboutTeaser: bi(
    'Easy Visa مكتب لخدمات السفر والتأشيرات في المكلا. نساعد المسافرين من حضرموت وكل اليمن على تقديم طلبات التأشيرات والحجوزات ومتابعتها بطريقة منظمة وواضحة.',
    'Easy Visa is a travel and visa services office in Mukalla. We help travellers from Hadhramaut and across Yemen submit and follow up visa and booking requests in an organised, clear way.',
  ),
}

export const about = {
  title: bi('عن Easy Visa', 'About Easy Visa'),
  intro: bi('راحة . أمان — مكتب خدمات سفر وتأشيرات في المكلا، حضرموت.', 'Comfort. Security. A travel and visa services office in Mukalla, Hadhramaut.'),
  sections: [
    {
      heading: bi('من نحن', 'Who we are'),
      body: bi(
        'Easy Visa مكتب ناشئ لخدمات السفر والتأشيرات، يعمل مع الوكلاء ومقدمي الخدمات المعتمدين حيثما يلزم، ليقدّم لعملائه طريقة أبسط لطلب التأشيرات والحجوزات ومتابعتها.',
        'Easy Visa is a new travel and visa services office. We work with agents and approved providers where needed, to give our customers a simpler way to request and follow up visas and bookings.',
      ),
    },
    {
      heading: bi('طريقتنا في العمل', 'How we work'),
      body: bi(
        'نستقبل طلبك عبر الموقع أو واتساب، نراجع البيانات، ونوضح لك المطلوب والتكلفة قبل البدء. نسجّل كل طلب برقم مرجع حتى تعرف أين وصل في أي وقت. لا نعدك بما لا نملكه: قرارات التأشيرات للجهات الرسمية، ونلتزم معك بالوضوح والمتابعة.',
        'We receive your request on the website or WhatsApp, review the details, and explain what is needed and the cost before we begin. Every request gets a reference number so you always know where it stands. We do not promise what is not ours to give: visa decisions belong to the authorities, and we commit to being clear and following up.',
      ),
    },
    {
      heading: bi('موقعنا', 'Where we are'),
      body: bi('المكلا، محافظة حضرموت، الجمهورية اليمنية.', 'Mukalla, Hadhramaut Governorate, Republic of Yemen.'),
    },
  ],
}

export const legal = {
  privacy: richBi(
    [
      { p: 'توضح هذه السياسة كيف تجمع Easy Visa بياناتك وتستخدمها وتحميها عند استخدامك لموقعنا.' },
      { h: 'البيانات التي نجمعها' },
      { ul: ['الاسم ورقم الهاتف ورقم الواتساب.', 'تفاصيل الطلب التي تدخلها في النموذج (مثل الجنسية وتواريخ السفر وعدد المسافرين).', 'المستندات التي ترفعها عند الحاجة، مثل صورة الجواز.'] },
      { h: 'لماذا نجمعها' },
      { p: 'نستخدم بياناتك فقط لمراجعة طلبك والتواصل معك بشأنه وتنفيذ الخدمة التي طلبتها.' },
      { h: 'كيف نتعامل مع المستندات' },
      { p: 'تُحفظ المستندات في مساحة خاصة غير متاحة للعامة، ولا يطّلع عليها إلا موظفو Easy Visa المخولون. لا نرسل مستنداتك عبر واتساب تلقائياً.' },
      { h: 'مشاركة البيانات' },
      { p: 'قد نشارك البيانات اللازمة فقط مع الجهات الرسمية أو الوكلاء أو مقدمي الخدمة (مثل شركات الطيران والفنادق) بالقدر المطلوب لتنفيذ طلبك. لا نبيع بياناتك.' },
      { h: 'مدة الاحتفاظ' },
      { p: 'نحتفظ ببيانات الطلب ومستنداته للمدة اللازمة لتنفيذ الخدمة والمتابعة، ثم نحذف المستندات وفق سياسة الاحتفاظ المعتمدة لدى المكتب.' },
      { h: 'حقوقك والتواصل' },
      { p: 'يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها بالتواصل معنا عبر أرقام التواصل المنشورة في الموقع.' },
    ],
    [
      { p: 'This policy explains how Easy Visa collects, uses and protects your data when you use our website.' },
      { h: 'What we collect' },
      { ul: ['Your name, phone number and WhatsApp number.', 'The request details you enter in the form (such as nationality, travel dates and number of travellers).', 'Documents you upload when needed, such as a passport photo.'] },
      { h: 'Why we collect it' },
      { p: 'We use your data only to review your request, contact you about it and deliver the service you asked for.' },
      { h: 'How documents are handled' },
      { p: 'Documents are stored in a private space that is not publicly accessible. Only authorised Easy Visa staff can see them. We never send your documents over WhatsApp automatically.' },
      { h: 'Sharing' },
      { p: 'We may share only the necessary data with official authorities, agents or providers (such as airlines and hotels) to the extent required to complete your request. We do not sell your data.' },
      { h: 'How long we keep it' },
      { p: 'We keep request data and documents for as long as needed to deliver and follow up the service, then delete documents according to the office’s retention policy.' },
      { h: 'Your rights and contact' },
      { p: 'You can ask to see, correct or delete your data by contacting us on the numbers published on this website.' },
    ],
  ),
  terms: richBi(
    [
      { p: 'باستخدامك موقع Easy Visa فإنك توافق على الشروط التالية.' },
      { h: 'طبيعة الخدمة' },
      { p: 'الطلب المرسل عبر الموقع هو طلب خدمة أو استفسار، وليس حجزاً مؤكداً أو تأشيرة صادرة. تُؤكَّد التفاصيل والأسعار مع العميل قبل أي التزام.' },
      { h: 'قرارات التأشيرات والحجوزات' },
      { p: 'قرارات التأشيرات تعود للجهات الرسمية المختصة، وتوفر الرحلات والفنادق يعود لمقدمي الخدمة. لا تضمن Easy Visa قبول أي طلب.' },
      { h: 'الأسعار' },
      { p: 'الأسعار المعروضة تقديرية ما لم يُذكر خلاف ذلك، وقد تتغير حسب التوفر وقت التأكيد.' },
      { h: 'دقة البيانات' },
      { p: 'يتحمل العميل مسؤولية صحة البيانات والمستندات المقدمة.' },
    ],
    [
      { p: 'By using the Easy Visa website you agree to the following terms.' },
      { h: 'Nature of the service' },
      { p: 'A request sent through the website is a service request or enquiry, not a confirmed booking or an issued visa. Details and prices are confirmed with the customer before anything is final.' },
      { h: 'Visa and booking decisions' },
      { p: 'Visa decisions belong to the competent official authorities, and flight and hotel availability belongs to the providers. Easy Visa does not guarantee that any request will be approved.' },
      { h: 'Prices' },
      { p: 'Displayed prices are indicative unless stated otherwise and may change with availability at the time of confirmation.' },
      { h: 'Accuracy of information' },
      { p: 'Customers are responsible for the accuracy of the details and documents they provide.' },
    ],
  ),
}

export const faqs = [
  { topic: 'requests', question: bi('هل إرسال الطلب يعني أن الحجز أو التأشيرة مؤكدة؟', 'Does sending a request mean my booking or visa is confirmed?'), answer: bi('لا. الطلب يصلنا لنراجعه، ثم نتواصل معك لتأكيد التفاصيل والسعر قبل أي التزام.', 'No. The request reaches us for review, then we contact you to confirm the details and price before anything is final.') },
  { topic: 'requests', question: bi('كيف أتابع حالة طلبي؟', 'How do I follow my request?'), answer: bi('من صفحة «تتبع طلبك» باستخدام رقم المرجع وآخر 4 أرقام من هاتفك، أو راسلنا على واتساب.', 'Use the “Track request” page with your reference and the last 4 digits of your phone, or message us on WhatsApp.') },
  { topic: 'requests', question: bi('أضعت رقم المرجع، ماذا أفعل؟', 'I lost my reference number. What now?'), answer: bi('راسلنا على واتساب باسمك ورقم الهاتف الذي استخدمته، وسنرسله لك.', 'Message us on WhatsApp with your name and the phone number you used, and we will send it to you.') },
  { topic: 'documents', question: bi('هل مستنداتي آمنة؟', 'Are my documents safe?'), answer: bi('تُحفظ في مساحة خاصة لا يصل إليها إلا موظفونا المخولون، ولا تظهر في صفحة التتبع.', 'They are stored in a private space only our authorised staff can access, and they never appear on the tracking page.') },
  { topic: 'documents', question: bi('هل يجب أن أرفع الجواز عند الطلب؟', 'Do I have to upload my passport when I request?'), answer: bi('في أغلب الخدمات هو اختياري في البداية. سنطلب ما يلزم فقط عند مراجعة طلبك.', 'For most services it is optional at first. We only ask for what is needed when we review your request.') },
  { topic: 'prices', question: bi('لماذا لا تظهر الأسعار لكل الخدمات؟', 'Why are prices not shown for every service?'), answer: bi('لأن أسعار التأشيرات والحجوزات تتغير حسب الوجهة والتاريخ والتوفر، لذلك نرسل لك السعر المحدّث عند مراجعة طلبك.', 'Visa and booking prices change with destination, dates and availability, so we send you the current price when we review your request.') },
]

const day = 24 * 3600_000
export const offers = (now = Date.now()) => [
  {
    slug: 'umrah-season-requests',
    title: bi('موسم العمرة: استقبال الطلبات مفتوح', 'Umrah season: requests are open'),
    summary: bi('قدّم طلب تأشيرة العمرة مبكراً، ونرتب لك مع الطلب حجز الفندق والطيران حسب رغبتك.', 'Send your Umrah visa request early and we can arrange your hotel and flights with it if you wish.'),
    includes: [{ item: bi('مراجعة الطلب والمستندات', 'Review of your request and documents') }, { item: bi('خيارات فنادق في مكة والمدينة', 'Hotel options in Makkah and Madinah') }, { item: bi('خيارات رحلات طيران', 'Flight options') }],
    terms: bi('الأسعار والتوفر يُؤكَّدان عند مراجعة الطلب.', 'Prices and availability are confirmed when we review your request.'),
    service: 'umrah-visa',
    startDate: new Date(now - 10 * day).toISOString(),
    endDate: new Date(now + 45 * day).toISOString(),
    featured: true,
  },
  {
    slug: 'family-travel-bookings',
    title: bi('رحلات العائلة: طيران وفندق في طلب واحد', 'Family trips: flights and hotel in one request'),
    summary: bi('أرسل تفاصيل رحلة عائلتك مرة واحدة، ونرسل لك خيارات الطيران والفنادق معاً.', 'Send your family trip details once and we send you flight and hotel options together.'),
    includes: [{ item: bi('خيارات طيران', 'Flight options') }, { item: bi('خيارات فنادق', 'Hotel options') }],
    terms: bi('العرض لا يشمل رسوم التأشيرات.', 'Visa fees are not included.'),
    service: 'flight-booking',
    startDate: new Date(now - 3 * day).toISOString(),
    endDate: new Date(now + 30 * day).toISOString(),
    featured: true,
  },
  {
    slug: 'early-booking-ramadan',
    title: bi('الحجز المبكر لرحلات رمضان', 'Early booking for Ramadan trips'),
    summary: bi('انتهى هذا العرض. تابعنا لمعرفة العروض القادمة.', 'This offer has ended. Follow us for upcoming offers.'),
    includes: [],
    service: 'hotel-booking',
    startDate: new Date(now - 90 * day).toISOString(),
    endDate: new Date(now - 20 * day).toISOString(),
    featured: false,
  },
]

export const lexicalEmpty = rich([{ p: '' }])
