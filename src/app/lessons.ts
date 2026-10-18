export interface Word { en: string; ru: string; e: string; ex?: string; tr?: string }
export interface Lesson { title: string; icon: string; words: Word[]; abc?: boolean; review?: boolean; section?: string }

// Формат слов: "english|русский|эмодзи[|пример|транскрипция]" через ";"
const parse = (s: string): Word[] =>
  s.split(';').map((x) => {
    const [en, ru, e, ex, tr] = x.split('|');
    return { en, ru, e, ex, tr };
  });

// Буква | как читается | картинка | слово-пример | как читается пример
const ABC = parse(
  'A|эй|🎂|cake|кейк;B|би|🐝|bee|би;C|си|🏙️|city|сити;D|ди|🐶|dog|дог;' +
  'E|и|🦅|eagle|игл;F|эф|🐟|fish|фиш;G|джи|🦒|giraffe|джираф;H|эйч|🏠|house|хаус;' +
  'I|ай|🍦|ice cream|айс крим;J|джей|🧃|juice|джус;K|кей|🪁|kite|кайт;L|эл|🦁|lion|лайон;' +
  'M|эм|🐵|monkey|манки;N|эн|👃|nose|ноуз;O|оу|🌊|ocean|оушен;P|пи|🐷|pig|пиг;' +
  'Q|кью|👑|queen|квин;R|ар|🌈|rainbow|рэйнбоу;S|эс|☀️|sun|сан;T|ти|🐯|tiger|тайгер;' +
  'U|ю|🦄|unicorn|юникорн;V|ви|🎻|violin|вайолин;W|дабл-ю|🍉|watermelon|уотермелон;' +
  'X|экс|🦊|fox|фокс;Y|уай|🪀|yo-yo|йо-йо;Z|зед|🦓|zebra|зибра',
);

