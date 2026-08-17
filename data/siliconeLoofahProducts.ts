export interface SiliconeLoofahProduct {
  id: string;
  name: string;
  arabicName: string;
  subtitle: string;
  tagline: string;
  originalSinglePrice: number;
  singlePrice: number;
  doublePrice: number;
  triplePrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  colors: {
    id: string;
    name: string;
    arabicName: string;
    hex: string;
    badge?: string;
  }[];
  features: {
    icon: string;
    title: string;
    desc: string;
  }[];
  comparison: {
    traditional: string[];
    silicone: string[];
  };
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const siliconeLoofahProduct: SiliconeLoofahProduct = {
  id: "silicone-loofah-double",
  name: "Double-Sided Silicone Body Scrubber",
  arabicName: "حزام ليفة السيليكون المزدوجة للتقشير والتدليك",
  subtitle: "الحل النهائي للنظافة العميقة والراحة التامة أثناء الاستحمام 🚿✨",
  tagline: "تخلص من الجلد الميت والتعب واستمتع بتدليك مريح لبشرة ناعمة وصحية 100%",
  originalSinglePrice: 4500,
  singlePrice: 3500,
  doublePrice: 6000, // 3000 DA each -> save 1000 DA
  triplePrice: 8200, // 2733 DA each -> save 2300 DA
  rating: 4.9,
  reviewCount: 384,
  image: "/products/poster_1.jpg",
  gallery: [
    "/products/poster_1.jpg",
    "/products/poster_2.jpg",
    "/products/poster_3.jpg",
    "/products/poster_4.jpg",
    "/products/poster_5.jpg",
  ],
  colors: [
    { id: "blue", name: "Sky Blue", arabicName: "أزرق سماوي", hex: "#38bdf8", badge: "الأكثر طلباً 🔥" },
    { id: "pink", name: "Soft Pink", arabicName: "وردي ناعم", hex: "#f472b6" },
    { id: "green", name: "Mint Green", arabicName: "أخضر نعناعي", hex: "#34d399" },
    { id: "purple", name: "Purple Lavender", arabicName: "بنفسجي لافندر", hex: "#a78bfa" },
  ],
  features: [
    {
      icon: "✨",
      title: "تصميم طويل ومقبضين مرنين",
      desc: "تصل لظهرك وكامل مناطق جسمك الصعبة بسهولة تامة وبدون الحاجة لمساعدة أحد."
    },
    {
      icon: "🔄",
      title: "وجهين مزدوجين في حزام واحد",
      desc: "جهة شعيرات ناعمة لتقشير وتنظيف الجلد الميت، وجهة ببروزات دائرية لتدليك الجسم وتنشيط الدورة الدموية."
    },
    {
      icon: "🛡️",
      title: "سيليكون طبي صحي 100%",
      desc: "مضادة للبكتيريا، لا تترسب بها الروائح الكريهة ولا تجمع الفطريات، تجف في ثوانٍ معدودة."
    },
    {
      icon: "💎",
      title: "اقتصادية وتدوم لسنوات",
      desc: "مصنوعة من سيليكون طبي مرن عالي الجودة يدوم معك سنوات طويلة دون أن يتلف أو يتغير."
    }
  ],
  comparison: {
    traditional: [
      "تجمع البكتيريا والفطريات بسرعة ❌",
      "تصدر منها روائح كريهة بعد الاستعمال ❌",
      "صعبة الوصول لكامل مناطق الظهر ❌",
      "تتلف وتتفتت بسرعة وتطلب الاستبدال دائماً ❌"
    ],
    silicone: [
      "مضادة للبكتيريا والفطريات 100% ✅",
      "تجف في دقائق ولا تحتفظ بأي رائحة ✅",
      "طويلة بمقابض مريحة للوصول لكل مكان ✅",
      "سيليكون طبي متين يدوم لسنوات طوال ✅"
    ]
  },
  faqs: [
    {
      question: "كيفاش نخدم بليفة السيليكون المزدوجة؟",
      answer: "سهلة بزاف! دير جيل التدويش (Gel Douche) ولا الصابون المفضل عندك فوق الشعيرات، حك بالمقابض ظهرك وجسمك وستمتع برغوة كثيفة وتدليك مريح."
    },
    {
      question: "هل تنفع لجميع أنواع البشرة؟",
      answer: "نعم، شعيرات السيليكون الطبية ناعمة ولطيفة جداً على البشرة ولا تسبب أي خدوش أو تهيج، حتى للبشرة الحساسة."
    },
    {
      question: "كيفاش ننظفها ونشفها؟",
      answer: "شللها بالماء برك بعد الاستحمام وعلقها من إحدى المقابض. رح تنشف في ثوانٍ ومستحيل تربي الريحة ولا البكتيريا."
    },
    {
      question: "شحال وقت التوصيل والدفع كيفاش؟",
      answer: "التوصيل متوفر لجميع الولايات (58 ولاية). والدفع يكون يد بيد عند الاستلام والتأكد من المنتج."
    }
  ]
};

export const customerReviews = [
  {
    id: 1,
    name: "مريم ب.",
    city: "الجزائر العاصمة",
    rating: 5,
    date: "منذ يومين",
    comment: "هايلة بزاف! تهنيت من العذاب تاع الكيس القديم، تخدم رغوة روعة وتوصل لضهري بسهولة والتدليك تاعها يريح العضلات.",
    verified: true
  },
  {
    id: 2,
    name: "كريم م.",
    city: "وهران",
    rating: 5,
    date: "منذ 3 أيام",
    comment: "منتج صحي 100%. ما تشدش الما وتنشف ليه ليه والسيليكون تاعها كاليتي ممتازة. ننصحكم بpack تاع زوج قطع.",
    verified: true
  },
  {
    id: 3,
    name: "فاطمة الزهراء",
    city: "قسنطينة",
    rating: 5,
    date: "منذ 5 أيام",
    comment: "وصلتني في يومين للتوصيل. حقيقة غيرت تجربة التدويش، جهة التقشير تنقي غاية وجهة المساج روعة بعد نهار تعب.",
    verified: true
  },
  {
    id: 4,
    name: "عبد القادر",
    city: "سطيف",
    rating: 5,
    date: "منذ أسبوع",
    comment: "طلبنا العرض العائلي 3 قطع. جودة عالية ومقابض صحاح، ربي يحفظكم على المصداقية والتوصيل السريع.",
    verified: true
  }
];
