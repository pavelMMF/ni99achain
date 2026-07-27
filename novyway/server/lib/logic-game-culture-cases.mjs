const FAMILY_LABELS = {
  'ad-hominem': { ru: 'Переход на личность', en: 'Ad hominem' },
  bandwagon: { ru: 'Довод большинством', en: 'Appeal to popularity' },
  'false-dilemma': { ru: 'Ложная дилемма', en: 'False dilemma' },
  'slippery-slope': { ru: 'Скользкий склон', en: 'Slippery slope' },
  'hasty-generalization': { ru: 'Поспешное обобщение', en: 'Hasty generalization' },
  'post-hoc': { ru: 'После — значит вследствие', en: 'Post hoc' },
  'circular-reasoning': { ru: 'Круг в доказательстве', en: 'Circular reasoning' },
  'straw-man': { ru: 'Подмена тезиса', en: 'Straw man' },
  'false-authority': { ru: 'Неподходящий авторитет', en: 'Irrelevant authority' },
  tradition: { ru: 'Довод традицией', en: 'Appeal to tradition' },
  'sunk-cost': { ru: 'Невозвратные затраты', en: 'Sunk-cost fallacy' },
  equivocation: { ru: 'Подмена значения слова', en: 'Equivocation' },
  composition: { ru: 'Ошибка композиции', en: 'Fallacy of composition' },
  'base-rate': { ru: 'Игнорирование базовой частоты', en: 'Base-rate neglect' },
  survivorship: { ru: 'Ошибка выжившего', en: 'Survivorship bias' },
}

const FAMILY_EXPLANATIONS = {
  'ad-hominem': {
    ru: 'Качества или мотивы участника не опровергают его довод; нужно отвечать на основания самого тезиса.',
    en: 'A participant’s character or motives do not refute the argument; the reasons for the claim still need an answer.',
  },
  bandwagon: {
    ru: 'Распространённость мнения показывает его популярность, но сама по себе не подтверждает истинность.',
    en: 'The prevalence of a belief shows popularity, but popularity alone does not establish truth.',
  },
  'false-dilemma': {
    ru: 'Рассуждение искусственно оставляет два исхода, хотя контекст допускает промежуточные и независимые варианты.',
    en: 'The reasoning artificially leaves two outcomes even though the context allows intermediate and independent options.',
  },
  'slippery-slope': {
    ru: 'Первый шаг не доказывает неизбежность всей цепочки; для каждого перехода нужны отдельные основания.',
    en: 'The first step does not make the whole chain inevitable; every transition needs separate support.',
  },
  'hasty-generalization': {
    ru: 'Единичный или узкий пример не даёт достаточного основания для вывода обо всей группе или эпохе.',
    en: 'A single or narrow example does not support a conclusion about an entire group or era.',
  },
  'post-hoc': {
    ru: 'Последовательность событий ещё не устанавливает причинную связь между ними.',
    en: 'The order of events does not by itself establish a causal connection.',
  },
  'circular-reasoning': {
    ru: 'Вывод повторяет исходное утверждение другими словами вместо независимого доказательства.',
    en: 'The conclusion repeats the starting claim in different words instead of offering independent support.',
  },
  'straw-man': {
    ru: 'Исходный тезис заменён более грубой и удобной версией, которую легче опровергнуть.',
    en: 'The original claim is replaced with a cruder, easier-to-attack version.',
  },
  'false-authority': {
    ru: 'Статус или талант в одной области не создаёт компетентность в другом вопросе.',
    en: 'Status or talent in one field does not create expertise in a different question.',
  },
  tradition: {
    ru: 'Давность обычая объясняет его происхождение, но не доказывает, что он справедлив или полезен сейчас.',
    en: 'The age of a custom explains its origin but does not prove that it remains fair or useful.',
  },
  'sunk-cost': {
    ru: 'Уже понесённые потери нельзя вернуть; решение должно зависеть от будущих выгод, рисков и альтернатив.',
    en: 'Past losses cannot be recovered; the decision should depend on future benefits, risks, and alternatives.',
  },
  equivocation: {
    ru: 'Ключевое слово незаметно меняет значение, поэтому вывод не следует из исходной посылки.',
    en: 'A key word quietly changes meaning, so the conclusion does not follow from the original premise.',
  },
  composition: {
    ru: 'Свойство отдельной части нельзя автоматически переносить на целое без данных об их взаимодействии.',
    en: 'A property of one part cannot automatically be transferred to the whole without evidence about interaction.',
  },
  'base-rate': {
    ru: 'Яркая деталь вытесняет общую частоту событий, без которой нельзя разумно оценить вероятность.',
    en: 'A vivid detail displaces the general frequency needed for a reasonable probability estimate.',
  },
  survivorship: {
    ru: 'Видимые успешные примеры скрывают неудачные случаи, поэтому выборка искажает вывод.',
    en: 'Visible successes hide failed cases, so the observed sample distorts the conclusion.',
  },
}

const SOURCE_TYPES = {
  fiction: { ru: 'Вымышленный сюжет', en: 'Fictional story' },
  history: { ru: 'Историческая риторика', en: 'Historical rhetoric' },
  book: { ru: 'Идея деловой книги', en: 'Business-book idea' },
}

const PROMPTS = [
  { ru: 'Какой фрагмент содержит логическую ошибку?', en: 'Which fragment contains a reasoning error?' },
  { ru: 'Где вывод звучит убедительно, но не подтверждается приведёнными основаниями?', en: 'Where does the conclusion sound persuasive without support from the stated reasons?' },
  { ru: 'Какой из трёх фрагментов подменяет проверку довода логическим сокращением?', en: 'Which of the three fragments replaces examination of the claim with a reasoning shortcut?' },
  { ru: 'Найдите фрагмент, в котором наблюдение превращается в слишком сильный вывод.', en: 'Find the fragment where an observation is turned into an overstrong conclusion.' },
  { ru: 'В какой реплике для вывода не хватает независимых данных или промежуточных шагов?', en: 'Which statement lacks independent evidence or intermediate steps for its conclusion?' },
  { ru: 'Какое рассуждение следует отвергнуть, даже если его итог кажется правдоподобным?', en: 'Which line of reasoning should be rejected even if its conclusion seems plausible?' },
]

const SOURCES = {
  massEffect: ['Mass Effect: выборы Шепарда и политика Цитадели', 'Mass Effect: Shepard’s choices and Citadel politics', 'https://www.ea.com/games/mass-effect/mass-effect-legendary-edition'],
  crysis3: ['Crysis 3: Нью-Йорк под куполом и власть корпорации', 'Crysis 3: New York under the dome and corporate power', 'https://www.crytek.com/games/crysis3'],
  steinsGate: ['Steins;Gate: причинность, линии мира и цена эксперимента', 'Steins;Gate: causality, world lines, and the cost of experiment', 'https://www.spike-chunsoft.com/games/steinsgate-elite/'],
  witcher3: ['Ведьмак 3: политика, пророчества и выбор Геральта', 'The Witcher 3: politics, prophecy, and Geralt’s choices', 'https://www.thewitcher.com/en/en/witcher3'],
  cyberpunk2077: ['Киберпанк 2077: Найт-Сити, корпорации и личность', 'Cyberpunk 2077: Night City, corporations, and identity', 'https://www.cyberpunk.net/gb/en/'],
  lotr: ['Властелин колец: власть Кольца и союз свободных народов', 'The Lord of the Rings: the Ring’s power and the alliance of free peoples', 'https://www.tolkienestate.com/letters/letter-to-milton-waldman-publisher-1951/'],
  drive: ['Драйв: молчаливый водитель, долг и насилие', 'Drive: the silent driver, obligation, and violence', 'https://player.bfi.org.uk/subscription/film/watch-drive-2011-online'],
  bladeRunner: ['Бегущий по лезвию: память, эмпатия и созданная личность', 'Blade Runner: memory, empathy, and constructed identity', 'https://www.britannica.com/topic/Blade-Runner-film-by-Scott'],
  matrix: ['Матрица: выбор, контроль и достоверность опыта', 'The Matrix: choice, control, and the reliability of experience', 'https://www.warnerbros.com/movies/matrix'],
  ghostShell: ['Призрак в доспехах: сознание, сеть и кибернетическое тело', 'Ghost in the Shell: mind, network, and cybernetic body', 'https://www.bfi.org.uk/lists/six-films-ghost-shell-scarlett-johansson'],
  foundation: ['Основание: психоистория, империя и политический расчёт', 'Foundation: psychohistory, empire, and political calculation', 'https://www.penguinrandomhouse.com/books/5655/foundation-by-isaac-asimov/'],
  strugatsky: ['Миры Стругацких: прогрессорство, знание и ответственность', 'The Strugatskys’ worlds: intervention, knowledge, and responsibility', 'https://www.chicagoreviewpress.com/roadside-picnic-products-9781613743416.php'],
  martianChronicles: ['Марсианские хроники: колонизация, память и утрата', 'The Martian Chronicles: colonization, memory, and loss', 'https://www.penguinrandomhouse.com/books/676170/ray-bradbury-novels-and-story-cycles-loa-347-by-ray-bradbury--jonathan-r-eller-editor/9781598537000/'],
  stsiborsky: ['Микола Сциборский и «Нациократия»: энциклопедическая справка', 'Mykola Stsiborsky and Natsiocracy: encyclopedia entry', 'https://www.encyclopediaofukraine.com/display.asp?linkpath=pages%5CS%5CT%5CStsiborskyMykola.htm'],
  bandera: ['Степан Бандера: биография и политический контекст', 'Stepan Bandera: biography and political context', 'https://www.encyclopediaofukraine.com/display.asp?linkPath=pages%5CB%5CA%5CBanderaStepan.htm'],
  hitler: ['Музей Холокоста США: нацистская пропаганда', 'United States Holocaust Memorial Museum: Nazi propaganda', 'https://encyclopedia.ushmm.org/content/en/article/nazi-propaganda'],
  stalin: ['Иосиф Сталин: энциклопедический обзор диктатуры', 'Joseph Stalin: encyclopedia overview of the dictatorship', 'https://www.britannica.com/biography/Joseph-Stalin'],
  roosevelt: ['Национальный архив США: ежегодное послание Рузвельта Конгрессу', 'National Archives: Roosevelt’s annual message to Congress', 'https://www.archives.gov/milestone-documents/president-franklin-roosevelts-annual-message-to-congress'],
  churchill: ['Архив Черчилля: речи и исторические документы', 'Churchill Archive: speeches and historical documents', 'https://www.churchillarchive.com/'],
  hirohito: ['Офис историка Госдепартамента США: решение Японии о капитуляции', 'Office of the Historian, U.S. Department of State: Japan’s surrender decision', 'https://history.state.gov/historicaldocuments/frus1945v07/d247'],
  mao: ['Мао Цзэдун: энциклопедический обзор правления и риторики', 'Mao Zedong: encyclopedia overview of rule and rhetoric', 'https://www.britannica.com/biography/Mao-Zedong'],
  trump: ['Архив выступлений Белого дома: речи Дональда Трампа', 'Archived White House remarks: Donald Trump speeches', 'https://trumpwhitehouse.archives.gov/remarks/'],
  atomicHabits: ['Атомные привычки: обзор автора', 'Atomic Habits: author’s overview', 'https://jamesclear.com/atomic-habits-summary'],
  sevenHabits: ['Семь навыков высокоэффективных людей: обзор издателя', 'The 7 Habits of Highly Effective People: publisher overview', 'https://www.simonandschuster.com/books/The-7-Habits-of-Highly-Effective-People/Stephen-R-Covey/The-Covey-Habits-Series/9781982137137'],
  richDad: ['Богатый папа, бедный папа: описание книги', 'Rich Dad Poor Dad: book description', 'https://www.richdad.com/rich-dad-poor-dad'],
  thinkGrow: ['Думай и богатей: описание издателя', 'Think and Grow Rich: publisher description', 'https://www.penguinrandomhouse.com/books/80093/think-and-grow-rich-by-napoleon-hill/'],
  fourHour: ['Четырёхчасовая рабочая неделя: описание автора', 'The 4-Hour Workweek: author’s description', 'https://www.penguinrandomhouse.com/books/49081/the-4-hour-workweek-expanded-and-updated-by-timothy-ferriss/'],
  secret: ['Тайна: описание книги издателем', 'The Secret: publisher description', 'https://www.simonandschuster.com/books/The-Secret/Rhonda-Byrne/9781582701707'],
  zeroOne: ['От нуля к единице: описание издателя', 'Zero to One: publisher description', 'https://www.penguinrandomhouse.com/books/234616/zero-to-one-by-peter-thiel-with-blake-masters/'],
  leanStartup: ['Бережливый стартап: описание автора', 'The Lean Startup: author’s description', 'https://theleanstartup.com/book'],
  goodGreat: ['От хорошего к великому: описание автора', 'Good to Great: author’s description', 'https://www.jimcollins.com/books/good-to-great.html'],
  cheese: ['Кто украл мой сыр?: описание издателя', 'Who Moved My Cheese?: publisher description', 'https://www.penguinrandomhouse.com/books/291680/who-moved-my-cheese-by-spencer-johnson/'],
}