// "Название#иконка#слова"; строка "=Раздел" начинает новый раздел
const C = [
  '=Слова 📚',
  'Привет!#👋#hello|привет|👋;goodbye|пока|🙋;yes|да|👍;no|нет|👎;please|пожалуйста|🙏;thank you|спасибо|💐',
  'Цвета#🎨#red|красный|🟥;blue|синий|🟦;green|зелёный|🟩;yellow|жёлтый|🟨;black|чёрный|⬛;white|белый|⬜',
  'Числа 1–5#🔢#one|один|1️⃣;two|два|2️⃣;three|три|3️⃣;four|четыре|4️⃣;five|пять|5️⃣',
  'Животные#🐶#cat|кошка|🐱;dog|собака|🐶;cow|корова|🐮;pig|свинья|🐷;fish|рыба|🐟;bird|птица|🐦',
  'Фрукты#🍎#apple|яблоко|🍎;banana|банан|🍌;orange|апельсин|🍊;pear|груша|🍐;grapes|виноград|🍇;lemon|лимон|🍋',
  'Числа 6–10#🔟#six|шесть|6️⃣;seven|семь|7️⃣;eight|восемь|8️⃣;nine|девять|9️⃣;ten|десять|🔟',
  'Семья#👪#mother|мама|👩;father|папа|👨;sister|сестра|👧;brother|брат|👦;baby|малыш|👶;grandma|бабушка|👵;grandpa|дедушка|👴',
  'Игрушки#🧸#ball|мяч|⚽;doll|кукла|🎎;car|машинка|🚗;teddy bear|мишка|🧸;kite|воздушный змей|🪁;robot|робот|🤖',
  'Тело#🧍#head|голова|🧑;eye|глаз|👁️;ear|ухо|👂;nose|нос|👃;mouth|рот|👄;hand|рука|✋;leg|нога|🦵',
  'Еда#🍞#bread|хлеб|🍞;milk|молоко|🥛;egg|яйцо|🥚;cheese|сыр|🧀;water|вода|💧;cake|торт|🎂;soup|суп|🍲',
  'Одежда#👕#hat|шапка|🧢;shirt|рубашка|👕;dress|платье|👗;shoes|ботинки|👟;socks|носки|🧦;coat|пальто|🧥;scarf|шарф|🧣',
  'Дом#🏠#house|дом|🏠;door|дверь|🚪;key|ключ|🔑;bed|кровать|🛏️;chair|стул|🪑;sofa|диван|🛋️;lamp|лампа|💡',
  'Погода#🌦️#sun|солнце|☀️;rain|дождь|🌧️;snow|снег|❄️;wind|ветер|💨;cloud|облако|☁️;rainbow|радуга|🌈',
  'Овощи#🥕#carrot|морковь|🥕;potato|картошка|🥔;tomato|помидор|🍅;onion|лук|🧅;corn|кукуруза|🌽;cucumber|огурец|🥒',
  'Транспорт#🚌#bus|автобус|🚌;train|поезд|🚂;plane|самолёт|✈️;ship|корабль|🚢;bike|велосипед|🚲;taxi|такси|🚕',
  'Школа#🏫#book|книга|📕;pen|ручка|🖊️;pencil|карандаш|✏️;bag|рюкзак|🎒;school|школа|🏫;teacher|учитель|🧑‍🏫',
  'Дикие животные#🦁#lion|лев|🦁;tiger|тигр|🐯;bear|медведь|🐻;monkey|обезьяна|🐵;elephant|слон|🐘;zebra|зебра|🦓;giraffe|жираф|🦒',
  'Эмоции#😊#happy|весёлый|😄;sad|грустный|😢;angry|злой|😠;scared|испуганный|😱;tired|уставший|😫;surprised|удивлённый|😲',
  'Действия#🏃#run|бегать|🏃;jump|прыгать|🤸;swim|плавать|🏊;sleep|спать|😴;eat|есть|🍽️;read|читать|📖;sing|петь|🎤;dance|танцевать|💃',
  'Природа#🌳#tree|дерево|🌳;flower|цветок|🌸;sea|море|🌊;mountain|гора|⛰️;river|река|🏞️;grass|трава|🌱',
  'Числа 11–15#🔢#eleven|одиннадцать|11;twelve|двенадцать|12;thirteen|тринадцать|13;fourteen|четырнадцать|14;fifteen|пятнадцать|15',
  'Профессии#🧑‍⚕️#doctor|врач|🧑‍⚕️;cook|повар|🧑‍🍳;farmer|фермер|🧑‍🌾;pilot|пилот|🧑‍✈️;police officer|полицейский|👮;artist|художник|🧑‍🎨',
  'Сладости#🍭#ice cream|мороженое|🍦;chocolate|шоколад|🍫;candy|конфета|🍬;cookie|печенье|🍪;juice|сок|🧃;pizza|пицца|🍕',
  'Ещё действия#✍️#write|писать|✍️;draw|рисовать|🖍️;play|играть|🎮;drink|пить|🥤;walk|гулять|🚶;cry|плакать|😭;fly|летать|🕊️',
  'Числа 16–20#🔢#sixteen|шестнадцать|16;seventeen|семнадцать|17;eighteen|восемнадцать|18;nineteen|девятнадцать|19;twenty|двадцать|20',
  'Времена года#🍂#spring|весна|🌷;summer|лето|🏖️;autumn|осень|🍂;winter|зима|⛄',
  'Дни недели#📅#Monday|понедельник|1️⃣;Tuesday|вторник|2️⃣;Wednesday|среда|3️⃣;Thursday|четверг|4️⃣;Friday|пятница|5️⃣;Saturday|суббота|6️⃣;Sunday|воскресенье|7️⃣',
  'Посуда#🍴#cup|чашка|☕;plate|тарелка|🍽️;spoon|ложка|🥄;fork|вилка|🍴;knife|нож|🔪;glass|стакан|🥃',
  'Спорт#⚽#football|футбол|⚽;tennis|теннис|🎾;basketball|баскетбол|🏀;hockey|хоккей|🏒;skiing|лыжи|⛷️;boxing|бокс|🥊',
  'Музыка#🎵#piano|пианино|🎹;guitar|гитара|🎸;drum|барабан|🥁;violin|скрипка|🎻;trumpet|труба|🎺;song|песня|🎵',
  'Какой?#🐘#big|большой|🐘;small|маленький|🐭;hot|горячий|🔥;cold|холодный|🥶;fast|быстрый|🐆;slow|медленный|🐢',
  'Я, ты, он#🙋#I|я|🙋;you|ты|👉;he|он|👦;she|она|👧;we|мы|👫;they|они|👨‍👩‍👦',
  'Комнаты#🛋️#kitchen|кухня|🍳;bathroom|ванная|🛁;bedroom|спальня|🛏️;living room|гостиная|🛋️;garden|сад|🌻',
  'Морские жители#🐳#whale|кит|🐳;dolphin|дельфин|🐬;shark|акула|🦈;octopus|осьминог|🐙;crab|краб|🦀;turtle|черепаха|🐢',
  'Насекомые#🐝#bee|пчела|🐝;butterfly|бабочка|🦋;ant|муравей|🐜;spider|паук|🕷️;ladybug|божья коровка|🐞;snail|улитка|🐌',
  'Птицы#🦉#owl|сова|🦉;duck|утка|🦆;chicken|курица|🐔;penguin|пингвин|🐧;eagle|орёл|🦅;parrot|попугай|🦜',
  'Ферма#🐴#horse|лошадь|🐴;sheep|овца|🐑;goat|коза|🐐;rabbit|кролик|🐰;mouse|мышь|🐭',
  'Город#🏙️#shop|магазин|🏪;park|парк|🏞️;hospital|больница|🏥;cinema|кино|🎬;cafe|кафе|☕;zoo|зоопарк|🦓',
  'Праздник#🎉#birthday|день рождения|🎂;gift|подарок|🎁;party|вечеринка|🎉;balloon|шарик|🎈;candle|свеча|🕯️;Christmas tree|ёлка|🎄',
  'Космос#🚀#star|звезда|⭐;moon|луна|🌙;planet|планета|🪐;rocket|ракета|🚀;Earth|Земля|🌍;alien|инопланетянин|👽',
  'Фигуры#🔺#circle|круг|🔵;square|квадрат|🟧;triangle|треугольник|🔺;heart|сердце|❤️;star|звезда|⭐;diamond|ромб|🔷',
  'Ещё цвета#🌈#pink|розовый|💗;purple|фиолетовый|🟪;orange|оранжевый|🟠;brown|коричневый|🟫;grey|серый|🌫️',
  'Время суток#🌙#morning|утро|🌅;day|день|🌞;evening|вечер|🌇;night|ночь|🌃;clock|часы|🕒',
  'Лицо и тело#💪#hair|волосы|💇;teeth|зубы|🦷;arm|рука|💪;foot|стопа|🦶;finger|палец|☝️;face|лицо|🙂',
  'Техника#💻#phone|телефон|📱;computer|компьютер|💻;TV|телевизор|📺;camera|фотоаппарат|📷;headphones|наушники|🎧',
  '=Фразы 💬',
  'Знакомство#🤝#My name is Tom|меня зовут Том|📛;I am seven|мне семь лет|7️⃣;Nice to meet you|приятно познакомиться|🤝;How are you?|как дела?|🙂;I am fine|у меня всё хорошо|👍;What is your name?|как тебя зовут?|❓',
  'Вежливость#🙏#Excuse me|извините|🙋;I am sorry|прости|😔;You are welcome|не за что|😊;Thank you very much|большое спасибо|💐;See you later|до встречи|👋',
  "Я люблю#❤️#I like dogs|я люблю собак|🐶;I like milk|я люблю молоко|🥛;I like to play|я люблю играть|🎮;I don't like rain|я не люблю дождь|🌧️;Do you like cake?|ты любишь торт?|🎂",
  'У меня есть#🎁#I have a ball|у меня есть мяч|⚽;I have two cats|у меня две кошки|🐈;I have a sister|у меня есть сестра|👧;I have a red car|у меня красная машинка|🚗;Do you have a pen?|у тебя есть ручка?|🖊️',
  "Я умею#🤸#I can run|я умею бегать|🏃;I can jump|я умею прыгать|🤸;I can sing|я умею петь|🎤;I can't fly|я не умею летать|🕊️;Can you swim?|ты умеешь плавать?|🏊",
  'Это...#👉#This is my mom|это моя мама|👩;This is my dog|это моя собака|🐶;This is a book|это книга|📕;That is a tree|то дерево|🌳;What is this?|что это?|❓',
  'Где?#📦#The cat is in the box|кошка в коробке|📦;The ball is under the table|мяч под столом|⚽;The book is on the chair|книга на стуле|🪑;Where is my bag?|где мой рюкзак?|🎒;It is here|оно здесь|👇',
  'Цвет предметов#🎨#a red apple|красное яблоко|🍎;a blue car|синяя машина|🚙;a green frog|зелёная лягушка|🐸;a yellow banana|жёлтый банан|🍌;a white cloud|белое облако|☁️',
  'Сколько?#🔢#two cats|две кошки|🐈;three dogs|три собаки|🐕;five apples|пять яблок|🍏;ten stars|десять звёзд|🌟;How many?|сколько?|❔',
  'Какая погода?#☀️#It is sunny|солнечно|☀️;It is raining|идёт дождь|🌧️;It is snowing|идёт снег|❄️;It is cold|холодно|🥶;It is hot|жарко|🥵;It is windy|ветрено|💨',
  'Я чувствую#😋#I am hungry|я голоден|😋;I am thirsty|я хочу пить|🥤;I am tired|я устал|😫;I am sad|мне грустно|😢;I am happy|я счастлив|😄',
  'Что ты делаешь?#🎬#I am eating|я ем|🍽️;I am reading|я читаю|📖;He is running|он бежит|🏃;She is dancing|она танцует|💃;We are singing|мы поём|🎤;They are sleeping|они спят|😴',
  'Мой день#⏰#I wake up|я просыпаюсь|⏰;I brush my teeth|я чищу зубы|🦷;I eat breakfast|я завтракаю|🥣;I go to school|я иду в школу|🏫;I go to bed|я ложусь спать|🛏️',
  'Он и она#👫#He is a doctor|он врач|🧑‍⚕️;She is a teacher|она учитель|🧑‍🏫;He is tall|он высокий|🦒;She is kind|она добрая|🥰;He is my friend|он мой друг|🤝',
  'Моя семья#👪#I love my mom|я люблю маму|❤️;My dad is strong|мой папа сильный|💪;My sister is small|моя сестра маленькая|👧;My grandma is kind|моя бабушка добрая|👵;We are a family|мы семья|👪',
  'За столом#🍽️#I want juice|я хочу сок|🧃;Can I have water?|можно мне воды?|💧;It is tasty|это вкусно|😋;Enjoy your meal|приятного аппетита|🍽️;Pass the bread please|передай хлеб пожалуйста|🍞',
  'В магазине#🛒#How much is it?|сколько это стоит?|💰;I want this toy|я хочу эту игрушку|🧸;Here you are|вот, пожалуйста|🤲;It is cheap|это дёшево|🏷️;It is expensive|это дорого|💎',
  'Там есть#🏞️#There is a cat|там есть кошка|🐱;There are two dogs|там две собаки|🐕;There is a tree|там есть дерево|🌳;Is there a park?|там есть парк?|🏞️;There are many stars|там много звёзд|✨',
  'Вчера#⏪#I was happy|я был счастлив|😄;I played football|я играл в футбол|⚽;I saw a bird|я видел птицу|🐦;We went to the zoo|мы ходили в зоопарк|🦓;It was fun|было весело|🎉',
  'Завтра#⏩#I will read|я буду читать|📖;We will play|мы будем играть|🎮;It will rain|будет дождь|🌧️;I will go to the park|я пойду в парк|🏞️;See you tomorrow|увидимся завтра|👋',
  'Хобби#🎨#I like drawing|я люблю рисовать|🖍️;I like dancing|я люблю танцевать|💃;I like reading|я люблю читать|📚;My hobby is music|моё хобби — музыка|🎵;I play the guitar|я играю на гитаре|🎸',
  'Что умеют звери#🐸#A fish can swim|рыба умеет плавать|🐟;A bird can fly|птица умеет летать|🐦;A frog can jump|лягушка умеет прыгать|🐸;A cat can climb|кошка умеет лазать|🐈;A dog can run fast|собака быстро бегает|🐕',
  'Сравнение#⚖️#bigger|больше|📈;smaller|меньше|📉;An elephant is bigger than a mouse|слон больше мыши|🐘;A car is faster than a bike|машина быстрее велосипеда|🏎️;The sun is very hot|солнце очень горячее|☀️',
  'Дорога#🧭#Turn left|поверни налево|⬅️;Turn right|поверни направо|➡️;Go straight|иди прямо|⬆️;Stop|стоп|🛑;Come here|иди сюда|👋;Wait for me|подожди меня|✋',
  'На уроке#🏫#Open your book|открой книгу|📖;Sit down|садись|🪑;Stand up|встань|🧍;Listen|слушай|👂;Be quiet|тише|🤫;Raise your hand|подними руку|🙋',
  'Зарядка#🤸#Clap your hands|похлопай в ладоши|👏;Touch your nose|дотронься до носа|👃;Jump up|подпрыгни|🦘;Turn around|повернись|🔄;Wave your hand|помаши рукой|👋',
  "Время#🕒#What time is it?|который час?|🕒;It is three o'clock|сейчас три часа|3️⃣;Good morning|доброе утро|🌅;Good night|спокойной ночи|🌙;See you on Monday|увидимся в понедельник|📅",
  'Вопросы#❓#Who is it?|кто это?|🕵️;Where do you live?|где ты живёшь?|🏠;How old are you?|сколько тебе лет?|🎂;What color is it?|какого это цвета?|🎨;Why?|почему?|🤔',
  'Поздравления#🎄#Happy birthday!|с днём рождения!|🎂;Happy New Year!|с Новым годом!|🎄;Merry Christmas!|счастливого Рождества!|🎅;Congratulations!|поздравляю!|🎉;Have a nice day!|хорошего дня!|🌞',
  "Друзья#🤗#Let's play together|давай играть вместе|🤗;You are my best friend|ты мой лучший друг|💖;Can I play with you?|можно с тобой поиграть?|🧩;Thank you for the gift|спасибо за подарок|🎁;I miss you|я скучаю по тебе|🥺",
  'Каникулы#🏖️#I am on holiday|я на каникулах|✈️;We go to the sea|мы едем на море|🌊;I swim in the sea|я плаваю в море|🏊;I build a sandcastle|я строю замок из песка|🏰;I eat ice cream|я ем мороженое|🍦',
  'Здоровье#🩺#I am sick|я болею|🤒;I have a headache|у меня болит голова|🤕;Wash your hands|мой руки|🧼;Eat vegetables|ешь овощи|🥦;Go to the doctor|иди к врачу|🧑‍⚕️',
  'Мои вещи#🎒#This is my bag|это мой рюкзак|🎒;This is your pen|это твоя ручка|🖊️;This is his ball|это его мяч|⚽;This is her doll|это её кукла|🎎;Is it your book?|это твоя книга?|📕',
  'Кем я стану#🌠#I want to be a doctor|я хочу стать врачом|🧑‍⚕️;I want to be a pilot|я хочу стать пилотом|🧑‍✈️;I want to be an artist|я хочу стать художником|🧑‍🎨;I want to be a cook|я хочу стать поваром|🧑‍🍳;I dream about space|я мечтаю о космосе|🚀',
  'Я люблю английский#🏆#I love English|я люблю английский|💖;English is fun|английский — это весело|🎉;I can speak English|я говорю по-английски|🗣️;I learn new words|я учу новые слова|📚;I am a champion|я чемпион|🏆',
];

