// Every flawed segment is an educational reconstruction, not a quotation from the linked source.
export const realWorldRuBelCases = [
  {
    key: 'ru-bel-01',
    country: 'russia',
    family: 'ad-hominem',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'Эксперимент с июня 2025 года до конца 2027 года должен сократить сроки оказания государственных услуг, обязательные очные визиты и число предъявляемых документов.',
      en: 'An experiment running from June 2025 through the end of 2027 is intended to shorten public-service delivery times, reduce mandatory in-person visits, and cut the number of required documents.',
    },
    segments: {
      ru: [
        'Пилот должен сократить сроки оказания услуг, число очных визитов и количество документов, которые приходится предъявлять.',
        'Результат эксперимента можно проверять по срокам, числу визитов, объёму документов и качеству оказанных услуг.',
        'Учебная реконструкция, не цитата: раз проект придумали чиновники, его можно сразу отвергнуть, ведь они всё равно не знают, как люди стоят в очередях.',
      ],
      en: [
        'The pilot is intended to reduce service times, in-person visits, and the number of documents that applicants must present.',
        'Its results can be assessed through delivery times, visit counts, document requirements, and the quality of the services provided.',
        'Educational reconstruction, not a quotation: because officials designed the project, it can be dismissed immediately, since they know nothing about waiting in public-service queues.',
      ],
    },
    explanation: {
      ru: 'Нападка на предполагаемый жизненный опыт авторов проекта не показывает, будут ли работать предложенные меры и показатели качества.',
      en: 'An attack on the designers’ presumed personal experience does not show whether the proposed measures or quality indicators will work.',
    },
    source: {
      title: {
        ru: 'Правительство утвердило параметры эксперимента по повышению качества предоставления государственных и муниципальных услуг',
        en: 'Government Approves Parameters for an Experiment to Improve the Quality of State and Municipal Services',
      },
      url: 'https://government.ru/docs/55401/',
    },
  },
  {
    key: 'ru-bel-02',
    country: 'russia',
    family: 'bandwagon',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'В опросе об обязательном втором иностранном языке в школе 80,3 процента участников высказались против, 18,4 процента поддержали предложение.',
      en: 'In a poll on making a second foreign language compulsory at school, 80.3 percent of participants opposed the proposal and 18.4 percent supported it.',
    },
    segments: {
      ru: [
        'В опубликованном опросе 80,3 процента участников не поддержали обязательное изучение второго иностранного языка.',
        'Учебная реконструкция, не цитата: раз большинство участников против, уже доказано, что второй иностранный язык вредит обучению.',
        'Опрос показывает предпочтения его участников, а влияние предмета на обучение требует отдельных данных и подходящей выборки.',
      ],
      en: [
        'In the published poll, 80.3 percent of participants opposed making a second foreign language compulsory.',
        'Educational reconstruction, not a quotation: because most participants opposed it, a second foreign language has already been proven harmful to learning.',
        'The poll reports its participants’ preferences, while educational effects require separate evidence and an appropriate sample.',
      ],
    },
    explanation: {
      ru: 'Популярность позиции среди участников опроса не доказывает её педагогическую верность и не измеряет последствия для обучения.',
      en: 'The popularity of a position among poll participants does not establish its educational merit or measure its effects on learning.',
    },
    source: {
      title: {
        ru: 'Вячеслав Володин: второй иностранный язык в школах в качестве обязательного вводиться не будет',
        en: 'Vyacheslav Volodin: A Second Foreign Language Will Not Be Introduced as a Compulsory School Subject',
      },
      url: 'https://duma.gov.ru/news/63321/',
    },
  },
  {
    key: 'ru-bel-03',
    country: 'russia',
    family: 'false-dilemma',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Банк России называет цифровой рубль дополнительной формой денег: наличные, безналичные и цифровые рубли должны сосуществовать, а открытие счёта остаётся добровольным.',
      en: 'The Bank of Russia describes the digital ruble as an additional form of money: cash, bank-account money, and digital rubles are to coexist, and opening an account remains voluntary.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: есть только два пути, полностью перейти на цифровой рубль или навсегда отказаться от удобных платежей.',
        'Цифровой рубль дополняет наличные и безналичные деньги, а счёт открывается только по желанию самого пользователя.',
        'Человек может выбирать разные формы рубля для разных операций, не принимая ни одну из предложенных крайностей.',
      ],
      en: [
        'Educational reconstruction, not a quotation: there are only two choices, switch entirely to the digital ruble or give up convenient payments forever.',
        'The digital ruble supplements cash and bank-account money, and an account is opened only when the user chooses to do so.',
        'A person can use different forms of the ruble for different transactions without accepting either proposed extreme.',
      ],
    },
    explanation: {
      ru: 'Ошибочная реплика скрывает сосуществование трёх форм рубля и добровольный выбор, которые прямо описаны официальным источником.',
      en: 'The flawed statement conceals the coexistence of three forms of the ruble and the voluntary choice explicitly described by the official source.',
    },
    source: {
      title: { ru: 'Цифровой рубль', en: 'Digital Ruble' },
      url: 'https://www.cbr.ru/PSystem/dr/',
    },
  },
  {
    key: 'ru-bel-04',
    country: 'russia',
    family: 'slippery-slope',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'Пилотный проект касается блокировки сайтов и приложений, которые имитируют официальные ресурсы и используются для кражи паролей или персональных данных.',
      en: 'The pilot project concerns blocking websites and applications that impersonate official resources and are used to steal passwords or personal data.',
    },
    segments: {
      ru: [
        'Пилот нацелен на поддельные сайты и приложения, создаваемые мошенниками под видом официальных ресурсов организаций.',
        'Учебная реконструкция, не цитата: сегодня блокируют фишинговые страницы, завтра неизбежно закроют любой неудобный сайт, а затем весь интернет.',
        'Для каждого возможного расширения блокировок нужны отдельные правовые основания и решения, которых источник не устанавливает.',
      ],
      en: [
        'The pilot targets fraudulent websites and applications designed to impersonate official resources belonging to organisations.',
        'Educational reconstruction, not a quotation: today phishing pages are blocked, tomorrow every inconvenient website will inevitably be closed, and then the entire internet.',
        'Any expansion of blocking would require separate legal grounds and decisions that the source does not establish.',
      ],
    },
    explanation: {
      ru: 'Реплика объявляет нарастающую цепочку последствий неизбежной, но не объясняет ни одного перехода от ограниченного пилота к всеобщей блокировке.',
      en: 'The statement declares an escalating chain inevitable without explaining any transition from the limited pilot to universal blocking.',
    },
    source: {
      title: {
        ru: 'Стартует пилотный проект по ограничению доступа к фишинговым сайтам',
        en: 'Pilot Project to Restrict Access to Phishing Websites Begins',
      },
      url: 'https://government.ru/news/55231/',
    },
  },
  {
    key: 'ru-bel-05',
    country: 'russia',
    family: 'hasty-generalization',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'Участники пилота из более чем 150 населённых пунктов открыли около 2,5 тысячи цифровых кошельков и провели около 100 тысяч операций.',
      en: 'Pilot participants in more than 150 communities opened about 2,500 digital wallets and completed about 100,000 transactions.',
    },
    segments: {
      ru: [
        'В пилоте открыто около 2,5 тысячи цифровых кошельков и проведено примерно 100 тысяч операций разных видов.',
        'Пилот показывает реальное использование платформы, но его участники не представляют автоматически всё население страны.',
        'Учебная реконструкция, не цитата: эти цифры уже доказывают, что цифровой рубль удобен каждому жителю России без исключения.',
      ],
      en: [
        'About 2,500 digital wallets were opened in the pilot, and participants completed roughly 100,000 transactions of different kinds.',
        'The pilot demonstrates real use of the platform, but its participants do not automatically represent the entire population.',
        'Educational reconstruction, not a quotation: these figures already prove that the digital ruble is convenient for every resident of Russia without exception.',
      ],
    },
    explanation: {
      ru: 'Опыт ограниченной группы участников переносится на всех жителей без проверки состава выборки, условий доступа и различий между пользователями.',
      en: 'The experience of a limited participant group is extended to everyone without examining the sample, access conditions, or differences among users.',
    },
    source: {
      title: {
        ru: 'Цифровой рубль сегодня и завтра: отчёт Банка России о пилотировании',
        en: 'The Digital Ruble Today and Tomorrow: Bank of Russia Pilot Report',
      },
      url: 'https://cbr.ru/press/event?id=24741',
    },
  },
  {
    key: 'ru-bel-06',
    country: 'russia',
    family: 'post-hoc',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'После принятия в 2025 году десяти законов против киберпреступности зарегистрированные интернет-преступления снизились на 10,8 процента, дистанционные кражи на 23 процента, а мошенничества с использованием информационных технологий на 8,3 процента.',
      en: 'After ten federal laws against cybercrime were adopted in 2025, registered internet-enabled crimes fell by 10.8 percent, remote theft by 23 percent, and information-technology fraud by 8.3 percent.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: законы приняли раньше снижения, значит только они целиком вызвали каждую из опубликованных цифр.',
        'Официальный материал сообщает как о десяти принятых законах, так и о последующем снижении нескольких показателей преступности.',
        'Для вывода о причинах нужно проверить исполнение законов, изменения учёта и другие факторы, действовавшие одновременно.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the laws came before the decline, so they alone caused every published decrease in full.',
        'The official material reports both ten adopted laws and a subsequent decline in several recorded crime indicators.',
        'A causal conclusion requires examining enforcement, reporting changes, and other factors operating during the same period.',
      ],
    },
    explanation: {
      ru: 'Последовательность событий и одновременное изменение показателей не изолируют единственную причину наблюдаемого снижения.',
      en: 'The sequence of events and the accompanying changes in indicators do not isolate a single cause of the observed decline.',
    },
    source: {
      title: {
        ru: 'Вячеслав Володин направил в профильный комитет законопроект об усилении защиты граждан от кибермошенничества',
        en: 'Vyacheslav Volodin Sends Bill Strengthening Protection Against Cyberfraud to the Relevant Committee',
      },
      url: 'https://duma.gov.ru/news/62766/',
    },
  },
  {
    key: 'ru-bel-07',
    country: 'russia',
    family: 'circular-reasoning',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Банк России составил перечень системно значимых кредитных организаций по отдельной методике; на перечисленные банки приходится около 80 процентов активов банковского сектора.',
      en: 'The Bank of Russia compiled its list of systemically important credit institutions under a separate methodology; the listed banks account for about 80 percent of banking-sector assets.',
    },
    segments: {
      ru: [
        'Банк России ссылается на отдельную методику определения системной значимости кредитных организаций.',
        'Проверять перечень следует по критериям этой методики и данным о доле банков в совокупных активах сектора.',
        'Учебная реконструкция, не цитата: эти банки значимы, потому что вошли в перечень, а перечень верен, потому что в нём находятся значимые банки.',
      ],
      en: [
        'The Bank of Russia refers to a separate methodology for identifying systemically important credit institutions.',
        'The list should be assessed through that methodology and evidence about each bank’s share of total sector assets.',
        'Educational reconstruction, not a quotation: these banks are important because they are on the list, and the list is correct because it contains important banks.',
      ],
    },
    explanation: {
      ru: 'Два утверждения поддерживают друг друга по кругу, тогда как независимое основание должно находиться в методике и исходных данных.',
      en: 'The two claims support each other in a circle, while an independent basis would have to come from the methodology and underlying data.',
    },
    source: {
      title: {
        ru: 'Перечень системно значимых кредитных организаций на 07.10.2025',
        en: 'List of Systemically Important Credit Institutions as of 7 October 2025',
      },
      url: 'https://www.cbr.ru/banking_sector/credit/systembanks.html/',
    },
  },
  {
    key: 'ru-bel-08',
    country: 'russia',
    family: 'straw-man',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'Региональный эксперимент позволяет выпускникам девятых классов, выбравшим среднее профессиональное образование, сдавать два итоговых экзамена вместо четырёх.',
      en: 'A regional experiment allows ninth-grade graduates who choose vocational education to take two final examinations instead of four.',
    },
    segments: {
      ru: [
        'Особый порядок касается отдельных регионов и выпускников, которые решили продолжить обучение в учреждениях среднего профессионального образования.',
        'Учебная реконструкция, не цитата: у всех девятиклассников отнимают два экзамена и полностью закрывают им путь в десятый класс.',
        'Предложение не распространяет сокращённый набор экзаменов на всех выпускников и не отменяет другие образовательные траектории.',
      ],
      en: [
        'The special procedure applies in selected regions to graduates who decide to continue in vocational education institutions.',
        'Educational reconstruction, not a quotation: two examinations are being taken away from every ninth-grader, and the route to tenth grade is being closed entirely.',
        'The proposal does not apply the reduced examination set to every graduate or abolish other educational pathways.',
      ],
    },
    explanation: {
      ru: 'Ограниченный добровольный маршрут для определённой группы подменён всеобщим запретом, которого в официальном материале нет.',
      en: 'A limited voluntary route for a defined group is replaced with a universal prohibition that does not appear in the official material.',
    },
    source: {
      title: {
        ru: 'Эксперимент о возможности девятиклассников сдать только два итоговых экзамена для поступления в учреждения СПО предлагается продлить до 2029 года',
        en: 'Experiment Allowing Ninth-Grade Students to Take Only Two Final Exams for Vocational Education Admission Proposed for Extension to 2029',
      },
      url: 'https://duma.gov.ru/news/62565/',
    },
  },
  {
    key: 'ru-bel-09',
    country: 'russia',
    family: 'false-authority',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Президентским указом создана комиссия по вопросам развития технологий искусственного интеллекта и назначены её сопредседатели.',
      en: 'A presidential decree established a commission on the development of artificial-intelligence technologies and appointed its co-chairs.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: комиссию создали указом Президента, поэтому её мнение о любой системе искусственного интеллекта автоматически важнее результатов испытаний.',
        'Указ учреждает комиссию по вопросам развития технологий искусственного интеллекта и определяет её руководство.',
        'Полномочия государственного органа не заменяют технические испытания безопасности и качества конкретной системы.',
      ],
      en: [
        'Educational reconstruction, not a quotation: because a presidential decree established the commission, its view of any artificial-intelligence system automatically outweighs test results.',
        'The decree establishes a commission on artificial-intelligence technology development and defines its leadership.',
        'The authority of a public body does not replace technical testing of the safety and quality of a particular system.',
      ],
    },
    explanation: {
      ru: 'Высокий институциональный статус используется вместо предметных доказательств, хотя надёжность конкретной технологии проверяется техническими данными.',
      en: 'High institutional status is substituted for subject-matter evidence even though the reliability of a particular technology is tested through technical data.',
    },
    source: {
      title: {
        ru: 'Образована Комиссия при Президенте по вопросам развития технологий искусственного интеллекта',
        en: 'Presidential Commission on Artificial Intelligence Technology Development Established',
      },
      url: 'https://kremlin.ru/events/councils/79224',
    },
  },
  {
    key: 'ru-bel-10',
    country: 'russia',
    family: 'tradition',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Указом утверждены основы государственной политики по сохранению и укреплению традиционных российских духовно-нравственных ценностей.',
      en: 'A presidential decree approved the foundations of state policy for preserving and strengthening traditional Russian spiritual and moral values.',
    },
    segments: {
      ru: [
        'Официальный документ закрепляет государственную политику в отношении традиционных духовно-нравственных ценностей.',
        'Учебная реконструкция, не цитата: если ценность названа традиционной, её применение к любой современной проблеме автоматически будет правильным.',
        'Историческая преемственность сама по себе не отменяет проверки последствий конкретного решения в нынешних условиях.',
      ],
      en: [
        'The official document establishes state policy concerning traditional spiritual and moral values.',
        'Educational reconstruction, not a quotation: if a value is described as traditional, applying it to any modern problem must automatically be correct.',
        'Historical continuity does not by itself remove the need to examine the consequences of a specific decision under present conditions.',
      ],
    },
    explanation: {
      ru: 'Традиционность принимается за достаточное доказательство правильности, хотя возраст ценности не определяет результат каждого её применения.',
      en: 'Traditional status is treated as sufficient proof of correctness even though the age of a value does not determine the outcome of every application.',
    },
    source: {
      title: {
        ru: 'Указ Президента Российской Федерации от 09.11.2022 № 809',
        en: 'Decree of the President of the Russian Federation No. 809 of 9 November 2022',
      },
      url: 'https://publication.pravo.gov.ru/Document/View/0001202211090019?index=3',
    },
  },
  {
    key: 'ru-bel-11',
    country: 'russia',
    family: 'sunk-cost',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Из 45 федеральных целевых программ и одной подпрограммы только 22 были оценены как полностью эффективные, а две получили неудовлетворительную оценку при общем финансировании почти в один триллион рублей.',
      en: 'Of 45 federal targeted programmes and one subprogramme, only 22 were assessed as fully effective and two received an unsatisfactory assessment, while total funding approached one trillion rubles.',
    },
    segments: {
      ru: [
        'Две программы получили неудовлетворительную оценку, несмотря на крупный общий объём финансирования федеральных целевых программ.',
        'Будущие расходы следует сравнивать с ожидаемыми результатами, рисками и доступными альтернативами использования средств.',
        'Учебная реконструкция, не цитата: деньги уже потрачены, поэтому неудовлетворительные программы надо продолжать без изменений, иначе всё пропало зря.',
      ],
      en: [
        'Two programmes received an unsatisfactory assessment despite the large overall volume of federal targeted-programme funding.',
        'Future spending should be compared with expected outcomes, risks, and alternative uses of the available funds.',
        'Educational reconstruction, not a quotation: money has already been spent, so the unsatisfactory programmes must continue unchanged or all earlier spending was wasted.',
      ],
    },
    explanation: {
      ru: 'Невозвратные прошлые расходы подменяют оценку будущей пользы, хотя решение о продолжении должно зависеть от ожидаемых последствий.',
      en: 'Irrecoverable past spending replaces an assessment of future value even though continuation should depend on expected consequences.',
    },
    source: {
      title: { ru: 'Заседание Правительства', en: 'Government Meeting' },
      url: 'https://government.ru/news/20977/',
    },
  },
  {
    key: 'ru-bel-12',
    country: 'russia',
    family: 'equivocation',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'В правительственном документе цифровая зрелость определена узко: как результат цифровой трансформации и перехода к управленческим решениям на основе данных, повышающим производительность.',
      en: 'A government document defines digital maturity narrowly as the result of digital transformation and a shift to data-based management decisions that improve productivity.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: предприятие достигло цифровой зрелости, значит оно вообще зрелое, всегда мудро управляется, выпускает качественный товар и лишено иных рисков.',
        'В документе цифровая зрелость обозначает конкретный результат преобразования производственных и управленческих процессов.',
        'Специальное значение термина нельзя незаметно заменять бытовым значением слова зрелость при построении вывода.',
      ],
      en: [
        'Educational reconstruction, not a quotation: a company has reached digital maturity, so it must be mature in every sense, always wisely managed, producing high-quality goods, and free of other risks.',
        'In the document, digital maturity denotes a specific outcome of changes to production and management processes.',
        'The specialised meaning of the term cannot be quietly replaced with the everyday meaning of maturity when drawing a conclusion.',
      ],
    },
    explanation: {
      ru: 'Рассуждение меняет узкое определение показателя на широкое бытовое значение того же слова и получает вывод, которого документ не поддерживает.',
      en: 'The argument switches from a narrow defined indicator to the broad everyday meaning of the same word and reaches a conclusion unsupported by the document.',
    },
    source: {
      title: {
        ru: 'Распоряжение Правительства Российской Федерации от 07.11.2023 г. № 3113-р',
        en: 'Order of the Government of the Russian Federation No. 3113-r of 7 November 2023',
      },
      url: 'https://government.ru/docs/all/150406/',
    },
  },
  {
    key: 'ru-bel-13',
    country: 'russia',
    family: 'composition',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Экспериментальный режим для беспилотных воздушных судов предусматривает ограниченные испытательные площадки и переход от автоматики к внешнему пилоту в течение 15 секунд.',
      en: 'An experimental regime for unmanned aircraft provides for limited test sites and a transfer from automatic operation to an external pilot within 15 seconds.',
    },
    segments: {
      ru: [
        'Для отдельного беспилотного воздушного судна предусмотрена возможность передать управление внешнему пилоту за 15 секунд.',
        'Безопасность всей системы зависит также от связи, погоды, плотности движения, координации и одновременных отказов.',
        'Учебная реконструкция, не цитата: если каждый аппарат умеет передавать управление пилоту, вся региональная система безопасна при любом масштабе.',
      ],
      en: [
        'Each unmanned aircraft must be capable of transferring control to an external pilot within 15 seconds.',
        'The safety of the whole system also depends on communications, weather, traffic density, coordination, and simultaneous failures.',
        'Educational reconstruction, not a quotation: if every aircraft can transfer control to a pilot, the entire regional system is safe at any scale.',
      ],
    },
    explanation: {
      ru: 'Свойство отдельных аппаратов необоснованно переносится на всю систему, у которой есть дополнительные связи, нагрузки и общие точки отказа.',
      en: 'A property of individual aircraft is unjustifiably extended to the whole system, which has additional interactions, loads, and shared failure points.',
    },
    source: {
      title: {
        ru: 'Постановление Правительства Российской Федерации от 08.11.2024 г. № 1518',
        en: 'Resolution of the Government of the Russian Federation No. 1518 of 8 November 2024',
      },
      url: 'https://government.ru/docs/all/155993/',
    },
  },
  {
    key: 'ru-bel-14',
    country: 'russia',
    family: 'base-rate',
    difficulty: 3,
    correctIndex: 1,
    context: {
      ru: 'В ренкинге крупных банков верхняя строка за 2025 год имеет показатель 6,90999 обоснованной жалобы на 100 тысяч кредитов; Банк России отдельно предупреждает, что таблица не является общей оценкой банков.',
      en: 'In the 2025 ranking of large banks, the top row has an indicator of 6.90999 substantiated complaints per 100,000 loans; the Bank of Russia separately warns that the table is not an overall assessment of banks.',
    },
    segments: {
      ru: [
        'Показатель рассчитывается как число обоснованных жалоб на 100 тысяч кредитов, а место определяется относительно других банков.',
        'Учебная реконструкция, не цитата: банк стоит первым в ренкинге, значит с проблемой сталкивается почти каждый его заёмщик.',
        'Относительное место не отменяет абсолютную частоту жалоб и прямую оговорку регулятора о пределах такого сравнения.',
      ],
      en: [
        'The indicator is calculated as substantiated complaints per 100,000 loans, and the position is relative to other banks.',
        'Educational reconstruction, not a quotation: the bank ranks first, so nearly every one of its borrowers must encounter a problem.',
        'A relative position does not erase the absolute complaint rate or the regulator’s explicit warning about the limits of the comparison.',
      ],
    },
    explanation: {
      ru: 'Реплика игнорирует малую абсолютную частоту, заменяя её порядковым местом, и превращает ограниченный показатель в общую оценку банка.',
      en: 'The statement ignores the small absolute rate, replaces it with rank position, and turns a limited indicator into an overall assessment of the bank.',
    },
    source: {
      title: { ru: 'Ренкинг банков', en: 'Bank Ranking' },
      url: 'https://www.cbr.ru/banking_sector/bank_ranking/',
    },
  },
  {
    key: 'ru-bel-15',
    country: 'russia',
    family: 'survivorship',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'На всероссийский отбор практик активного долголетия поступило 2684 заявки из 89 регионов; 110 проектов стали финалистами, а десять были признаны лучшими.',
      en: 'A nationwide selection of active-longevity practices received 2,684 applications from 89 regions; 110 projects became finalists and ten were selected as the best.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: десять победителей выглядят убедительно, значит копирование любой их практики почти всегда даёт успех, а остальные заявки можно не изучать.',
        'Десять победителей были выбраны из 2684 заявок, причём до финала дошли 110 представленных проектов.',
        'Для оценки вероятности успеха нужны результаты не только победителей, но также остальных проектов и попыток их внедрения.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the ten winners look convincing, so copying any of their practices almost always succeeds and the other applications need not be studied.',
        'The ten winners were selected from 2,684 applications, with 110 submitted projects reaching the final stage.',
        'Estimating the chance of success requires outcomes for the winners, the other projects, and attempts to reproduce their results.',
      ],
    },
    explanation: {
      ru: 'Отобранные успехи рассматриваются без данных о неудачах и отсеве, поэтому по победителям нельзя установить обычную вероятность результата.',
      en: 'Selected successes are considered without data on failures or attrition, so the winners alone cannot establish the ordinary probability of success.',
    },
    source: {
      title: {
        ru: 'Татьяна Голикова: 12 миллионов граждан старшего возраста участвуют в программах активного долголетия',
        en: 'Tatyana Golikova: 12 Million Older People Participate in Active Longevity Programmes',
      },
      url: 'https://government.ru/news/54515/',
    },
  },
  {
    key: 'ru-bel-16',
    country: 'belarus',
    family: 'tradition',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Фестивалю исполнилось 35 лет; за всё время в нём участвовали представители 85 стран и более 18 тысяч артистов.',
      en: 'The festival marked its 35th anniversary; over its history, representatives of 85 countries and more than 18,000 performers have taken part.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: фестиваль проводится 35 лет, значит прежний формат обязательно лучший, а менять его можно только во вред.',
        'Официальный материал подтверждает долгую историю фестиваля и широкое международное участие артистов и гостей.',
        'История показывает устойчивость проекта, но не доказывает превосходство каждого элемента нынешнего или прежнего формата.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the festival has run for 35 years, so its old format must be the best and any change can only be harmful.',
        'The official material confirms the festival’s long history and the broad international participation of performers and guests.',
        'Longevity demonstrates continuity but does not prove that every element of the current or previous format is optimal.',
      ],
    },
    explanation: {
      ru: 'Продолжительность существования принимается за доказательство лучшего устройства, хотя сравнение форматов требует оценки их нынешних результатов.',
      en: 'Length of existence is treated as proof of the best design even though comparing formats requires evidence about their present results.',
    },
    source: {
      title: {
        ru: 'Открытие 35-го Международного фестиваля искусств «Славянский базар в Витебске»',
        en: 'Opening of the 35th International Festival of Arts Slavianski Bazaar in Vitebsk',
      },
      url: 'https://president.gov.by/ru/events/otkrytie-xxxv-mezdunarodnogo-festivala-iskusstv-slavanskij-bazar-v-vitebske',
    },
  },
  {
    key: 'ru-bel-17',
    country: 'belarus',
    family: 'slippery-slope',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'Указ расширяет технические возможности обмена данными о гражданах с временным ограничением выезда и усиливает защиту информации в соответствующем банке данных.',
      en: 'A decree expands technical data-sharing capabilities concerning citizens subject to temporary travel restrictions and strengthens protection of the information held in the relevant database.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: сегодня расширят обмен сведениями в этом банке данных, а завтра без отдельного решения запретят выезд всем гражданам.',
        'Изменения касаются банка данных о гражданах, чьё право на выезд уже временно ограничено в установленном порядке.',
        'Источник не описывает механизма перехода от обмена сведениями об ограниченной группе к всеобщему запрету на выезд.',
      ],
      en: [
        'Educational reconstruction, not a quotation: today data sharing in this database will be expanded, and tomorrow every citizen will be barred from leaving without any separate decision.',
        'The changes concern a database of citizens whose right to leave the country is already temporarily restricted under the established procedure.',
        'The source provides no mechanism by which data sharing about a limited group would become a universal travel ban.',
      ],
    },
    explanation: {
      ru: 'Крайний результат объявлен неизбежным без правового или технического перехода от ограниченной базы к запрету для всего населения.',
      en: 'An extreme outcome is declared inevitable without any legal or technical path from the limited database to a ban covering the entire population.',
    },
    source: {
      title: {
        ru: 'В Беларуси совершенствуется работа банка данных о гражданах, право на выезд которых ограничено',
        en: 'Belarus Improves the Database on Citizens Whose Right to Leave the Country Is Restricted',
      },
      url: 'https://president.gov.by/ru/events/v-belarusi-soversenstvuetsa-rabota-banka-dannyh-o-grazdanah-pravo-na-vyezd-kotoryh-ograniceno',
    },
  },
  {
    key: 'ru-bel-18',
    country: 'belarus',
    family: 'straw-man',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'Закон уточняет права владельцев железнодорожной инфраструктуры и путей необщего пользования, учёт нарушений безопасности и медицинские осмотры работников.',
      en: 'The law clarifies the rights of railway-infrastructure and non-public-track owners, the recording of safety violations, and medical examinations for employees.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: частные подъездные пути теперь запретят, а железнодорожную инфраструктуру обязательно заберут у владельцев.',
        'Закон регулирует обязанности владельцев путей, расследование нарушений безопасности и информирование уполномоченного органа.',
        'В официальном описании нет запрета путей необщего пользования или обязательного изъятия их у нынешних владельцев.',
      ],
      en: [
        'Educational reconstruction, not a quotation: private access tracks will now be prohibited, and railway infrastructure will inevitably be taken from its owners.',
        'The law regulates track owners’ duties, the investigation of safety violations, and reporting to the competent authority.',
        'The official description contains no ban on non-public tracks and no mandatory seizure from their current owners.',
      ],
    },
    explanation: {
      ru: 'Регулирование обязанностей и безопасности подменено радикальным запретом собственности, которого рассматриваемый материал не содержит.',
      en: 'Regulation of duties and safety is replaced with a radical property ban that the material under discussion does not contain.',
    },
    source: {
      title: {
        ru: 'Подписан Закон «Об изменении законов по вопросам железнодорожного транспорта»',
        en: 'Law Amending Legislation on Railway Transport Signed',
      },
      url: 'https://president.gov.by/ru/events/podpisan-zakon-ob-izmenenii-zakonov-po-voprosam-zeleznodoroznogo-transporta',
    },
  },
  {
    key: 'ru-bel-19',
    country: 'belarus',
    family: 'sunk-cost',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'На бюджетные деньги закупили 1,2 тысячи голов датской красной породы и построили комплекс, однако за пять лет прирост поголовья оказался небольшим.',
      en: 'Public funds were used to buy 1,200 Danish Red cattle and build a livestock complex, yet herd growth remained modest over five years.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: скот уже закупили и комплекс построили, поэтому прежний план надо продолжать любой ценой даже при медленном приросте.',
        'Источник сообщает о вложениях, почти 2,3 тысячи племенных коров и требовании составить конкретную программу результатов.',
        'Дальнейшие варианты следует сравнивать по будущим расходам, ожидаемому эффекту и измеримым целям, а не только по прошлым вложениям.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the cattle have been bought and the complex built, so the old plan must continue at any cost despite slow herd growth.',
        'The source reports the investment, almost 2,300 breeding cows, and a demand for a concrete programme of measurable results.',
        'Future options should be compared by their prospective costs, expected benefits, and measurable objectives rather than only by past investment.',
      ],
    },
    explanation: {
      ru: 'Уже понесённые расходы нельзя вернуть, поэтому сами по себе они не оправдывают любой будущий курс при появлении новых данных.',
      en: 'Past expenditure cannot be recovered, so it does not by itself justify any future course when new evidence becomes available.',
    },
    source: {
      title: {
        ru: 'Рабочая поездка в Оршанский район Витебской области',
        en: 'Working Visit to Orsha District, Vitebsk Region',
      },
      url: 'https://president.gov.by/ru/events/rabocaa-poezdka-v-orsanskij-rajon-vitebskoj-oblasti',
    },
  },
  {
    key: 'ru-bel-20',
    country: 'belarus',
    family: 'composition',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Во время уборочной кампании одновременно идут несколько видов полевых работ; официальный материал подчёркивает роль планирования от хозяйств до правительства и влияние погоды.',
      en: 'Several kinds of field work proceed simultaneously during the harvest campaign; the official material stresses planning from individual farms through the government and the influence of weather.',
    },
    segments: {
      ru: [
        'Готовность требуется от агрономов, руководителей хозяйств, областных властей и правительства на разных уровнях работы.',
        'Общий результат зависит от сроков, погоды, логистики и согласованности действий между хозяйствами и органами управления.',
        'Учебная реконструкция, не цитата: если каждое хозяйство отдельно отчитается о готовности, вся уборочная обязательно пройдёт без потерь.',
      ],
      en: [
        'Readiness is required from agronomists, farm managers, regional authorities, and the government at different operational levels.',
        'The overall result depends on timing, weather, logistics, and coordination among farms and public authorities.',
        'Educational reconstruction, not a quotation: if every farm separately reports that it is ready, the entire harvest campaign is guaranteed to finish without losses.',
      ],
    },
    explanation: {
      ru: 'Отдельная готовность участников не гарантирует работу всей связанной системы, результат которой зависит от координации и общих условий.',
      en: 'The readiness of individual participants does not guarantee the performance of an interconnected system that depends on coordination and shared conditions.',
    },
    source: {
      title: {
        ru: 'Селекторное совещание по вопросам уборочной кампании 2026 года',
        en: 'Conference Call on the 2026 Harvest Campaign',
      },
      url: 'https://president.gov.by/ru/events/selektornoe-sovesanie-po-voprosam-uborocnoj-kampanii-2026-goda',
    },
  },
  {
    key: 'ru-bel-21',
    country: 'belarus',
    family: 'false-dilemma',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Цифровой белорусский рубль проектируется как ещё одна равная форма национальной валюты в гибридной модели с участием банков; значительная часть работ ещё впереди.',
      en: 'The digital Belarusian ruble is being designed as another equally valued form of the national currency under a hybrid model involving banks; substantial implementation work remains.',
    },
    segments: {
      ru: [
        'Цифровой белорусский рубль имеет одинаковую ценность с наличной и безналичной формами, а проект использует гибридную модель.',
        'Учебная реконструкция, не цитата: есть только два пути, целиком заменить наличные цифровым рублём или отказаться от модернизации платежей.',
        'Официальное описание допускает сосуществование форм рубля, участие банков и поэтапное выполнение оставшихся работ.',
      ],
      en: [
        'The digital Belarusian ruble has the same value as cash and bank-account money, and the project uses a hybrid model.',
        'Educational reconstruction, not a quotation: the only choices are to replace cash entirely with the digital ruble or abandon payment modernisation.',
        'The official description allows the forms of the ruble to coexist, includes bank participation, and provides for phased implementation.',
      ],
    },
    explanation: {
      ru: 'Два крайних варианта скрывают смешанную модель и промежуточные этапы, которые прямо предусмотрены официальным проектом.',
      en: 'The two extremes conceal the mixed model and intermediate stages expressly provided for in the official project.',
    },
    source: {
      title: {
        ru: 'Проект по внедрению цифрового белорусского рубля',
        en: 'Digital Belarusian Ruble Implementation Project',
      },
      url: 'https://www.nb-rb.by/payment/digital_ruble.htm',
    },
  },
  {
    key: 'ru-bel-22',
    country: 'belarus',
    family: 'circular-reasoning',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'Банковский надзор использует нормативы капитала, защитные буферы, показатели ликвидности, внешние рейтинги и процедуры надзорной оценки.',
      en: 'Banking supervision uses capital requirements, protective buffers, liquidity indicators, external ratings, and supervisory assessment procedures.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: правила надёжны, потому что по ним работают надёжные банки, а банки надёжны, потому что так говорят эти правила.',
        'Источник перечисляет отдельные нормативы капитала, ликвидности, управления рисками и надзорной оценки банков.',
        'Надёжность следует проверять по независимым показателям и результатам надзора, а не повторением исходного утверждения.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the rules are reliable because reliable banks follow them, and the banks are reliable because the rules say so.',
        'The source lists separate requirements for capital, liquidity, risk management, and supervisory assessment of banks.',
        'Reliability should be tested through independent indicators and supervisory results rather than by repeating the original assertion.',
      ],
    },
    explanation: {
      ru: 'Каждая часть вывода обосновывается другой частью того же вывода, хотя источник предоставляет независимые измеримые критерии.',
      en: 'Each part of the conclusion is supported by the other part of the same conclusion even though the source provides independent measurable criteria.',
    },
    source: {
      title: {
        ru: 'Внедрение международных стандартов Базельского комитета по банковскому надзору в Республике Беларусь',
        en: 'Implementation of Basel Committee on Banking Supervision International Standards in the Republic of Belarus',
      },
      url: 'https://www.nb-rb.by/system/basel.htm',
    },
  },
  {
    key: 'ru-bel-23',
    country: 'belarus',
    family: 'bandwagon',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Опросная оценка ожидаемого роста цен на следующие 12 месяцев снизилась с 11,5 до 11 процентов; фактическая годовая инфляция в марте 2024 года составляла 5,6 процента.',
      en: 'The survey estimate of expected price growth over the next 12 months fell from 11.5 to 11 percent; actual annual inflation in March 2024 was 5.6 percent.',
    },
    segments: {
      ru: [
        'Участники опроса в среднем ожидали роста цен на 11 процентов в течение следующих двенадцати месяцев.',
        'Учебная реконструкция, не цитата: раз население ожидает 11 процентов, это и есть точный и заведомо верный прогноз будущей инфляции.',
        'Ожидания отражают мнение респондентов и могут влиять на поведение, но не доказывают точное будущее значение показателя.',
      ],
      en: [
        'Survey respondents expected prices to rise by an average of 11 percent over the following twelve months.',
        'Educational reconstruction, not a quotation: because the public expects 11 percent, that figure must be an exact and certainly correct forecast of future inflation.',
        'Expectations report respondents’ beliefs and may affect behaviour, but they do not prove the exact future value of inflation.',
      ],
    },
    explanation: {
      ru: 'Коллективное ожидание принимается за установленный будущий факт, хотя опрос измеряет представления людей, а не гарантированный результат.',
      en: 'A collective expectation is treated as an established future fact even though the survey measures beliefs rather than a guaranteed outcome.',
    },
    source: {
      title: {
        ru: 'Информация о динамике и факторах изменения потребительских цен и тарифов. Первый квартал 2024 года',
        en: 'Information on Consumer Price and Tariff Dynamics and Their Drivers, First Quarter of 2024',
      },
      url: 'https://www.nb-rb.by/publications/inflationquarterly/inflationquarterly_2024_1.pdf',
    },
  },
  {
    key: 'ru-bel-24',
    country: 'belarus',
    family: 'equivocation',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'За ноябрь 2018 года средняя заработная плата составляла 994 рубля, медианная 751,1 рубля; выше средней получали около 30 процентов работников.',
      en: 'For November 2018, the arithmetic mean wage was 994 rubles and the median was 751.1 rubles; about 30 percent of employees earned more than the mean.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: средняя зарплата равна 994 рублям, значит обычный работник получает примерно 994 рубля.',
        'Официальная презентация различает среднюю арифметическую и медианную заработную плату и приводит обе величины.',
        'При неравномерном распределении медиана может описывать типичного работника точнее, чем среднее арифметическое.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the average wage is 994 rubles, so an ordinary employee must earn approximately 994 rubles.',
        'The official presentation distinguishes the arithmetic mean from the median wage and reports both figures.',
        'When a distribution is uneven, the median may describe a typical employee more accurately than the arithmetic mean.',
      ],
    },
    explanation: {
      ru: 'Слово средняя незаметно меняет смысл с арифметической величины на типичное значение, хотя источник показывает существенную разницу между ними.',
      en: 'The word average quietly shifts from an arithmetic measure to a typical value even though the source shows a substantial difference between them.',
    },
    source: {
      title: {
        ru: 'Белстат объяснит: как считается средняя заработная плата',
        en: 'Belstat Explains: How the Average Wage Is Calculated',
      },
      url: 'https://www.belstat.gov.by/upload-belstat/upload-belstat-pdf/metodology/Belstat_obyasnit-sred_zarplata-2019-2.pdf',
    },
  },
  {
    key: 'ru-bel-25',
    country: 'belarus',
    family: 'hasty-generalization',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'Национальный банк предупреждает о незаконных сервисах онлайн-заимствования, но отдельно указывает, что зарегистрированные операторы из официального реестра могут работать законно.',
      en: 'The National Bank warns about illegal online lending services but separately states that registered operators listed in the official register may operate lawfully.',
    },
    segments: {
      ru: [
        'Незаконной является деятельность организаций, которые не включены в официальный реестр операторов сервисов онлайн-заимствования.',
        'Перед использованием сервиса можно проверить его наличие в реестре и отличить зарегистрированного оператора от незарегистрированного.',
        'Учебная реконструкция, не цитата: обнаружены незаконные онлайн-сервисы, значит любой заём через интернет незаконен и обязательно связан с мошенничеством.',
      ],
      en: [
        'The unlawful activity is that of organisations which are not included in the official register of online lending service operators.',
        'Before using a service, a person can check the register and distinguish a registered operator from an unregistered one.',
        'Educational reconstruction, not a quotation: illegal online services have been found, so every internet loan is unlawful and necessarily fraudulent.',
      ],
    },
    explanation: {
      ru: 'Несколько незаконных случаев необоснованно переносятся на весь класс услуг, хотя источник прямо различает зарегистрированных и незарегистрированных операторов.',
      en: 'Several unlawful cases are unjustifiably generalised to the entire category even though the source expressly distinguishes registered from unregistered operators.',
    },
    source: {
      title: {
        ru: 'В Беларуси фиксируются случаи деятельности незаконных сервисов онлайн-заимствования',
        en: 'Illegal Online Lending Services Detected in Belarus',
      },
      url: 'https://www.nb-rb.by/press/21457-1.htm',
    },
  },
]