const FICTION_GROUPS = [
  ['massEffect', [
    ['Совет Цитадели оценивает предупреждение Шепарда о новой угрозе.', 'The Citadel Council evaluates Shepard’s warning about a new threat.'],
    ['Команда спорит, можно ли доверять бывшему противнику перед общей миссией.', 'The crew debates whether a former enemy can be trusted on a shared mission.'],
    ['Кроганское лекарство обсуждают как военное средство и как моральный долг.', 'The krogan cure is discussed as both a military tool and a moral obligation.'],
    ['Кварианцы и геты по-разному объясняют давнюю войну и нынешний риск.', 'Quarians and geth explain the old war and the present risk differently.'],
    ['Спектр требует свободы действий, но должен обосновать цену для мирных жителей.', 'A Spectre demands operational freedom but must justify the cost to civilians.'],
    ['Экипаж сравнивает личную верность командиру с проверкой его решения.', 'The crew compares personal loyalty to a commander with scrutiny of the decision.'],
    ['Политики считают одну удачную операцию доказательством верной стратегии.', 'Politicians treat one successful operation as proof of a sound strategy.'],
    ['Союзники решают, продолжать ли план после крупных уже понесённых потерь.', 'The allies decide whether to continue a plan after major losses already incurred.'],
    ['Разговор о синтетиках смешивает разумность, управляемость и право на жизнь.', 'A debate about synthetics mixes intelligence, controllability, and a right to live.'],
  ]],
  ['crysis3', [
    ['Отряд оценивает обещание корпорации защищать город под энергетическим куполом.', 'The squad evaluates a corporation’s promise to protect the city under an energy dome.'],
    ['Пророк отделяет полезность нанокостюма от влияния костюма на личность.', 'Prophet separates the nanosuit’s utility from its influence on identity.'],
    ['Повстанцы спорят, оправдывает ли победа любой ущерб городской инфраструктуре.', 'The rebels debate whether victory justifies any damage to city infrastructure.'],
    ['Один успешный налёт принимают за модель всей кампании против корпорации.', 'One successful raid is treated as a model for the entire campaign against the corporation.'],
    ['Командование связывает появление угрозы с недавним включением новой системы.', 'Command links the appearance of a threat to the recent activation of a new system.'],
    ['Бойцы решают, сохранять ли опасный проект после многих лет вложений.', 'The fighters decide whether to retain a dangerous project after years of investment.'],
    ['Городские слухи о пришельцах сравнивают с доступными разведданными.', 'City rumors about aliens are compared with the available intelligence.'],
  ]],
  ['steinsGate', [
    ['Лаборатория обсуждает, доказывает ли изменение линии мира конкретную причину.', 'The laboratory debates whether a world-line change proves a specific cause.'],
    ['Один удачный опыт с сообщением превращают в правило для всех экспериментов.', 'One successful messaging experiment is turned into a rule for every experiment.'],
    ['Участники отделяют научный титул от способности оценить моральный риск.', 'The participants separate scientific credentials from the ability to assess moral risk.'],
    ['Решение продолжать опыты оценивают после уже понесённых личных потерь.', 'The decision to continue experiments is assessed after personal losses already suffered.'],
    ['Слово «наблюдатель» используют то как свидетеля, то как причину события.', 'The word “observer” is used first for a witness and then for a cause of events.'],
    ['Неудачу одной линии мира переносят на все возможные варианты будущего.', 'The failure of one world line is extended to every possible future.'],
    ['Предупреждение о риске подменяют требованием навсегда отказаться от науки.', 'A warning about risk is recast as a demand to abandon science forever.'],
    ['Популярность городской легенды принимают за подтверждение её механизма.', 'The popularity of an urban legend is treated as proof of its mechanism.'],
    ['Выжившие после эксперимента дают советы без учёта тех, кто потерял возможность ответить.', 'Experiment survivors give advice without accounting for those who lost the chance to respond.'],
  ]],
  ['witcher3', [
    ['Геральт проверяет, делает ли древнее пророчество один исход неизбежным.', 'Geralt tests whether an ancient prophecy makes one outcome inevitable.'],
    ['Жители деревни судят обо всех ведьмаках по одному пугающему случаю.', 'Villagers judge all witchers by one frightening incident.'],
    ['Правитель сводит политический выбор к покорности или полному хаосу.', 'A ruler reduces a political choice to obedience or total chaos.'],
    ['Охотник на чудовищ отделяет свидетельства очевидцев от слухов толпы.', 'A monster hunter separates eyewitness evidence from crowd rumor.'],
    ['Чародейку объявляют неправой из-за её прошлого, не разбирая предложение.', 'A sorceress is declared wrong because of her past without examining her proposal.'],
    ['Давний обычай деревни используют как единственное оправдание жертвы.', 'An old village custom is used as the sole justification for a sacrifice.'],
    ['После снятия проклятия удачу немедленно приписывают одному ритуалу.', 'After a curse is lifted, the success is immediately attributed to one ritual.'],
    ['Умение одного солдата переносят на боеспособность всей армии.', 'One soldier’s skill is transferred to the fighting ability of an entire army.'],
    ['Цена прошлых поисков влияет на решение продолжать опасную погоню.', 'The cost of the past search influences whether to continue a dangerous pursuit.'],
  ]],
  ['cyberpunk2077', [
    ['Корпорация называет контроль данных безопасностью и свободой одновременно.', 'A corporation calls control of data both security and freedom.'],
    ['Наёмник оценивает риск контракта отдельно от репутации заказчика.', 'A mercenary evaluates a contract’s risk separately from the client’s reputation.'],
    ['Жители Найт-Сити считают модную имплантацию доказательством её безопасности.', 'Night City residents treat a fashionable implant as proof of its safety.'],
    ['Один переживший опасную операцию становится образцом для всех клиентов клиники.', 'One survivor of a dangerous operation becomes the model for every clinic patient.'],
    ['Спор о цифровой копии сознания смешивает память, личность и право собственности.', 'A dispute over a digital mind copy mixes memory, identity, and ownership.'],
    ['Банда переносит храбрость отдельных бойцов на надёжность всей организации.', 'A gang transfers the courage of individual fighters to the reliability of the whole organization.'],
    ['После установки импланта сбой сети объявляют его прямым следствием.', 'A network failure after an implant is installed is declared its direct consequence.'],
    ['Вложенные в ограбление ресурсы используют как причину не отменять провальный план.', 'Resources invested in a heist are used as a reason not to cancel a failing plan.'],
    ['Критику корпоративного надзора подменяют призывом уничтожить любую технологию.', 'Criticism of corporate surveillance is recast as a call to destroy all technology.'],
  ]],
  ['lotr', [
    ['Совет обсуждает, можно ли использовать Кольцо против его создателя.', 'The council debates whether the Ring can be used against its maker.'],
    ['Недоверие к одному союзнику распространяют на весь его народ.', 'Distrust of one ally is extended to that ally’s entire people.'],
    ['Древность королевского обычая принимают за достаточное доказательство его мудрости.', 'The age of a royal custom is treated as sufficient proof of its wisdom.'],
    ['Героизм одного воина переносят на силу всего отряда.', 'One warrior’s heroism is transferred to the strength of the entire company.'],
    ['После прибытия незнакомца несчастье считают вызванным именно им.', 'A misfortune after a stranger arrives is treated as caused by that stranger.'],
    ['План похода защищают тем, что верный план обязан вести к победе.', 'A campaign plan is defended by saying that a true plan must lead to victory.'],
    ['Предложение отступить для перегруппировки подменяют призывом сдаться навсегда.', 'A proposal to retreat and regroup is recast as a call to surrender forever.'],
    ['Песни о вернувшихся героях скрывают судьбы тех, кто не дошёл домой.', 'Songs about returning heroes hide the fates of those who never came home.'],
    ['Выбор между прямой атакой и бездействием не учитывает тайные и дипломатические пути.', 'A choice between direct attack and inaction ignores covert and diplomatic paths.'],
  ]],
  ['drive', [
    ['Водитель отличает личный долг перед семьёй от обязанности принять любой риск.', 'The driver distinguishes personal obligation to a family from a duty to accept every risk.'],
    ['Один спокойный поступок считают доказательством полной безопасности незнакомца.', 'One calm action is treated as proof that a stranger is entirely safe.'],
    ['После встречи героя с преступниками последующее насилие объясняют только этой встречей.', 'Violence after the hero meets criminals is explained solely by that meeting.'],
    ['Молчаливость персонажа используют вместо ответа на его практическое предложение.', 'A character’s silence is used instead of answering his practical proposal.'],
    ['Успешный побег принимают за подтверждение безошибочности всей схемы.', 'A successful escape is treated as proof that the entire scheme is flawless.'],
    ['Затраты на подготовку ограбления становятся доводом продолжать после изменения условий.', 'Preparation costs become a reason to continue a robbery after conditions change.'],
    ['Верность отдельного сообщника переносят на надёжность всей преступной группы.', 'One accomplice’s loyalty is transferred to the reliability of the entire criminal group.'],
  ]],
  ['bladeRunner', [
    ['Следователь проверяет, достаточно ли воспоминаний для вывода о происхождении личности.', 'An investigator tests whether memories are enough to establish a person’s origin.'],
    ['Эмпатию одного репликанта переносят на свойства всех созданных существ.', 'One replicant’s empathy is extended to every created being.'],
    ['Юридическое слово «человек» смешивают с биологическим и моральным значениями.', 'The legal word “human” is mixed with its biological and moral meanings.'],
    ['Опасность одного беглеца становится оправданием подозрения ко всей группе.', 'The danger posed by one fugitive becomes grounds for suspecting the entire group.'],
    ['Создателя считают специалистом по моральной ценности созданной им жизни.', 'A creator is treated as an expert on the moral worth of the life he created.'],
    ['После появления искусственной памяти новое поведение приписывают только ей.', 'New behavior after an artificial memory appears is attributed solely to that memory.'],
    ['Критику теста на эмпатию подменяют утверждением, будто любые проверки бессмысленны.', 'Criticism of an empathy test is recast as the claim that all testing is meaningless.'],
  ]],
  ['matrix', [
    ['Герои различают субъективную убедительность опыта и его внешнюю проверку.', 'The heroes distinguish the subjective force of experience from external verification.'],
    ['Один сбой программы считают доказательством ложности любого восприятия.', 'One program failure is treated as proof that every perception is false.'],
    ['Выбор красной или синей таблетки представляют как единственные жизненные пути.', 'The choice between red and blue pills is presented as the only possible path in life.'],
    ['После пробуждения героя каждое совпадение объясняют вмешательством системы.', 'After the hero awakens, every coincidence is explained as system interference.'],
    ['Слова прорицательницы принимают за доказательство только из-за её репутации.', 'An oracle’s words are treated as proof solely because of her reputation.'],
    ['Успех освободившихся людей скрывает тех, чьи попытки закончились неудачей.', 'The success of freed people hides those whose attempts failed.'],
    ['Навык отдельного бойца переносят на непобедимость всего сопротивления.', 'One fighter’s skill is transferred to the invincibility of the whole resistance.'],
  ]],
  ['ghostShell', [
    ['Следствие различает копию памяти и непрерывность личности.', 'The investigation distinguishes a copied memory from continuity of identity.'],
    ['Один взломанный кибермозг принимают за доказательство уязвимости каждого гражданина.', 'One hacked cyberbrain is treated as proof that every citizen is vulnerable.'],
    ['Сетевую популярность идеи считают подтверждением её истинности.', 'An idea’s online popularity is treated as confirmation of its truth.'],
    ['Слово «призрак» используют то для самосознания, то для необъяснимого остатка.', 'The word “ghost” is used first for self-awareness and then for an unexplained residue.'],
    ['Авторитет опытного оперативника заменяет техническую проверку кода.', 'The authority of an experienced operative replaces a technical inspection of code.'],
    ['После подключения к сети изменение поведения объявляют следствием подключения.', 'A behavior change after a network connection is declared to have been caused by it.'],
    ['Опасность автономной программы переносят на любую форму искусственного разума.', 'The danger of one autonomous program is extended to every form of artificial intelligence.'],
  ]],
  ['foundation', [
    ['Политики отличают статистический прогноз для масс от судьбы отдельного человека.', 'Politicians distinguish a statistical forecast for populations from one person’s fate.'],
    ['Успех одного кризисного плана принимают за безошибочность психоистории.', 'One successful crisis plan is treated as proof that psychohistory is infallible.'],
    ['Имперскую традицию используют как единственную причину сохранять институт.', 'Imperial tradition is used as the sole reason to preserve an institution.'],
    ['После предсказания кризиса его наступление приписывают самому предсказанию.', 'After a crisis is predicted, its arrival is attributed to the prediction itself.'],
    ['Возражение торговца отвергают из-за его выгоды, не проверяя факты.', 'A trader’s objection is rejected because of his profit motive without checking the facts.'],
    ['Падение одной провинции переносят на неизбежный распад всей Империи.', 'The fall of one province is extended to the inevitable collapse of the entire Empire.'],
    ['Два политических исхода объявляют единственными, исключая локальные союзы.', 'Two political outcomes are declared exhaustive, excluding local alliances.'],
    ['Истории успешных миров скрывают планеты, где та же стратегия провалилась.', 'Stories of successful worlds hide planets where the same strategy failed.'],
  ]],
  ['strugatsky', [
    ['Прогрессоры спорят, даёт ли техническое превосходство моральное право вмешиваться.', 'Interventionists debate whether technical superiority grants a moral right to intervene.'],
    ['Один жестокий правитель становится основанием судить обо всём обществе.', 'One brutal ruler becomes the basis for judging an entire society.'],
    ['Наблюдение за будущим смешивают с правом управлять чужим выбором.', 'Observing a future is confused with a right to govern another society’s choices.'],
    ['После тайного вмешательства перемены объявляют его прямым результатом.', 'Changes after a covert intervention are declared its direct result.'],
    ['Критику прогрессорства подменяют требованием равнодушно смотреть на страдание.', 'Criticism of intervention is recast as a demand to watch suffering with indifference.'],
    ['Успешные вмешательства обсуждают без миссий, которые разрушили местные институты.', 'Successful interventions are discussed without missions that damaged local institutions.'],
  ]],
  ['martianChronicles', [
    ['Земные поселенцы считают привычный уклад достаточным основанием повторить его на Марсе.', 'Earth settlers treat familiar customs as enough reason to reproduce them on Mars.'],
    ['Исчезновение одного поселения объясняют событием, которое произошло незадолго до него.', 'The disappearance of one settlement is explained by an event that occurred shortly before it.'],
    ['Один враждебный контакт переносят на намерения всех марсиан.', 'One hostile contact is extended to the intentions of all Martians.'],
    ['Успех выживших колонистов скрывает экспедиции, которые не оставили рассказчиков.', 'The success of surviving colonists hides expeditions that left no storytellers.'],
    ['Освоение пустого дома приравнивают к моральному праву присвоить чужую историю.', 'Occupying an empty house is equated with a moral right to appropriate another people’s history.'],
    ['Критику колонизации подменяют запретом на любое путешествие и обмен знаниями.', 'Criticism of colonization is recast as a ban on all travel and exchange of knowledge.'],
  ]],
]

const HISTORY_GROUPS = [
  ['stsiborsky', [
    ['Авторитарную модель «Нациократии» разбирают как идеологический проект, а не как нейтральную науку.', 'The authoritarian model in Natsiocracy is examined as an ideological project, not neutral science.'],
    ['Корпоративное представительство объявляют выражением единой нации без проверки реального несогласия.', 'Corporate representation is presented as the voice of a unified nation without testing actual dissent.'],
    ['Критику партийной демократии превращают в доказательство необходимости единого центра власти.', 'Criticism of party democracy is turned into proof that a single center of power is necessary.'],
    ['Исторические кризисы используют для вывода, будто авторитарный переход неизбежно восстановит порядок.', 'Historical crises are used to claim that an authoritarian transition will inevitably restore order.'],
  ]],
  ['bandera', [
    ['Революционную дисциплину сторонники представляли как достаточное основание политической правоты.', 'Supporters presented revolutionary discipline as sufficient evidence of political correctness.'],
    ['Биографический символ национальной борьбы подменяет оценку конкретных методов и последствий.', 'A biographical symbol of national struggle replaces assessment of specific methods and consequences.'],
    ['Репрессии против движения используют для вывода, будто любая его стратегия была оправданной.', 'Repression against the movement is used to claim that every strategy it pursued was justified.'],
    ['Критику лидера подменяют отрицанием права общества на независимость.', 'Criticism of a leader is recast as denial of a society’s right to independence.'],
  ]],
  ['hitler', [
    ['Нацистская пропаганда изображала преследуемые группы причиной сложных общественных кризисов.', 'Nazi propaganda depicted persecuted groups as the cause of complex social crises.'],
    ['Культ вождя заменял проверку решений заявлением об особой исторической миссии.', 'The leader cult replaced scrutiny of decisions with claims of a special historical mission.'],
    ['Военные и экономические успехи использовали как подтверждение расистской идеологии.', 'Military and economic successes were used as confirmation of racist ideology.'],
    ['Несогласие с режимом представляли как выбор в пользу национального уничтожения.', 'Disagreement with the regime was presented as a choice in favor of national destruction.'],
  ]],
  ['stalin', [
    ['Политические провалы объясняли деятельностью врагов вместо проверки решений руководства.', 'Political failures were blamed on enemies instead of examining leadership decisions.'],
    ['Индустриальные достижения переносили на моральную оценку всей системы принуждения.', 'Industrial achievements were transferred to a moral judgment of the entire coercive system.'],
    ['Признания на показательных процессах использовали как круговое подтверждение обвинений.', 'Confessions in show trials were used as circular confirmation of accusations.'],
    ['Критику темпов политики представляли как стремление вернуть страну к беспомощности.', 'Criticism of policy speed was presented as a desire to return the country to helplessness.'],
  ]],
  ['roosevelt', [
    ['Образ общего страха рассматривают отдельно от доказательств эффективности конкретной программы.', 'The image of shared fear is considered separately from evidence for a specific program’s effectiveness.'],
    ['Популярную поддержку реформ нельзя принимать за самостоятельное доказательство каждого решения.', 'Popular support for reform cannot serve as independent proof for every decision.'],
    ['Успех одной меры восстановления не устанавливает результативность всего пакета автоматически.', 'The success of one recovery measure does not automatically establish the effectiveness of the entire package.'],
  ]],
  ['churchill', [
    ['Военная речь укрепляет решимость, но эмоциональная сила не заменяет оценку стратегии.', 'A wartime speech can strengthen resolve, but emotional force does not replace strategic assessment.'],
    ['Призыв к стойкости не означает, что любой риск или любая операция разумны.', 'A call for endurance does not mean that every risk or operation is sound.'],
    ['Послевоенный образ разделённой Европы проверяют по институтам и событиям, а не по славе оратора.', 'The postwar image of a divided Europe is tested against institutions and events, not the speaker’s fame.'],
  ]],
  ['hirohito', [
    ['Рескрипт о капитуляции смягчал описание поражения, и риторическую форму нужно отделять от фактов войны.', 'The surrender rescript softened the description of defeat, and its rhetoric must be separated from wartime facts.'],
    ['Ссылка на сохранение государства не доказывает, что прежняя политика была неизбежной.', 'An appeal to preserving the state does not prove that prior policy was inevitable.'],
    ['Императорский статус говорящего не заменяет анализа ответственности и причин капитуляции.', 'The speaker’s imperial status does not replace analysis of responsibility and the causes of surrender.'],
  ]],
  ['mao', [
    ['Массовую поддержку кампании нельзя считать доказательством верности её экономических предпосылок.', 'Mass support for a campaign cannot be treated as proof that its economic premises were correct.'],
    ['Отдельные образцовые коммуны не показывают результаты всех регионов и хозяйств.', 'Selected model communes do not show the outcomes across all regions and farms.'],
    ['Критику курса представляли как враждебность народу, не отвечая на данные о последствиях.', 'Criticism of policy was presented as hostility to the people without answering evidence about consequences.'],
  ]],
  ['trump', [
    ['Размер митинга используют как показатель поддержки, но он не заменяет репрезентативные данные.', 'Rally size is used as a sign of support, but it does not replace representative evidence.'],
    ['Сложный политический спор сводят к выбору между полной лояльностью и предательством страны.', 'A complex political dispute is reduced to a choice between total loyalty and betrayal of the country.'],
    ['Личный деловой образ используют как авторитет в вопросах, требующих иной экспертизы.', 'A personal business image is used as authority on questions requiring different expertise.'],
  ]],
]

const BOOK_GROUPS = [
  ['atomicHabits', [
    ['Малые повторяемые действия могут менять среду поведения, но не гарантируют любой поставленный результат.', 'Small repeated actions can reshape a behavioral environment but do not guarantee every desired outcome.'],
    ['Совет сосредоточиться на системе проверяют с учётом ресурсов, здоровья и внешних ограничений.', 'The advice to focus on systems is tested against resources, health, and external constraints.'],
  ]],
  ['sevenHabits', [
    ['Личную инициативу отделяют от контроля над обстоятельствами, которые человеку не подчиняются.', 'Personal initiative is separated from control over circumstances beyond a person’s power.'],
    ['Принцип взаимной выгоды полезен как ориентир, но не описывает каждый конфликт интересов.', 'Mutual benefit is useful as a guide but does not describe every conflict of interest.'],
  ]],
  ['richDad', [
    ['Различие активов и обязательств помогает задавать вопросы, но не заменяет бухгалтерский анализ.', 'The asset-liability distinction helps frame questions but does not replace accounting analysis.'],
    ['Успешная история инвестора не показывает частоту неудач среди людей с похожей стратегией.', 'A successful investor’s story does not reveal failure rates among people using a similar strategy.'],
  ]],
  ['thinkGrow', [
    ['Настойчивость может поддерживать работу, но сильное желание не устанавливает причин успеха.', 'Persistence can sustain effort, but intense desire does not establish the cause of success.'],
    ['Биографии победителей нужно сравнивать с людьми, применявшими те же советы без результата.', 'Winner biographies must be compared with people who followed the same advice without success.'],
  ]],
  ['fourHour', [
    ['Автоматизация экономит время в некоторых профессиях, но её пределы зависят от вида работы.', 'Automation saves time in some occupations, but its limits depend on the work involved.'],
    ['Пример прибыльного удалённого бизнеса не устанавливает типичный доход для всех читателей.', 'One profitable remote business does not establish typical income for every reader.'],
  ]],
  ['secret', [
    ['Позитивное внимание может менять поведение, но мысли сами по себе не доказывают внешнюю причинность.', 'Positive attention can change behavior, but thoughts alone do not establish external causation.'],
    ['Истории сбывшихся желаний не учитывают несбывшиеся ожидания и обычные совпадения.', 'Stories of fulfilled wishes omit unmet expectations and ordinary coincidences.'],
  ]],
  ['zeroOne', [
    ['Создание нового рынка может дать преимущество, но монополия не становится благом по определению.', 'Creating a new market can provide an advantage, but monopoly is not good by definition.'],
    ['Опыт нескольких технологических компаний не переносится без проверки на любую отрасль.', 'The experience of several technology companies cannot be transferred to every industry without testing.'],
  ]],
  ['leanStartup', [
    ['Быстрый эксперимент сокращает неопределённость только при измеримом вопросе и подходящей выборке.', 'A rapid experiment reduces uncertainty only with a measurable question and a suitable sample.'],
    ['Уже вложенные месяцы разработки не оправдывают продолжение продукта без спроса.', 'Months already invested in development do not justify continuing a product with no demand.'],
  ]],
  ['goodGreat', [
    ['Черты отобранных успешных компаний нужно сравнивать с похожими компаниями, которые не преуспели.', 'Traits of selected successful companies must be compared with similar companies that did not prosper.'],
    ['Дисциплина отдельных руководителей не делает всю организацию дисциплинированной автоматически.', 'Discipline among individual executives does not automatically make an entire organization disciplined.'],
  ]],
  ['cheese', [
    ['Готовность к переменам полезна, но не превращает каждое внешнее изменение в разумное или справедливое.', 'Readiness for change is useful, but it does not make every external change reasonable or fair.'],
  ]],
]

