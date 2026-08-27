export interface ChargeSeparatorProduct {
  id: string;
  name: string;
  arabicName: string;
  subTitle: string;
  badgeText: string;
  badgeBg: string;
  pixelId: string;
  singlePrice: number;
  doublePrice: number;
  triplePrice: number;
  oldSinglePrice: number;
  oldDoublePrice: number;
  oldTriplePrice: number;
  mainImage: string;
  gallery: string[];
  features: { icon: string; title: string; desc: string }[];
}

export const chargeSeparatorProduct: ChargeSeparatorProduct = {
  id: "charge-separator",
  name: "Full-Charge Separator Auto-Eject Charger",
  arabicName: "فاصل الشحن الذكي بآلية الطرد والتفصيل التلقائي — Full-Charge Separator",
  subTitle: "المحول الذكي الأول لحماية بطارية الهواتف والأجهزة الإلكترونية من الانتفاخ والتلف عبر فصل الكهرباء تلقائياً عند اكتمال الشحن 100%",
  badgeText: "الأكثر مبيعاً لحماية البطارية ⚡",
  badgeBg: "from-blue-600 to-indigo-600",
  pixelId: "1031581459671396",
  singlePrice: 2900,
  doublePrice: 5200,
  triplePrice: 6900,
  oldSinglePrice: 4500,
  oldDoublePrice: 9000,
  oldTriplePrice: 13500,
  mainImage: "/products/charge_separator_principal.jpg",
  gallery: [
    "/products/charge_separator_principal.jpg",
    "/products/charge_separator_advantages_ar.jpg",
    "/products/charge_separator_cable.jpg"
  ],
  features: [
    {
      icon: "⚡",
      title: "فصل تلقائي عند وصول الشحن 100%",
      desc: "يقطع التيار الكهربائي نهائياً فور اكتمال شحن البطارية لحمايتها من الحرارة السائدة والانتفاخ وتدهور الكفاءة."
    },
    {
      icon: "💡",
      title: "نمطين إضاءة ذكية (White & Blue Modes)",
      desc: "نمط الضوء الأبيض مخصص للهواتف والتابلت ذات الشاشات، ونمط الضوء الأزرق للسماعات والباوربانك والأجهزة بدون شاشة."
    },
    {
      icon: "🔘",
      title: "زر التحكم والتشغيل بلمسة واحدة",
      desc: "إمكانية تبديل نمط الشحن أو أعادة تشغيل عملية الشحن بضغطة زر واحدة دون الحاجة لنزع الكابل."
    },
    {
      icon: "🔋",
      title: "إطالة عمر البطارية وتوفير المال",
      desc: "يحميك من تكاليف استبدال بطارية هاتفك الباهظة أو تلف اللوحة الأم جراء الشحن المتواصل طوال الليل."
    },
    {
      icon: "🔌",
      title: "توافق شامل مع تقنيات الشحن السريع",
      desc: "يدعم كابلات ومنافذ Type-C و Lightning لشحن الهواتف والأجهزة الذكية بأمان تام وسرعة عالية."
    }
  ]
};

export const customerReviews = [
  {
    name: "حمزة ب.",
    city: "الجزائر العاصمة",
    rating: 5,
    date: "منذ يومين",
    comment: "صراحة اختراع رائع جداً! كنت دايماً نخلي التيليفون يتشرجى كامل الليل ونخاف على البطارية. ركبت هذا الفاصل، غير يلحق 100% يحبس الشحن وحدو. ربي يجازيكم."
  },
  {
    name: "مصطفى ك.",
    city: "وهران",
    rating: 5,
    date: "منذ 3 أيام",
    comment: "شريت عرض القطعتين (واحدة لي وواحدة لزوجتي). الجودة ممتازة والزر يتجاوب فوراً. أضواء البيان واضحة بزاف والتوصيل كان سريع فـ 48 ساعة."
  },
  {
    name: "رياض م.",
    city: "سطيف",
    rating: 5,
    date: "منذ 4 أيام",
    comment: "منتج أصلي 100% وعملي بزاف خاصة للسماعات اللاسلكية والباوربانك فـ Blue Light Mode. يعطيك الصحة."
  },
  {
    name: "إسلام ع.",
    city: "قسنطينة",
    rating: 5,
    date: "منذ أسبوع",
    comment: "وصلني اليوم للمنزل، التغليف محكم والمنتج متين من المعدن. جربتو مع الآيفون يقطع الكهرباء ديريكت كي يقفل 100%."
  },
  {
    name: "عمر ف.",
    city: "عنابة",
    rating: 5,
    date: "منذ أسبوعين",
    comment: "خدمة فائقة وسرعة في التوصيل. أفضل استثمار لحماية بطاريات الهواتف الذكية."
  }
];

export const faqs = [
  {
    q: "كيف يعمل فاصل الشحن الذكي (Full-Charge Separator)؟",
    a: "يتعرف المحول الذكي على مستوى شحن الأجهزة المتصلة به. عندما تصل نسبة البطارية إلى 100%، يقطع التيار الكهربائي تلقائياً وبشكل كامل لتجنب الشحن الزائد وارتفاع حرارة البطارية."
  },
  {
    q: "ما الفرق بين وضع الضوء الأبيض (White Light) ووضع الضوء الأزرق (Blue Light)؟",
    a: "وضع الضوء الأبيض مخصص للهواتف الذكية والتابلت ذات الشاشات (يفصل عند اكتمال الشحن). بينما وضع الضوء الأزرق مخصص للأجهزة التي لا تحتوي على شاشات مثل السماعات اللاسلكية، الباوربانك، وماكينات الحلاقة."
  },
  {
    q: "هل يعمل مع جميع الهواتف والأجهزة؟",
    a: "نعم، المحول متوافق مع كافة الشواحن والكابلات القياسية (Type-C و Lightning) ويدعم تقنيات الشحن السريع بكل أمان."
  },
  {
    q: "كيف تتم عملية الطلب والدفع والتوصيل؟",
    a: "الطلب يكون عبر الاستمارة في الأسفل. التوصيل متوفر لجميع 58 ولاية جزائرية حتى باب المنزل أو المكتب، والدفع يكون نقدًا عند الاستلام ومعاينة المنتج."
  }
];
