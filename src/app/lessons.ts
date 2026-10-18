export interface Word { en: string; ru: string; e: string }
export interface Lesson { title: string; icon: string; words: Word[] }

// Формат слов: "english|русский|эмодзи;..."
const L = (title: string, icon: string, s: string): Lesson => ({
  title,
  icon,
  words: s.split(';').map((x) => {
    const [en, ru, e] = x.split('|');
    return { en, ru, e };
  }),
});

// Уроки идут от простого к сложному: слова -> действия -> фразы
export const LESSONS: Lesson[] = [
  L('Привет!', '👋', 'hello|привет|👋;goodbye|пока|🙋;yes|да|👍;no|нет|👎;please|пожалуйста|🙏;thank you|спасибо|💐'),
  L('Цвета', '🎨', 'red|красный|🟥;blue|синий|🟦;green|зелёный|🟩;yellow|жёлтый|🟨;black|чёрный|⬛;white|белый|⬜'),
  L('Числа', '🔢', 'one|один|1️⃣;two|два|2️⃣;three|три|3️⃣;four|четыре|4️⃣;five|пять|5️⃣;six|шесть|6️⃣;seven|семь|7️⃣;eight|восемь|8️⃣;nine|девять|9️⃣;ten|десять|🔟'),
  L('Животные', '🐶', 'cat|кошка|🐱;dog|собака|🐶;cow|корова|🐮;pig|свинья|🐷;fish|рыба|🐟;bird|птица|🐦;lion|лев|🦁;frog|лягушка|🐸'),
  L('Фрукты', '🍎', 'apple|яблоко|🍎;banana|банан|🍌;orange|апельсин|🍊;pear|груша|🍐;grapes|виноград|🍇;lemon|лимон|🍋;cherry|вишня|🍒'),
  L('Семья', '👪', 'mother|мама|👩;father|папа|👨;sister|сестра|👧;brother|брат|👦;baby|малыш|👶;grandma|бабушка|👵;grandpa|дедушка|👴'),
  L('Тело', '🧍', 'head|голова|🧑;eye|глаз|👁️;ear|ухо|👂;nose|нос|👃;mouth|рот|👄;hand|рука|✋;leg|нога|🦵'),
  L('Еда', '🍕', 'bread|хлеб|🍞;milk|молоко|🥛;egg|яйцо|🥚;cheese|сыр|🧀;water|вода|💧;cake|торт|🎂;soup|суп|🍲'),
  L('Действия', '🏃', 'run|бегать|🏃;jump|прыгать|🤸;swim|плавать|🏊;sleep|спать|😴;eat|есть|🍽️;read|читать|📖;sing|петь|🎤;dance|танцевать|💃'),
  L('Фразы', '💬', 'I am happy|я счастлив|😊;I like apples|я люблю яблоки|🍎;I have a cat|у меня есть кошка|🐱;The sun is yellow|солнце жёлтое|🌞;I can swim|я умею плавать|🏊;Good morning|доброе утро|🌅'),
];