const FALLACY_SEGMENTS = {
  'ad-hominem': [
    ['Этот вывод выдвигает явно корыстный участник, поэтому разбирать его фактические основания незачем.', 'The claim comes from an obviously self-interested participant, so its factual grounds need no examination.'],
    ['Автор рассуждения проявил слабость в другом эпизоде, а значит нынешний довод заведомо ложен.', 'The speaker showed weakness in another episode, so the present argument must be false.'],
    ['Сторонник тезиса неприятен и непоследователен; одного этого достаточно, чтобы считать тезис опровергнутым.', 'The claim’s advocate is unpleasant and inconsistent; that alone is enough to refute the claim.'],
  ],
  bandwagon: [
    ['Большинство участников принимает это объяснение, следовательно оно верно и дополнительная проверка не нужна.', 'Most participants accept this explanation, so it is true and needs no further testing.'],
    ['Эта версия стала самой популярной, а популярное толкование не может быть ошибочным.', 'This account became the most popular one, and a popular interpretation cannot be mistaken.'],
    ['Все вокруг повторяют такой вывод; общественное согласие само по себе доказывает его истинность.', 'Everyone repeats this conclusion; public agreement by itself proves that it is true.'],
  ],
  'false-dilemma': [
    ['Возможны только два исхода: полностью принять этот план или сознательно выбрать катастрофу.', 'Only two outcomes exist: accept this plan completely or deliberately choose disaster.'],
    ['Либо участники без оговорок согласны с решением, либо они вообще не хотят решать проблему.', 'Either the participants support the decision without qualification or they do not want to solve the problem at all.'],
    ['Здесь остаётся выбор между немедленным действием и вечным бездействием; иных путей быть не может.', 'The only choice is immediate action or permanent inaction; no other path can exist.'],
  ],
  'slippery-slope': [
    ['Стоит допустить первый шаг, и дальше неизбежно исчезнут все ограничения, а система полностью разрушится.', 'Allow the first step and every limit will inevitably disappear until the whole system collapses.'],
    ['Одна уступка обязательно вызовет следующую, затем ещё одну, и остановить окончательную катастрофу уже не удастся.', 'One concession must trigger another and then another until the final disaster can no longer be stopped.'],
    ['Если принять это частное решение, оно без дополнительных причин приведёт ко всем самым тяжёлым последствиям.', 'If this limited decision is accepted, it will lead to every worst consequence without any additional cause.'],
  ],
  'hasty-generalization': [
    ['Один яркий эпизод показывает, что все подобные люди и решения всегда устроены одинаково.', 'One vivid episode shows that all similar people and decisions always work the same way.'],
    ['Этот единственный пример полностью раскрывает правило для любой ситуации того же рода.', 'This single example fully establishes the rule for every situation of the same kind.'],
    ['После одного случая можно уверенно судить обо всей группе, не собирая дополнительных наблюдений.', 'After one case, the entire group can be judged confidently without gathering more observations.'],
  ],
  'post-hoc': [
    ['Второе событие произошло после первого, значит первое несомненно было его единственной причиной.', 'The second event followed the first, so the first event was unquestionably its sole cause.'],
    ['Перемена началась сразу после решения; одной последовательности достаточно, чтобы доказать причинность.', 'The change began right after the decision; sequence alone is enough to prove causation.'],
    ['Поскольку последствия появились позже, их можно без проверки целиком приписать предыдущему событию.', 'Because the consequences appeared later, they can be attributed entirely to the preceding event without testing.'],
  ],
  'circular-reasoning': [
    ['Вывод объявляют верным, потому что объяснение правильное, а правильность объяснения подтверждают тем же выводом.', 'The conclusion is declared true because the explanation is correct, while the explanation is called correct because it yields that conclusion.'],
    ['Тезис считают надёжным из-за верности исходной версии, а верность версии доказывают только этим же тезисом.', 'The claim is treated as reliable because the original account is true, while that account is supported only by the same claim.'],
    ['Решение называют обоснованным, потому что оно разумно, а его разумность выводят лишь из заявления об обоснованности.', 'The decision is called justified because it is reasonable, while its reasonableness is inferred only from the claim that it is justified.'],
  ],  'straw-man': [
    ['Осторожная просьба проверить риск на самом деле означает требование навсегда запретить любые действия.', 'A cautious request to assess risk really means a demand to ban every action forever.'],
    ['Критику одного решения можно пересказать как отрицание всех целей и ценностей другой стороны.', 'Criticism of one decision can be restated as rejection of every goal and value held by the other side.'],
    ['Предложение ограничить конкретный метод равносильно желанию уничтожить весь проект целиком.', 'A proposal to limit one method is equivalent to wanting to destroy the entire project.'],
  ],
  'false-authority': [
    ['Известная фигура добилась успеха в другой области, поэтому её мнение объявляют окончательным ответом на этот специальный вопрос.', 'A famous figure succeeded in another field, so that person’s opinion is treated as the final answer to this specialized question.'],
    ['Влиятельный участник поддержал вывод, поэтому его известность принимают вместо проверки данных и профильной компетентности.', 'An influential participant endorsed the conclusion, so fame is accepted instead of checking evidence and relevant expertise.'],
    ['Человек с высоким статусом уверен в объяснении, поэтому относящиеся к делу возражения предлагают не рассматривать.', 'A high-status person is confident in the explanation, so relevant objections are dismissed without examination.'],
  ],  tradition: [
    ['Так поступали много поколений, поэтому обычай остаётся правильным и обсуждать его последствия незачем.', 'Many generations acted this way, so the custom remains right and its consequences need no discussion.'],
    ['Правило древнее, а значит оно непременно мудрее любой современной альтернативы.', 'The rule is ancient, so it must be wiser than every modern alternative.'],
    ['Привычный порядок существовал давно; одна эта давность доказывает его справедливость сегодня.', 'The familiar order has existed for a long time; age alone proves that it is fair today.'],
  ],
  'sunk-cost': [
    ['Слишком многое уже потеряно и вложено, поэтому план нужно продолжать независимо от будущих рисков.', 'Too much has already been lost and invested, so the plan must continue regardless of future risks.'],
    ['Отказ сейчас сделает прошлые усилия напрасными, следовательно новые затраты обязательны даже без ожидаемой пользы.', 'Stopping now would waste past effort, so further spending is required even without expected benefit.'],
    ['Многолетняя работа над решением сама по себе доказывает, что от него нельзя отказаться после новых данных.', 'Years spent on the decision prove by themselves that it cannot be abandoned after new evidence.'],
  ],
  equivocation: [
    ['Ключевое слово сначала употребляют в узком смысле, а в выводе незаметно придают ему более широкое значение.', 'A key word is first used in a narrow sense and then quietly given a broader meaning in the conclusion.'],
    ['Термин в первой посылке обозначает наблюдаемый факт, а в выводе уже выражает моральную оценку того же события.', 'A term denotes an observable fact in the first premise but becomes a moral judgment about the same event in the conclusion.'],
    ['Одно понятие сначала означает снижение отдельного риска, а затем превращается в гарантию отсутствия любых опасностей.', 'One concept first means reducing a particular risk and then changes into a guarantee that no danger exists.'],
  ],  composition: [
    ['Каждая заметная часть выглядит сильной, следовательно вся система обязательно сильна при любом взаимодействии частей.', 'Every visible part looks strong, so the whole system must be strong under every interaction among its parts.'],
    ['Один участник надёжен, а значит вся организация автоматически заслуживает такого же доверия.', 'One participant is reliable, so the entire organization automatically deserves the same trust.'],
    ['Отдельные элементы полезны сами по себе, следовательно их сочетание не может дать вредного результата.', 'The individual elements are useful alone, so their combination cannot produce a harmful result.'],
  ],
  'base-rate': [
    ['Один необычный и яркий случай делает этот исход почти неизбежным, даже если общая частота очень мала.', 'One unusual and vivid case makes this outcome nearly certain even if its general frequency is very low.'],
    ['Запомнившийся пример важнее статистики похожих случаев и позволяет уверенно назвать самый вероятный исход.', 'A memorable example outweighs statistics from similar cases and identifies the most likely outcome with confidence.'],
    ['Редкий признак появился в рассказе, поэтому базовую частоту альтернативных объяснений можно не учитывать.', 'A rare sign appears in the story, so the base rates of alternative explanations can be ignored.'],
  ],
  survivorship: [
    ['Известны только победители, применявшие этот подход, значит подход почти всегда приводит к победе.', 'Only winners who used this approach are visible, so the approach almost always produces victory.'],
    ['Сохранившиеся истории успеха полностью показывают результат метода, хотя о неудачных случаях никто не рассказывает.', 'Surviving success stories fully reveal the method’s outcome even though failed cases are never reported.'],
    ['Все доступные рассказчики прошли испытание, следовательно большинство начинавших тоже должны были его пройти.', 'Every available narrator survived the trial, so most of those who started must have survived as well.'],
  ],
}

