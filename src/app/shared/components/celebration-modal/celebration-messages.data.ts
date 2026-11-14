/**
 * Spider Math Educational Platform (v2.2)
 * Dynamic Celebration Phrases & Random Picker
 * Strictly zero emojis.
 */

export interface CelebrationPhrases {
  ar: string[];
  en: string[];
}

/**
 * 1. Perfect Score Phrases (100% / العلامة الكاملة)
 */
export const CELEBRATION_PHRASES_PERFECT: CelebrationPhrases = {
  ar: [
    'جبت الدرجة كاملة يا بطل، الرياضيات كلها تحت سيطرتك',
    'مية في المية، انت مش بتحل، انت بتبدع',
    'عبقري الرياضيات وصل، فخورين بيك جدا',
    'مفيش مسألة وقفت قدامك، ومفيش حاجة هتوقفك',
    'دي مش درجة، دي شهادة عبقرية',
    'الدرجة دي بتاعتك، حافظ عليها',
    'انت الأول بتاعنا، كمل بنفس القوة',
    'ممتاز جدا، انت تستاهل كل التقدير',
    'انت رفعت راسنا، احنا فخورين بيك أوي',
    'شغلك يجنن، عقلك ده كنز',
    'انت مثال لأي حد عايز ينجح',
    'خليك كده على طول، انت نجم النجوم',
    'النجاح ده مش صدفة، ده تعبك ومجهودك',
    'برافو بجد، انت عملت اللي مفيش حد عمله',
    'يا جمالك يا بطل، جبت الدرجة بكل سهولة',
    'انت النهاردة بطل، وبكرة هتبقى أعظم',
    'استمتع بنجاحك، انت تستاهله',
    'دي بداية حكاية نجاح كبيرة ليك',
    'ذكاءك ده هيوصلك لأبعد مكان',
    'انت قدوة لكل صحابك'
  ],
  en: [
    "Perfect Score! You're a Math Star!",
    "100%! You didn't just solve it, you owned it!",
    "Math Genius Alert! So proud of you!",
    "Flawless! Nothing can stop you now!",
    "You cracked every single problem!",
    "Champion of Numbers!",
    "Keep shining, Superstar!",
    "Amazing job! You are the best!",
    "You are unstoppable! What a performance!",
    "Brilliant! Your hard work paid off!",
    "You made it look so easy! Incredible!",
    "Top of the class! You deserve it!",
    "Your brain is on fire! Keep it up!",
    "A perfect score for a perfect mind!",
    "You are a true Math Hero!",
    "We are so proud of you! You did it!",
    "Excellence looks good on you!",
    "You set the bar so high! Wow!",
    "This is what greatness looks like!",
    "Keep dreaming big, you can do anything!"
  ]
};

/**
 * 2. Close to Full Score Phrases (70% - 99% / اللي قربوا يجيبوا الدرجة كاملة)
 */
export const CELEBRATION_PHRASES_CLOSE: CelebrationPhrases = {
  ar: [
    'فاضل تكة وتجيب الدرجة كاملة، انت قدها',
    'قربت جدا، المرة الجاية الدرجة بتاعتك',
    'شايف التقدم، انت بتطور بسرعة رهيبة',
    'غلطة صغيرة بس، وركز هتجيبها المرة الجاية',
    'انت مش بعيد، انت على باب الدرجة الكاملة',
    'حاول تاني، انت أقوى من المسألة دي',
    'ممتاز، كمل بنفس الحماس وهتجيب الدرجة',
    'برافو عليك، تقدمك واضح جدا',
    'انت ماشي صح، كمل متوقفش',
    'خلاص هانت، الدرجة الكاملة مستنياك',
    'شايف الفرق، انت بقيت أشطر بكتير',
    'غلطة واحدة مش هتوقف بطل زيك',
    'انت قريب أوي، شد حيلك شوية كمان',
    'ركز في اللي جاي، وهتفرحنا بالدرجة الكاملة',
    'مجهودك باين، ولسه الأحلى جاي',
    'متستسلمش، انت على بعد خطوة من القمة',
    'انا شايفة فيك بطل كبير أوي',
    'كل مرة بتبقى أحسن من اللي قبلها',
    'انت تستاهل الدرجة الكاملة، وهتجيبها',
    'يلا بينا، المرة الجاية بتاعتك'
  ],
  en: [
    "So close! One more try and you'll get it!",
    "Almost perfect! You're doing amazing!",
    "You're so close to the top, don't stop now!",
    "Small mistake, big progress! Keep going!",
    "You're on the right track, Math Star!",
    "Next time is YOUR time to get 100%!",
    "Proud of your progress, keep pushing!",
    "Great effort! You are almost there!",
    "You are so close, I can feel it!",
    "One more step and you are at the top!",
    "Your improvement is amazing!",
    "Don't stop now, you are almost a champion!",
    "A tiny mistake can't stop a star like you!",
    "Keep your focus, your perfect score is coming!",
    "You are getting better every single time!",
    "Believe me, you are a future champion!",
    "Almost there! Just a little more!",
    "You are doing better than you think!",
    "The finish line is so close! Run for it!",
    "Your hard work is about to pay off!"
  ]
};

