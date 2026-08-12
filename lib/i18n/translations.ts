export type Locale = "en" | "hi" | "mai"

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mai", label: "Maithili", native: "मैथिली" },
]

export const DEFAULT_LOCALE: Locale = "en"

/**
 * Translation dictionary.
 *
 * To add or extend a language:
 * 1. Add its code to the `Locale` union and the `LOCALES` array above.
 * 2. Provide a matching object below with the same keys as `en`.
 * Missing keys automatically fall back to English (see `t()` in the provider).
 */
export const translations = {
  en: {
    "brand.name": "OurMithla",
    "brand.tagline": "Culture, Almanac & Community of Mithila",

    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.panchang": "Panchang",
    "nav.horoscope": "Horoscope",
    "nav.kundli": "Kundli",
    "nav.contact": "Contact",
    "nav.submit": "Write",
    "nav.language": "Language",

    "home.hero.eyebrow": "Welcome to OurMithla",
    "home.hero.title": "Celebrating the living heritage of Mithila",
    "home.hero.subtitle":
      "Stories, traditions, festivals, and the daily Hindu Panchang — all in your language.",
    "home.hero.cta.blog": "Read the Blog",
    "home.hero.cta.panchang": "Today's Panchang",

    "home.features.title": "Explore OurMithla",
    "home.features.blog.title": "Cultural Blog",
    "home.features.blog.desc":
      "Articles on Madhubani art, festivals, cuisine, and folklore of the Mithila region.",
    "home.features.panchang.title": "Daily Panchang",
    "home.features.panchang.desc":
      "Tithi, Nakshatra, Yoga, Karana, and auspicious timings — updated every day.",
    "home.features.community.title": "Community",
    "home.features.community.desc":
      "Connect with us, share your stories, and stay updated on cultural events.",

    "home.featured.title": "Featured Articles",
    "home.featured.viewAll": "View all articles",
    "home.latest.title": "Latest Articles",

    "home.panchang.title": "Today at a Glance",
    "home.panchang.desc":
      "A quick look at today's Panchang. Open the full almanac for detailed muhurats.",
    "home.panchang.open": "Open full Panchang",

    "blog.title": "The OurMithla Blog",
    "blog.subtitle": "Stories and knowledge from the heart of Mithila.",
    "blog.categories.all": "All",
    "blog.featured": "Featured",
    "blog.readMore": "Read more",
    "blog.minRead": "min read",
    "blog.empty": "No articles found in this category.",
    "blog.prev": "Previous",
    "blog.next": "Next",
    "blog.page": "Page",
    "blog.of": "of",
    "blog.backToBlog": "Back to blog",
    "blog.relatedTitle": "More articles",
    "blog.notFound": "Article not found",
    "blog.notFoundDesc": "The article you are looking for does not exist or has moved.",

    "contact.title": "Contact Us",
    "contact.subtitle":
      "Have a question, a story to share, or a partnership idea? We'd love to hear from you.",
    "contact.form.name": "Full Name",
    "contact.form.email": "Email Address",
    "contact.form.phone": "Phone Number",
    "contact.form.message": "Message",
    "contact.form.namePlaceholder": "Your name",
    "contact.form.emailPlaceholder": "you@example.com",
    "contact.form.phonePlaceholder": "+91 00000 00000",
    "contact.form.messagePlaceholder": "How can we help you?",
    "contact.form.submit": "Send Message",
    "contact.form.submitting": "Sending...",
    "contact.form.success":
      "Thank you! Your message has been received. Check your inbox for a welcome note.",
    "contact.form.error": "Something went wrong. Please try again.",
    "contact.form.captchaRequired": "Please complete the captcha.",
    "contact.form.required": "This field is required.",
    "contact.form.invalidEmail": "Please enter a valid email address.",
    "contact.info.title": "Get in touch",
    "contact.info.desc": "Reach out through the form or the details below.",
    "contact.info.emailLabel": "Email",
    "contact.info.locationLabel": "Region",
    "contact.info.location": "Mithila (Bihar, India & Madhesh, Nepal)",

    "ad.label": "Advertisement",

    "submit.notice":
      "Your article will be sent to the admin for review. It will appear on the blog only after approval.",
    "submit.successTitle": "Submitted for review",
    "submit.successDesc":
      "Thank you! An admin will review your article and publish it if it fits OurMithla.",
    "submit.another": "Submit another article",
    "submit.form.title": "Title",
    "submit.form.titlePlaceholder": "e.g. Memories of Chhath in my village",
    "submit.form.category": "Category",
    "submit.form.author": "Your name",
    "submit.form.authorPlaceholder": "Display name as author",
    "submit.form.email": "Email",
    "submit.form.emailPlaceholder": "you@example.com",
    "submit.form.cover": "Cover image",
    "submit.form.coverHint": "Optional — upload or paste a URL",
    "submit.form.upload": "Upload",
    "submit.form.excerpt": "Short summary",
    "submit.form.excerptPlaceholder": "A short teaser for the blog card…",
    "submit.form.content": "Article content",
    "submit.form.contentPlaceholder": "Write your article here. Separate paragraphs with a blank line.",
    "submit.form.submit": "Submit for approval",
    "submit.form.submitting": "Submitting…",

    "horoscope.eyebrow": "Daily guidance",
    "horoscope.chooseRashi": "Choose your rashi",
    "horoscope.chooseHint": "Pick your birth moon sign. Readings match today's Panchang.",
    "horoscope.location": "Location",
    "horoscope.loading": "Preparing today's reading…",
    "horoscope.moonToday": "Moon today",
    "horoscope.luckyColor": "Lucky colour",
    "horoscope.luckyNumber": "Lucky number",
    "horoscope.luckyTime": "Favourable time",
    "horoscope.lifeTitle": "Life areas to build",
    "horoscope.lifeHint": "Love, work, health, wealth, and spirit — for a balanced day.",
    "horoscope.tipTitle": "Today's tip",
    "horoscope.disclaimer":
      "Guidance is for reflection and cultural inspiration, aligned with sidereal Panchang. For important decisions, consult a trusted jyotishi.",

    "kundli.eyebrow": "Janam Kundli",
    "kundli.formTitle": "Enter birth details",
    "kundli.formHint": "Accurate time and place help Lagna and house placements stay closer to Vedic tradition.",
    "kundli.name": "Name",
    "kundli.namePlaceholder": "Your name (optional)",
    "kundli.place": "Birth place",
    "kundli.date": "Birth date",
    "kundli.time": "Birth time",
    "kundli.generate": "Generate birth chart",
    "kundli.generating": "Calculating…",
    "kundli.resultEyebrow": "Your chart",
    "kundli.lagna": "Lagna (Ascendant)",
    "kundli.moon": "Moon sign",
    "kundli.sun": "Sun sign",
    "kundli.nakshatra": "Birth nakshatra",
    "kundli.planetsTitle": "Planetary positions",
    "kundli.planetsHint": "Sidereal longitudes with whole-sign houses from Lagna.",
    "kundli.housesTitle": "Twelve houses",
    "kundli.lifeTitle": "Life predictions",
    "kundli.lifeHint": "Personality, career, wealth, relationships, health, family, spirit, and timing themes.",
    "kundli.remediesTitle": "Supportive practices",

    "footer.about.title": "About OurMithla",
    "footer.about.desc":
      "A cultural home for the people of Mithila — preserving heritage and serving the community.",
    "footer.links.title": "Quick Links",
    "footer.follow.title": "Stay Connected",
    "footer.rights": "All rights reserved.",

    "panchang.pageTitle": "Daily Panchang & Maithili Patra",
  },

  hi: {
    "brand.name": "अवरमिथिला",
    "brand.tagline": "मिथिला की संस्कृति, पंचांग और समुदाय",

    "nav.home": "होम",
    "nav.blog": "ब्लॉग",
    "nav.panchang": "पंचांग",
    "nav.horoscope": "राशिफल",
    "nav.kundli": "कुंडली",
    "nav.contact": "संपर्क",
    "nav.submit": "लिखें",
    "nav.language": "भाषा",

    "home.hero.eyebrow": "अवरमिथिला में आपका स्वागत है",
    "home.hero.title": "मिथिला की जीवंत विरासत का उत्सव",
    "home.hero.subtitle":
      "कहानियाँ, परंपराएँ, त्योहार और दैनिक हिन्दू पंचांग — सब आपकी भाषा में।",
    "home.hero.cta.blog": "ब्लॉग पढ़ें",
    "home.hero.cta.panchang": "आज का पंचांग",

    "home.features.title": "अवरमिथिला को जानें",
    "home.features.blog.title": "सांस्कृतिक ब्लॉग",
    "home.features.blog.desc":
      "मधुबनी कला, त्योहारों, व्यंजनों और मिथिला की लोककथाओं पर लेख।",
    "home.features.panchang.title": "दैनिक पंचांग",
    "home.features.panchang.desc":
      "तिथि, नक्षत्र, योग, करण और शुभ मुहूर्त — प्रतिदिन अद्यतन।",
    "home.features.community.title": "समुदाय",
    "home.features.community.desc":
      "हमसे जुड़ें, अपनी कहानियाँ साझा करें और सांस्कृतिक कार्यक्रमों की जानकारी पाएँ।",

    "home.featured.title": "विशेष लेख",
    "home.featured.viewAll": "सभी लेख देखें",
    "home.latest.title": "नवीनतम लेख",

    "home.panchang.title": "आज एक नज़र में",
    "home.panchang.desc":
      "आज के पंचांग की झलक। विस्तृत मुहूर्त के लिए पूरा पंचांग खोलें।",
    "home.panchang.open": "पूरा पंचांग खोलें",

    "blog.title": "अवरमिथिला ब्लॉग",
    "blog.subtitle": "मिथिला के हृदय से कहानियाँ और ज्ञान।",
    "blog.categories.all": "सभी",
    "blog.featured": "विशेष",
    "blog.readMore": "और पढ़ें",
    "blog.minRead": "मिनट पढ़ें",
    "blog.empty": "इस श्रेणी में कोई लेख नहीं मिला।",
    "blog.prev": "पिछला",
    "blog.next": "अगला",
    "blog.page": "पृष्ठ",
    "blog.of": "में से",
    "blog.backToBlog": "ब्लॉग पर लौटें",
    "blog.relatedTitle": "और लेख",
    "blog.notFound": "लेख नहीं मिला",
    "blog.notFoundDesc": "आप जिस लेख को खोज रहे हैं वह मौजूद नहीं है या स्थानांतरित हो गया है।",

    "contact.title": "संपर्क करें",
    "contact.subtitle":
      "कोई प्रश्न, साझा करने के लिए कहानी, या साझेदारी का विचार है? हमें आपसे सुनना अच्छा लगेगा।",
    "contact.form.name": "पूरा नाम",
    "contact.form.email": "ईमेल पता",
    "contact.form.phone": "फ़ोन नंबर",
    "contact.form.message": "संदेश",
    "contact.form.namePlaceholder": "आपका नाम",
    "contact.form.emailPlaceholder": "you@example.com",
    "contact.form.phonePlaceholder": "+91 00000 00000",
    "contact.form.messagePlaceholder": "हम आपकी कैसे मदद कर सकते हैं?",
    "contact.form.submit": "संदेश भेजें",
    "contact.form.submitting": "भेजा जा रहा है...",
    "contact.form.success":
      "धन्यवाद! आपका संदेश प्राप्त हो गया है। स्वागत संदेश के लिए अपना इनबॉक्स देखें।",
    "contact.form.error": "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
    "contact.form.captchaRequired": "कृपया कैप्चा पूरा करें।",
    "contact.form.required": "यह फ़ील्ड आवश्यक है।",
    "contact.form.invalidEmail": "कृपया एक मान्य ईमेल पता दर्ज करें।",
    "contact.info.title": "संपर्क में रहें",
    "contact.info.desc": "फ़ॉर्म या नीचे दिए गए विवरण के माध्यम से संपर्क करें।",
    "contact.info.emailLabel": "ईमेल",
    "contact.info.locationLabel": "क्षेत्र",
    "contact.info.location": "मिथिला (बिहार, भारत और मधेश, नेपाल)",

    "ad.label": "विज्ञापन",

    "submit.notice":
      "आपका लेख समीक्षा के लिए एडमिन को भेजा जाएगा। स्वीकृति के बाद ही यह ब्लॉग पर दिखेगा।",
    "submit.successTitle": "समीक्षा के लिए जमा",
    "submit.successDesc":
      "धन्यवाद! एडमिन आपके लेख की समीक्षा करेगा और उपयुक्त होने पर प्रकाशित करेगा।",
    "submit.another": "एक और लेख जमा करें",
    "submit.form.title": "शीर्षक",
    "submit.form.titlePlaceholder": "उदा. मेरे गाँव में छठ की यादें",
    "submit.form.category": "श्रेणी",
    "submit.form.author": "आपका नाम",
    "submit.form.authorPlaceholder": "लेखक के रूप में दिखने वाला नाम",
    "submit.form.email": "ईमेल",
    "submit.form.emailPlaceholder": "you@example.com",
    "submit.form.cover": "कवर छवि",
    "submit.form.coverHint": "वैकल्पिक — अपलोड करें या URL डालें",
    "submit.form.upload": "अपलोड",
    "submit.form.excerpt": "संक्षिप्त सार",
    "submit.form.excerptPlaceholder": "ब्लॉग कार्ड के लिए छोटा परिचय…",
    "submit.form.content": "लेख सामग्री",
    "submit.form.contentPlaceholder": "यहाँ अपना लेख लिखें। पैराग्राफ खाली पंक्ति से अलग करें।",
    "submit.form.submit": "अनुमोदन के लिए जमा करें",
    "submit.form.submitting": "जमा हो रहा है…",

    "horoscope.eyebrow": "दैनिक मार्गदर्शन",
    "horoscope.chooseRashi": "अपनी राशि चुनें",
    "horoscope.chooseHint": "अपनी जन्म चंद्र राशि चुनें। पाठ आज के पंचांग से मेल खाता है।",
    "horoscope.location": "स्थान",
    "horoscope.loading": "आज का राशिफल तैयार हो रहा है…",
    "horoscope.moonToday": "आज चंद्र",
    "horoscope.luckyColor": "शुभ रंग",
    "horoscope.luckyNumber": "शुभ अंक",
    "horoscope.luckyTime": "शुभ समय",
    "horoscope.lifeTitle": "जीवन के क्षेत्र",
    "horoscope.lifeHint": "प्रेम, कर्म, स्वास्थ्य, धन और आत्मा — संतुलित दिन के लिए।",
    "horoscope.tipTitle": "आज की सलाह",
    "horoscope.disclaimer":
      "यह मार्गदर्शन चिंतन और सांस्कृतिक प्रेरणा के लिए है, वैदिक पंचांग से जुड़ा। महत्वपूर्ण निर्णयों हेतु विश्वसनीय ज्योतिषी से परामर्श लें।",

    "kundli.eyebrow": "जन्म कुंडली",
    "kundli.formTitle": "जन्म विवरण दर्ज करें",
    "kundli.formHint": "सटीक समय और स्थान लग्न व भावों को वैदिक परंपरा के निकट रखते हैं।",
    "kundli.name": "नाम",
    "kundli.namePlaceholder": "आपका नाम (वैकल्पिक)",
    "kundli.place": "जन्म स्थान",
    "kundli.date": "जन्म तिथि",
    "kundli.time": "जन्म समय",
    "kundli.generate": "कुंडली बनाएँ",
    "kundli.generating": "गणना हो रही है…",
    "kundli.resultEyebrow": "आपकी कुंडली",
    "kundli.lagna": "लग्न",
    "kundli.moon": "चंद्र राशि",
    "kundli.sun": "सूर्य राशि",
    "kundli.nakshatra": "जन्म नक्षत्र",
    "kundli.planetsTitle": "ग्रह स्थिति",
    "kundli.planetsHint": "लग्न से पूर्ण-राशि भावों सहित सायन/निरायन स्थितियाँ।",
    "kundli.housesTitle": "बारह भाव",
    "kundli.lifeTitle": "जीवन भविष्यवाणी",
    "kundli.lifeHint": "स्वभाव, कर्म, धन, संबंध, स्वास्थ्य, परिवार, आत्मा और समय।",
    "kundli.remediesTitle": "सहायक उपाय",

    "footer.about.title": "अवरमिथिला के बारे में",
    "footer.about.desc":
      "मिथिला के लोगों का सांस्कृतिक घर — विरासत का संरक्षण और समुदाय की सेवा।",
    "footer.links.title": "त्वरित लिंक",
    "footer.follow.title": "जुड़े रहें",
    "footer.rights": "सर्वाधिकार सुरक्षित।",

    "panchang.pageTitle": "दैनिक पंचांग व मैथिली पात्र",
  },

  mai: {
    "brand.name": "अपन मिथिला",
    "brand.tagline": "मिथिलाक संस्कृति, पंचांग आ समुदाय",

    "nav.home": "मुख्य पृष्ठ",
    "nav.blog": "ब्लॉग",
    "nav.panchang": "पंचांग",
    "nav.horoscope": "राशिफल",
    "nav.kundli": "कुंडली",
    "nav.contact": "संपर्क",
    "nav.submit": "लिखू",
    "nav.language": "भाषा",

    "home.hero.eyebrow": "अपन मिथिला मे अहाँक स्वागत अछि",
    "home.hero.title": "मिथिलाक जीवंत धरोहरक उत्सव",
    "home.hero.subtitle":
      "कथा, परंपरा, पाबनि आ दैनिक हिन्दू पंचांग — सभ अहाँक भाषा मे।",
    "home.hero.cta.blog": "ब्लॉग पढ़ू",
    "home.hero.cta.panchang": "आइक पंचांग",

    "home.features.title": "अपन मिथिला केँ जानू",
    "home.features.blog.title": "सांस्कृतिक ब्लॉग",
    "home.features.blog.desc":
      "मधुबनी कला, पाबनि, व्यंजन आ मिथिलाक लोककथा पर आलेख।",
    "home.features.panchang.title": "दैनिक पंचांग",
    "home.features.panchang.desc":
      "तिथि, नक्षत्र, योग, करण आ शुभ मुहूर्त — रोज अद्यतन।",
    "home.features.community.title": "समुदाय",
    "home.features.community.desc":
      "हमरा सभ सँ जुड़ू, अपन कथा साझा करू आ सांस्कृतिक आयोजनक जानकारी पाबू।",

    "home.featured.title": "विशेष आलेख",
    "home.featured.viewAll": "सभ आलेख देखू",
    "home.latest.title": "नवीनतम आलेख",

    "home.panchang.title": "आइ एक नजरि मे",
    "home.panchang.desc":
      "आइक पंचांगक झलक। विस्तृत मुहूर्त लेल पूरा पंचांग खोलू।",
    "home.panchang.open": "पूरा पंचांग खोलू",

    "blog.title": "अपन मिथिला ब्लॉग",
    "blog.subtitle": "मिथिलाक हृदय सँ कथा आ ज्ञान।",
    "blog.categories.all": "सभ",
    "blog.featured": "विशेष",
    "blog.readMore": "आओर पढ़ू",
    "blog.minRead": "मिनट पढ़ब",
    "blog.empty": "एहि श्रेणी मे कोनो आलेख नहि भेटल।",
    "blog.prev": "पछिला",
    "blog.next": "अगिला",
    "blog.page": "पृष्ठ",
    "blog.of": "मे सँ",
    "blog.backToBlog": "ब्लॉग पर घुरू",
    "blog.relatedTitle": "आओर आलेख",
    "blog.notFound": "आलेख नहि भेटल",
    "blog.notFoundDesc": "अहाँ जे आलेख तकैत छी ओ मौजूद नहि अछि वा हटा देल गेल अछि।",

    "contact.title": "संपर्क करू",
    "contact.subtitle":
      "कोनो प्रश्न, साझा करबा लेल कथा, वा साझेदारीक विचार अछि? हमरा अहाँ सँ सुनि नीक लागत।",
    "contact.form.name": "पूरा नाम",
    "contact.form.email": "ईमेल पता",
    "contact.form.phone": "फोन नंबर",
    "contact.form.message": "संदेश",
    "contact.form.namePlaceholder": "अहाँक नाम",
    "contact.form.emailPlaceholder": "you@example.com",
    "contact.form.phonePlaceholder": "+91 00000 00000",
    "contact.form.messagePlaceholder": "हम अहाँक कोना मदति करी?",
    "contact.form.submit": "संदेश पठाउ",
    "contact.form.submitting": "पठाओल जाइत अछि...",
    "contact.form.success":
      "धन्यवाद! अहाँक संदेश भेट गेल। स्वागत संदेश लेल अपन इनबॉक्स देखू।",
    "contact.form.error": "किछु गलत भ' गेल। कृपया फेर सँ प्रयास करू।",
    "contact.form.captchaRequired": "कृपया कैप्चा पूरा करू।",
    "contact.form.required": "ई फील्ड आवश्यक अछि।",
    "contact.form.invalidEmail": "कृपया मान्य ईमेल पता दिअ।",
    "contact.info.title": "संपर्क मे रहू",
    "contact.info.desc": "फॉर्म वा नीचाँ देल विवरणक माध्यम सँ संपर्क करू।",
    "contact.info.emailLabel": "ईमेल",
    "contact.info.locationLabel": "क्षेत्र",
    "contact.info.location": "मिथिला (बिहार, भारत आ मधेश, नेपाल)",

    "ad.label": "विज्ञापन",

    "submit.notice":
      "अहाँक आलेख समीक्षा लेल एडमिन केँ पठाओल जायत। स्वीकृतिक बादहि ई ब्लॉग पर देखायत।",
    "submit.successTitle": "समीक्षा लेल जमा",
    "submit.successDesc":
      "धन्यवाद! एडमिन अहाँक आलेखक समीक्षा करत आ उपयुक्त होइत प्रकाशित करत।",
    "submit.another": "आओर एक आलेख जमा करू",
    "submit.form.title": "शीर्षक",
    "submit.form.titlePlaceholder": "उदा. हमर गाँव मे छठक याद",
    "submit.form.category": "श्रेणी",
    "submit.form.author": "अहाँक नाम",
    "submit.form.authorPlaceholder": "लेखक रूप मे देखाय बला नाम",
    "submit.form.email": "ईमेल",
    "submit.form.emailPlaceholder": "you@example.com",
    "submit.form.cover": "कवर छवि",
    "submit.form.coverHint": "वैकल्पिक — अपलोड करू वा URL दिअ",
    "submit.form.upload": "अपलोड",
    "submit.form.excerpt": "संक्षिप्त सार",
    "submit.form.excerptPlaceholder": "ब्लॉग कार्ड लेल छोट परिचय…",
    "submit.form.content": "आलेख सामग्री",
    "submit.form.contentPlaceholder": "एतय अपन आलेख लिखू। पैराग्राफ खाली पंक्ति सँ अलग करू।",
    "submit.form.submit": "अनुमोदन लेल जमा करू",
    "submit.form.submitting": "जमा भ' रहल अछि…",

    "horoscope.eyebrow": "दैनिक मार्गदर्शन",
    "horoscope.chooseRashi": "अपन राशि चुनू",
    "horoscope.chooseHint": "अपन जन्म चंद्र राशि चुनू। पाठ आइक पंचांग सँ मेल खाइत अछि।",
    "horoscope.location": "स्थान",
    "horoscope.loading": "आइक राशिफल तैयार भ' रहल अछि…",
    "horoscope.moonToday": "आइ चंद्र",
    "horoscope.luckyColor": "शुभ रंग",
    "horoscope.luckyNumber": "शुभ अंक",
    "horoscope.luckyTime": "शुभ समय",
    "horoscope.lifeTitle": "जीवनक क्षेत्र",
    "horoscope.lifeHint": "प्रेम, कर्म, स्वास्थ्य, धन आ आत्मा — संतुलित दिन लेल।",
    "horoscope.tipTitle": "आइक सलाह",
    "horoscope.disclaimer":
      "ई मार्गदर्शन चिंतन आ सांस्कृतिक प्रेरणा लेल अछि, वैदिक पंचांग सँ जुड़ल। महत्वपूर्ण निर्णय लेल विश्वसनीय ज्योतिषी सँ परामर्श लिअ।",

    "kundli.eyebrow": "जन्म कुंडली",
    "kundli.formTitle": "जन्म विवरण दिअ",
    "kundli.formHint": "सटीक समय आ स्थान लग्न व भाव केँ वैदिक परंपराक निकट राखैत अछि।",
    "kundli.name": "नाम",
    "kundli.namePlaceholder": "अहाँक नाम (वैकल्पिक)",
    "kundli.place": "जन्म स्थान",
    "kundli.date": "जन्म तिथि",
    "kundli.time": "जन्म समय",
    "kundli.generate": "कुंडली बनाउ",
    "kundli.generating": "गणना भ' रहल अछि…",
    "kundli.resultEyebrow": "अहाँक कुंडली",
    "kundli.lagna": "लग्न",
    "kundli.moon": "चंद्र राशि",
    "kundli.sun": "सूर्य राशि",
    "kundli.nakshatra": "जन्म नक्षत्र",
    "kundli.planetsTitle": "ग्रह स्थिति",
    "kundli.planetsHint": "लग्न सँ भाव सहित निरायन स्थितियाँ।",
    "kundli.housesTitle": "बारह भाव",
    "kundli.lifeTitle": "जीवन भविष्यवाणी",
    "kundli.lifeHint": "स्वभाव, कर्म, धन, संबंध, स्वास्थ्य, परिवार, आत्मा आ समय।",
    "kundli.remediesTitle": "सहायक उपाय",

    "footer.about.title": "अपन मिथिलाक बारे मे",
    "footer.about.desc":
      "मिथिलाक लोकक सांस्कृतिक घर — धरोहरक संरक्षण आ समुदायक सेवा।",
    "footer.links.title": "त्वरित लिंक",
    "footer.follow.title": "जुड़ल रहू",
    "footer.rights": "सर्वाधिकार सुरक्षित।",

    "panchang.pageTitle": "दैनिक पंचांग आ मैथिली पात्र",
  },
} as const

export type TranslationKey = keyof (typeof translations)["en"]