const FAMILY_SOUND_SEGMENTS = {
  'ad-hominem': [
    ['Характер участника может подсказать возможную предвзятость, но сам тезис нужно сверить с фактами сцены.', 'A participant’s character may suggest possible bias, but the claim itself must be checked against the facts of the scene.'],
    ['Даже у ненадёжного героя бывает верный довод, поэтому ответ должен касаться причин, а не личности.', 'Even an unreliable character can make a sound point, so the response should address reasons rather than personality.'],
    ['Конфликт интересов стоит отметить и затем поискать независимое подтверждение спорного утверждения.', 'A conflict of interest should be noted and followed by a search for independent confirmation of the disputed claim.'],
    ['Доверие к говорящему и истинность его конкретного вывода — разные вопросы, требующие разных данных.', 'Trust in the speaker and the truth of the specific conclusion are different questions requiring different evidence.'],
  ],
  bandwagon: [
    ['Согласие толпы показывает настроение участников сцены, но истинность версии проверяется отдельными свидетельствами.', 'Crowd agreement shows the mood of the participants, while the truth of the account requires separate evidence.'],
    ['Популярность решения можно измерить, не превращая число сторонников в доказательство его качества.', 'The popularity of a decision can be measured without turning the number of supporters into proof of its quality.'],
    ['Мнение большинства важно для политических последствий, однако фактический прогноз нужно проверять независимо.', 'Majority opinion matters for political consequences, but the factual forecast must be tested independently.'],
    ['Причины общего согласия могут включать страх, моду или давление, поэтому полезно изучить способ формирования поддержки.', 'Shared agreement may reflect fear, fashion, or pressure, so the way support formed should be examined.'],
  ],
  'false-dilemma': [
    ['Перед выбором стоит перечислить промежуточные меры, отсрочку и сочетания решений, исключённые из двух вариантов.', 'Before choosing, list intermediate measures, delays, and combinations excluded from the two stated options.'],
    ['Оба названных исхода можно отвергнуть, если в сцене доступен третий путь с иной ценой и риском.', 'Both stated outcomes can be rejected if the scene allows a third path with different costs and risks.'],
    ['Проверка дилеммы начинается с вопроса, действительно ли варианты несовместимы и исчерпывают возможности.', 'Testing the dilemma starts by asking whether the options are truly incompatible and exhaustive.'],
    ['Разные участники могут выбрать частичные или последовательные действия вместо полного принятия одной крайности.', 'Different participants may choose partial or sequential actions instead of fully accepting either extreme.'],
  ],
  'slippery-slope': [
    ['Для каждого перехода к следующему последствию нужен собственный механизм, а не одно слово «неизбежно».', 'Each transition to the next consequence needs its own mechanism rather than the single word “inevitable.”'],
    ['Можно оценить вероятность каждого шага цепочки и назвать барьеры, способные остановить развитие событий.', 'The probability of each step can be assessed along with barriers capable of stopping the chain.'],
    ['Ограниченное решение допускает предохранители, срок пересмотра и условия отмены без движения к крайнему исходу.', 'A limited decision can include safeguards, a review date, and reversal conditions without leading to the extreme outcome.'],
    ['Прогноз станет сильнее, если показать предыдущие случаи, где первый шаг действительно запускал всю заявленную последовательность.', 'The forecast becomes stronger if prior cases show that the first step actually triggered the entire claimed sequence.'],
  ],
  'hasty-generalization': [
    ['Один эпизод следует оставить единичным наблюдением, пока другие случаи не покажут устойчивую закономерность.', 'One episode should remain a single observation until other cases show a stable pattern.'],
    ['Для общего вывода нужны разнообразные примеры, правила отбора и сведения о случаях, противоречащих версии.', 'A general conclusion needs varied examples, selection rules, and cases that contradict the account.'],
    ['Этот случай может стать поводом для гипотезы, но не для утверждения обо всех людях или решениях такого типа.', 'This case can motivate a hypothesis but not a claim about every person or decision of that type.'],
    ['Размер и представительность выборки нужно оценить до переноса вывода за пределы описанной сцены.', 'Sample size and representativeness must be assessed before extending the conclusion beyond the scene described.'],
  ],
  'post-hoc': [
    ['Хронология известна, но причинность требует механизма и проверки других событий, произошедших в тот же период.', 'The chronology is known, but causation requires a mechanism and checks of other events in the same period.'],
    ['Можно сравнить случаи с первым событием и без него, чтобы увидеть, меняется ли вероятность второго.', 'Cases with and without the first event can be compared to see whether the probability of the second changes.'],
    ['Нужно исключить общую причину, которая могла независимо вызвать оба последовательных события.', 'A common cause that could independently produce both sequential events must be ruled out.'],
    ['Позднее событие совместимо с причинной связью, но одной очередности недостаточно для уверенного вывода.', 'The later event is compatible with causation, but timing alone is insufficient for a confident conclusion.'],
  ],
  'circular-reasoning': [
    ['Основание должно подтверждаться независимо от вывода, иначе рассуждение лишь повторяет исходную уверенность.', 'The premise must be supported independently of the conclusion, or the reasoning merely repeats its initial confidence.'],
    ['Полезно спросить, какое наблюдение могло бы опровергнуть тезис, а не считать тезис собственным доказательством.', 'Ask what observation could disprove the claim instead of treating the claim as its own evidence.'],
    ['Определение ключевого понятия не должно заранее включать именно тот результат, который требуется доказать.', 'The definition of the key term should not already contain the result that must be proved.'],
    ['Внешний документ, измерение или предсказание разорвёт круг, если получен без опоры на спорный вывод.', 'An external record, measurement, or prediction can break the circle if obtained without relying on the disputed conclusion.'],
  ],
  'straw-man': [
    ['Сначала нужно повторить исходное предложение в наиболее точной форме и получить подтверждение его автора.', 'First restate the original proposal as precisely as possible and have its author confirm the wording.'],
    ['Критика должна отвечать на заявленное ограничение, а не на более крайний запрет, которого никто не предлагал.', 'The criticism should answer the stated limitation rather than an extreme ban nobody proposed.'],
    ['Полезно разделить буквальный тезис, его возможные последствия и карикатурную версию, добавленную оппонентом.', 'Separate the literal claim, its possible consequences, and the caricature added by the opponent.'],
    ['Если спорная формулировка допускает два прочтения, уточнение сильнее, чем атака на самое неудобное прочтение.', 'If the disputed wording permits two readings, clarification is stronger than attacking the least charitable one.'],
  ],
  'false-authority': [
    ['Компетентность источника нужно сопоставить с предметом спора, а затем проверить приведённые им данные.', 'The source’s expertise should be matched to the disputed subject, followed by a check of the evidence provided.'],
    ['Известность или должность повышает внимание к мнению, но не заменяет профильные знания и проверяемый метод.', 'Fame or office may draw attention to an opinion but does not replace relevant expertise and a verifiable method.'],
    ['Даже подходящий специалист может ошибаться, поэтому важны согласие данных, прозрачность метода и независимая проверка.', 'Even a relevant expert can be wrong, so evidential fit, method transparency, and independent review still matter.'],
    ['Личный опыт авторитетной фигуры следует считать одним наблюдением, а не окончательным решением общего вопроса.', 'An authority figure’s personal experience should count as one observation rather than the final answer to a general question.'],
  ],
  tradition: [
    ['История обычая объясняет, почему он возник, а нынешние последствия показывают, стоит ли его сохранять.', 'The history of a custom explains why it arose, while present consequences show whether it should be retained.'],
    ['Старое правило можно сравнить с современными альтернативами по справедливости, риску и практическому результату.', 'An old rule can be compared with modern alternatives for fairness, risk, and practical outcome.'],
    ['Долгое существование порядка говорит об устойчивости, но может также отражать запрет на несогласие или отсутствие выбора.', 'A long-standing order may show stability, but it may also reflect suppressed dissent or lack of choice.'],
    ['Сохранить традицию разумно, если её польза подтверждается сейчас, а не только возрастом и привычностью.', 'Keeping a tradition is reasonable when its benefits hold now, not merely because it is old and familiar.'],
  ],
  'sunk-cost': [
    ['Решение следует принимать по будущим расходам, выгодам и рискам, поскольку прошлые вложения уже не вернуть.', 'The decision should depend on future costs, benefits, and risks because past investment cannot be recovered.'],
    ['Продолжение оправдано только ожидаемой пользой следующего шага, а не желанием придать смысл прежним потерям.', 'Continuing is justified only by the expected benefit of the next step, not by a wish to give meaning to past losses.'],
    ['Нужно сравнить остановку, изменение плана и новые вложения с одной и той же текущей точки.', 'Stopping, changing course, and investing more should be compared from the same present starting point.'],
    ['Признание неудачных затрат может быть болезненным, но оно не увеличивает ценность дальнейшего риска.', 'Acknowledging failed expenditure may be painful, but it does not increase the value of taking further risk.'],
  ],
  equivocation: [
    ['Ключевое слово нужно определить один раз и сохранить это значение во всех посылках и выводе.', 'The key word should be defined once and retain that meaning throughout the premises and conclusion.'],
    ['Если термин имеет юридический, бытовой и моральный смысл, каждый из них следует обозначить отдельно.', 'If a term has legal, everyday, and moral meanings, each one should be identified separately.'],
    ['Подстановка синонима допустима только тогда, когда объём понятия не меняется в середине рассуждения.', 'A synonym can be substituted only when the concept’s scope does not change midway through the reasoning.'],
    ['Уточнение того, что именно означает спорное слово в этой сцене, может снять видимое противоречие.', 'Clarifying what the disputed word means in this scene may dissolve the apparent contradiction.'],
  ],
  composition: [
    ['Свойства отдельных участников нужно дополнить данными об их взаимодействии перед выводом о всей системе.', 'Properties of individual participants must be supplemented with evidence about their interaction before judging the whole system.'],
    ['Сильные части могут конфликтовать, дублировать работу или создавать общий риск, которого нет у каждой по отдельности.', 'Strong parts may conflict, duplicate work, or create a collective risk absent from each part alone.'],
    ['Оценка целого требует показателей общего результата, а не простого сложения характеристик заметных элементов.', 'Assessing the whole requires measures of collective performance rather than simply adding traits of visible elements.'],
    ['Перенос свойства части допустим лишь при известном правиле, связывающем устройство частей с поведением целого.', 'A property may be transferred from part to whole only when a known rule connects component structure to collective behavior.'],
  ],
  'base-rate': [
    ['Яркий признак нужно объединить с частотой возможных исходов в подходящей группе сравнения.', 'The vivid clue must be combined with outcome frequencies in an appropriate reference group.'],
    ['Сначала следует выбрать базовый класс случаев, а затем оценить, насколько новое свидетельство меняет исходную вероятность.', 'First choose the relevant class of cases, then estimate how much the new evidence changes the prior probability.'],
    ['Редкое объяснение требует особенно сильного признака, если обычные причины встречаются значительно чаще.', 'A rare explanation needs especially strong evidence when ordinary causes occur much more often.'],
    ['Статистика похожих случаев не решает вопрос автоматически, но задаёт отправную точку для оценки единичной сцены.', 'Statistics from similar cases do not settle the issue automatically, but they provide a starting point for assessing one scene.'],
  ],
  survivorship: [
    ['К видимым победителям нужно добавить неудачные и прерванные случаи, исчезнувшие из рассказа.', 'Failed and abandoned cases missing from the story must be added to the visible winners.'],
    ['Вероятность успеха определяется по всем начавшим путь, а не только по тем, кто дошёл до финала и смог рассказать.', 'Success probability should be calculated from everyone who started, not only those who finished and could report back.'],
    ['Отбор примеров после результата скрывает потери; критерий включения нужно установить до сравнения.', 'Selecting examples after the outcome hides losses, so inclusion criteria should be set before comparison.'],
    ['Опыт выживших полезен для описания их пути, но без данных об остальных он не показывает эффективность метода.', 'Survivors’ experience describes their path, but without data on everyone else it does not establish the method’s effectiveness.'],
  ],
}
const FICTION_SCENE_LINES = [
  ['Шепард показывает Совету Цитадели новые данные о приближающейся угрозе.', 'Shepard presents the Citadel Council with new evidence of an approaching threat.'],
  ['Экипаж решает, брать ли бывшего противника на общее задание.', 'The crew decides whether to take a former enemy on a shared mission.'],
  ['Союзники обсуждают военное и моральное значение лекарства от генокоблажа.', 'The allies discuss the military and moral significance of the genophage cure.'],
  ['Кварианцы и геты сверяют разные версии давней войны перед новым сражением.', 'Quarians and geth compare different accounts of their old war before a new battle.'],
  ['Спектр планирует операцию в районе, где остаются мирные жители.', 'A Spectre plans an operation in a district where civilians remain.'],
  ['Экипаж получает спорный приказ Шепарда и решает, как на него ответить.', 'The crew receives a disputed order from Shepard and decides how to respond.'],
  ['Политики пересматривают общую стратегию после одной удачной операции.', 'Politicians review the broader strategy after one successful operation.'],
  ['После тяжёлых потерь союзники заново решают судьбу прежнего плана.', 'After heavy losses, the allies reconsider the fate of their old plan.'],
  ['На Цитадели спорят об интеллекте, управляемости и правах синтетиков.', 'The Citadel debates the intelligence, controllability, and rights of synthetics.'],
  ['Жители Нью-Йорка слушают обещание корпорации защитить город под куполом.', 'New Yorkers hear a corporate promise to protect the city under the dome.'],
  ['Пророк использует нанокостюм, который влияет и на его тело, и на самоощущение.', 'Prophet uses a nanosuit that affects both his body and his sense of self.'],
  ['Повстанцы планируют удар по корпорации внутри населённого города.', 'The rebels plan a strike against the corporation inside a populated city.'],
  ['Повстанческий отряд возвращается после удачного налёта.', 'A rebel unit returns from a successful raid.'],
  ['Новая система включается незадолго до появления городской угрозы.', 'A new system comes online shortly before an urban threat appears.'],
  ['Бойцы пересматривают опасный проект, в который вкладывались много лет.', 'The fighters review a dangerous project that has consumed years of investment.'],
  ['Жители сообщают о пришельцах, а разведка собирает собственные данные.', 'Residents report aliens while intelligence officers gather their own evidence.'],
  ['Лабораторный опыт заканчивается изменением линии мира.', 'A laboratory experiment ends with a change in the world line.'],
  ['Одно отправленное сообщение даёт лаборатории желаемый результат.', 'One transmitted message gives the laboratory the result it wanted.'],
  ['Учёный участник лаборатории высказывается о моральном риске опыта.', 'A scientist in the laboratory comments on the experiment’s moral risk.'],
  ['После личных потерь лаборатория решает, продолжать ли опыты с линиями мира.', 'After personal losses, the laboratory decides whether to continue world-line experiments.'],
  ['Участники лаборатории используют слово «наблюдатель» в двух частях спора.', 'The laboratory participants use the word “observer” in two parts of their debate.'],
  ['Одна линия мира заканчивается неудачей.', 'One world line ends in failure.'],
  ['Лаборатория обсуждает просьбу остановить опасный опыт.', 'The laboratory discusses a request to halt a dangerous experiment.'],
  ['Городская легенда о машине времени быстро набирает сторонников.', 'An urban legend about a time machine rapidly gains supporters.'],
  ['После опыта говорить о нём могут только сохранившие память участники.', 'After the experiment, only participants who retained their memories can report what happened.'],
  ['Геральт выясняет, насколько пророчество ограничивает судьбу Цири.', 'Geralt investigates how tightly the prophecy constrains Ciri’s fate.'],
  ['Деревня встречает ведьмака после одного пугающего происшествия.', 'A village encounters a witcher after one frightening incident.'],
  ['Правитель требует решения на фоне угрозы политического хаоса.', 'A ruler demands a decision under the threat of political chaos.'],
  ['Геральт сопоставляет показания очевидцев о чудовище с деревенскими слухами.', 'Geralt compares eyewitness testimony about the monster with village rumor.'],
  ['Чародейка предлагает новый план, а собеседники помнят её прошлые поступки.', 'A sorceress proposes a new plan while the others remember her past actions.'],
  ['Деревня решает, продолжать ли старый обычай жертвоприношения.', 'A village decides whether to continue an old sacrificial custom.'],
  ['Сразу после ритуала проклятие исчезает.', 'The curse disappears immediately after a ritual.'],
  ['Один солдат показывает выдающееся мастерство перед общей кампанией.', 'One soldier displays exceptional skill before a broader campaign.'],
  ['Геральт решает, продолжать ли поиски после уже понесённых затрат.', 'Geralt decides whether to continue the search after the costs already incurred.'],
  ['Корпорация Найт-Сити объясняет жителям свою систему контроля данных.', 'A Night City corporation explains its data-control system to residents.'],
  ['Наёмник изучает контракт, предложенный известным заказчиком.', 'A mercenary reviews a contract offered by a famous client.'],
  ['Жители Найт-Сити обсуждают безопасность популярного импланта.', 'Night City residents discuss the safety of a popular implant.'],
  ['Клиника рекламирует клиента, пережившего рискованную операцию.', 'A clinic advertises a client who survived a risky operation.'],
  ['Стороны спорят о правах на цифровую копию сознания.', 'The parties dispute ownership and rights over a digital copy of a mind.'],
  ['Банда оценивает надёжность своей группы перед новой операцией.', 'A gang assesses its reliability before a new operation.'],
  ['После установки импланта в городской сети происходит сбой.', 'A city network fails after an implant is installed.'],
  ['Условия ограбления ухудшаются после долгой и дорогой подготовки.', 'The conditions of a heist deteriorate after long and expensive preparation.'],
  ['Жители спорят о допустимых границах корпоративной слежки.', 'Residents debate acceptable limits on corporate surveillance.'],
  ['Совет Элронда обсуждает судьбу Кольца и войну с Сауроном.', 'Elrond’s Council debates the Ring’s fate and the war against Sauron.'],
  ['Поступок одного союзника ставит перед отрядом вопрос о доверии.', 'One ally’s conduct raises a question of trust for the company.'],
  ['Совет пересматривает старый королевский обычай.', 'A council reviews an old royal custom.'],
  ['Один воин проявляет исключительную доблесть в бою.', 'One warrior shows exceptional valor in battle.'],
  ['Незнакомец прибывает незадолго до несчастья.', 'A stranger arrives shortly before a misfortune.'],
  ['Военный совет проверяет план похода перед выступлением.', 'The war council reviews the campaign plan before departure.'],
  ['Командир предлагает отступить и перегруппировать силы.', 'A commander proposes retreating to regroup the forces.'],
  ['Песни рассказывают о героях, вернувшихся из похода.', 'Songs tell of heroes who returned from the journey.'],
  ['Военный совет выбирает способ противостоять врагу.', 'The war council chooses how to confront the enemy.'],
  ['Водитель решает, какой риск принять ради семьи Айрин.', 'The Driver decides what risk to accept for Irene’s family.'],
  ['Незнакомец один раз ведёт себя спокойно рядом с семьёй.', 'A stranger behaves calmly around the family on one occasion.'],
  ['Водитель встречается с преступниками, после чего начинается насилие.', 'The Driver meets with criminals, after which violence begins.'],
  ['Водитель молча предлагает сообщникам практический план.', 'The Driver silently presents the accomplices with a practical plan.'],
  ['Сообщникам удаётся один побег по подготовленной схеме.', 'The accomplices complete one successful escape using the prepared scheme.'],
  ['После оплаты подготовки условия ограбления резко меняются.', 'After preparation has been paid for, the conditions of the robbery change sharply.'],
  ['Один сообщник сохраняет верность Водителю.', 'One accomplice remains loyal to the Driver.'],
  ['Декард изучает воспоминания, связанные с происхождением личности.', 'Deckard examines memories connected to a person’s origin.'],
  ['Один репликант проявляет эмпатию.', 'One replicant displays empathy.'],
  ['В споре о репликантах участники несколько раз употребляют слово «человек».', 'Participants in the replicant debate use the word “human” several times.'],
  ['Один беглый репликант представляет реальную опасность.', 'One fugitive replicant poses a real danger.'],
  ['Создатель репликантов участвует в споре о ценности их жизни.', 'The replicants’ creator joins the debate over the value of their lives.'],
  ['После внедрения искусственной памяти поведение репликанта меняется.', 'A replicant’s behavior changes after an artificial memory is implanted.'],
  ['Критики оспаривают точность теста Войта-Кампфа.', 'Critics challenge the accuracy of the Voight-Kampff test.'],
  ['Нео сравнивает личное переживание с внешними признаками работы Матрицы.', 'Neo compares his personal experience with external signs of how the Matrix works.'],
  ['В Матрице происходит один заметный сбой.', 'One noticeable glitch occurs in the Matrix.'],
  ['Морфеус предлагает Нео красную и синюю таблетки.', 'Morpheus offers Neo the red and blue pills.'],
  ['После пробуждения Нео замечает несколько странных совпадений.', 'After awakening, Neo notices several strange coincidences.'],
  ['Пифия даёт Нео предсказание.', 'The Oracle gives Neo a prediction.'],
  ['Архив сопротивления хранит истории людей, покинувших Матрицу.', 'The resistance archive preserves stories of people who left the Matrix.'],
  ['Нео показывает выдающиеся боевые навыки.', 'Neo demonstrates exceptional combat skill.'],
  ['Отдел Девять сравнивает скопированную память с непрерывностью личности.', 'Section Nine compares copied memory with continuity of identity.'],
  ['Следователи фиксируют один взлом кибермозга.', 'Investigators document one cyberbrain hack.'],
  ['Одна идея быстро распространяется по сети.', 'One idea spreads rapidly across the network.'],
  ['Участники расследования по-разному употребляют слово «призрак».', 'The investigators use the word “ghost” in different ways.'],
  ['Опытный оперативник Отдела Девять оценивает незнакомый код.', 'An experienced Section Nine operative evaluates unfamiliar code.'],
  ['После подключения к сети поведение человека меняется.', 'A person’s behavior changes after connecting to the network.'],
  ['Одна автономная программа создаёт серьёзную угрозу.', 'One autonomous program creates a serious threat.'],
  ['Психоисторический прогноз для масс обсуждают применительно к одному человеку.', 'A psychohistorical forecast for populations is discussed in relation to one individual.'],
  ['Один кризисный план Основания завершается успехом.', 'One Foundation crisis plan succeeds.'],
  ['Совет решает судьбу многовекового имперского института.', 'A council decides the fate of a centuries-old imperial institution.'],
  ['Предсказанный Селдоном кризис действительно наступает.', 'A crisis predicted by Seldon actually arrives.'],
  ['Торговец возражает против плана, имея собственную выгоду.', 'A trader objects to a plan while having a personal financial interest.'],
  ['Одна провинция Империи терпит крах.', 'One imperial province collapses.'],
  ['Политики Основания обсуждают несколько возможных союзов.', 'Foundation politicians discuss several possible alliances.'],
  ['Архивы Основания собирают отчёты об успешных мирах.', 'Foundation archives collect reports from successful worlds.'],
  ['Прогрессоры обсуждают вмешательство в развитие чужого общества.', 'The Progressors debate intervention in another society’s development.'],
  ['На одной планете правит жестокий властитель.', 'A brutal ruler governs one planet.'],
  ['Наблюдатели Земли видят возможное будущее чужого общества.', 'Earth’s observers see a possible future for another society.'],
  ['После тайной операции прогрессоров в обществе начинаются перемены.', 'Changes begin in a society after a covert Progressor operation.'],
  ['Критики оспаривают методы прогрессорского вмешательства.', 'Critics challenge the methods of Progressor intervention.'],
  ['Отчёты прогрессоров подробно описывают удачные миссии.', 'Progressor reports describe successful missions in detail.'],
  ['Земные поселенцы проектируют общественный уклад новой марсианской колонии.', 'Earth settlers design the social order of a new Martian colony.'],
  ['Одно марсианское поселение исчезает вскоре после другого события.', 'One Martian settlement vanishes shortly after another event.'],
  ['Колонисты переживают один враждебный контакт с марсианином.', 'The colonists experience one hostile encounter with a Martian.'],
  ['О марсианских экспедициях рассказывают вернувшиеся колонисты.', 'Returning colonists tell the stories of the Martian expeditions.'],
  ['Земные поселенцы находят пустой марсианский дом.', 'Earth settlers find an empty Martian house.'],
  ['Критики и колонисты спорят о путешествиях между мирами.', 'Critics and colonists debate travel between worlds.'],
]
const HISTORY_SCENE_LINES = [
  ['Историки разбирают авторитарную модель «Нациократии» Сциборского как идеологический проект.', 'Historians examine Stsiborsky’s authoritarian Natsiocracy as an ideological project.'],
  ['Исследователи сравнивают проект корпоративных палат с реальными свидетельствами политического несогласия.', 'Researchers compare the proposed corporate chambers with evidence of actual political dissent.'],
  ['Критики парламентаризма и сторонники единого центра власти обсуждают устройство государства.', 'Critics of parliament and supporters of a single power center debate the structure of the state.'],
  ['Сциборский связывает общественный кризис с переходом к авторитарной системе.', 'Stsiborsky links social crisis with a transition to an authoritarian system.'],
  ['Историки оценивают политические доводы дисциплинированного революционного руководства.', 'Historians assess the political claims of a disciplined revolutionary leadership.'],
  ['Публичная память о Бандере как символе борьбы сосуществует со спором о методах движения.', 'Public memory of Bandera as a symbol of struggle coexists with debate over the movement’s methods.'],
  ['После репрессий против движения его участники решают, сохранять ли прежнюю стратегию.', 'After repression of the movement, its members decide whether to retain the old strategy.'],
  ['Спор о Бандере затрагивает и оценку лидера, и право украинцев на независимость.', 'The debate over Bandera concerns both the leader’s record and Ukrainians’ right to independence.'],
  ['Музейные материалы показывают, как нацистская агитация объясняла общественный кризис.', 'Museum records show how Nazi propaganda explained social crisis.'],
  ['Нацистский культ Гитлера связывает решения вождя с заявленной исторической миссией.', 'The Nazi cult of Hitler links the leader’s decisions to a claimed historical mission.'],
  ['Историки сопоставляют отдельные успехи режима с полными последствиями расистской политики.', 'Historians compare selected regime successes with the full consequences of racist policy.'],
  ['Нацистские речи ставят перед аудиторией вопрос о лояльности режиму во время войны.', 'Nazi speeches confront audiences with the issue of loyalty to the regime during wartime.'],
  ['Историки сравнивают сталинские заявления о врагах с решениями самого руководства.', 'Historians compare Stalinist claims about enemies with decisions made by the leadership itself.'],
  ['Исследователи оценивают промышленные результаты вместе с устройством системы принуждения.', 'Researchers assess industrial outcomes alongside the structure of the coercive system.'],
  ['На показательном процессе обвинение опирается на признание подсудимого.', 'At a show trial, the accusation relies on the defendant’s confession.'],
  ['Критики темпа сталинской политики отвечают на обвинения в политической нелояльности.', 'Critics of the pace of Stalinist policy respond to accusations of political disloyalty.'],
  ['Рузвельт использует образ общего страха, обсуждая конкретную государственную программу.', 'Roosevelt invokes shared fear while discussing a specific government program.'],
  ['Общественная поддержка реформ Рузвельта становится предметом политического анализа.', 'Public support for Roosevelt’s reforms becomes a subject of political analysis.'],
  ['Одна мера Нового курса даёт измеримый положительный результат.', 'One New Deal measure produces a measurable positive result.'],
  ['Речь Черчилля поднимает боевой дух перед новым стратегическим решением.', 'Churchill’s speech raises morale before a new strategic decision.'],
  ['После понесённых потерь Черчилль снова призывает страну к стойкости.', 'After losses have been suffered, Churchill again calls the country to endure.'],
  ['Черчилль описывает послевоенное разделение Европы в известной речи.', 'Churchill describes postwar division in Europe in a famous speech.'],
  ['Хирохито объявляет капитуляцию языком императорского рескрипта.', 'Hirohito announces surrender in the language of an imperial rescript.'],
  ['Японское руководство обсуждает сохранение государства и итоги прежнего курса.', 'Japanese leaders discuss preservation of the state and the results of prior policy.'],
  ['Историки обсуждают статус Хирохито и его ответственность за войну.', 'Historians debate Hirohito’s status and his responsibility for the war.'],
  ['Кампания Мао получает массовую поддержку на фоне спорных экономических результатов.', 'Mao’s campaign receives mass support amid disputed economic results.'],
  ['В отчётах о политике Мао подробно показаны несколько образцовых коммун.', 'Reports on Maoist policy feature several model communes in detail.'],
  ['Критики курса Мао отвечают на обвинения во враждебности китайскому народу.', 'Critics of Mao’s policy respond to accusations of hostility toward the Chinese people.'],
  ['Большой митинг Трампа собирает активных сторонников перед национальным опросом.', 'A large Trump rally gathers committed supporters before a national poll.'],
  ['Трамп обсуждает политическое несогласие через понятия лояльности и предательства.', 'Trump discusses political disagreement through the language of loyalty and betrayal.'],
  ['Деловой опыт Трампа сопоставляют с требованиями другой области государственной политики.', 'Trump’s business experience is compared with the demands of another field of public policy.'],
]
const BOOK_SCENE_LINES = [
  ['Читатель «Атомных привычек» пробует небольшие повторяемые действия ради большой цели.', 'An Atomic Habits reader tries small repeated actions in pursuit of a large goal.'],
  ['Читатель адаптирует систему Джеймса Клира к своему здоровью, бюджету и рабочей среде.', 'A reader adapts James Clear’s system to personal health, budget, and work environment.'],
  ['Читатель «Семи навыков» определяет, на какие обстоятельства действительно может влиять.', 'A reader of The 7 Habits identifies which circumstances are genuinely controllable.'],
  ['Две стороны пробуют принцип взаимной выгоды Кови в реальном конфликте интересов.', 'Two parties try Covey’s win-win principle in a real conflict of interest.'],
  ['Читатель «Богатого папы» классифицирует покупку как актив или обязательство.', 'A Rich Dad reader classifies a purchase as an asset or a liability.'],
  ['Автор «Богатого папы» приводит историю успешного инвестора.', 'The author of Rich Dad presents the story of a successful investor.'],
  ['Читатель Наполеона Хилла использует настойчивость, добиваясь финансовой цели.', 'A Napoleon Hill reader applies persistence while pursuing a financial goal.'],
  ['«Думай и богатей» строит часть рекомендаций на биографиях победителей.', 'Think and Grow Rich bases part of its advice on biographies of winners.'],
  ['Феррис предлагает владельцу бизнеса автоматизировать часть повседневной работы.', 'Ferriss advises a business owner to automate part of the daily workload.'],
  ['«Четырёхчасовая рабочая неделя» показывает пример прибыльного удалённого бизнеса.', 'The 4-Hour Workweek presents an example of a profitable remote business.'],
  ['Читатель «Тайны» проверяет, как позитивное внимание влияет на поступки и внешние события.', 'A reader of The Secret tests how positive attention affects actions and external events.'],
  ['«Тайна» собирает рассказы людей о сбывшихся желаниях.', 'The Secret collects stories from people whose wishes came true.'],
  ['Тиль обсуждает новый рынок и монопольное положение компании в «От нуля к единице».', 'Thiel discusses a new market and a company’s monopoly position in Zero to One.'],
  ['«От нуля к единице» использует примеры нескольких технологических компаний.', 'Zero to One uses examples from several technology companies.'],
  ['Команда Бережливого стартапа запускает быстрый эксперимент с новой функцией.', 'A Lean Startup team runs a rapid experiment on a new feature.'],
  ['Команда месяцами разрабатывала продукт, который пока не нашёл спроса.', 'A team spent months developing a product that has not yet found demand.'],
  ['Коллинз отбирает успешные компании для исследования «От хорошего к великому».', 'Collins selects successful firms for the Good to Great study.'],
  ['Несколько руководителей из выборки Коллинза демонстрируют строгую дисциплину.', 'Several executives in Collins’s sample demonstrate strict discipline.'],
  ['Герои «Кто украл мой сыр?» обнаруживают перемену и выбирают дальнейшие действия.', 'The characters in Who Moved My Cheese? discover a change and choose what to do next.'],
]
const SCENE_LINES = [...FICTION_SCENE_LINES, ...HISTORY_SCENE_LINES, ...BOOK_SCENE_LINES]

