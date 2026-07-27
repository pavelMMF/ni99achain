// Every segment is an educational reconstruction, not a quotation from the linked source.
export const realWorldUaUsCases = [
  {
    key: 'ua-us-01',
    country: 'ukraine',
    family: 'false-dilemma',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: '24 февраля 2022 года указ № 64/2022 ввёл военное положение на 30 дней из-за военной агрессии; Верховная Рада утвердила его 300 голосами.',
      en: 'On February 24, 2022, Decree No. 64/2022 imposed martial law for 30 days because of military aggression; the Verkhovna Rada approved it with 300 votes.',
    },
    segments: {
      ru: [
        'Конкретные ограничения следует сверять с текстом указа и нормами действующего закона.',
        'Либо человек безоговорочно поддерживает каждую меру военного положения, либо он поддерживает агрессора.',
        'Можно поддерживать введение режима и одновременно спорить о необходимости или соразмерности отдельной меры.',
      ],
      en: [
        'Specific restrictions should be checked against the decree and the applicable law.',
        'Either a person supports every martial-law measure unconditionally or sides with the aggressor.',
        'A person may support martial law while questioning the necessity or proportionality of a particular measure.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика искусственно оставляет только две позиции. Введение режима не превращает критику любой отдельной меры в поддержку противника.',
      en: 'The flawed statement invents only two possible positions. Supporting martial law does not make criticism of every individual measure support for the aggressor.',
    },
    source: {
      title: {
        ru: 'Президент подписал указ о введении военного положения в Украине, Верховная Рада его утвердила',
        en: 'President signed a decree on the imposition of martial law in Ukraine, the Verkhovna Rada approved it',
      },
      url: 'https://www.president.gov.ua/en/news/prezident-pidpisav-ukaz-pro-zaprovadzhennya-voyennogo-stanu-73109',
    },
  },
  {
    key: 'ua-us-02',
    country: 'ukraine',
    family: 'straw-man',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: '21 августа 2024 года Верховная Рада 281 голосом ратифицировала Римский статут; официальный материал перечисляет отдельные категории особо тяжких преступлений.',
      en: 'On August 21, 2024, the Verkhovna Rada ratified the Rome Statute with 281 votes; the official material lists specified categories of grave crimes.',
    },
    segments: {
      ru: [
        'Ратификация упразднила украинские суды и передала Международному уголовному суду любое уголовное дело.',
        'Официальный материал описывает юрисдикцию международного суда применительно к отдельным категориям особо тяжких преступлений.',
        'Возражения против решения нужно сопоставлять с настоящим текстом статута и законом о его ратификации.',
      ],
      en: [
        'Ratification abolished Ukrainian courts and transferred every criminal case to the International Criminal Court.',
        'The official material describes international jurisdiction over specified categories of exceptionally grave crimes.',
        'Objections to the decision should address the actual statute and the law that ratified it.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика заменяет ограниченное решение гораздо более радикальным тезисом, которого источник не содержит, а затем атакует эту подмену.',
      en: 'The flawed statement replaces a limited decision with a much broader claim that the source does not make, then attacks that substitute claim.',
    },
    source: {
      title: {
        ru: 'Верховная Рада Украины ратифицировала Римский статут Международного уголовного суда и поправки к нему',
        en: 'The Verkhovna Rada of Ukraine ratified the Rome Statute of the International Criminal Court and its amendments',
      },
      url: 'https://www.rada.gov.ua/news/razom/252711.html',
    },
  },
  {
    key: 'ua-us-03',
    country: 'ukraine',
    family: 'circular-reasoning',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Закон № 3841-ІХ устанавливает порядок сбора, анализа и публикации предложений заинтересованных сторон; основная часть начнёт действовать после прекращения военного положения.',
      en: 'Law No. 3841-IX establishes procedures for collecting, analysing, and publishing stakeholder proposals; its main provisions take effect after martial law ends.',
    },
    segments: {
      ru: [
        'Закон требует собирать и анализировать предложения, а после консультации публиковать итоговый отчёт.',
        'Качество консультации можно проверять по альтернативам, составу участников и реакции на предложения.',
        'Консультация была содержательной, потому что дала хорошее решение; решение хорошее, потому что консультация была содержательной.',
      ],
      en: [
        'The law requires proposals to be collected and analysed and a final report to be published after consultation.',
        'Consultation quality can be tested through the alternatives, participants, and responses to proposals.',
        'The consultation was meaningful because it produced a good decision, and the decision was good because the consultation was meaningful.',
      ],
    },
    explanation: {
      ru: 'В ошибочной реплике два утверждения подтверждают друг друга, но независимого основания ни для одного из них не приведено.',
      en: 'The flawed statement uses each claim to support the other while providing no independent basis for either one.',
    },
    source: {
      title: { ru: 'О публичных консультациях', en: 'On Public Consultations' },
      url: 'https://zakon.rada.gov.ua/laws/show/3841-IX',
    },
  },
  {
    key: 'ua-us-04',
    country: 'ukraine',
    family: 'sunk-cost',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: '18 марта 2024 года правительство утвердило план программы «Механизм для Украины» с более чем 150 индикаторами по 69 направлениям реформ; выплаты связали с их выполнением.',
      en: 'On March 18, 2024, the government approved the Ukraine Facility Plan with more than 150 indicators across 69 reform areas; payments were tied to their completion.',
    },
    segments: {
      ru: [
        'Уже понесённые расходы важны как цена перехода, но сами по себе не доказывают пользу продолжения.',
        'Раз на выполнение индикатора уже потрачены ресурсы, его нельзя менять, даже если новые данные показывают неэффективность.',
        'Решение о продолжении должно учитывать будущую пользу, будущие расходы и принятые обязательства.',
      ],
      en: [
        'Past spending may affect switching costs, but it does not by itself prove that continuation is beneficial.',
        'Because resources have already been spent on an indicator, it must remain even if new evidence shows that it is ineffective.',
        'The decision to continue should consider future benefits, future costs, and existing commitments.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика делает невозвратные расходы основанием для будущего решения. Значимы последствия доступных вариантов, а не желание оправдать прошлые траты.',
      en: 'The flawed statement treats irrecoverable spending as a reason for a future choice. The relevant factors are the future consequences of the available options.',
    },
    source: {
      title: {
        ru: 'Правительство утвердило план реализации программы «Механизм для Украины»',
        en: 'Government approves the Ukraine Facility Plan',
      },
      url: 'https://eu-ua.kmu.gov.ua/en/news/uryad-zatverdyv-plan-dlya-realizatsiyi-programy-ukraine-facility/',
    },
  },
  {
    key: 'ua-us-05',
    country: 'ukraine',
    family: 'survivorship',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'На начало 2025 года в реестре было 247 819 повреждённых или уничтоженных объектов; компенсацию получили более 70 тысяч семей, а почти 5 тысяч заявителей получили сертификаты.',
      en: 'At the start of 2025, the register contained 247,819 damaged or destroyed properties; more than 70,000 families received compensation and nearly 5,000 applicants received certificates.',
    },
    segments: {
      ru: [
        'Истории семей, уже получивших компенсацию, доказывают, что программа одинаково доступна всем пострадавшим.',
        'Официальная страница отдельно приводит число зарегистрированных объектов, выплат и выданных сертификатов.',
        'Для оценки доступности нужны также данные об отказах, сроках ожидания и людях, не сумевших подать заявление.',
      ],
      en: [
        'Stories from families that received compensation prove that the program is equally accessible to every affected household.',
        'The official page reports registered properties, compensation payments, and issued certificates separately.',
        'An accessibility assessment also needs denied, pending, and unsubmitted cases and their waiting times.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика рассматривает только заметную группу получателей и исключает из вывода менее заметные неуспешные случаи.',
      en: 'The flawed statement considers only the visible group of recipients and leaves less visible unsuccessful cases out of the conclusion.',
    },
    source: {
      title: { ru: 'еВосстановление', en: 'eRecovery' },
      url: 'https://mindev.gov.ua/proiekty/yevidnovlennia',
    },
  },
  {
    key: 'ua-us-06',
    country: 'ukraine',
    family: 'composition',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'По итогам 2023 года система ДРИМ содержала более 1 560 проектов восстановления и сведения о 49,9 млрд грн подтверждённого финансирования.',
      en: 'By the end of 2023, DREAM contained more than 1,560 recovery projects and data on UAH 49.9 billion in confirmed financing.',
    },
    segments: {
      ru: [
        'Система публикует сведения об отдельных проектах восстановления и этапах их реализации.',
        'Для оценки общего портфеля нужно сравнивать проекты, учитывать приоритеты и ограниченность ресурсов.',
        'Если каждый проект по отдельности прозрачен, весь портфель автоматически оптимален и эффективен.',
      ],
      en: [
        'The system publishes information about individual recovery projects and their implementation stages.',
        'Portfolio assessment requires project comparison, policy priorities, and resource constraints.',
        'If every individual project is transparent, the entire portfolio is automatically optimal and efficient.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика без дополнительного анализа переносит свойство отдельных проектов на весь портфель проектов.',
      en: 'The flawed statement transfers a property of individual projects to the whole portfolio without additional analysis.',
    },
    source: {
      title: {
        ru: 'Государственная цифровая экосистема обеспечивает инструменты прозрачного и подотчётного восстановления',
        en: 'The state digital ecosystem DREAM provides tools for transparent and accountable recovery',
      },
      url: 'https://restoration.gov.ua/blog/instrumenty-dlya-prozorogo-ta-pidzvitnogo-vidnovlennya-yak-dlya-gromad-tak-i-dlya-mizhnarodnyh-partneriv-zabezpechuye-derzhavna-czyfrova-ekosystema-dream/',
    },
  },
  {
    key: 'ua-us-07',
    country: 'ukraine',
    family: 'tradition',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Закон об административной процедуре регулирует рассмотрение дел и принятие административных актов органами публичной власти.',
      en: 'The Law on Administrative Procedure governs how public authorities consider cases and adopt administrative acts.',
    },
    segments: {
      ru: [
        'Закон задаёт общие правила принятия и исполнения индивидуальных административных актов.',
        'Прежними процедурами пользовались много лет, поэтому они обязательно справедливее любых новых правил.',
        'Старые и новые правила следует сравнивать по защите прав, срокам и возможности обжалования.',
      ],
      en: [
        'The law sets general rules for adopting and carrying out individual administrative acts.',
        'The previous procedures were used for many years, so they must be fairer than any new rules.',
        'Old and new rules should be compared by rights protection, timing, and appeal safeguards.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика считает длительность существования практики доказательством её справедливости, хотя это отдельный вопрос.',
      en: 'The flawed statement treats the age of a practice as proof that it is fair, although those are separate questions.',
    },
    source: {
      title: { ru: 'Об административной процедуре', en: 'On Administrative Procedure' },
      url: 'https://zakon.rada.gov.ua/laws/show/2073-20',
    },
  },
  {
    key: 'ua-us-08',
    country: 'united-states',
    family: 'ad-hominem',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'В 2024 году Верховный суд отменил доктрину «Шеврон» и потребовал от судов самостоятельно толковать законы; прежние решения не были автоматически отменены.',
      en: 'In 2024, the Supreme Court overruled the Chevron doctrine and required courts to exercise independent judgment when interpreting statutes; earlier holdings were not automatically invalidated.',
    },
    segments: {
      ru: [
        'Суд отменил прежнюю доктрину, но не объявил недействительными все решения, которые ранее на неё опирались.',
        'Критику решения следует строить вокруг текста закона, административной процедуры и аргументов о прецеденте.',
        'Мне не нравится судья, написавший мнение, поэтому его правовой анализ следует считать заведомо ложным.',
      ],
      en: [
        'The Court overruled the doctrine without invalidating every earlier holding that had relied on it.',
        'Criticism should address the statutory text, administrative procedure, and the arguments about precedent.',
        'I dislike the justice who wrote the opinion, so the legal analysis should be treated as necessarily false.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика оценивает личность автора вместо содержания его правовых доводов и связи вывода с законом.',
      en: 'The flawed statement attacks the author instead of examining the legal arguments and their connection to the statute.',
    },
    source: {
      title: {
        ru: '«Лопер Брайт Энтерпрайзис» против Раймондо, решение от 28 июня 2024 года',
        en: 'Loper Bright Enterprises v. Raimondo, decided June 28, 2024',
      },
      url: 'https://www.supremecourt.gov/opinions/23pdf/22-451_7m58.pdf',
    },
  },
  {
    key: 'ua-us-09',
    country: 'united-states',
    family: 'slippery-slope',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'Исполнительный указ № 14110 от 2023 года предусматривал стандартизированные проверки и состязательное тестирование систем искусственного интеллекта, одновременно поддерживая инновации и конкуренцию.',
      en: 'Executive Order 14110 of 2023 called for standardised evaluations and red-team testing of artificial intelligence systems while also supporting innovation and competition.',
    },
    segments: {
      ru: [
        'Если власти потребуют стандартных проверок искусственного интеллекта, затем они неизбежно введут лицензию на каждую модель и запретят независимое программирование.',
        'Указ сочетал меры проверки безопасности с заявленной поддержкой открытой конкуренции и ответственных инноваций.',
        'Для каждого предполагаемого перехода в такой цепочке нужны отдельный механизм и доказательства его вероятности.',
      ],
      en: [
        'If authorities require standard artificial intelligence tests, they will inevitably license every model and then ban independent programming.',
        'The order combined safety evaluation measures with stated support for open competition and responsible innovation.',
        'Each predicted transition in such a chain needs a mechanism and evidence showing that it is likely.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика объявляет цепочку всё более жёстких последствий неизбежной, но не объясняет ни одного перехода между ними.',
      en: 'The flawed statement declares an escalating chain of consequences inevitable without explaining any transition in that chain.',
    },
    source: {
      title: {
        ru: 'Исполнительный указ № 14110 «Безопасная, защищённая и заслуживающая доверия разработка и применение искусственного интеллекта»',
        en: 'Executive Order 14110: Safe, Secure, and Trustworthy Development and Use of Artificial Intelligence',
      },
      url: 'https://www.govinfo.gov/content/pkg/FR-2023-11-01/pdf/2023-24283.pdf',
    },
  },
  {
    key: 'ua-us-10',
    country: 'united-states',
    family: 'hasty-generalization',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Бюро трудовой статистики сообщило о росте занятости на 206 тысяч в июне 2024 года при безработице 4,1 процента; рост был сосредоточен в нескольких отраслях.',
      en: 'The Bureau of Labor Statistics reported a payroll increase of 206,000 in June 2024 and an unemployment rate of 4.1 percent; gains were concentrated in several industries.',
    },
    segments: {
      ru: [
        'В июне занятость выросла главным образом в государственном секторе, здравоохранении, социальной помощи и строительстве.',
        'Один положительный месяц доказывает, что все отрасли вошли в постоянный подъём и безработица теперь может только снижаться.',
        'Для вывода об устойчивом тренде нужны более длинный ряд, отраслевой разрез и последующие пересмотры данных.',
      ],
      en: [
        'June employment gains were concentrated in government, health care, social assistance, and construction.',
        'One positive month proves that every industry has entered a permanent boom and unemployment can only decline now.',
        'A durable trend requires a longer series, industry detail, and later revisions to the reported data.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика превращает один месячный результат, неодинаковый для разных отраслей, в общий и бессрочный вывод.',
      en: 'The flawed statement turns one monthly result, which differed across industries, into a universal and permanent conclusion.',
    },
    source: {
      title: { ru: 'Положение в сфере занятости, июнь 2024 года', en: 'The Employment Situation: June 2024' },
      url: 'https://www.bls.gov/news.release/archives/empsit_07052024.htm',
    },
  },
  {
    key: 'ua-us-11',
    country: 'united-states',
    family: 'post-hoc',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Доклад Федеральной резервной системы за март 2023 года одновременно отмечал повышение ставок, замедление инфляции, ослабление перебоев поставок и снижение цен на энергию.',
      en: 'The March 2023 Federal Reserve report noted higher interest rates, slower inflation, easing supply bottlenecks, and lower energy prices during the same period.',
    },
    segments: {
      ru: [
        'Инфляция замедлилась после своего пика, а Федеральная резервная система в тот же период повышала целевой диапазон ставки.',
        'Причинная оценка должна учитывать задержки действия политики, условия поставок, цены на энергию и альтернативный сценарий.',
        'Ставки выросли раньше, чем инфляция замедлилась, значит только повышение ставок вызвало всё наблюдаемое замедление.',
      ],
      en: [
        'Inflation slowed after its peak while the Federal Reserve was raising its target interest-rate range.',
        'Causal assessment should consider policy lags, supply conditions, energy prices, and a counterfactual scenario.',
        'Rates rose before inflation slowed, so rate increases alone caused the entire observed slowdown.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика выдаёт последовательность событий за достаточное доказательство единственной причины, хотя источник отмечает несколько факторов.',
      en: 'The flawed statement treats temporal order as sufficient proof of a single cause even though the source identifies several factors.',
    },
    source: {
      title: { ru: 'Доклад о денежно-кредитной политике, март 2023 года', en: 'Monetary Policy Report: March 2023' },
      url: 'https://www.federalreserve.gov/monetarypolicy/2023-03-mpr-summary.htm',
    },
  },
  {
    key: 'ua-us-12',
    country: 'united-states',
    family: 'false-authority',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Пресс-кит миссии «Артемида-2» описывал её как первый пилотируемый испытательный полёт программы и перечислял проверку систем, аварийных процедур и сбор данных.',
      en: 'The Artemis II press kit described the mission as the first crewed test flight in the campaign and listed system checks, emergency operations, and data collection among its priorities.',
    },
    segments: {
      ru: [
        'Популярный киноактёр считает системы миссии безопасными, поэтому дальнейшая техническая проверка совершенно не нужна.',
        'В задачи испытательного полёта входили проверка систем, операций, аварийных возможностей и сбор данных.',
        'Вывод о безопасности должен опираться на инженерные испытания, критерии миссии и профильную экспертизу.',
      ],
      en: [
        'A popular film actor considers the mission systems safe, so no further technical review is needed at all.',
        'The test-flight objectives included systems, operations, emergency capabilities, and data collection.',
        'Safety conclusions should rely on engineering tests, mission criteria, and relevant technical expertise.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика подменяет профильные данные мнением известного человека, чья известность не подтверждает компетентность в космической технике.',
      en: 'The flawed statement replaces relevant evidence with the view of a famous person whose fame does not establish aerospace expertise.',
    },
    source: {
      title: { ru: 'Пресс-кит миссии «Артемида-2»', en: 'Artemis II Press Kit' },
      url: 'https://www.nasa.gov/artemis-ii-press-kit/',
    },
  },
  {
    key: 'ua-us-13',
    country: 'united-states',
    family: 'equivocation',
    difficulty: 3,
    correctIndex: 1,
    context: {
      ru: 'Сайт Конгресса указывает для законопроекта № 5376 название «Закон о снижении инфляции 2022 года»; 16 августа 2022 года он стал публичным законом № 117-169.',
      en: 'Congress.gov identifies H.R. 5376 as the Inflation Reduction Act of 2022; it became Public Law 117-169 on August 16, 2022.',
    },
    segments: {
      ru: [
        'В указанном на сайте Конгресса названии закона содержится выражение «снижение инфляции».',
        'Снижение инфляции означает, что цена каждого отдельного товара обязательно должна стать ниже.',
        'Снижение темпа инфляции может означать, что общий уровень цен продолжает расти, но делает это медленнее.',
      ],
      en: [
        'The title identified on the congressional website contains the phrase inflation reduction.',
        'Reducing inflation means that the price of every individual product must necessarily fall.',
        'Lower inflation may mean that the general price level is still rising, but at a slower rate.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика подменяет темп изменения общего уровня цен направлением изменения цены каждого отдельного товара.',
      en: 'The flawed statement switches from the rate of change in the general price level to the direction of every individual price.',
    },
    source: {
      title: {
        ru: 'Наименования законопроекта № 5376 Палаты представителей, 117-й Конгресс',
        en: 'Titles: H.R. 5376, 117th Congress (2021-2022)',
      },
      url: 'https://www.congress.gov/bill/117th-congress/house-bill/5376/titles',
    },
  },
  {
    key: 'ua-us-14',
    country: 'united-states',
    family: 'base-rate',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'Главное контрольное управление оценило ежегодные федеральные потери от мошенничества в 233-521 млрд долларов, или 3-7 процентов средних обязательств за 2018-2022 годы.',
      en: 'The Government Accountability Office estimated annual federal fraud losses at $233 billion to $521 billion, or 3 to 7 percent of average obligations for fiscal years 2018 through 2022.',
    },
    segments: {
      ru: [
        'Совокупные потери огромны, поэтому любой платёж, отмеченный автоматическим фильтром, почти наверняка мошеннический даже без данных о частоте мошенничества в программе.',
        'Официальная оценка даёт диапазон 3-7 процентов обязательств и отмечает различия между условиями риска.',
        'Вероятность мошенничества после сигнала зависит от базовой частоты, чувствительности проверки и доли ложных срабатываний.',
      ],
      en: [
        'Aggregate losses are huge, so any payment flagged by an automated screen is almost certainly fraudulent even without a program-specific fraud rate.',
        'The official estimate gives a range of 3 to 7 percent of obligations and notes differences among risk environments.',
        'The probability of fraud after a flag depends on the base rate, test sensitivity, and the false-positive rate.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика переносит крупную совокупную сумму на отдельный платёж. Без базовой частоты и характеристик фильтра такой вывод не следует.',
      en: 'The flawed statement applies a large aggregate loss to one payment. The conclusion does not follow without the base rate and the screening characteristics.',
    },
    source: {
      title: {
        ru: 'Целостность программ: меры ведомств и Конгресса по управлению рисками ошибочных выплат и мошенничества',
        en: 'Program Integrity: Agencies and Congress Can Take Actions to Better Manage Improper Payments and Fraud Risks',
      },
      url: 'https://www.gao.gov/products/gao-25-108172',
    },
  },
]