function build(): Lesson[] {
  const out: Lesson[] = [];
  for (let i = 0; i < 24; i += 4) {
    const words = ABC.slice(i, i === 20 ? 26 : i + 4);
    out.push({ title: `Буквы ${words[0].en}–${words[words.length - 1].en}`, icon: words[0].en, words, abc: true });
  }
  out[0].section = 'Алфавит 🔤';
  out.push({ title: 'Весь алфавит', icon: '🔠', words: ABC, abc: true, review: true });

  // После каждых 4 уроков — повторение
  let buf: Lesson[] = [];
  let section = '';
  for (const s of C) {
    if (s[0] === '=') {
      section = s.slice(1);
      continue;
    }
    const [title, icon, w] = s.split('#');
    const l: Lesson = { title, icon, words: parse(w), section: section || undefined };
    section = '';
    out.push(l);
    buf.push(l);
    if (buf.length === 4) {
      out.push({ title: 'Повторение', icon: '🔁', words: buf.flatMap((x) => x.words), review: true });
      buf = [];
    }
  }
  const all = out.filter((l) => !l.review && !l.abc).flatMap((l) => l.words);
  out.push({ title: 'Финальный экзамен', icon: '🎓', words: all, review: true, section: 'Финал 🎓' });
  return out;
}

export const LESSONS = build();