function localizeSegment(segment) {
  return { ru: segment[0], en: segment[1] }
}
function toSource(sourceKey) {
  const [ru, en, url] = SOURCES[sourceKey]
  return { title: { ru, en }, url }
}

function expandGroups(groups, kind) {
  return groups.flatMap(([sourceKey, topics]) => topics.map(([ru, en]) => ({
    kind,
    sourceKey,
    contextLabel: { ru, en },
  })))
}

const RAW_CHALLENGE_BASE = [
  ...expandGroups(FICTION_GROUPS, 'fiction'),
  ...expandGroups(HISTORY_GROUPS, 'history'),
  ...expandGroups(BOOK_GROUPS, 'book'),
]

if (SCENE_LINES.length !== 150) throw new Error('culture_scene_lines_must_contain_150_entries')
if (RAW_CHALLENGE_BASE.length !== SCENE_LINES.length) throw new Error('culture_scene_lines_must_match_raw_challenges')

const RAW_CHALLENGES = RAW_CHALLENGE_BASE.map((item, index) => ({
  ...item,
  sceneLine: { ru: SCENE_LINES[index][0], en: SCENE_LINES[index][1] },
}))

const FAMILIES = Object.keys(FAMILY_LABELS)

const FAMILY_CASE_IDS = {
  'ad-hominem': [2, 6, 30, 55, 56, 85, 101, 106, 109, 134],
  bandwagon: [16, 24, 29, 37, 76, 102, 118, 120, 126, 129],
  'false-dilemma': [3, 28, 52, 69, 87, 103, 112, 116, 130, 140],
  'slippery-slope': [5, 10, 22, 26, 43, 44, 86, 104, 124, 132],
  'hasty-generalization': [7, 13, 18, 27, 45, 54, 63, 68, 90, 97],
  'post-hoc': [14, 17, 41, 48, 65, 70, 79, 84, 92, 96],
  'circular-reasoning': [1, 12, 49, 57, 60, 81, 99, 110, 115, 136],
  'straw-man': [23, 50, 66, 93, 100, 108, 113, 128, 133, 142],
  'false-authority': [19, 36, 64, 71, 78, 89, 105, 122, 125, 131],
  tradition: [4, 31, 32, 46, 53, 83, 95, 123, 135, 150],
  'sunk-cost': [8, 15, 20, 34, 42, 58, 107, 121, 138, 147],
  equivocation: [9, 11, 21, 35, 39, 62, 74, 77, 91, 144],
  composition: [33, 40, 47, 59, 61, 73, 82, 114, 119, 149],
  'base-rate': [67, 75, 80, 111, 117, 127, 137, 141, 145, 146],
  survivorship: [25, 38, 51, 72, 88, 94, 98, 139, 143, 148],
}

const FAMILY_BY_CASE_NUMBER = new Map()
for (const [family, caseNumbers] of Object.entries(FAMILY_CASE_IDS)) {
  for (const caseNumber of caseNumbers) {
    if (FAMILY_BY_CASE_NUMBER.has(caseNumber)) throw new Error('duplicate_culture_family_assignment:' + caseNumber)
    FAMILY_BY_CASE_NUMBER.set(caseNumber, family)
  }
}
if (FAMILY_BY_CASE_NUMBER.size !== 150) throw new Error('culture_family_assignments_must_cover_150_cases')

const CONTEXTUAL_REASONING = {
  'ad-hominem': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Но довод отвергают из-за личности или прошлого говорящего, не отвечая на его содержание.`,
      en: (scene, claim) => `${scene} ${claim} Yet the argument is rejected because of the speaker's character or past, without answering its substance.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Прошлое участника может влиять на доверие, но решение должно опираться на проверяемые детали его предложения.`,
      en: (scene, claim) => `${claim} A participant's past may affect trust, but the decision should rest on verifiable details of the proposal.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Возможный конфликт интересов стоит отметить отдельно и затем сверить сказанное с независимыми сведениями.`,
      en: (scene, claim) => `${scene} Any conflict of interest should be noted separately, then the statement should be compared with independent evidence.`,
    },
  },
  bandwagon: {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Участники объявляют решение верным лишь потому, что его поддерживает большинство.`,
      en: (scene, claim) => `${scene} ${claim} The participants declare the decision true solely because a majority supports it.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Число сторонников показывает настроение группы, а правоту решения должны подтвердить данные о последствиях.`,
      en: (scene, claim) => `${claim} The number of supporters shows the group's mood; evidence about consequences must establish whether the decision is sound.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Поддержка могла возникнуть из-за моды, страха или давления, поэтому важны независимые свидетельства.`,
      en: (scene, claim) => `${scene} Support may reflect fashion, fear, or pressure, so independent evidence still matters.`,
    },
  },
  'false-dilemma': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Участникам оставляют только два исхода: принять предложенный путь целиком или сознательно выбрать провал.`,
      en: (scene, claim) => `${scene} ${claim} The participants are left only two outcomes: accept the proposed path in full or deliberately choose failure.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Между крайними ответами могут быть отсрочка, частичное решение или сочетание нескольких мер.`,
      en: (scene, claim) => `${claim} Delay, a limited measure, or a combination of actions may lie between the extreme answers.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Прежде чем выбирать, стороны должны проверить, исчерпывают ли названные варианты доступные действия.`,
      en: (scene, claim) => `${scene} Before choosing, the parties should check whether the stated options exhaust the available actions.`,
    },
  },
  'slippery-slope': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Один шаг объявляют началом неизбежной цепи, которая без новых причин закончится худшим исходом.`,
      en: (scene, claim) => `${scene} ${claim} One step is declared the start of an inevitable chain that reaches the worst outcome without any further cause.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Для каждого следующего последствия нужен свой механизм, вероятность и условие, при котором цепь остановится.`,
      en: (scene, claim) => `${claim} Each later consequence needs its own mechanism, probability, and a condition that could stop the chain.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Ограничения, срок пересмотра и возможность отмены могут не дать первому решению перерасти в крайний исход.`,
      en: (scene, claim) => `${scene} Safeguards, a review date, and reversal can keep the first decision from growing into the extreme outcome.`,
    },
  },
  'hasty-generalization': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Одного случая считают достаточным, чтобы без новых наблюдений судить обо всех похожих людях и решениях.`,
      en: (scene, claim) => `${scene} ${claim} One case is treated as enough to judge every similar person and decision without further observations.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Пока это один эпизод; похожие решения с иным результатом покажут, выдерживает ли правило перенос.`,
      en: (scene, claim) => `${claim} This remains one episode; similar decisions with different outcomes will show whether the rule travels.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Надёжный вывод должен учитывать размер и разнообразие выборки, а также случаи с другим результатом.`,
      en: (scene, claim) => `${scene} A reliable conclusion must account for the sample's size and variety, including cases with different outcomes.`,
    },
  },
  'post-hoc': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Первое событие называют единственной причиной второго только потому, что оно произошло раньше.`,
      en: (scene, claim) => `${scene} ${claim} The first event is called the sole cause of the second merely because it happened earlier.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Порядок событий задаёт гипотезу, но причинность требует механизма и сравнения с альтернативными объяснениями.`,
      en: (scene, claim) => `${claim} The order of events suggests a hypothesis, but causation requires a mechanism and comparison with alternative explanations.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Нужно выяснить, началась бы перемена без первого события и не действовала ли третья причина.`,
      en: (scene, claim) => `${scene} The parties should ask whether the change would have happened anyway and whether a third cause was operating.`,
    },
  },
  'circular-reasoning': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Вывод считают верным, потому что исходное объяснение верно, а объяснение — потому что оно даёт полученный результат.`,
      en: (scene, claim) => `${scene} ${claim} The conclusion is called true because the original account is true, and the account is called true because it yields that conclusion.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Подтвердить эту версию могут только сведения, полученные без предположения о её правоте.`,
      en: (scene, claim) => `${claim} Only evidence obtained without assuming this account is correct can support it.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Запись, свидетель или наблюдаемое последствие должны подтвердить версию без ссылки на неё саму.`,
      en: (scene, claim) => `${scene} A record, witness, or observable consequence must support the account without referring back to the account itself.`,
    },
  },
  'straw-man': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Ограниченное возражение пересказывают как требование уничтожить или запретить весь замысел.`,
      en: (scene, claim) => `${scene} ${claim} A limited objection is recast as a demand to destroy or ban the entire project.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Ответ должен касаться точного предложения оппонента, включая названные им границы и условия.`,
      en: (scene, claim) => `${claim} The response should address the opponent's exact proposal, including its stated limits and conditions.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Полезно отделить буквальный тезис от более резкой версии, которую ему приписывает другая сторона.`,
      en: (scene, claim) => `${scene} The literal claim should be separated from the harsher version attributed to it by the other side.`,
    },
  },
  'false-authority': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Высокий статус участника принимают за окончательное доказательство в вопросе, где нужна другая экспертиза.`,
      en: (scene, claim) => `${scene} ${claim} A participant's high status is treated as final proof on a question that requires different expertise.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Опыт говорящего имеет вес лишь в той части спора, где он действительно работал с такими задачами и последствиями.`,
      en: (scene, claim) => `${claim} The speaker's experience carries weight only where that person has actually worked with these tasks and consequences.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Известность может привлечь внимание к версии, но не заменяет профильных знаний и независимой проверки.`,
      en: (scene, claim) => `${scene} Fame may draw attention to an account, but it cannot replace relevant knowledge and independent verification.`,
    },
  },
  tradition: {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Порядок объявляют правильным только потому, что он существует давно и привычен участникам.`,
      en: (scene, claim) => `${scene} ${claim} The arrangement is declared right only because it has existed for a long time and feels familiar.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Происхождение обычая объясняет его форму, а сохранять его стоит лишь при приемлемых нынешних последствиях.`,
      en: (scene, claim) => `${claim} A custom's origin explains its form; keeping it depends on whether its present consequences remain acceptable.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Старое правило можно сравнить с альтернативами по риску, справедливости и практическому результату.`,
      en: (scene, claim) => `${scene} The old rule can be compared with alternatives by risk, fairness, and practical result.`,
    },
  },
  'sunk-cost': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} План продолжают ради уже понесённых затрат, даже если будущая польза больше не покрывает риск.`,
      en: (scene, claim) => `${scene} ${claim} The plan continues because of costs already incurred, even when future benefit no longer covers the risk.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Уже потраченное не вернуть; выбор должен зависеть от будущих выгод, опасностей и доступных замен.`,
      en: (scene, claim) => `${claim} Past spending cannot be recovered; the choice should depend on future benefits, dangers, and available alternatives.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Отказ может быть разумным, если новые условия сделали продолжение хуже остановки или другого плана.`,
      en: (scene, claim) => `${scene} Stopping may be reasonable if new conditions make continuation worse than withdrawal or another plan.`,
    },
  },
  equivocation: {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Ключевое слово сначала означает один факт, а в выводе незаметно получает другое, более удобное значение.`,
      en: (scene, claim) => `${scene} ${claim} A key word first denotes one fact, then quietly takes a different, more convenient meaning in the conclusion.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Сторонам нужно закрепить одно значение спорного термина и отдельно назвать другие свойства предмета.`,
      en: (scene, claim) => `${claim} The parties should keep one meaning for the disputed term and name the object's other properties separately.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Если заменить ключевое слово точным определением в каждой посылке, станет видно, следует ли вывод.`,
      en: (scene, claim) => `${scene} Replacing the key word with a precise definition in each premise will show whether the conclusion follows.`,
    },
  },
  composition: {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Свойство одного участника или элемента автоматически переносят на всю группу и её общий результат.`,
      en: (scene, claim) => `${scene} ${claim} A property of one participant or element is automatically transferred to the whole group and its combined result.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Общий результат зависит не только от отдельных качеств, но и от связей, ролей и конфликтов между частями.`,
      en: (scene, claim) => `${claim} The combined result depends on individual qualities as well as links, roles, and conflicts among the parts.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Чтобы судить о целом, нужно проверить совместную работу элементов, а не выбирать один яркий пример.`,
      en: (scene, claim) => `${scene} Judging the whole requires evidence about how the elements work together, not one vivid example.`,
    },
  },
  'base-rate': {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Яркий частный признак считают важнее базовой частоты похожих исходов и сразу называют версию наиболее вероятной.`,
      en: (scene, claim) => `${scene} ${claim} One vivid detail is treated as more important than the base rate of similar outcomes, and the account is called most likely.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Частный признак нужно сопоставить с тем, как часто каждый возможный исход встречается в похожих условиях.`,
      en: (scene, claim) => `${claim} The specific sign should be weighed against how often each possible outcome occurs under similar conditions.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Редкая деталь изменит оценку лишь настолько, насколько она действительно различает конкурирующие объяснения.`,
      en: (scene, claim) => `${scene} A rare detail should change the estimate only as much as it truly distinguishes the competing explanations.`,
    },
  },
  survivorship: {
    error: {
      ru: (scene, claim) => `${scene} ${claim} Видимые победители считаются полной выборкой, а исчезнувшие и неудачные случаи не учитываются.`,
      en: (scene, claim) => `${scene} ${claim} Visible winners are treated as the complete sample, while missing and failed cases are ignored.`,
    },
    soundA: {
      ru: (scene, claim) => `${claim} Для оценки метода нужны сведения и о тех, кто начал тем же путём, но не дошёл до наблюдаемого результата.`,
      en: (scene, claim) => `${claim} Evaluating the method requires evidence about those who started the same way but never reached the observed result.`,
    },
    soundB: {
      ru: (scene, claim) => `${scene} Доступные истории показывают опыт оставшихся рассказчиков, а не частоту успеха среди всех участников.`,
      en: (scene, claim) => `${scene} The available stories show the experience of remaining narrators, not the success rate among all participants.`,
    },
  },
}

