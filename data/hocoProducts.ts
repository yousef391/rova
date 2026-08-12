export interface HocoProduct {
  id: string;
  name: string;
  subTitle: string;
  compatibility: 'apple' | 'android';
  compatibilityText: string;
  badgeText: string;
  badgeBg: string;
  priceSingle: number;
  priceBundle: number;
  oldPriceSingle: number;
  oldPriceBundle: number;
  image: string;
  gallery: string[];
  lifestyleBanner: string;
  antitheftBanner: string;
  colorName: string;
  colorHex: string;
  material: string;
  battery: string;
  features: { icon: string; title: string; desc: string }[];
}

export const hocoProducts: HocoProduct[] = [
  {
    id: "hoco-e101",
    name: "HOCO E101 Smart Tag",
    subTitle: "جهاز التتبع الذكي الأصلي HOCO E101 لحماية الممتلكات والمفاتيح والدراجات",
    compatibility: "apple",
    compatibilityText: "متوافق مع شبكة التتبع العالمية (Find My)",
    badgeText: "الأكثر مبيعاً",
    badgeBg: "from-blue-600 to-indigo-600",
    priceSingle: 3200,
    priceBundle: 6000,
    oldPriceSingle: 4800,
    oldPriceBundle: 9000,
    image: "/products/hoco_e101_black.jpg",
    gallery: [
      "/products/hoco_e101_black.jpg",
      "/products/hoco_e101_showcase.jpg",
      "/products/hoco_mob_antitheft.png",
      "/products/hoco_mob_sound.png"
    ],
    lifestyleBanner: "/products/hoco_e101_showcase.jpg",
    antitheftBanner: "/products/hoco_antitheft.png",
    colorName: "أسود ملكي",
    colorHex: "#18181b",
    material: "ABS المقوى الفاخر مقاوم للخدوش والماء",
    battery: "CR2032 تدوم سنة كاملة (1 عام - 1 Ans) سهلة التغيير",
    features: [
      {
        icon: "📍",
        title: "تحديد موقع جغرافي مباشر ودقيق",
        desc: "يتتبع ممتلكاتك عبر شبكة التتبع العالمية الموزعة حول العالم في الخريطة لحظة بلحظة."
      },
      {
        icon: "🏍️",
        title: "حماية الموتور والسيارة من السرقة",
        desc: "تخفيه داخل الدراجة النارية أو السيارة لتتبع مكانها وتحديد موقعها فوراً في حالة السرقة."
      },
      {
        icon: "🔊",
        title: "صوت رنين قوي للبحث السريع",
        desc: "ضغطة زر واحدة تجعل الجهاز يصدر رنيناً عالياً لتجده في ثوانٍ."
      },
      {
        icon: "⚡",
        title: "بدون أي اشتراك شهري أو شريحة",
        desc: "ادفع مرة واحدة فقط! يعمل مدى الحياة دون الحاجة لشراء بطاقة SIM أو دفع رسوم شهرية."
      },
      {
        icon: "🔋",
        title: "بطارية تدوم سنة كاملة (1 عام - 1 Ans)",
        desc: "بطارية CR2032 اقتصادية تدوم 12 شهراً ومتاحة في جميع المحلات وسهلة الاستبدال."
      }
    ]
  }
];