/**
 * 3. Below 70% Phrases (< 70% / اللي جابوا أقل من سبعين)
 */
export const CELEBRATION_PHRASES_BELOW_70: CelebrationPhrases = {
  ar: [
    'الغلط مش فشل، الغلط أول خطوة للدرجة الكاملة',
    'كل عباقرة الرياضيات بدأوا من هنا',
    'متزعلش من الدرجة، ازعل لو بطلت تحاول',
    'انت تقدر، بس محتاج محاولة كمان بتركيز',
    'المسألة الصعبة دي هي اللي هتخليك أقوى',
    'انا واثقة فيك، وانت كمان لازم تثق في نفسك',
    'النهاردة بتتعلم، بكرة بتجيب الدرجة الكاملة',
    'يلا نراجع الغلطات مع بعض ونرجع أقوى',
    'كمل هتقدر، احنا معاك',
    'الدرجة دي مش انت، انت أكبر من كده بكتير',
    'كل محاولة بتخليك أشطر، متوقفش',
    'انت لسه في أول الطريق، والطريق ده ليك',
    'اللي بيغلط وبيتعلم، هو اللي بيوصل في الآخر',
    'متخليش درجة توقف حلمك',
    'انا عارفة انك تقدر، وانت كمان هتعرف',
    'يلا نبدأ من جديد، وبقوة أكبر',
    'الصعب النهاردة، هيبقى سهل بكرة',
    'انت مش لوحدك، احنا جنبك وهنساعدك',
    'خليك قوي، الأبطال بيتولدوا من المحاولات دي',
    'بكرة هتضحك على الدرجة دي، وهتجيب الدرجة الكاملة',
    'مفيش حد بيجيب الدرجة الكاملة من أول مرة، كلنا بنتعلم',
    'حاول تاني، وكل مرة هتبقى أقرب',
    'انت ذكي، بس محتاج شوية تركيز وصبر',
    'فخورة بيك عشان حاولت، ولسه هتفرحني',
    'الدرجة الكاملة مش بعيدة، انت بس محتاج تكمل'
  ],
  en: [
    "Mistakes mean you're learning! Keep going!",
    "Every Math Genius started right here!",
    "Don't give up, you're getting stronger!",
    "You can do it! Try one more time!",
    "Hard problems make strong minds!",
    "I believe in you! Believe in yourself too!",
    "Today you learn, tomorrow you ace it!",
    "Let's fix it together and come back stronger!",
    "Keep going, we are with you!",
    "This score does not define you, you are much more!",
    "Every try makes you smarter, don't stop!",
    "You are just getting started, this journey is yours!",
    "The ones who make mistakes and learn are the ones who win!",
    "Don't let one score stop your dream!",
    "I know you can do it, and soon you will too!",
    "Let's start again, even stronger!",
    "What is hard today will be easy tomorrow!",
    "You are not alone, we are here to help you!",
    "Stay strong, heroes are made from tries like this!",
    "Tomorrow you will laugh at this score and get full marks!",
    "Nobody gets it perfect the first time, we all learn!",
    "Try again, every time you get closer!",
    "You are smart, you just need a little focus and patience!",
    "I am proud of you for trying, and you will make me prouder!",
    "A perfect score is not far, you just need to keep going!"
  ]
};

/**
 * Random phrase selector based on percentage and language
 */
export function getRandomCelebrationPhrase(percentage: number, isArabic: boolean): string {
  let pool: string[];
  if (percentage >= 100) {
    pool = isArabic ? CELEBRATION_PHRASES_PERFECT.ar : CELEBRATION_PHRASES_PERFECT.en;
  } else if (percentage >= 70) {
    pool = isArabic ? CELEBRATION_PHRASES_CLOSE.ar : CELEBRATION_PHRASES_CLOSE.en;
  } else {
    pool = isArabic ? CELEBRATION_PHRASES_BELOW_70.ar : CELEBRATION_PHRASES_BELOW_70.en;
  }
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