const FALLACY_SIGNATURES = {
  'ad-hominem': { ru: 'Но довод отвергают из-за личности', en: 'Yet the argument is rejected because of the speaker' },
  bandwagon: { ru: 'Участники объявляют решение верным лишь потому', en: 'The participants declare the decision true solely because' },
  'false-dilemma': { ru: 'Участникам оставляют только два исхода', en: 'The participants are left only two outcomes' },
  'slippery-slope': { ru: 'Один шаг объявляют началом неизбежной цепи', en: 'One step is declared the start of an inevitable chain' },
  'hasty-generalization': { ru: 'Одного случая считают достаточным', en: 'One case is treated as enough' },
  'post-hoc': { ru: 'Первое событие называют единственной причиной второго', en: 'The first event is called the sole cause of the second' },
  'circular-reasoning': { ru: 'Вывод считают верным, потому что исходное объяснение верно', en: 'The conclusion is called true because the original account is true' },
  'straw-man': { ru: 'Ограниченное возражение пересказывают как требование', en: 'A limited objection is recast as a demand' },
  'false-authority': { ru: 'Высокий статус участника принимают за окончательное доказательство', en: "A participant's high status is treated as final proof" },
  tradition: { ru: 'Порядок объявляют правильным только потому', en: 'The arrangement is declared right only because' },
  'sunk-cost': { ru: 'План продолжают ради уже понесённых затрат', en: 'The plan continues because of costs already incurred' },
  equivocation: { ru: 'Ключевое слово сначала означает один факт', en: 'A key word first denotes one fact' },
  composition: { ru: 'Свойство одного участника или элемента автоматически переносят', en: 'A property of one participant or element is automatically transferred' },
  'base-rate': { ru: 'Яркий частный признак считают важнее базовой частоты', en: 'One vivid detail is treated as more important than the base rate' },
  survivorship: { ru: 'Видимые победители считаются полной выборкой', en: 'Visible winners are treated as the complete sample' },
}

const OVERRIDE_FALLACY_SIGNATURES = {
  1: { ru: 'Совет не признал предупреждение доказанным', en: 'The Council has not recognized the warning as proven' },
  2: { ru: 'Он когда-то стрелял в нас', en: 'He once fired on us' },
  3: { ru: 'Либо мы немедленно отдаём', en: 'Either we give the krogan' },
  4: { ru: 'Кварианцы всегда возвращали', en: 'Quarians have always reclaimed' },
  5: { ru: 'Стоит дать Спектру', en: 'Allow the Spectre one strike' },
  6: { ru: 'Шепард слишком самоуверен', en: 'Shepard is too confident' },
  7: { ru: 'Эта операция удалась, значит', en: 'This operation succeeded, so' },
  8: { ru: 'После стольких погибших отступить нельзя', en: 'After so many deaths, retreat is impossible' },
  20: { ru: 'Лаборатория Окабэ уже заплатила', en: 'Okabe’s laboratory has already paid' },
  37: { ru: 'Имплант носит половина Найт-Сити', en: 'Half of Night City wears the implant' },
  51: { ru: 'Все рассказчики добрались домой', en: 'Every available storyteller came home' },
  68: { ru: 'Один заметный сбой Матрицы доказывает', en: 'One visible Matrix glitch proves' },
  87: { ru: 'Фонд может либо принять', en: 'The Foundation must either accept' },
  99: { ru: 'Мы вправе занять дом, потому что', en: 'We may occupy the house because' },
  100: { ru: 'Критики хотят запретить колонизацию', en: 'The critics oppose colonization' },
  101: { ru: 'Сциборский был политическим идеологом', en: 'Stsiborsky was a political ideologue' },
  102: { ru: 'Большинство разрешённых корпораций', en: 'Most authorized corporations' },
  112: { ru: 'Кто не поддерживает режим Гитлера', en: 'Anyone who does not support Hitler’s regime' },
  131: { ru: 'Трамп добился известного успеха', en: 'Trump achieved prominent business success' },
  145: { ru: 'Несколько успехов из «От нуля к единице»', en: 'Several Zero to One successes prove' },
  150: { ru: 'Мы всегда выживали', en: 'We have always survived' },
}

const SCENARIO_CONFLICTS = {
  'ad-hominem': {
    ru: 'Одни хотят судить предложение по репутации говорящего, другие — по тому, сработает ли сам план; ошибка может оставить группу без полезного решения.',
    en: 'Some want to judge the proposal by the speaker’s reputation, while others ask whether the plan itself will work; a mistake could cost the group a useful option.',
  },
  bandwagon: {
    ru: 'Спор решают между поддержкой толпы и сведениями о реальном результате; популярная ошибка может подтолкнуть всех к неверному шагу.',
    en: 'The dispute pits crowd support against evidence about the actual result; mistaking popularity for proof could push everyone toward the wrong move.',
  },
  'false-dilemma': {
    ru: 'Один участник оставляет лишь две крайности, хотя от выбора зависит судьба людей и есть время поискать промежуточный ход.',
    en: 'One participant allows only two extremes, even though people’s fate depends on the choice and there is time to look for an intermediate move.',
  },
  'slippery-slope': {
    ru: 'Один осторожный шаг представляют началом необратимой катастрофы; из-за такого прогноза герои рискуют отказаться от управляемого решения.',
    en: 'One limited step is presented as the start of an irreversible disaster; that forecast may make the characters reject a manageable option.',
  },
  'hasty-generalization': {
    ru: 'Участники решают, достаточно ли одного заметного случая для общего правила; поспешный ответ изменит их отношение ко всей группе или стратегии.',
    en: 'The participants must decide whether one striking case supports a general rule; a rushed answer will shape how they treat an entire group or strategy.',
  },
  'post-hoc': {
    ru: 'Первое событие произошло раньше второго, и теперь герои спорят о причине; неверная связь направит расследование или ответные действия не туда.',
    en: 'One event came before another, and the characters now dispute the cause; a false link would send the investigation or response in the wrong direction.',
  },
  'circular-reasoning': {
    ru: 'Спор упирается в доказательство, которое повторяет само себя; без внешней опоры участники могут принять удобную версию за установленный факт.',
    en: 'The dispute rests on proof that repeats itself; without outside support, the participants may mistake a convenient account for an established fact.',
  },
  'straw-man': {
    ru: 'Ограниченное возражение превращают в радикальный запрет; если подмену не заметить, исходное предложение даже не будет обсуждаться.',
    en: 'A limited objection is turned into a radical ban; if the substitution goes unnoticed, the original proposal will never be discussed.',
  },
  'false-authority': {
    ru: 'Известному участнику готовы поверить за пределами его опыта; ставка — решение, для которого нужны знания именно об этой угрозе или политике.',
    en: 'The group is ready to trust a famous participant beyond that person’s expertise; the decision requires knowledge of this particular threat or policy.',
  },
  tradition: {
    ru: 'Привычный порядок защищают его возрастом, хотя нынешняя цена уже спорна; героям нужно решить, сохранять ли его сейчас.',
    en: 'A familiar arrangement is defended by its age even though its present cost is disputed; the characters must decide whether to keep it now.',
  },
  'sunk-cost': {
    ru: 'После крупных потерь участники выбирают между остановкой и новыми расходами; прошлые вложения давят на решение, хотя вернуть их уже нельзя.',
    en: 'After major losses, the participants choose between stopping and spending more; past investment weighs on the decision even though it cannot be recovered.',
  },
  equivocation: {
    ru: 'Ключевое слово в споре означает разные вещи для разных участников; от смысла термина зависит, какие права, риски или обязанности они признают.',
    en: 'A key word means different things to different participants; its meaning determines which rights, risks, or duties they recognize.',
  },
  composition: {
    ru: 'Качество одного человека или элемента переносят на всю систему; ошибка может создать ложное доверие к отряду, организации или плану.',
    en: 'A quality of one person or element is transferred to the whole system; the mistake may create false confidence in a team, organization, or plan.',
  },
  'base-rate': {
    ru: 'Яркая деталь заслоняет обычную частоту похожих исходов; из-за этого участники могут переоценить редкую угрозу или обещанный успех.',
    en: 'A vivid detail overshadows how often similar outcomes usually occur; the participants may therefore overestimate a rare threat or promised success.',
  },
  survivorship: {
    ru: 'Перед участниками только истории тех, кто дошёл до результата; судьбы исчезнувших могут полностью изменить оценку риска.',
    en: 'The participants can see only the stories of those who reached the outcome; the missing cases may completely change the risk estimate.',
  },
}