export const marketingAngles = [
  {
    id: "antitheft",
    badge: "حماية من السرقة 24/7",
    title: "خايف على الموتور ولا السكوتار تاعك يتسرق؟",
    subtitle: "ضع HOCO E101 في دراجتك أو سيارتك وتتبع مكانها لحظة بلحظة على الماب أينما ذهبت!",
    highlights: [
      "تحديد الموقع بدقة عالية بدون شريحة SIM",
      "إمكانية إخفائه بسهولة داخل هيكل الدراجة أو تحت الكرسي",
      "بدون أي مصاريف أو اشتراكات شهرية"
    ]
  },
  {
    id: "lostkeys",
    badge: "تضيّع مفاتيحك دائماً؟",
    title: "تخرج مستعجل وتضيع مفاتيح السيارة أو الساكوشة؟",
    subtitle: "بضغطة واحدة من تليفونك، يصدر جهاز HOCO E101 رنيناً صويتياً قوياً لتجده فوراً!",
    highlights: [
      "رنين صوتي مرتفع يسمع من الغرفة المجاورة",
      "مؤشر الاتجاه والمسافة على شاشة هاتفك",
      "خفيف الوزن وسهل التعليق في أي ميدالية"
    ]
  },
  {
    id: "kids_pets",
    badge: "حماية الأطفال والحيوانات",
    title: "راحة بالك وأمان عائلتك وممتلكاتك أولويتنا",
    subtitle: "علقه في حقيبة طفلك أو في قلادة أليفك لتبقى على اطلاع دائم بمكانه في أي مكان.",
    highlights: [
      "مقاوم للماء والصدمات اليومية",
      "تنبيه تلقائي عند الابتعاد عن مكانك",
      "بطارية تدوم سنة كاملة دون الحاجة للشحن"
    ]
  }
];

export const customerReviews = [
  {
    name: "كريم م.",
    city: "الجزائر العاصمة",
    rating: 5,
    date: "منذ يومين",
    comment: "صراحة روعة! درتو فالموتور تاعي Sym Fiddle 3 ومخبيه مليح، نتبع البلاصة تاعو فالماب ديريكت من الآيفون. ربي يحفظكم على المصداقية والسرعة فالتوصيل."
  },
  {
    name: "ياسين ب.",
    city: "وهران",
    rating: 5,
    date: "منذ 3 أيام",
    comment: "اشتريت عرض القطعتين (واحدة للموتور وواحدة لمفاتيح الطوموبيل). الجودة ممتازة والصوت تع الرنين مسموع بزاف. ما تحتاج شريحة ما تحتاج تخلص كل شهر. 10/10."
  },
  {
    name: "حمزة ق.",
    city: "قسنطينة",
    rating: 5,
    date: "منذ 5 أيام",
    comment: "خدمة التوصيل كانت سريعة جداً وصلني في يومين. ركبتو فمفاتيح الطوموبيل والساكوشة، هناني من الضياع."
  },
  {
    name: "سفيان ت.",
    city: "البليدة",
    rating: 5,
    date: "منذ أسبوع",
    comment: "منتج أنيق وحجمو صغير، والأهم أنو يخدم مع تطبيق Find My الأصلي بدون أي تطبيق خارجي. يعطيك الصحة."
  },
  {
    name: "عبد القادر ر.",
    city: "عنابة",
    rating: 5,
    date: "منذ أسبوعين",
    comment: "جربتو فالموتور TMAX، يحدد المكان بدقة عالية وين تسطاسيونه يخرجلك فالماب. أفضل استثمار لحماية الموتور."
  }
];

export const faqs = [
  {
    q: "هل يتطلب جهاز HOCO E101 اشتراكاً شهرياً أو بطاقة شريحة (SIM)؟",
    a: "لا مطلقاً! الجهاز يعمل بتقنية البلوتوث والشبكة العالمية (Find My) بدون أي شريحة هاتف وبدون أي مصاريف أو اشتراكات شهرية مدى الحياة."
  },
  {
    q: "كيف يحدد الجهاز الموقع إذا ابتعدت عنه؟",
    a: "الجهاز يتواصل بشكل مشفر وآمن مع الأجهزة المحيطة به في الشارع أو المواقف، ويرسل لك موقعه المباشر على الخريطة في تطبيقك دون أن يشعر أي أحد."
  },
  {
    q: "كم تدوم البطارية وهل يمكن تغييرها؟",
    a: "تستمر البطارية (CR2032) لمدة تصل إلى 12 شهراً كاملاً، وعند انتهاء شحنتها يمكنك تغييرها بسهولة من أي مكتبة أو محل بسعر رمزي."
  },
  {
    q: "كيف تكون طريقة الدفع والتوصيل؟",
    a: "الدفع يكون عند الاستلام فقط (Cash on Delivery) بعد معاينة وتأكدك من المنتج. والتوصيل متوفر لـ 58 ولاية حتى باب المنزل أو إلى المكتب عبر شركة التوصيل."
  }
];
