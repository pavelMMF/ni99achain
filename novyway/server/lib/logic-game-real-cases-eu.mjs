export const realWorldEuCases = [
  {
    key: 'eu-01',
    country: 'france',
    family: 'slippery-slope',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'Девятого июня 2024 года президент Франции объявил о роспуске Национального собрания и назначил два тура парламентских выборов.',
      en: 'On 9 June 2024, the French President announced the dissolution of the National Assembly and scheduled two rounds of parliamentary elections.',
    },
    segments: {
      ru: [
        'В официальном обращении зафиксированы один роспуск Национального собрания и конкретные даты последующих выборов.',
        'Учебная реконструкция, не цитата: этот роспуск неизбежно сделает роспуск ответом на каждый неблагоприятный результат, а выборы станут почти непрерывными.',
        'Источник не устанавливает правила, которое автоматически запускало бы новые роспуски после каждого политического поражения.',
      ],
      en: [
        'The official address records one dissolution of the National Assembly and the specific dates of the ensuing elections.',
        'Educational reconstruction, not a quotation: this dissolution will inevitably make dissolution the response to every adverse result, followed by almost continuous elections.',
        'The source establishes no rule that would automatically trigger new dissolutions after every political defeat.',
      ],
    },
    explanation: {
      ru: 'Одно решение превращено в неизбежную цепочку будущих событий без механизма, который связывал бы её отдельные этапы.',
      en: 'One decision is turned into an inevitable chain of future events without a mechanism linking the individual stages.',
    },
    source: {
      title: { ru: 'Обращение к французам', en: 'Address to the French People' },
      url: 'https://www.elysee.fr/emmanuel-macron/2024/06/09/adresse-aux-francais-4',
    },
  },
  {
    key: 'eu-02',
    country: 'france',
    family: 'straw-man',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Четвёртого марта 2024 года Конгресс Франции принял конституционный текст о гарантированной женщине свободе прибегнуть к прерыванию беременности.',
      en: 'On 4 March 2024, the French Congress adopted constitutional wording guaranteeing a woman the freedom to seek an abortion.',
    },
    segments: {
      ru: [
        'Конституционный текст был принят большинством в три пятых поданных голосов членов французского Конгресса.',
        'Принятая формулировка защищает возможность выбора, а условия осуществления этой свободы определяются законом.',
        'Учебная реконструкция, не цитата: раз свобода гарантирована, конституционная реформа предписывает каждой беременной женщине сделать аборт.',
      ],
      en: [
        'The constitutional text was adopted by a majority of three fifths of the votes cast by members of the French Congress.',
        'The adopted wording protects a choice, while the conditions for exercising that freedom are determined by law.',
        'Educational reconstruction, not a quotation: because the freedom is guaranteed, the constitutional reform orders every pregnant woman to have an abortion.',
      ],
    },
    explanation: {
      ru: 'Защищённая возможность совершить действие подменена обязанностью его совершить, после чего критикуется уже вымышленная версия нормы.',
      en: 'A protected freedom to act is replaced with an obligation to act, after which the invented version of the rule is attacked.',
    },
    source: {
      title: {
        ru: 'Конституционный законопроект о свободе прибегнуть к прерыванию беременности: принятие парламентом, собравшимся в Конгресс',
        en: 'Constitutional Bill on the Freedom to Seek an Abortion: Adoption by Parliament Convened in Congress',
      },
      url: 'https://www.assemblee-nationale.fr/dyn/actualites-accueil-hub/projet-de-loi-constitutionnelle-relatif-a-la-liberte-de-recourir-a-l-ivg-adoption-par-le-parlement-reuni-en-congres',
    },
  },
  {
    key: 'eu-03',
    country: 'france',
    family: 'sunk-cost',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'В декабре 2023 года план «Франция 2030» оценивался в 54 миллиарда евро на пять лет, причём обязательства на 25 миллиардов уже охватывали более 3200 проектов.',
      en: 'In December 2023, the France 2030 plan totalled 54 billion euros over five years, with 25 billion euros committed across more than 3,200 projects.',
    },
    segments: {
      ru: [
        'Официальный материал сообщает общий объём программы, число поддержанных проектов и размер уже принятых обязательств.',
        'Учебная реконструкция, не цитата: обязательства на 25 миллиардов евро доказывают, что все будущие транши надо продолжать по прежнему плану даже при ухудшении ожидаемой отдачи.',
        'Ещё не выделенные средства следует оценивать по будущим затратам, рискам и результатам, а не по объёму прежних обязательств.',
      ],
      en: [
        'The official material reports the programme size, the number of supported projects, and the value of commitments already made.',
        'Educational reconstruction, not a quotation: the 25 billion euros already committed prove that every future tranche must follow the old plan even if expected returns deteriorate.',
        'Funds not yet allocated should be assessed by their future costs, risks, and outcomes rather than by the size of earlier commitments.',
      ],
    },
    explanation: {
      ru: 'Ранее принятые обязательства сами по себе не доказывают полезность дополнительных расходов, решение о которых ещё можно пересмотреть.',
      en: 'Earlier commitments do not by themselves prove the value of additional spending that can still be reconsidered.',
    },
    source: {
      title: { ru: 'Промежуточные итоги плана «Франция 2030» в Тулузе', en: 'Progress Update on the France 2030 Plan from Toulouse' },
      url: 'https://www.elysee.fr/emmanuel-macron/2023/12/11/point-detatpe-du-plan-france-2030-depuis-toulouse',
    },
  },
  {
    key: 'eu-04',
    country: 'france',
    family: 'false-dilemma',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'Официальный документ описывает постепенное повышение общего пенсионного возраста с 62 до 64 лет, досрочные выходы и другие изменения пенсионных правил.',
      en: 'The official document describes a gradual rise in the general retirement age from 62 to 64, early retirement routes, and other changes to pension rules.',
    },
    segments: {
      ru: [
        'В самой реформе предусмотрены разные сроки, досрочные выходы и исключения, связанные с отдельными жизненными обстоятельствами.',
        'Устройство пенсионной системы можно обсуждать через сочетание возраста, стажа, доходов и специальных правил для разных групп.',
        'Учебная реконструкция, не цитата: есть только два варианта, принять эту схему для всех без изменений или немедленно прекратить выплату пенсий.',
      ],
      en: [
        'The reform itself provides different timelines, early retirement routes, and exceptions linked to particular personal circumstances.',
        'Pension policy can be designed through combinations of retirement age, contribution periods, revenue, and special rules for different groups.',
        'Educational reconstruction, not a quotation: the only choices are to apply this exact scheme to everyone or immediately stop paying pensions.',
      ],
    },
    explanation: {
      ru: 'Множество возможных решений сведено к двум крайностям, хотя даже официальный документ содержит промежуточные и дифференцированные правила.',
      en: 'Multiple possible policy designs are reduced to two extremes even though the official document itself contains intermediate and differentiated rules.',
    },
    source: {
      title: { ru: 'Пенсионная реформа: что меняется с первого сентября 2023 года', en: 'Pension Reform: What Changes from 1 September 2023' },
      url: 'https://www.gouvernement.fr/upload/media/content/0001/06/23a1b07e2b077ad537b0dc73370e48c846dd009e.pdf',
    },
  },
  {
    key: 'eu-05',
    country: 'germany',
    family: 'equivocation',
    difficulty: 3,
    correctIndex: 1,
    context: {
      ru: 'Бундестаг определяет специальный фонд как обособленную часть федерального имущества с отдельным управлением и отдельно приводит сведения о долге и праве на заимствования.',
      en: 'The Bundestag defines a special fund as a legally separated part of federal assets with its own financial management and separately reports debt and borrowing authority.',
    },
    segments: {
      ru: [
        'В германском бюджетном праве выражение «специальный фонд» является техническим термином с установленным законом содержанием.',
        'Учебная реконструкция, не цитата: раз в названии говорится об имуществе, специальный фонд не может включать долг, а название доказывает отсутствие заимствований.',
        'Содержание правового термина определяется бюджетными нормами, а не бытовым значением отдельного слова в его названии.',
      ],
      en: [
        'In German budget law, the expression special fund is a technical term whose content is established by legal rules.',
        'Educational reconstruction, not a quotation: because the name refers to assets, a special fund cannot involve debt, and the label proves there is no borrowing.',
        'The content of a legal term is determined by budget rules rather than by the everyday meaning of one word in its name.',
      ],
    },
    explanation: {
      ru: 'Рассуждение незаметно заменяет специальное юридическое значение термина бытовым значением слова и получает вывод, противоречащий официальному определению.',
      en: 'The argument quietly replaces a specialised legal meaning with an everyday meaning and reaches a conclusion that conflicts with the official definition.',
    },
    source: {
      title: { ru: 'Специальные фонды федерации: общий обзор', en: 'Federal Special Funds: An Overview' },
      url: 'https://www.bundestag.de/dokumente/textarchiv/sondervermoegen-doku-1106000',
    },
  },
  {
    key: 'eu-06',
    country: 'germany',
    family: 'straw-man',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'В октябре 2025 года Бундестаг отменил трёхлетний ускоренный путь к гражданству, сохранив общий минимальный срок предварительного проживания в пять лет.',
      en: 'In October 2025, the Bundestag removed the three-year accelerated route to citizenship while retaining a general minimum residence period of five years.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: отменив трёхлетний путь, Германия полностью отменила возможность получения гражданства через натурализацию.',
        'Решение касается одной возможности сокращения срока проживания при подтверждённых особых достижениях в интеграции.',
        'Общий пятилетний путь и остальные предусмотренные законом условия получения гражданства продолжают действовать.',
      ],
      en: [
        'Educational reconstruction, not a quotation: by removing the three-year route, Germany completely abolished the possibility of obtaining citizenship through naturalisation.',
        'The decision concerns one option for reducing the residence period when exceptional integration achievements are demonstrated.',
        'The general five-year route and the other statutory conditions for obtaining citizenship continue to apply.',
      ],
    },
    explanation: {
      ru: 'Ограниченная поправка о минимальном сроке проживания заменена гораздо более радикальным тезисом об отмене всего института натурализации.',
      en: 'A limited amendment to the minimum residence period is replaced with the much more radical claim that naturalisation itself was abolished.',
    },
    source: {
      title: { ru: 'Натурализация только после проживания не менее пяти лет', en: 'Naturalisation Only After at Least Five Years of Prior Residence' },
      url: 'https://www.bundestag.de/dokumente/textarchiv/2025/kw26-de-staatsangehoerigkeit-1084776',
    },
  },
  {
    key: 'eu-07',
    country: 'germany',
    family: 'bandwagon',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'По состоянию на май 2026 года единым проездным пользовались около 14,5 миллиона человек; он стоил 63 евро и действовал в местном и региональном транспорте.',
      en: 'As of May 2026, about 14.5 million people used the nationwide travel pass, which cost 63 euros and covered local and regional transport.',
    },
    segments: {
      ru: [
        'Количество подписчиков показывает, что единый проездной широко используется пассажирами в разных частях Германии.',
        'Эффективность расходов, качество перевозок и доступность по регионам требуют отдельных показателей и сравнений.',
        'Учебная реконструкция, не цитата: 14,5 миллиона пользователей сами по себе доказывают, что проездной оптимален для каждого региона и дальнейшая оценка не нужна.',
      ],
      en: [
        'The subscriber count shows that the nationwide travel pass is widely used by passengers across different parts of Germany.',
        'Fiscal efficiency, service quality, and regional accessibility require separate measures and comparisons.',
        'Educational reconstruction, not a quotation: 14.5 million users alone prove that the pass is optimal for every region and needs no further evaluation.',
      ],
    },
    explanation: {
      ru: 'Популярность решения ошибочно используется как доказательство его оптимальности по всем критериям, которые официальная статистика использования не измеряет.',
      en: 'The policy\'s popularity is incorrectly treated as proof that it is optimal under every criterion not measured by the usage figure.',
    },
    source: {
      title: { ru: 'Вопросы и ответы о едином проездном: один билет для всей Германии', en: 'Questions and Answers on the Nationwide Travel Pass: One Ticket for All of Germany' },
      url: 'https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/deutschlandticket-2134074',
    },
  },
  {
    key: 'eu-08',
    country: 'germany',
    family: 'slippery-slope',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'Закон 2024 года разрешил взрослым ограниченное хранение и выращивание каннабиса, установив количественные пределы и правила защиты детей.',
      en: 'The 2024 law permitted limited adult possession and cultivation of cannabis while setting quantity limits and child protection rules.',
    },
    segments: {
      ru: [
        'Официальный материал перечисляет конкретные разрешения, количественные пределы и условия выращивания каннабиса взрослыми.',
        'Учебная реконструкция, не цитата: ограниченное разрешение каннабиса неизбежно приведёт к разрешению всех остальных наркотиков и отмене любых возрастных ограничений.',
        'Каждое дальнейшее изменение потребовало бы отдельного решения, а принятый текст не создаёт автоматической законодательной цепочки.',
      ],
      en: [
        'The official material lists specific permissions, quantity limits, and conditions for the cultivation of cannabis by adults.',
        'Educational reconstruction, not a quotation: limited cannabis permission will inevitably lead to permitting every other drug and removing all age restrictions.',
        'Each further change would require a separate decision, and the enacted text creates no automatic legislative chain.',
      ],
    },
    explanation: {
      ru: 'Несколько самостоятельных законодательных решений объявлены неизбежными последствиями первого шага без описания механизма перехода между ними.',
      en: 'Several independent legislative decisions are declared inevitable consequences of the first step without a mechanism connecting them.',
    },
    source: {
      title: { ru: 'После долгих споров Бундестаг принял закон о разрешении каннабиса', en: 'After a Long Debate, the Bundestag Passes Cannabis Legalisation' },
      url: 'https://www.bundestag.de/dokumente/textarchiv/2024/kw08-de-cannabis-990684',
    },
  },
  {
    key: 'eu-09',
    country: 'united-kingdom',
    family: 'post-hoc',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Ограничение автобусного тарифа действовало с января 2023 года; оценка отмечает рост разовых поездок, различия в использовании и восстановление пассажиропотока после пандемии.',
      en: 'The bus fare cap began in January 2023; the evaluation notes increased single journeys, varied take-up, and continuing patronage recovery after the COVID-19 pandemic.',
    },
    segments: {
      ru: [
        'После запуска схемы количество и доля разовых автобусных поездок выросли по сравнению с предшествующим периодом.',
        'В тот же период пассажиропоток уже восстанавливался после коронавирусной пандемии, а использование схемы различалось между группами и регионами.',
        'Учебная реконструкция, не цитата: поскольку рост начался после первого января, тарифное ограничение единолично вызвало весь рост автобусных поездок.',
      ],
      en: [
        'After the scheme began, the number and share of single bus journeys increased compared with the preceding period.',
        'During the same period, patronage was already recovering after the COVID-19 pandemic, while take-up varied across groups and regions.',
        'Educational reconstruction, not a quotation: because the increase followed 1 January, the fare cap alone caused the entire rise in bus travel.',
      ],
    },
    explanation: {
      ru: 'Временная последовательность событий подменяет проверку причинной связи и не отделяет влияние тарифа от параллельного восстановления спроса.',
      en: 'Temporal sequence substitutes for a causal test and does not separate the fare cap\'s effect from the concurrent recovery in demand.',
    },
    source: {
      title: { ru: 'Оценка ограничения автобусного тарифа двумя фунтами', en: 'Evaluation of the Two-Pound Bus Fare Cap' },
      url: 'https://www.gov.uk/government/publications/evaluation-of-the-2-bus-fare-cap',
    },
  },
  {
    key: 'eu-10',
    country: 'united-kingdom',
    family: 'composition',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'Закон о безопасности в интернете получил королевскую санкцию 26 октября 2023 года и возложил на регулируемые площадки обязанности, вводимые надзорным органом поэтапно.',
      en: 'The Online Safety Act received Royal Assent on 26 October 2023 and imposed duties on regulated platforms for phased enforcement by Ofcom.',
    },
    segments: {
      ru: [
        'Закон устанавливает для отдельных интернет-сервисов обязанности по работе с незаконными материалами и содержанием, вредным для детей.',
        'Учебная реконструкция, не цитата: если каждая регулируемая площадка получила обязанности по безопасности, весь интернет автоматически безопасен для каждого ребёнка.',
        'Общий результат зависит от охвата закона, исполнения требований, надзора, взаимодействия сервисов и поведения пользователей.',
      ],
      en: [
        'The Act gives individual online services duties concerning illegal material and content that is harmful to children.',
        'Educational reconstruction, not a quotation: if every regulated platform has safety duties, the internet as a whole is automatically safe for every child.',
        'The system-level outcome depends on the law\'s coverage, compliance, enforcement, interactions between services, and user behaviour.',
      ],
    },
    explanation: {
      ru: 'Обязанность отдельных частей ошибочно переносится на всю систему, хотя свойства системы зависят также от связей, охвата и исполнения правил.',
      en: 'A duty imposed on individual components is incorrectly transferred to the whole system, whose properties also depend on coverage, interactions, and enforcement.',
    },
    source: {
      title: { ru: 'Закон о безопасности в интернете принят для защиты детей и взрослых', en: 'Online Safety Bill Becomes Law to Protect Children and Adults' },
      url: 'https://www.gov.uk/government/news/uk-children-and-adults-to-be-safer-online-as-world-leading-bill-becomes-law',
    },
  },
  {
    key: 'eu-11',
    country: 'united-kingdom',
    family: 'equivocation',
    difficulty: 3,
    correctIndex: 2,
    context: {
      ru: 'Закон установил цель нулевого баланса выбросов к 2050 году; официальный материал определяет её как равновесие остаточных выбросов и удаления газов из атмосферы.',
      en: 'The law set a 2050 net-zero target, officially defined as balancing remaining emissions with equivalent greenhouse gas removals.',
    },
    segments: {
      ru: [
        'Установленная законом цель касается итогового баланса между выбросами и удалением парниковых газов из атмосферы.',
        'Понятие нулевого баланса отличается от буквального отсутствия любых выбросов во всех отраслях экономики.',
        'Учебная реконструкция, не цитата: слово «нулевой» означает, что в 2050 году авиация, сельское хозяйство и все остальные источники не должны произвести ни одной единицы выбросов.',
      ],
      en: [
        'The statutory target concerns the final balance between greenhouse gas emissions and removals from the atmosphere.',
        'A net-zero balance differs from the literal absence of every emission across all sectors of the economy.',
        'Educational reconstruction, not a quotation: the word zero means that aviation, agriculture, and every other source must produce no emissions whatsoever in 2050.',
      ],
    },
    explanation: {
      ru: 'Определённое официальным источником значение нулевого баланса незаметно заменено значением абсолютного отсутствия выбросов.',
      en: 'The official definition of a net-zero balance is quietly replaced with the meaning of an absolute absence of emissions.',
    },
    source: {
      title: { ru: 'Великобритания первой среди крупных экономик приняла закон о нулевом балансе выбросов', en: 'United Kingdom Becomes the First Major Economy to Pass a Net-Zero Emissions Law' },
      url: 'https://www.gov.uk/government/news/uk-becomes-first-major-economy-to-pass-net-zero-emissions-law',
    },
  },
]