const LEGACY_EDITORIAL_OVERRIDES = {
  1: {
    scenario: {
      ru: 'После атаки на Иден Прайм Шепард приносит Совету видение с протеанского маяка и обвиняет Сарена в связи с гетами. Совет считает видение ненадёжным и признаёт лишь доказательства, прошедшие его собственную проверку. Если предупреждение отвергнут, Цитадель не успеет подготовиться к Жнецам.',
      en: 'After the attack on Eden Prime, Shepard brings the Council a vision from the Prothean beacon and links Saren to the geth. The Council distrusts the vision and accepts only evidence that has passed its own review. If the warning is dismissed, the Citadel may lose its chance to prepare for the Reapers.',
    },
    explanation: {
      ru: 'Совет замыкает круг: данные считаются надёжными только после признания Советом, а отказ Совета признать их подают как доказательство ненадёжности. Записи нападения, сведения о Сарене и маяк должны оцениваться независимо от этого отказа.',
      en: 'The Council closes the loop: evidence is reliable only after Council recognition, while the lack of recognition is used to prove unreliability. The attack records, information about Saren, and the beacon must be assessed independently of that refusal.',
    },
    segments: {
      ru: [
        'Совет не признал предупреждение доказанным, значит доказательств нет; а раз доказательств нет, Совет прав, что не признаёт предупреждение.',
        'Нужно сопоставить запись нападения гетов, состояние маяка и перемещения Сарена: совпадение этих следов поддержит версию Шепарда без ссылки на авторитет Совета.',
        'Видение Шепарда само по себе ненадёжно, но его детали можно отделить от впечатлений и проверить по данным Иден Прайм.',
      ],
      en: [
        'The Council has not recognized the warning as proven, so there is no evidence; and because there is no evidence, the Council is right not to recognize the warning.',
        'The geth attack record, the beacon’s condition, and Saren’s movements should be compared; matching traces would support Shepard without relying on Council approval.',
        'Shepard’s vision is unreliable on its own, but its details can be separated from the experience and checked against the Eden Prime evidence.',
      ],
    },
  },
  2: {
    scenario: {
      ru: 'На «Нормандию» просится бывший противник, который знает маршрут к цели, но раньше сражался против команды. Гаррус предлагает оценить его сведения и условия сотрудничества, а один из офицеров требует отказать из-за прошлого. Ошибка может лишить Шепарда проводника и сорвать миссию.',
      en: 'A former enemy asks to join the Normandy and knows the route to the target, but previously fought Shepard’s crew. Garrus wants to test the information and terms of cooperation, while an officer demands rejection because of the applicant’s past. A mistake could cost Shepard a guide and derail the mission.',
    },
    explanation: {
      ru: 'Враждебное прошлое кандидата повышает риск, но не опровергает его карту и сведения о цели. Команде нужно отдельно проверить данные, мотив и возможность предательства.',
      en: 'The applicant’s hostile past raises the risk but does not refute the map or intelligence. The crew must separately test the information, motive, and opportunity for betrayal.',
    },
    segments: {
      ru: [
        'Гаррус может сверить маршрут бывшего противника с навигационными записями «Нормандии» и назначить ему ограниченный доступ.',
        'Шепард вправе потребовать залог, наблюдение и запасной путь, прежде чем брать бывшего врага на общую миссию.',
        'Он когда-то стрелял в нас, поэтому любая его карта ложна и слушать объяснение маршрута незачем.',
      ],
      en: [
        'Garrus can compare the former enemy’s route with the Normandy’s navigation records and grant only limited access.',
        'Shepard can require collateral, supervision, and a backup route before taking a former enemy on the mission.',
        'He once fired on us, so every map he brings is false and there is no reason to hear his route explanation.',
      ],
    },
  },
  3: {
    scenario: {
      ru: 'Перед решающим сражением Шепард предлагает вылечить кроганов, чтобы получить их армию. Советники спорят, считать ли лекарство временной военной сделкой или исполнением старого морального долга. От решения зависят союз против Жнецов и будущее кроганов.',
      en: 'Before a decisive battle, Shepard proposes curing the krogan to secure their army. Advisers dispute whether the cure is a temporary military bargain or repayment of an old moral debt. The alliance against the Reapers and the krogan future are at stake.',
    },
    explanation: {
      ru: 'Выбор не сводится к безусловному лечению или отказу от союза. Шепард может обсуждать гарантии, контроль распространения лекарства и послевоенные обязательства.',
      en: 'The choice is not limited to an unconditional cure or abandoning the alliance. Shepard can negotiate safeguards, distribution controls, and postwar obligations.',
    },
    segments: {
      ru: [
        'Шепард может связать передачу лекарства с проверяемыми гарантиями кроганского руководства и совместным контролем после войны.',
        'Либо мы немедленно отдаём кроганам лекарство без условий, либо сознательно проигрываем Жнецам; третьего пути нет.',
        'Военная польза кроганов не отменяет вопроса о генокоблаже, поэтому Совет должен обсудить и союз, и права вылеченного народа.',
      ],
      en: [
        'Shepard can tie delivery of the cure to verifiable guarantees from krogan leaders and joint postwar oversight.',
        'Either we give the krogan the cure immediately and without conditions or deliberately lose to the Reapers; there is no third path.',
        'The krogan military contribution does not erase the genophage question, so the Council must address both the alliance and the rights of a cured people.',
      ],
    },
  },
  4: {
    scenario: {
      ru: 'Кварианский адмирал требует вернуть родной мир, ссылаясь на войну предков с гетами. Легион показывает Шепарду другую версию изгнания и предупреждает о новой бойне. На кону — мир между двумя народами или повторение старой войны.',
      en: 'A quarian admiral demands the homeworld back by invoking the ancestors’ war with the geth. Legion shows Shepard a different account of the exile and warns of another massacre. The choice is peace between two peoples or a repetition of the old war.',
    },
    explanation: {
      ru: 'Возраст притязания не делает новую атаку справедливой. Решение зависит от нынешних жителей, возможностей переговоров и цены войны, а не только от обычая возвращать землю предков.',
      en: 'The age of the claim does not make a new attack just. The decision depends on present inhabitants, room for negotiation, and the cost of war, not merely on a custom of reclaiming ancestral land.',
    },
    segments: {
      ru: [
        'Кварианцы всегда возвращали утраченную землю силой, поэтому адмирал вправе начать войну независимо от нынешних намерений гетов.',
        'Шепард может сравнить архивы кварианцев с памятью Легиона и выяснить, кто сейчас контролирует спорные территории.',
        'Переговоры о возвращении части планеты и гарантиях безопасности позволят проверить, неизбежна ли новая война.',
      ],
      en: [
        'Quarians have always reclaimed lost land by force, so the admiral may begin the war regardless of the geth’s present intentions.',
        'Shepard can compare quarian archives with Legion’s memory and establish who now controls the disputed territory.',
        'Talks over partial return and security guarantees can test whether another war is truly unavoidable.',
      ],
    },
  },
  5: {
    scenario: {
      ru: 'Спектр готовит удар по базе, вокруг которой остаются гражданские корабли. Совет разрешает ограниченную операцию, но противник заявляет, что любая свобода Спектра неизбежно закончится уничтожением всего района. Шепард должен выбрать план до ухода цели.',
      en: 'A Spectre prepares a strike on a base surrounded by civilian ships. The Council authorizes a limited operation, but an opponent claims that any freedom given to the Spectre will inevitably destroy the whole district. Shepard must choose before the target escapes.',
    },
    explanation: {
      ru: 'Разрешение одной операции не уничтожает все ограничения автоматически. Для перехода от точечного удара к массовым жертвам нужны отдельные причины, которые можно сдержать правилами эвакуации и отмены.',
      en: 'Authorizing one operation does not automatically erase every limit. Moving from a targeted strike to mass casualties requires additional causes that evacuation and abort rules can constrain.',
    },
    segments: {
      ru: [
        'Шепард может установить коридор эвакуации, предел мощности оружия и условие отмены удара при движении гражданских судов.',
        'Совет может разрешить Спектру только разведку базы, пока флот проверяет число мирных кораблей и время отхода цели.',
        'Стоит дать Спектру право на один удар, и завтра он отменит эвакуацию, затем начнёт бомбить города, а после уничтожит весь сектор.',
      ],
      en: [
        'Shepard can set an evacuation corridor, a weapons limit, and an abort condition if civilian ships move into the strike zone.',
        'The Council can authorize reconnaissance only while the fleet checks civilian traffic and the target’s escape window.',
        'Allow the Spectre one strike and tomorrow he will cancel evacuations, then bomb cities, and finally destroy the entire sector.',
      ],
    },
  },
  6: {
    scenario: {
      ru: 'Шепард отдаёт приказ пройти через опасную систему ради срочного перехвата. Часть экипажа доверяет командиру после прошлых побед, а другие требуют проверить топливо, разведданные и путь отхода. Ошибка может погубить «Нормандию» ещё до встречи с целью.',
      en: 'Shepard orders a passage through a dangerous system for an urgent interception. Some crew members trust the commander after earlier victories, while others want fuel, intelligence, and an escape route checked. A mistake could destroy the Normandy before it reaches the target.',
    },
    explanation: {
      ru: 'Личная симпатия или неприязнь к Шепарду не определяет качество маршрута. Приказ нужно оценить по угрозам системы, запасам корабля и доступным обходам.',
      en: 'Personal loyalty or hostility toward Shepard does not determine whether the route is sound. The order must be judged by the system’s threats, ship reserves, and available detours.',
    },
    segments: {
      ru: [
        'Экипаж может проверить запас топлива «Нормандии», активность врага и точку возврата до входа в опасную систему.',
        'Шепард слишком самоуверен после прошлых побед, поэтому предложенный им маршрут наверняка ведёт в ловушку.',
        'Даже при срочном перехвате Джокер может сравнить прямой путь с обходом и назвать цену задержки.',
      ],
      en: [
        'The crew can check the Normandy’s fuel, enemy activity, and point of no return before entering the dangerous system.',
        'Shepard is too confident after earlier victories, so the route he proposed must lead into a trap.',
        'Even with an urgent interception, Joker can compare the direct route with a detour and state the cost of delay.',
      ],
    },
  },
  7: {
    scenario: {
      ru: 'Силы Цитадели выигрывают одну операцию после смены тактики. Политики хотят немедленно распространить тот же план на всю кампанию, а командиры напоминают о других противниках и условиях. Ошибка может стоить флоту следующего сражения.',
      en: 'Citadel forces win one operation after changing tactics. Politicians want to apply the same plan across the campaign, while commanders point to different enemies and conditions. A bad inference could cost the fleet its next battle.',
    },
    explanation: {
      ru: 'Одна победа не показывает, как тактика работает против других сил и на других участках. Нужны результаты сопоставимых операций и разбор того, что обеспечило именно этот успех.',
      en: 'One victory does not show how the tactic performs against other forces or in other sectors. Comparable operations and the factors behind this particular success are needed.',
    },
    segments: {
      ru: [
        'Эта операция удалась, значит новая тактика без исключений выиграет всю кампанию против любого противника.',
        'Командиры могут проверить, сработала ли тактика на других участках с похожим соотношением сил и снабжением.',
        'Перед расширением плана стоит отделить вклад новой тактики от внезапности атаки, ошибок врага и местных условий.',
      ],
      en: [
        'This operation succeeded, so the new tactic will win the entire campaign against any opponent without exception.',
        'The commanders can check whether the tactic worked in other sectors with similar force ratios and supply conditions.',
        'Before expanding the plan, they should separate the tactic’s effect from surprise, enemy mistakes, and local conditions.',
      ],
    },
  },
  8: {
    segments: {
      ru: [
        'Шепард может сравнить будущие потери союзного флота с шансом, что прежний план ещё достигнет цели.',
        'Совет вправе закрыть операцию и сохранить оставшиеся корабли, даже если уже погибшие экипажи не вернутся.',
        'После стольких погибших отступить нельзя: иначе их жертва окажется напрасной, поэтому флот обязан продолжать прежний план.',
      ],
      en: [
        'Shepard can compare the allied fleet’s future losses with the remaining chance that the old plan will reach its objective.',
        'The Council may end the operation and preserve the remaining ships even though the lost crews cannot return.',
        'After so many deaths, retreat is impossible: their sacrifice would be wasted, so the fleet must continue the old plan.',
      ],
    },
  },
  20: {
    segments: {
      ru: [
        'Лаборатория Окабэ уже заплатила личными потерями, поэтому обязана продолжать опыты, даже если следующая линия мира опаснее прежней.',
        'Окабэ может оценить риск нового сообщения отдельно от боли, которую прежние опыты уже причинили Маюри и остальным.',
        'Дару и Курису стоит сравнить остановку, отмену последнего изменения и ещё один опыт по будущим последствиям каждого пути.',
      ],
      en: [
        'Okabe’s laboratory has already paid through personal loss, so it must continue even if the next world line is more dangerous.',
        'Okabe can assess the risk of a new message separately from the pain earlier experiments caused Mayuri and the others.',
        'Daru and Kurisu should compare stopping, reversing the last change, and one more experiment by the future consequences of each path.',
      ],
    },
  },
  37: {
    segments: {
      ru: [
        'V может запросить у клиники частоту отказов модного импланта и проверить, кто оплатил рекламу в Найт-Сити.',
        'Популярность импланта показывает спрос, но не отвечает, сколько владельцев пережили сбой или скрыли осложнения.',
        'Имплант носит половина Найт-Сити, значит он безопасен; столько покупателей не могли одновременно ошибиться.',
      ],
      en: [
        'V can ask the clinic for the fashionable implant’s failure rate and check who paid for its Night City advertising.',
        'The implant’s popularity shows demand but not how many owners suffered failures or concealed complications.',
        'Half of Night City wears the implant, so it is safe; that many buyers could not all be wrong.',
      ],
    },
  },
  68: {
    segments: {
      ru: [
        'Один заметный сбой Матрицы доказывает, что любое восприятие Нео всегда ложно и ни одному ощущению нельзя верить.',
        'Нео может сравнить сбой с повторяющимися изменениями кода и показаниями других членов сопротивления.',
        'Единичный сбой подтверждает уязвимость Матрицы, но не определяет надёжность каждого последующего восприятия.',
      ],
      en: [
        'One visible Matrix glitch proves that every perception Neo has is always false and no sensation can be trusted.',
        'Neo can compare the glitch with recurring code changes and reports from other resistance members.',
        'A single glitch confirms that the Matrix is vulnerable but does not determine the reliability of every later perception.',
      ],
    },
  },
  87: {
    segments: {
      ru: [
        'Фонд может либо принять союз Империи целиком, либо остаться в полной изоляции; местные соглашения и нейтралитет невозможны.',
        'Селдон может рассчитать отдельные договоры с соседними мирами, не подчиняя Фонд единому имперскому блоку.',
        'Политики Терминуса могут совместить торговый договор, временную оборону и право выйти из союза при нарушении условий.',
      ],
      en: [
        'The Foundation must either accept the Imperial alliance in full or remain completely isolated; local agreements and neutrality are impossible.',
        'Seldon can model separate treaties with neighboring worlds without placing the Foundation under one Imperial bloc.',
        'Terminus leaders can combine a trade pact, temporary defense, and a right to withdraw if the terms are broken.',
      ],
    },
  },
  112: {
    segments: {
      ru: [
        'Историки могут отделить несогласие с нацистским режимом от поддержки военного поражения и проверить реальные позиции оппозиционных групп.',
        'Кто не поддерживает режим Гитлера без оговорок, тот выбирает уничтожение Германии и помогает каждому её врагу.',
        'Во время войны гражданин мог отвергать диктатуру, поддерживать защиту населения и предлагать другое политическое устройство одновременно.',
      ],
      en: [
        'Historians can separate opposition to the Nazi regime from support for military defeat and examine the actual positions of opposition groups.',
        'Anyone who does not support Hitler’s regime without reservation chooses Germany’s destruction and helps every enemy.',
        'During the war, a citizen could reject dictatorship, support civilian defense, and advocate a different political order at the same time.',
      ],
    },
  },
  145: {
    segments: {
      ru: [
        'Несколько успехов из «От нуля к единице» доказывают, что стартап Тиля почти наверняка повторит их результат в любой отрасли.',
        'Основателю стоит сравнить показанные технологические компании с закрывшимися стартапами того же возраста и рынка.',
        'Примеры «Пэйпэл» и других победителей могут подсказать механизм роста, но ожидаемую вероятность задаёт вся сопоставимая выборка.',
      ],
      en: [
        'Several Zero to One successes prove that Thiel’s startup will almost certainly reproduce their result in any industry.',
        'A founder should compare the featured technology firms with failed startups of the same age and market.',
        'PayPal and other winners may suggest a growth mechanism, but the expected probability comes from the full comparable sample.',
      ],
    },
  },
  51: {
    scenario: {
      ru: 'После похода в Средиземье певцы славят воинов, которые вернулись домой. Семьи пропавших не могут рассказать, как те же решения закончились для погибших отрядов. Совет решает, повторять ли маршрут, и цена ошибки — новые жизни.',
      en: 'After a campaign in Middle-earth, singers celebrate the warriors who returned home. The missing cannot explain how the same decisions ended for the lost companies. The council must decide whether to repeat the route, with more lives at stake.',
    },
    explanation: {
      ru: 'Песни сохраняют опыт вернувшихся и исключают погибших из выборки. Без сведений о пропавших отрядах нельзя оценить, был ли маршрут безопасным или выжившим просто повезло.',
      en: 'The songs preserve the experience of those who returned and exclude the dead from the sample. Without the lost companies, the council cannot tell whether the route was safe or the survivors were fortunate.',
    },
    segments: {
      ru: [
        'Совету следует сверить песни со списками вышедших в поход, погибших и пропавших на каждом участке маршрута.',
        'Все рассказчики добрались домой, поэтому выбранный маршрут надёжен для большинства; тех, кто не вернулся, можно не учитывать.',
        'Опыт вернувшихся полезен для описания отдельных опасностей, но частоту потерь покажут только данные обо всём походе.',
      ],
      en: [
        'The council should compare the songs with records of everyone who departed, died, or vanished along each part of the route.',
        'Every available storyteller came home, so the route is safe for most travelers; those who never returned need not be counted.',
        'The survivors can describe particular dangers, but only records for the whole expedition can establish the loss rate.',
      ],
    },
  },
  99: {
    scenario: {
      ru: 'Земные поселенцы находят на Марсе пустой дом с вещами прежних хозяев. Они хотят занять его и спорят, означает ли отсутствие жильцов отказ от собственности и памяти. Решение определит, будут ли следы марсианской культуры сохранены или присвоены.',
      en: 'Earth settlers find an empty Martian house containing the former occupants’ belongings. They want to move in and dispute whether absence means abandonment of ownership and memory. Their decision will determine whether Martian cultural traces are preserved or appropriated.',
    },
    explanation: {
      ru: 'Поселенцы ходят по кругу: дом называют ничейным, потому что его можно занять, а право занять его выводят из утверждения, что он ничейный. Нужны отдельные сведения о хозяевах и правилах наследования.',
      en: 'The settlers reason in a circle: the house is called ownerless because it can be occupied, while the right to occupy it rests on calling it ownerless. Separate evidence about the owners and inheritance is required.',
    },
    segments: {
      ru: [
        'Пустота дома показывает лишь отсутствие жильцов сейчас; записи, вещи и возможные наследники могут прояснить, кому он принадлежал.',
        'Мы вправе занять дом, потому что он ничей; он ничей именно потому, что мы вправе его занять.',
        'Поселенцы могут временно укрыться внутри, не уничтожая вещи и не объявляя марсианскую историю своей собственностью.',
      ],
      en: [
        'The empty house shows only that nobody is present now; records, belongings, and possible heirs may clarify who owned it.',
        'We may occupy the house because it is ownerless; it is ownerless precisely because we may occupy it.',
        'The settlers can use the house as temporary shelter without destroying its contents or claiming Martian history as their property.',
      ],
    },
  },
  100: {
    scenario: {
      ru: 'После разграбления пустых марсианских городов критики требуют ограничить присвоение домов и памятников. Колонисты отвечают, что без свободных экспедиций Земля потеряет обмен знаниями. Спор идёт о правилах колонизации, а не о запрете межпланетных путешествий.',
      en: 'After empty Martian cities are stripped, critics demand limits on taking houses and artifacts. Colonists answer that Earth will lose the exchange of knowledge without free expeditions. The dispute concerns rules for colonization, not a ban on interplanetary travel.',
    },
    explanation: {
      ru: 'Колонисты заменяют требование не присваивать чужое наследие более удобным тезисом о полном запрете полётов. Ответ на этот запрет не опровергает предложение охранять дома и памятники.',
      en: 'The colonists replace a demand not to appropriate another culture’s heritage with an easier claim about banning all travel. Refuting that ban does not answer the proposal to protect homes and artifacts.',
    },
    segments: {
      ru: [
        'Критики хотят запретить колонизацию, значит они требуют закрыть Марс для любых путешественников и прекратить обмен знаниями.',
        'Можно разрешить экспедиции и научный обмен, но запретить вывоз вещей и разрушение марсианских домов.',
        'Колонистам стоит ответить на узкое требование критиков: кто хранит памятники и на каких условиях люди могут пользоваться пустыми зданиями.',
      ],
      en: [
        'The critics oppose colonization, so they want Mars closed to every traveler and all exchange of knowledge stopped.',
        'Expeditions and scientific exchange can continue while removing artifacts and damaging Martian homes are prohibited.',
        'The colonists should answer the critics’ narrow proposal: who preserves the sites and under what terms people may use empty buildings.',
      ],
    },
  },
  101: {
    scenario: {
      ru: 'Историки обсуждают проект «Нациократии», в котором Сциборский предлагает авторитарное государство и корпоративное представительство. Один участник пытается снять вопрос о полномочиях власти ссылкой на политическую биографию автора. Ставка — оценка институтов, которые ограничивают выбор и несогласие.',
      en: 'Historians discuss Stsiborsky’s Natsiocracy, an authoritarian state organized through corporate representation. One participant tries to avoid the question of state power by pointing to the author’s political biography. The stakes are institutions that restrict choice and dissent.',
    },
    explanation: {
      ru: 'Политическая роль Сциборского важна для контекста, но не доказывает и не опровергает устройство предложенной системы. Критику нужно направить на концентрацию власти, порядок представительства и отсутствие независимых ограничителей.',
      en: 'Stsiborsky’s political role matters as context, but it neither proves nor refutes the proposed system. The critique must address concentrated power, representation, and the absence of independent checks.',
    },
    segments: {
      ru: [
        'Историки могут проверить, кто назначает корпоративные палаты, кому они подотчётны и допускают ли организованное несогласие.',
        'Авторитарность проекта подтверждается полномочиями единого центра и отсутствием независимых механизмов смены власти.',
        'Сциборский был политическим идеологом, поэтому разбирать его модель представительства и полномочия государства бессмысленно.',
      ],
      en: [
        'The historians can examine who appoints the corporate chambers, whom they answer to, and whether organized dissent is permitted.',
        'The project’s authoritarian character follows from the powers of its central authority and the absence of independent mechanisms for changing rulers.',
        'Stsiborsky was a political ideologue, so examining his model of representation and the state’s powers is pointless.',
      ],
    },
  },
  102: {
    scenario: {
      ru: 'Сторонники «Нациократии» предлагают заменить партийное представительство корпоративными палатами профессий и сословий. Они утверждают, что такие палаты говорят от имени единой нации, хотя открытое несогласие в модели ограничено. Историки решают, можно ли считать эту поддержку представительной.',
      en: 'Supporters of Natsiocracy propose replacing party representation with corporate chambers for professions and estates. They claim that these chambers speak for a unified nation even though open dissent is restricted. Historians must decide whether that support is representative.',
    },
    explanation: {
      ru: 'Широкое одобрение внутри разрешённых корпораций не доказывает согласия всей страны, особенно когда альтернативные организации подавлены. Нужны сведения о правилах отбора, отказах и голосах вне официальных палат.',
      en: 'Broad approval inside authorized corporations does not prove national agreement, especially when alternative organizations are suppressed. Selection rules, refusals, and voices outside the official chambers matter.',
    },
    segments: {
      ru: [
        'Историки могут сравнить состав палат с населением и проверить, имели ли несогласные возможность отказаться или выбрать других представителей.',
        'Большинство разрешённых корпораций поддержало единый центр, значит корпоративные палаты бесспорно выражают волю всей нации.',
        'Поддержка внутри официальных палат показывает позицию их членов, но не заменяет сведения о запрещённых партиях и неучтённых группах.',
      ],
      en: [
        'The historians can compare chamber membership with the population and ask whether dissenters could refuse or choose different representatives.',
        'Most authorized corporations supported the central authority, so the corporate chambers unquestionably express the will of the entire nation.',
        'Support inside official chambers shows their members’ position, but it does not replace evidence about banned parties and excluded groups.',
      ],
    },
  },
  131: {
    scenario: {
      ru: 'В политическом споре Трамп ссылается на успех в недвижимости и переговорах как на основание для решения специального государственного вопроса. Советники разделились: одни доверяют деловой репутации, другие требуют профильных данных. Ошибка может превратить узнаваемый образ в замену экспертизе.',
      en: 'In a policy dispute, Trump cites success in real estate and negotiation as grounds for deciding a specialized government question. Advisers split between trusting his business reputation and demanding field-specific evidence. The mistake could turn a familiar image into a substitute for expertise.',
    },
    explanation: {
      ru: 'Опыт в недвижимости и переговорах может быть полезен для отдельных задач, но не даёт автоматической компетентности в другой области политики. Советникам нужно опираться на профильные данные и специалистов по самому вопросу.',
      en: 'Experience in real estate and negotiation may help with some tasks, but it does not automatically confer expertise in another policy field. Advisers should use field-specific evidence and specialists.',
    },
    segments: {
      ru: [
        'Советники могут выделить ту часть решения, где опыт переговоров действительно применим, и отдельно проверить технические последствия.',
        'Трамп добился известного успеха в бизнесе, поэтому его мнение достаточно для окончательного решения и профильные специалисты не нужны.',
        'Деловые результаты подтверждают умение вести сделки, но прогноз для другой области должен опираться на её данные и риски.',
      ],
      en: [
        'The advisers can identify the part of the decision where negotiation experience is relevant and test the technical consequences separately.',
        'Trump achieved prominent business success, so his view is sufficient for the final decision and field specialists are unnecessary.',
        'Business results support his ability to negotiate, but a forecast in another field must rest on that field’s evidence and risks.',
      ],
    },
  },
  150: {
    scenario: {
      ru: 'В притче сотрудники обнаруживают, что привычный источник «сыра» исчез, и выбирают между поиском нового и попыткой вернуть старый порядок. Руководитель хочет превратить готовность к переменам в постоянное правило для команды. На кону — способность отличить полезную адаптацию от покорности любому внешнему изменению.',
      en: 'In the fable, workers discover that their familiar source of “cheese” has disappeared and choose between searching elsewhere and restoring the old arrangement. A manager wants to turn readiness for change into a permanent team rule. The stakes are whether useful adaptation can be distinguished from submission to every external change.',
    },
    explanation: {
      ru: 'Привычка быстро приспосабливаться не становится правильной только из-за долгого применения. Команда должна оценить конкретное изменение: можно ли на него влиять, кому оно выгодно и каковы издержки.',
      en: 'A long-standing habit of adapting quickly is not right merely because it is familiar. The team must assess the specific change: whether it can be influenced, who benefits, and what it costs.',
    },
    segments: {
      ru: [
        'Команда может проверить, действительно ли старый источник исчерпан, какие новые варианты доступны и кто несёт цену перехода.',
        'Мы всегда выживали, сразу приспосабливаясь к переменам, поэтому и теперь обязаны принять новый порядок без обсуждения.',
        'Поиск нового «сыра» разумен, если он лучше попытки восстановить прежний источник, а не просто потому, что движение привычно.',
      ],
      en: [
        'The team can verify whether the old source is truly exhausted, what alternatives exist, and who bears the cost of moving.',
        'We have always survived by adapting immediately, so we must accept the new arrangement without discussion this time as well.',
        'Searching for new “cheese” is reasonable if it is better than restoring the old source, not merely because movement is familiar.',
      ],
    },
  },
}

const MANUAL_EDITORIAL_OVERRIDES = {
  ...cultureOverrides001To050,
  ...cultureOverrides051To100,
  ...cultureOverrides101To150,
}

if (Object.keys(MANUAL_EDITORIAL_OVERRIDES).length !== 150) {
  throw new Error('manual_culture_editorial_overrides_must_cover_all_150_cases')
}

const EDITORIAL_OVERRIDES = {
  ...LEGACY_EDITORIAL_OVERRIDES,
  ...MANUAL_EDITORIAL_OVERRIDES,
}

const CASE_ANCHORS = {
  massEffect: { ru: 'экипаж «Нормандии»', en: 'the Normandy crew' },
  crysis3: { ru: 'Пророк и повстанцы Нью-Йорка', en: 'Prophet and the New York rebels' },
  steinsGate: { ru: 'лаборатория Окабэ', en: 'Okabe’s laboratory' },
  witcher3: { ru: 'Геральт и жители Севера', en: 'Geralt and the people of the North' },
  cyberpunk2077: { ru: 'V и жители Найт-Сити', en: 'V and the people of Night City' },
  lotr: { ru: 'Совет и отряды Средиземья', en: 'the council and the companies of Middle-earth' },
  drive: { ru: 'Водитель и семья Айрин', en: 'the Driver and Irene’s family' },
  bladeRunner: { ru: 'Декард и репликанты', en: 'Deckard and the replicants' },
  matrix: { ru: 'Нео и сопротивление', en: 'Neo and the resistance' },
  ghostShell: { ru: 'майор Кусанаги и Отдел Девять', en: 'Major Kusanagi and Section 9' },
  foundation: { ru: 'Селдон и Фонд', en: 'Seldon and the Foundation' },
  strugatsky: { ru: 'земные прогрессоры', en: 'Earth’s interventionists' },
  martianChronicles: { ru: 'земные колонисты Марса', en: 'Earth’s Martian colonists' },
  stsiborsky: { ru: 'историки «Нациократии»', en: 'historians of Natsiocracy' },
  bandera: { ru: 'историки движения Бандеры', en: 'historians of Bandera’s movement' },
  hitler: { ru: 'исследователи нацистской пропаганды', en: 'researchers of Nazi propaganda' },
  stalin: { ru: 'историки сталинского режима', en: 'historians of Stalin’s regime' },
  roosevelt: { ru: 'Рузвельт и Конгресс', en: 'Roosevelt and Congress' },
  churchill: { ru: 'Черчилль и военный кабинет', en: 'Churchill and the war cabinet' },
  hirohito: { ru: 'Хирохито и японское руководство', en: 'Hirohito and Japan’s leadership' },
  mao: { ru: 'Мао и китайское руководство', en: 'Mao and China’s leadership' },
  trump: { ru: 'Трамп и его советники', en: 'Trump and his advisers' },
  atomicHabits: { ru: 'читатель Джеймса Клира', en: 'James Clear’s reader' },
  sevenHabits: { ru: 'читатель Стивена Кови', en: 'Stephen Covey’s reader' },
  richDad: { ru: 'читатель «Богатого папы»', en: 'a Rich Dad reader' },
  thinkGrow: { ru: 'читатель Наполеона Хилла', en: 'a Napoleon Hill reader' },
  fourHour: { ru: 'владелец бизнеса у Ферриса', en: 'the business owner in Ferriss’s example' },
  secret: { ru: 'читатель «Тайны»', en: 'a reader of The Secret' },
  zeroOne: { ru: 'Тиль и основатель компании', en: 'Thiel and a company founder' },
  leanStartup: { ru: 'команда Бережливого стартапа', en: 'the Lean Startup team' },
  goodGreat: { ru: 'Коллинз и руководители выборки', en: 'Collins and the executives in his sample' },
  cheese: { ru: 'герои истории о «сыре»', en: 'the characters in the “cheese” story' },
}

function compactCaseDetail(value, wordCount = 7) {
  const words = value.replace(/[.!?]+$/u, '').split(/\s+/u)
  return words.slice(Math.max(0, words.length - wordCount)).join(' ')
}

function buildScenario(item, family) {
  const conflict = SCENARIO_CONFLICTS[family]
  return {
    ru: `${item.sceneLine.ru} ${conflict.ru}`,
    en: `${item.sceneLine.en} ${conflict.en}`,
  }
}

function buildSegments(item, family, correctIndex, caseNumber) {
  const override = EDITORIAL_OVERRIDES[caseNumber]
  if (override) return override.segments
  const reasoning = CONTEXTUAL_REASONING[family]
  const anchor = CASE_ANCHORS[item.sourceKey]
  const sceneRu = `${item.sceneLine.ru} В споре участвуют ${anchor.ru}.`
  const sceneEn = `${item.sceneLine.en} The dispute involves ${anchor.en}.`
  const claimRu = `${anchor.ru}: ${item.sceneLine.ru}`
  const claimEn = `${anchor.en}: ${item.sceneLine.en}`
  const soundA = {
    ru: reasoning.soundA.ru(sceneRu, claimRu),
    en: reasoning.soundA.en(sceneEn, claimEn),
  }
  const soundB = {
    ru: reasoning.soundB.ru(sceneRu, claimRu),
    en: reasoning.soundB.en(sceneEn, claimEn),
  }
  const fallacy = {
    ru: reasoning.error.ru(sceneRu, claimRu).replace(`${sceneRu} ${claimRu}`, claimRu),
    en: reasoning.error.en(sceneEn, claimEn).replace(`${sceneEn} ${claimEn}`, claimEn),
  }
  const ordered = [soundA, soundB]
  ordered.splice(correctIndex, 0, fallacy)
  return {
    ru: ordered.map((segment) => segment.ru),
    en: ordered.map((segment) => segment.en),
  }
}

function buildExplanation(item, family) {
  return {
    ru: `${item.contextLabel.ru} ${FAMILY_EXPLANATIONS[family].ru}`,
    en: `${item.contextLabel.en} ${FAMILY_EXPLANATIONS[family].en}`,
  }
}

export const cultureLogicChallenges = RAW_CHALLENGES.map((item, index) => {
  const sequence = String(index + 1).padStart(3, '0')
  const family = FAMILY_BY_CASE_NUMBER.get(index + 1)
  const correctIndex = (index * 2 + Math.floor(index / 15)) % 3
  const override = EDITORIAL_OVERRIDES[index + 1]

  return {
    id: `logic-culture-${sequence}-v1`,
    contextId: `culture-${sequence}`,
    country: `culture-${item.kind}`,
    origin: 'culture',
    difficulty: Math.floor(index / 50) + 1,
    family,
    label: FAMILY_LABELS[family],
    explanation: override?.explanation || buildExplanation(item, family),
    contextLabel: item.contextLabel,
    scenario: override?.scenario || buildScenario(item, family),
    sourceType: SOURCE_TYPES[item.kind],
    prompt: PROMPTS[index % PROMPTS.length],
    segments: buildSegments(item, family, correctIndex, index + 1),
    correctIndex,
    source: toSource(item.sourceKey),
  }
})

function countBy(items, select) {
  return items.reduce((counts, item) => {
    const key = String(select(item))
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
}

function assertBalanced(actual, keys, expected, errorCode) {
  if (keys.some((key) => actual[key] !== expected)) {
    throw new Error(`${errorCode}:${JSON.stringify(actual)}`)
  }
}

if (cultureLogicChallenges.length !== 150) throw new Error('culture_logic_catalog_must_contain_150_cases')

const expectedIds = cultureLogicChallenges.every((item, index) => (
  item.id === `logic-culture-${String(index + 1).padStart(3, '0')}-v1`
  && item.contextId === `culture-${String(index + 1).padStart(3, '0')}`
))
if (!expectedIds) throw new Error('culture_logic_ids_must_be_sequential')
if (new Set(cultureLogicChallenges.map((item) => item.id)).size !== 150) throw new Error('culture_logic_ids_must_be_unique')

assertBalanced(countBy(cultureLogicChallenges, (item) => item.difficulty), ['1', '2', '3'], 50, 'culture_logic_difficulty_balance')
assertBalanced(countBy(cultureLogicChallenges, (item) => item.correctIndex), ['0', '1', '2'], 50, 'culture_logic_answer_position_balance')
assertBalanced(countBy(cultureLogicChallenges, (item) => item.family), FAMILIES, 10, 'culture_logic_family_balance')
assertBalanced(countBy(RAW_CHALLENGES, (item) => item.kind), ['fiction'], 100, 'culture_logic_fiction_count')
assertBalanced(countBy(RAW_CHALLENGES, (item) => item.kind), ['history'], 31, 'culture_logic_history_count')
assertBalanced(countBy(RAW_CHALLENGES, (item) => item.kind), ['book'], 19, 'culture_logic_book_count')

function maximumRepetition(values) {
  return Math.max(...Object.values(countBy(values, (value) => value)))
}

const allSegmentsRu = cultureLogicChallenges.flatMap((item) => item.segments.ru)
const allSegmentsEn = cultureLogicChallenges.flatMap((item) => item.segments.en)
const fullCasesRu = cultureLogicChallenges.map((item) => [item.contextLabel.ru, item.scenario.ru, ...item.segments.ru].join('|'))
const fullCasesEn = cultureLogicChallenges.map((item) => [item.contextLabel.en, item.scenario.en, ...item.segments.en].join('|'))

if (new Set(cultureLogicChallenges.map((item) => item.scenario.ru)).size !== 150) throw new Error('culture_scenarios_ru_must_be_unique')
if (new Set(cultureLogicChallenges.map((item) => item.scenario.en)).size !== 150) throw new Error('culture_scenarios_en_must_be_unique')
if (new Set(fullCasesRu).size !== 150) throw new Error('culture_full_cases_ru_must_be_unique')
if (new Set(fullCasesEn).size !== 150) throw new Error('culture_full_cases_en_must_be_unique')
if (maximumRepetition(allSegmentsRu) > 5) throw new Error('culture_segments_ru_repeat_too_often')
if (maximumRepetition(allSegmentsEn) > 5) throw new Error('culture_segments_en_repeat_too_often')
if (maximumRepetition(allSegmentsRu.map((segment) => segment.slice(0, 72))) > 2) throw new Error('culture_segments_ru_reuse_common_scaffold')
if (maximumRepetition(allSegmentsEn.map((segment) => segment.slice(0, 72))) > 2) throw new Error('culture_segments_en_reuse_common_scaffold')

const BANNED_GENERIC_FRAGMENTS = {
  ru: [
    'факты сцены',
    'разбор сцены',
    'анализируя сцену',
    'применительно к ситуации',
    'предмет учебного разбора',
    'учебный пересказ',
    'этот вывод',
    'сторонам нужен независимый признак',
    'важно выяснить',
    'для общего правила нужны',
    'основание должно',
  ],
  en: [
    'facts of the scene',
    'scene analysis',
    'analyzing the scene',
    'for the situation',
    'educational analysis',
    'educational paraphrase',
    'this conclusion',
    'the parties need an independent sign',
    'it is important to determine',
    'a general rule requires',
    'the premise must',
  ],
}

function sentenceCount(value) {
  return (value.match(/[.!?](?:["'”’»)\]]*)?(?:\s|$)/gu) || []).length
}

const BANNED_SEGMENT_OPENERS = {
  ru: [
    'Применительно к ситуации',
    'Анализируя сцену',
    'В эпизоде',
    'Предмет учебного разбора',
    'Если держаться событий сцены',
    'Оценивая ситуацию',
    'В центре эпизода',
    'Для проверки рассуждения возьмём сцену',
    'Разбор касается сцены',
    'В описанном споре',
    'Отправная точка',
    'Конкретный вопрос',
    'При оценке эпизода',
    'Здесь предмет проверки',
    'Сцена для анализа',
    'В рамках этого выбора',
    'Если разбирать момент',
    'Для этого конфликта',
    'Контекст ограничивает вывод сценой',
    'Рассуждение относится к моменту',
    'Сначала зафиксируем ситуацию',
    'Аргумент проверяется на материале сцены',
    'Для различения факта и вывода важна сцена',
    'Основания оцениваются в сцене',
    'Логический разбор привязан к сцене',
    'Данные нужно соотнести со сценой',
    'Перед выводом уточним сцену',
    'Довод относится к сцене',
    'Проверка начинается со сцены',
    'В этом контексте рассматривается сцена',
  ],
  en: [
    'For the situation',
    'Analyzing the scene',
    'In the episode',
    'The subject of the educational analysis',
    'Sticking to the events in the scene',
    'Assessing the situation',
    'At the center of the episode',
    'To test the reasoning, consider the scene',
    'The analysis concerns the scene',
    'In the dispute described as',
    'The starting point',
    'The specific question',
    'When assessing the episode',
    'Here the subject under review',
    'The scene under analysis',
    'Within this choice',
    'When examining the moment',
    'For this conflict',
    'The context limits the conclusion to the scene',
    'The reasoning concerns the moment',
    'First establish the situation',
    'The argument is tested against the scene',
    'The scene matters when separating fact from inference',
    'The reasons are assessed in the scene',
    'The logical analysis is tied to the scene',
    'The evidence must be related to the scene',
    'Before drawing a conclusion, consider the scene',
    'The argument concerns the scene',
    'The inquiry starts with the scene',
    'This context examines the scene',
  ],
}

for (const [itemIndex, item] of cultureLogicChallenges.entries()) {
  if (item.origin !== 'culture') throw new Error(`invalid_culture_origin:${item.id}`)
  if (!item.country.startsWith('culture-')) throw new Error(`invalid_culture_namespace:${item.id}`)
  if (![1, 2, 3].includes(item.difficulty)) throw new Error(`invalid_culture_difficulty:${item.id}`)
  if (![0, 1, 2].includes(item.correctIndex)) throw new Error(`invalid_culture_correct_index:${item.id}`)
  if (!item.label?.ru || !item.label?.en || !item.explanation?.ru || !item.explanation?.en) throw new Error(`invalid_culture_bilingual_metadata:${item.id}`)
  if (!item.contextLabel?.ru || !item.contextLabel?.en || !item.scenario?.ru || !item.scenario?.en || !item.sourceType?.ru || !item.sourceType?.en) throw new Error(`invalid_culture_context_metadata:${item.id}`)
  if (!item.prompt?.ru || !item.prompt?.en) throw new Error(`invalid_culture_prompt:${item.id}`)
  if (item.segments?.ru?.length !== 3 || item.segments?.en?.length !== 3) throw new Error(`invalid_culture_segments:${item.id}`)
  if (sentenceCount(item.scenario.ru) < 2 || sentenceCount(item.scenario.ru) > 4) throw new Error(`culture_ru_scenario_must_have_2_to_4_sentences:${item.id}`)
  if (sentenceCount(item.scenario.en) < 2 || sentenceCount(item.scenario.en) > 4) throw new Error(`culture_en_scenario_must_have_2_to_4_sentences:${item.id}`)
  if (item.scenario.ru.includes(item.contextLabel.ru) || item.scenario.en.includes(item.contextLabel.en)) throw new Error(`culture_scenario_must_not_copy_context_label:${item.id}`)
  if (item.segments.ru.some((segment) => segment.includes(item.contextLabel.ru)) || item.segments.en.some((segment) => segment.includes(item.contextLabel.en))) throw new Error(`culture_segment_must_not_copy_context_label:${item.id}`)
  if (item.scenario.ru.length > 520 || item.scenario.en.length > 620) throw new Error(`culture_scenario_exceeds_desktop_budget:${item.id}`)
  const caseNumber = Number(item.id.slice('logic-culture-'.length, 'logic-culture-'.length + 3))
  if (!MANUAL_EDITORIAL_OVERRIDES[caseNumber]) {
    const signature = OVERRIDE_FALLACY_SIGNATURES[caseNumber] || FALLACY_SIGNATURES[item.family]
    const ruSignatureMatches = item.segments.ru.map((segment) => segment.includes(signature.ru))
    const enSignatureMatches = item.segments.en.map((segment) => segment.includes(signature.en))
    if (ruSignatureMatches.filter(Boolean).length !== 1 || !ruSignatureMatches[item.correctIndex]) throw new Error(`culture_ru_fallacy_signature_mismatch:${item.id}`)
    if (enSignatureMatches.filter(Boolean).length !== 1 || !enSignatureMatches[item.correctIndex]) throw new Error(`culture_en_fallacy_signature_mismatch:${item.id}`)
  }
  if (item.segments.ru.some((segment) => BANNED_SEGMENT_OPENERS.ru.some((opener) => segment.startsWith(opener)))) throw new Error(`culture_ru_segment_uses_mechanical_opener:${item.id}`)
  if (item.segments.en.some((segment) => BANNED_SEGMENT_OPENERS.en.some((opener) => segment.startsWith(opener)))) throw new Error(`culture_en_segment_uses_mechanical_opener:${item.id}`)
  if (item.segments.ru.some((segment) => BANNED_GENERIC_FRAGMENTS.ru.some((fragment) => segment.toLowerCase().includes(fragment)))) throw new Error(`culture_ru_segment_uses_generic_fragment:${item.id}`)
  if (item.segments.en.some((segment) => BANNED_GENERIC_FRAGMENTS.en.some((fragment) => segment.toLowerCase().includes(fragment)))) throw new Error(`culture_en_segment_uses_generic_fragment:${item.id}`)
  if (!EDITORIAL_OVERRIDES[itemIndex + 1]) {
    const anchor = CASE_ANCHORS[RAW_CHALLENGES[itemIndex].sourceKey]
    if (item.segments.ru.some((segment) => !segment.includes(anchor.ru))) throw new Error(`culture_ru_segment_missing_case_anchor:${item.id}`)
    if (item.segments.en.some((segment) => !segment.includes(anchor.en))) throw new Error(`culture_en_segment_missing_case_anchor:${item.id}`)
  }
  if (/учебн/u.test(item.sourceType.ru) || /educational|paraphrase/iu.test(item.sourceType.en)) throw new Error(`culture_source_type_must_not_be_educational:${item.id}`)
  if ([...item.segments.ru, ...item.segments.en].some((segment) => segment.length < 35)) throw new Error(`culture_segment_too_short:${item.id}`)
  if (item.segments.ru.some((segment) => segment.length > 320) || item.segments.en.some((segment) => segment.length > 380)) throw new Error(`culture_segment_exceeds_desktop_budget:${item.id}`)
  if (item.explanation.ru === FAMILY_EXPLANATIONS[item.family].ru || item.explanation.en === FAMILY_EXPLANATIONS[item.family].en) throw new Error(`culture_explanation_must_be_scene_specific:${item.id}`)
  if (item.segments.en.some((segment) => /[А-Яа-яЁё]/u.test(segment))) throw new Error(`cyrillic_in_english_segment:${item.id}`)
  if (!item.source?.title?.ru || !item.source?.title?.en || !item.source?.url) throw new Error(`invalid_culture_source:${item.id}`)
  const parsedSource = new URL(item.source.url)
  if (parsedSource.protocol !== 'https:') throw new Error(`culture_source_must_use_https:${item.id}`)
}
import { cultureOverrides001To050 } from './logic-game-culture-overrides-001-050.mjs'
import { cultureOverrides051To100 } from './logic-game-culture-overrides-051-100.mjs'
import { cultureOverrides101To150 } from './logic-game-culture-overrides-101-150.mjs'
