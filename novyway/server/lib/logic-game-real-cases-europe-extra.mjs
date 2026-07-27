const sources = {
  elyseeEnergy: {
    title: {
      ru: 'Стратегия возвращения контроля над энергетическим будущим Франции',
      en: 'Taking Back Control of the French Energy Future',
    },
    url: 'https://www.elysee.fr/emmanuel-macron/2022/02/10/reprendre-en-main-notre-destin-energetique',
  },
  assemblyAbortion: {
    title: {
      ru: 'Принятие Конгрессом конституционного законопроекта о свободе прибегнуть к прерыванию беременности',
      en: 'Congress Adopts the Constitutional Bill on the Freedom to Seek an Abortion',
    },
    url: 'https://www.assemblee-nationale.fr/dyn/actualites-accueil-hub/projet-de-loi-constitutionnelle-relatif-a-la-liberte-de-recourir-a-l-ivg-adoption-par-le-parlement-reuni-en-congres',
  },
  constitutionalCouncilPensions: {
    title: {
      ru: 'Решение Конституционного совета № 2023-849 DC о пенсионной реформе',
      en: 'Constitutional Council Decision No. 2023-849 DC on Pension Reform',
    },
    url: 'https://www.conseil-constitutionnel.fr/decision/2023/2023849DC.htm',
  },
  auditCourtFinances: {
    title: {
      ru: 'Состояние государственных финансов Франции в начале 2026 года',
      en: 'The State of French Public Finances at the Start of 2026',
    },
    url: 'https://www.ccomptes.fr/en/publications/state-french-public-finances-start-2026',
  },
  bundestagElection: {
    title: {
      ru: 'Реформа избирательного права для сокращения Бундестага',
      en: 'Electoral Reform to Reduce the Size of the Bundestag',
    },
    url: 'https://www.bundestag.de/dokumente/textarchiv/2023/kw11-de-bundeswahlgesetz-937896',
  },
  germanyTicket: {
    title: {
      ru: 'Вопросы и ответы о едином проездном Германии',
      en: 'Questions and Answers on the Deutschlandticket',
    },
    url: 'https://www.bundesregierung.de/breg-de/bundesregierung/bundeskanzleramt/deutschlandticket-2134074',
  },
  germanClimateDecision: {
    title: {
      ru: 'Конституционные жалобы на Федеральный закон о защите климата частично удовлетворены',
      en: 'Constitutional Complaints Against the Federal Climate Change Act Partially Successful',
    },
    url: 'https://www.bundesverfassungsgericht.de/SharedDocs/Pressemitteilungen/EN/2021/bvg21-031.html',
  },
  bletchleyDeclaration: {
    title: {
      ru: 'Блетчлиская декларация стран - участниц Саммита по безопасности ИИ',
      en: 'The Bletchley Declaration by Countries Attending the AI Safety Summit',
    },
    url: 'https://www.gov.uk/government/publications/ai-safety-summit-2023-the-bletchley-declaration/the-bletchley-declaration-by-countries-attending-the-ai-safety-summit-1-2-november-2023',
  },
  onlineSafetyAct: {
    title: {
      ru: 'Законопроект о безопасности в интернете завершил прохождение Парламента',
      en: 'Online Safety Bill Completes Passage Through Parliament',
    },
    url: 'https://www.parliament.uk/business/news/2023/january-2023/lords-scrutinises-online-safety-bill/',
  },
  rwandaJudgment: {
    title: {
      ru: 'Краткое изложение решения Верховного суда по делу AAA и других о политике в отношении Руанды',
      en: 'Supreme Court Press Summary in AAA and Others on the Rwanda Policy',
    },
    url: 'https://supremecourt.uk/uploads/uksc_2023_0093_press_summary_435372d8db.pdf',
  },
}

export const realWorldEuropeExtraCases = [
  {
    key: 'eu-extra-001',
    country: 'france',
    family: 'false-dilemma',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'В энергетической стратегии 2022 года были одновременно поставлены задачи сократить общее потребление энергии на 40% за 30 лет, производить до 60% больше электроэнергии и развивать как возобновляемые источники, так и атомную энергетику.',
      en: 'The 2022 energy strategy simultaneously set goals to cut overall energy consumption by 40% over 30 years, produce up to 60% more electricity, and develop both renewables and nuclear power.',
    },
    segments: {
      ru: [
        'Стратегия связывает электрификацию транспорта, отопления и промышленности с ростом спроса на низкоуглеродную электроэнергию.',
        'Учебная реконструкция, не цитата: у Франции есть только два варианта - построить объявленную атомную программу без единого изменения или смириться с постоянными отключениями электричества.',
        'В источнике также предусмотрены энергоэффективность, солнечная и ветровая генерация, сети, накопители и другие элементы смешанной системы.',
      ],
      en: [
        'The strategy links the electrification of transport, heating, and industry to higher demand for low-carbon electricity.',
        'Educational reconstruction, not a quotation: France has only two options - build the announced nuclear programme without a single change or accept permanent power cuts.',
        'The source also provides for efficiency, solar and wind generation, grids, storage, and other elements of a mixed system.',
      ],
    },
    explanation: {
      ru: 'Многокомпонентный выбор сведен к двум крайностям, хотя официальный план прямо сочетает несколько инструментов и допускает их настройку.',
      en: 'A multi-part policy choice is reduced to two extremes even though the official plan expressly combines several instruments that can be adjusted.',
    },
    source: sources.elyseeEnergy,
  },
  {
    key: 'eu-extra-002',
    country: 'france',
    family: 'slippery-slope',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Цель снизить потребление энергии на 40% за 30 лет была представлена как переход через инновации, модернизацию промышленности, обновление жилья и транспорта, а не через лишения.',
      en: 'The goal of reducing energy consumption by 40% over 30 years was presented as a transition through innovation and the modernisation of industry, homes, and transport rather than deprivation.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: первая цель по энергоэффективности неизбежно приведет к нормированию любого бытового электричества, а затем к запрету отопления и поездок.',
        'В речи прямо противопоставлены лишениям инвестиции, изменение практик и технологии, позволяющие потреблять меньше при сохранении производства.',
        'Числовая цель для совокупного потребления сама по себе не устанавливает автоматической цепочки запретов для каждого домохозяйства.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the first energy-efficiency target will inevitably lead to rationing all household electricity and then to bans on heating and travel.',
        'The speech expressly contrasts deprivation with investment, changed practices, and technologies that reduce consumption while maintaining production.',
        'A numerical target for aggregate consumption does not itself create an automatic chain of prohibitions for every household.',
      ],
    },
    explanation: {
      ru: 'Между общей целью эффективности и серией все более жестких запретов не показан механизм, который делал бы каждый следующий шаг неизбежным.',
      en: 'No mechanism is shown that would make each increasingly severe prohibition an inevitable result of the general efficiency target.',
    },
    source: sources.elyseeEnergy,
  },
  {
    key: 'eu-extra-003',
    country: 'france',
    family: 'sunk-cost',
    difficulty: 3,
    correctIndex: 2,
    context: {
      ru: 'В речи указано, что за предшествующие шесть лет государство мобилизовало более 10 млрд евро для укрепления баланса EDF, а новая атомная программа потребует еще нескольких десятков миллиардов публичного финансирования.',
      en: 'The speech states that the state had mobilised more than EUR10 billion over the preceding six years to strengthen EDF balance sheet and that the new nuclear programme would require several tens of billions more in public financing.',
    },
    segments: {
      ru: [
        'Более 10 млрд евро прежней поддержки уже были потрачены и не могут быть возвращены решением о следующем транше.',
        'Будущие вложения следует оценивать по ожидаемым затратам, срокам, рискам и результатам новой программы.',
        'Учебная реконструкция, не цитата: раз государство уже вложило более 10 млрд евро, остановка или пересмотр любого будущего транша иррациональны независимо от новых данных.',
      ],
      en: [
        'The previous support of more than EUR10 billion has already been spent and cannot be recovered by the decision on the next tranche.',
        'Future investment should be assessed against the expected costs, timelines, risks, and results of the new programme.',
        'Educational reconstruction, not a quotation: because the state has already invested more than EUR10 billion, stopping or revising any future tranche is irrational regardless of new evidence.',
      ],
    },
    explanation: {
      ru: 'Невозвратные прошлые расходы подменяют оценку еще не понесенных затрат, хотя именно будущие последствия должны определять новое решение.',
      en: 'Irrecoverable past spending replaces an assessment of costs not yet incurred even though future consequences should determine the new decision.',
    },
    source: sources.elyseeEnergy,
  },
  {
    key: 'eu-extra-004',
    country: 'france',
    family: 'composition',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Для морской ветроэнергетики стратегия задала ориентир около 40 ГВт и примерно 50 парков к 2050 году, одновременно потребовав морского планирования и учета интересов рыболовства, биоразнообразия и местных сообществ.',
      en: 'For offshore wind, the strategy set a goal of about 40 GW and roughly 50 wind farms by 2050 while also requiring maritime planning and consideration of fisheries, biodiversity, and local communities.',
    },
    segments: {
      ru: [
        'Согласование отдельного парка с местными правилами относится к конкретной площадке и ее условиям.',
        'Работа всей системы зависит также от совокупного воздействия проектов, сетевых подключений, графика ввода и пространственного планирования.',
        'Учебная реконструкция, не цитата: если каждый отдельный парк пройдет свою местную процедуру, вся система из примерно 50 парков автоматически не будет иметь сетевых, экологических или календарных ограничений.',
      ],
      en: [
        'Compliance by an individual wind farm with local rules concerns that site and its particular conditions.',
        'The performance of the whole system also depends on combined impacts, grid connections, commissioning schedules, and spatial planning.',
        'Educational reconstruction, not a quotation: if every individual wind farm passes its local process, the system of roughly 50 farms automatically has no grid, environmental, or scheduling constraints.',
      ],
    },
    explanation: {
      ru: 'Свойство отдельных проектов безосновательно перенесено на совокупную систему, у которой появляются собственные взаимодействия и ограничения.',
      en: 'A property of individual projects is transferred without justification to the combined system, which has interactions and constraints of its own.',
    },
    source: sources.elyseeEnergy,
  },
  {
    key: 'eu-extra-005',
    country: 'france',
    family: 'hasty-generalization',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'В речи сопоставлены ориентировочные сроки: около пяти лет разрешительных процедур для солнечного парка, семь лет или больше для ветропарка и примерно 15 лет для строительства реактора.',
      en: 'The speech compares indicative timelines: about five years of permitting for a solar farm, seven years or more for a wind farm, and roughly 15 years to build a reactor.',
    },
    segments: {
      ru: [
        'Эти примеры иллюстрируют проблему длительных процедур для нескольких типов энергетической инфраструктуры.',
        'Учебная реконструкция, не цитата: три приведенных срока доказывают, что каждый будущий энергетический проект во Франции займет ровно столько же времени.',
        'Фактический срок отдельного проекта может зависеть от технологии, площадки, разрешений, финансирования и готовности цепочки поставок.',
      ],
      en: [
        'The examples illustrate the problem of lengthy processes for several kinds of energy infrastructure.',
        'Educational reconstruction, not a quotation: the three stated timelines prove that every future French energy project will take exactly the same amount of time.',
        'The actual duration of an individual project can depend on technology, site, permits, financing, and supply-chain readiness.',
      ],
    },
    explanation: {
      ru: 'Несколько ориентировочных примеров превращены в универсальное правило для неоднородной совокупности будущих проектов.',
      en: 'A few indicative examples are turned into a universal rule for a heterogeneous set of future projects.',
    },
    source: sources.elyseeEnergy,
  },
  {
    key: 'eu-extra-006',
    country: 'france',
    family: 'straw-man',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Четвертого марта 2024 года французский Парламент, собравшийся в Конгресс, принял формулировку, по которой закон определяет условия осуществления гарантированной женщине свободы прибегнуть к прерыванию беременности.',
      en: 'On 4 March 2024, the French Parliament convened in Congress and adopted wording under which the law determines the conditions for exercising the freedom guaranteed to a woman to seek an abortion.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: конституционная поправка обязывает каждую беременную женщину прервать беременность.',
        'Принятая формулировка гарантирует свободу выбора, а условия ее осуществления определяются законом.',
        'Гарантия возможности совершить действие логически не равна предписанию совершить его.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the constitutional amendment requires every pregnant woman to terminate her pregnancy.',
        'The adopted wording guarantees freedom of choice, while the conditions for exercising it are determined by law.',
        'A guarantee that an action may be taken is not logically equivalent to an order to take it.',
      ],
    },
    explanation: {
      ru: 'Защищенная свобода подменена противоположной по смыслу обязанностью, после чего критикуется уже вымышленная норма.',
      en: 'A protected freedom is replaced with an obligation of the opposite meaning, and the invented rule is then attacked.',
    },
    source: sources.assemblyAbortion,
  },
  {
    key: 'eu-extra-007',
    country: 'france',
    family: 'bandwagon',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Одинаковый текст был принят обеими палатами, а затем получил в Конгрессе требуемое большинство в три пятых поданных голосов.',
      en: 'The same text was adopted by both Houses and then received the required three-fifths majority of votes cast in Congress.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: поддержка большинства в три пятых сама по себе доказывает, что формулировка безошибочна и ни одно содержательное возражение не может быть верным.',
        'Результат голосования устанавливает, что конституционный порог принятия был достигнут.',
        'Число голосов не заменяет отдельный анализ смысла, последствий и возможных возражений к норме.',
      ],
      en: [
        'Educational reconstruction, not a quotation: support from a three-fifths majority by itself proves that the wording is flawless and that no substantive objection can be valid.',
        'The vote establishes that the constitutional threshold for adoption was met.',
        'The number of votes does not replace a separate analysis of the rule, its effects, and possible objections.',
      ],
    },
    explanation: {
      ru: 'Популярность решения среди голосовавших используется как доказательство его содержательной истинности и безошибочности.',
      en: 'Support among those voting is treated as proof of the substantive truth and infallibility of the decision.',
    },
    source: sources.assemblyAbortion,
  },
  {
    key: 'eu-extra-008',
    country: 'france',
    family: 'composition',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'До заседания Конгресса Национальное собрание и Сенат приняли проект в одинаковой редакции; окончательное голосование состоялось на совместном заседании в Версале.',
      en: 'Before the sitting of Congress, the National Assembly and the Senate adopted the bill in identical terms; the final vote took place at a joint sitting in Versailles.',
    },
    segments: {
      ru: [
        'Совпадение редакций двух палат было необходимым институциональным этапом конституционной процедуры.',
        'Решение представительных органов не означает тождества мнений всех их членов или всех граждан страны.',
        'Учебная реконструкция, не цитата: раз каждая палата одобрила одинаковый текст, все французское общество как единое целое поддержало каждое его слово без исключений.',
      ],
      en: [
        'Agreement on identical wording by both Houses was a necessary institutional stage of the constitutional procedure.',
        'A decision by representative bodies does not mean that every member or every citizen holds the same view.',
        'Educational reconstruction, not a quotation: because each House approved the same text, French society as a whole supported every word of it without exception.',
      ],
    },
    explanation: {
      ru: 'Свойство двух представительных институтов перенесено на все общество, состав которого и распределение мнений значительно шире.',
      en: 'A property of two representative institutions is transferred to society as a whole, whose membership and distribution of views are much broader.',
    },
    source: sources.assemblyAbortion,
  },
  {
    key: 'eu-extra-009',
    country: 'france',
    family: 'tradition',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Конгресс применил предусмотренную конституционную процедуру пересмотра и добавил новую гарантию в текст Конституции.',
      en: 'Congress used the constitutional amendment procedure and added a new guarantee to the text of the Constitution.',
    },
    segments: {
      ru: [
        'Само наличие процедуры пересмотра допускает изменение конституционного текста при выполнении установленных условий.',
        'Учебная реконструкция, не цитата: поскольку такой формулировки раньше не было в Конституции, историческая традиция доказывает, что ее никогда не следовало добавлять.',
        'Предшествующее отсутствие нормы описывает прошлое, но не доказывает, что сохранение прежнего текста всегда является лучшим решением.',
      ],
      en: [
        'The existence of an amendment procedure permits the constitutional text to change when its stated conditions are met.',
        'Educational reconstruction, not a quotation: because this wording was not previously in the Constitution, historical tradition proves that it should never have been added.',
        'The prior absence of a rule describes the past but does not prove that preserving the previous text is always the best choice.',
      ],
    },
    explanation: {
      ru: 'Прежнее состояние текста объявлено правильным только потому, что оно существовало раньше, без оценки оснований для изменения.',
      en: 'The previous text is declared correct merely because it existed before, without assessing the reasons for change.',
    },
    source: sources.assemblyAbortion,
  },
  {
    key: 'eu-extra-010',
    country: 'france',
    family: 'circular-reasoning',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Президентский декрет от 29 февраля 2024 года созвал Парламент в Конгресс на 4 марта, где проект был поставлен на голосование после принятия одинакового текста двумя палатами.',
      en: 'A presidential decree of 29 February 2024 convened Parliament in Congress for 4 March, when the bill was put to a vote after both Houses had adopted identical wording.',
    },
    segments: {
      ru: [
        'Декрет определил созыв и дату заседания, но не подменил собой голосование Конгресса.',
        'Учебная реконструкция, не цитата: голосование было действительным, потому что Конгресс принял действительный текст, а текст был действительным, потому что за него действительно проголосовал Конгресс.',
        'Проверка процедуры требует независимых оснований, включая совпадение редакций и достижение большинства в три пятых.',
      ],
      en: [
        'The decree set the convocation and sitting date but did not replace the vote in Congress.',
        'Educational reconstruction, not a quotation: the vote was valid because Congress adopted a valid text, and the text was valid because Congress validly voted for it.',
        'Reviewing the procedure requires independent grounds, including identical wording and attainment of the three-fifths majority.',
      ],
    },
    explanation: {
      ru: 'Два вывода поддерживают друг друга по кругу, не добавляя внешнего основания, которое подтверждало бы действительность процедуры.',
      en: 'Two conclusions support each other in a circle without adding an external premise that would establish the validity of the procedure.',
    },
    source: sources.assemblyAbortion,
  },
  {
    key: 'eu-extra-011',
    country: 'france',
    family: 'survivorship',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'В решении № 2023-849 DC Конституционный совет отклонил возражения против основной процедуры и положений о повышении пенсионного возраста, но исключил шесть групп так называемых социальных наездников.',
      en: 'In Decision No. 2023-849 DC, the Constitutional Council rejected objections to the main procedure and the retirement-age provisions but struck out six groups of so-called social riders.',
    },
    segments: {
      ru: [
        'Итог решения был смешанным: значительная часть закона сохранилась, а несколько групп положений были исключены.',
        'Оценка только положений, прошедших контроль, скрывает обнаруженные Советом процедурные дефекты других положений.',
        'Учебная реконструкция, не цитата: раз повышение возраста сохранилось, проверку успешно прошло каждое оспоренное положение и Совет не обнаружил ни одного недостатка.',
      ],
      en: [
        'The outcome was mixed: a substantial part of the law remained while several groups of provisions were removed.',
        'Looking only at provisions that survived review conceals the procedural defects found in other provisions.',
        'Educational reconstruction, not a quotation: because the higher retirement age survived, every challenged provision passed review and the Council found no defect at all.',
      ],
    },
    explanation: {
      ru: 'Вывод построен только на сохранившейся части закона и игнорирует исключенные положения, поэтому картина результата искажена.',
      en: 'The conclusion uses only the surviving part of the law and ignores the removed provisions, distorting the overall result.',
    },
    source: sources.constitutionalCouncilPensions,
  },
  {
    key: 'eu-extra-012',
    country: 'france',
    family: 'equivocation',
    difficulty: 3,
    correctIndex: 1,
    context: {
      ru: 'Шесть групп положений были исключены как социальные наездники, потому что они не относились надлежащим образом к сфере закона о финансировании социального обеспечения; Совет отдельно не предрешал их соответствие другим конституционным требованиям.',
      en: 'Six groups of provisions were struck out as social riders because they did not properly belong in a social-security financing law; the Council expressly did not prejudge their compliance with other constitutional requirements.',
    },
    segments: {
      ru: [
        'Основанием исключения было место положений в данном виде закона, а не окончательная оценка каждой содержащейся в них политики по существу.',
        'Учебная реконструкция, не цитата: слово «исключены» здесь означает, что Совет признал сами политические идеи этих шести групп неконституционными по существу.',
        'Одинаковое слово может обозначать процедурный результат проверки, не утверждая ничего о возможном содержании нормы в другом законодательном акте.',
      ],
      en: [
        'The ground for removal concerned the placement of the provisions in this type of law, not a final merits assessment of every policy they contained.',
        'Educational reconstruction, not a quotation: the words struck out here mean that the Council held the policy ideas in all six groups substantively unconstitutional.',
        'The same expression can describe a procedural result without deciding what the rule might mean in a different legislative measure.',
      ],
    },
    explanation: {
      ru: 'Процедурное значение результата незаметно заменено содержательным, хотя официальный источник прямо разводит эти два вопроса.',
      en: 'The procedural meaning of the result is quietly replaced with a substantive meaning even though the official source expressly separates the two questions.',
    },
    source: sources.constitutionalCouncilPensions,
  },
  {
    key: 'eu-extra-013',
    country: 'france',
    family: 'false-authority',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'Совет признал, что законодатель стремился обеспечить финансовое равновесие распределительной пенсионной системы, и не счел выбранные меры неуместными относительно этой цели.',
      en: 'The Council recognised that the legislature sought to secure the financial balance of the pay-as-you-go pension system and did not find the chosen measures inappropriate to that objective.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: поскольку Конституционный совет сохранил основные положения, повышение возраста до 64 лет доказано как экономически оптимальная пенсионная модель среди всех возможных вариантов.',
        'Совет проверял конституционные требования, а не проводил исчерпывающее экономическое ранжирование всех пенсионных моделей.',
        'Решение также учитывает сохраненные или расширенные возможности досрочного выхода для ряда групп.',
      ],
      en: [
        'Educational reconstruction, not a quotation: because the Constitutional Council allowed the main provisions to stand, a retirement age of 64 is proven to be the economically optimal pension model among every possible alternative.',
        'The Council reviewed constitutional requirements; it did not conduct an exhaustive economic ranking of every pension model.',
        'The decision also notes retained or expanded early-retirement routes for several groups.',
      ],
    },
    explanation: {
      ru: 'Авторитет органа в конституционном контроле ошибочно распространяется на иной вопрос - экономическую оптимальность среди всех альтернатив.',
      en: 'The authority of the constitutional reviewer is wrongly extended to a different question: economic optimality among all alternatives.',
    },
    source: sources.constitutionalCouncilPensions,
  },
  {
    key: 'eu-extra-014',
    country: 'france',
    family: 'ad-hominem',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'Совет получил обращения от премьер-министра, двух групп более чем из 60 депутатов и группы более чем из 60 сенаторов.',
      en: 'The Council received referrals from the Prime Minister, two groups of more than 60 deputies, and a group of more than 60 senators.',
    },
    segments: {
      ru: [
        'Личность заявителя не меняет текст конституционных положений, по которым проверялся закон.',
        'Критика решения должна разбирать примененный стандарт, факты и выводы Совета.',
        'Учебная реконструкция, не цитата: решение можно не анализировать, потому что одно из обращений подал премьер-министр, а значит весь документ является правительственной пропагандой.',
      ],
      en: [
        'The identity of a referring party does not change the constitutional provisions against which the law was reviewed.',
        'A critique of the decision should address the standard applied, the facts, and the reasoning of the Council.',
        'Educational reconstruction, not a quotation: the decision need not be analysed because one referral came from the Prime Minister, which makes the entire document government propaganda.',
      ],
    },
    explanation: {
      ru: 'Вместо разбора аргументов решение отклоняется по происхождению одного обращения, хотя заявителей было несколько и Совет изложил собственные основания.',
      en: 'Instead of addressing the reasoning, the decision is dismissed because of the source of one referral even though there were several applicants and the Council gave its own reasons.',
    },
    source: sources.constitutionalCouncilPensions,
  },
  {
    key: 'eu-extra-015',
    country: 'france',
    family: 'composition',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'Совет отдельно рассмотрел несколько ускоряющих процедур, а затем их совокупное применение; комбинация была названа необычной, но в обстоятельствах дела не нарушившей Конституцию.',
      en: 'The Council examined several accelerating procedures separately and then considered their combined use; the combination was described as unusual but not unconstitutional in the circumstances.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: раз каждая примененная процедура была доступна по отдельности, их совокупность автоматически не могла затронуть ясность и добросовестность парламентских дебатов.',
        'Совет не ограничился свойствами отдельных процедур и оценил также эффект их сочетания в конкретном деле.',
        'Допустимость каждой части сама по себе не решает вопрос о взаимодействии частей в общей процедуре.',
      ],
      en: [
        'Educational reconstruction, not a quotation: because each procedure was available on its own, their combination automatically could not affect the clarity and sincerity of parliamentary debate.',
        'The Council did not stop at the properties of each procedure and also assessed the effect of their combination in the particular case.',
        'The permissibility of every component by itself does not settle how the components interact in the procedure as a whole.',
      ],
    },
    explanation: {
      ru: 'Свойства отдельных процедур без проверки переносятся на их сочетание, хотя взаимодействие частей способно создать новый эффект.',
      en: 'Properties of the individual procedures are transferred to their combination without review even though interactions between parts can create a new effect.',
    },
    source: sources.constitutionalCouncilPensions,
  },
  {
    key: 'eu-extra-016',
    country: 'france',
    family: 'base-rate',
    difficulty: 3,
    correctIndex: 1,
    context: {
      ru: 'Счетная палата оценивала дефицит Франции за 2025 год в 5,4% ВВП, долг - в 116,3% ВВП и относила страну к трем наиболее задолжавшим государствам еврозоны.',
      en: 'The Court of Accounts estimated the French 2025 deficit at 5.4% of GDP, debt at 116.3% of GDP, and ranked the country among the three most indebted euro-area states.',
    },
    segments: {
      ru: [
        'Общие показатели долга важны для стоимости финансирования и доступного бюджетного пространства.',
        'Учебная реконструкция, не цитата: место Франции в общеевропейском рейтинге доказывает, что любой французский публичный инвестиционный проект рискованнее любого проекта в стране с меньшим долгом.',
        'Оценка конкретного проекта требует его собственных денежных потоков, рисков, срока и общественной отдачи наряду с общим финансовым фоном.',
      ],
      en: [
        'Aggregate debt indicators matter for financing costs and available fiscal space.',
        'Educational reconstruction, not a quotation: the French position in the euro-area ranking proves that every French public investment project is riskier than every project in a lower-debt country.',
        'Assessing a specific project requires its own cash flows, risks, timeline, and public return alongside the general fiscal background.',
      ],
    },
    explanation: {
      ru: 'Агрегированный базовый показатель страны подменяет данные о конкретных проектах и превращается в универсальное сравнение без учета их различий.',
      en: 'An aggregate national base rate replaces project-specific evidence and becomes a universal comparison that ignores differences between projects.',
    },
    source: sources.auditCourtFinances,
  },
  {
    key: 'eu-extra-017',
    country: 'france',
    family: 'post-hoc',
    difficulty: 3,
    correctIndex: 2,
    context: {
      ru: 'По данным Счетной палаты, отношение долга к ВВП продолжало расти, а доходность французских десятилетних облигаций за два года увеличилась примерно на половину процентного пункта и приблизилась к уровням Италии и Греции.',
      en: 'According to the Court of Accounts, the debt-to-GDP ratio continued to rise while the yield on French ten-year bonds increased by about half a percentage point over two years and approached Italian and Greek levels.',
    },
    segments: {
      ru: [
        'Рост долга и доходности облигаций происходил в одном периоде и мог влиять на оценку французских финансов инвесторами.',
        'Одна временная последовательность не отделяет влияние долга от инфляции, денежной политики, ожиданий и других рыночных факторов.',
        'Учебная реконструкция, не цитата: поскольку рост долга предшествовал или сопутствовал росту доходности, именно он единолично вызвал все повышение ставки на половину пункта.',
      ],
      en: [
        'Debt and bond yields rose during the same period and the fiscal position could affect investor assessments of France.',
        'Timing alone does not separate the effect of debt from inflation, monetary policy, expectations, and other market factors.',
        'Educational reconstruction, not a quotation: because rising debt preceded or accompanied the higher yield, it alone caused the entire half-point increase.',
      ],
    },
    explanation: {
      ru: 'Последовательность и совместное движение показателей превращены в доказательство единственной причины без отделения параллельных факторов.',
      en: 'Sequence and co-movement are turned into proof of a sole cause without separating concurrent factors.',
    },
    source: sources.auditCourtFinances,
  },
  {
    key: 'eu-extra-018',
    country: 'france',
    family: 'survivorship',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'Палата отметила, что финансовые цели, принятые в начале 2025 года, были достигнуты, но противопоставила этот результат ухудшению 2023 и 2024 годов и более слабому, чем первоначально намечалось, оздоровлению.',
      en: 'The Court noted that the financial targets adopted at the start of 2025 were met, but contrasted that result with deterioration in 2023 and 2024 and an adjustment weaker than initially planned.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: успешное выполнение целей одного 2025 года показывает, что французские бюджетные прогнозы постоянно надежны и прошлые промахи учитывать не нужно.',
        'В самом отчете удачный результат 2025 года рассматривается рядом с двумя предшествующими годами ухудшения.',
        'Оценка надежности прогнозов должна включать как выполненные, так и невыполненные цели за сопоставимые периоды.',
      ],
      en: [
        'Educational reconstruction, not a quotation: meeting the targets in 2025 alone shows that French fiscal forecasts are consistently reliable and past misses need not be considered.',
        'The report itself places the successful 2025 outcome alongside two preceding years of deterioration.',
        'Forecast reliability should be assessed using both met and missed targets over comparable periods.',
      ],
    },
    explanation: {
      ru: 'В выборку попал только успешный год, а неудобные прошлые результаты исключены, что завышает оценку надежности.',
      en: 'Only the successful year is selected while inconvenient earlier outcomes are excluded, overstating reliability.',
    },
    source: sources.auditCourtFinances,
  },
  {
    key: 'eu-extra-019',
    country: 'france',
    family: 'circular-reasoning',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Для 2026 года правительство ставило цель дефицита 5,0% ВВП, тогда как европейская траектория предполагала 4,6%; Палата оценивала порог стабилизации долга примерно в 2,8% ВВП.',
      en: 'For 2026, the government targeted a deficit of 5.0% of GDP while the European path implied 4.6%; the Court estimated that stabilising debt would require a deficit of about 2.8% of GDP.',
    },
    segments: {
      ru: [
        'Разные числовые ориентиры позволяют проверять официальную траекторию по ожидаемой динамике долга.',
        'Учебная реконструкция, не цитата: траектория устойчива, потому что правительство назвало ее устойчивой, а правительственное название верно, потому что описывает устойчивую траекторию.',
        'Вывод об устойчивости требует внешней проверки через дефицит, рост, ставки и изменение отношения долга к ВВП.',
      ],
      en: [
        'The different numerical benchmarks allow the official path to be tested against expected debt dynamics.',
        'Educational reconstruction, not a quotation: the path is sustainable because the government calls it sustainable, and the government label is correct because it describes a sustainable path.',
        'A sustainability conclusion requires an external test using the deficit, growth, interest rates, and the debt-to-GDP trajectory.',
      ],
    },
    explanation: {
      ru: 'Утверждение и его основание повторяют друг друга, тогда как отчет предоставляет независимые показатели для реальной проверки.',
      en: 'The claim and its support merely repeat each other even though the report supplies independent indicators for an actual test.',
    },
    source: sources.auditCourtFinances,
  },
  {
    key: 'eu-extra-020',
    country: 'france',
    family: 'sunk-cost',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Процентные расходы по долгу оценивались примерно в 65 млрд евро за 2025 год, почти в 74 млрд за 2026 год и более чем в 100 млрд к 2029 году.',
      en: 'Debt-interest spending was estimated at about EUR65 billion in 2025, nearly EUR74 billion in 2026, and more than EUR100 billion by 2029.',
    },
    segments: {
      ru: [
        'Проценты по уже накопленному долгу ограничивают будущие бюджетные возможности, но сами по себе не определяют ценность каждого нового расхода.',
        'Еще не понесенные расходы можно пересматривать по их будущим выгодам, рискам и альтернативной стоимости.',
        'Учебная реконструкция, не цитата: раз страна уже платит десятки миллиардов процентов, она обязана продолжить каждую ранее объявленную программу, иначе прежние процентные платежи окажутся напрасными.',
      ],
      en: [
        'Interest on accumulated debt constrains future fiscal choices but does not by itself determine the value of every new item of spending.',
        'Costs not yet incurred can be reconsidered according to future benefits, risks, and opportunity cost.',
        'Educational reconstruction, not a quotation: because the country already pays tens of billions in interest, it must continue every previously announced programme or the earlier interest payments will have been wasted.',
      ],
    },
    explanation: {
      ru: 'Уже возникшие обязательства используются для блокирования пересмотра будущих решений, хотя продолжение программы не возвращает прошлые проценты.',
      en: 'Existing obligations are used to block reconsideration of future decisions even though continuing a programme cannot recover past interest payments.',
    },
    source: sources.auditCourtFinances,
  },
  {
    key: 'eu-extra-021',
    country: 'germany',
    family: 'bandwagon',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Семнадцатого марта 2023 года Бундестаг принял реформу избирательного права 399 голосами против 261 при 23 воздержавшихся.',
      en: 'On 17 March 2023, the Bundestag adopted the electoral reform by 399 votes to 261, with 23 abstentions.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: поскольку за реформу проголосовало большинство, выбранная система доказанно является самой справедливой для каждого немецкого избирателя.',
        'Подсчет голосов устанавливает парламентский результат, но не измеряет справедливость всех последствий системы.',
        'Официальный отчет фиксирует резкие разногласия и несколько конкурирующих проектов реформы.',
      ],
      en: [
        'Educational reconstruction, not a quotation: because a majority voted for the reform, the chosen system is proven to be the fairest one for every German voter.',
        'The vote count establishes the parliamentary outcome but does not measure the fairness of every effect of the system.',
        'The official account records sharp disagreement and several competing reform proposals.',
      ],
    },
    explanation: {
      ru: 'Поддержка большинства превращена в доказательство качества решения по всем критериям и для всех граждан.',
      en: 'Majority support is turned into proof of the decision quality under every criterion and for every citizen.',
    },
    source: sources.bundestagElection,
  },
  {
    key: 'eu-extra-022',
    country: 'germany',
    family: 'straw-man',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Реформа сохранила 299 округов и два голоса: второй голос определяет пропорциональное распределение мест между партиями, а победитель округа получает мандат при наличии покрытия результатом второго голоса.',
      en: 'The reform retained 299 constituencies and two votes: the second vote determines proportional seat allocation among parties, while a constituency winner receives a seat when covered by the second-vote result.',
    },
    segments: {
      ru: [
        'Избиратели по-прежнему выбирают кандидата в округе первым голосом и партийный список вторым.',
        'Изменение касается условия, при котором победа кандидата в округе превращается в парламентский мандат.',
        'Учебная реконструкция, не цитата: реформа полностью упразднила округа, поэтому немецкие избиратели больше не могут голосовать за местных кандидатов.',
      ],
      en: [
        'Voters still choose a constituency candidate with the first vote and a party list with the second.',
        'The change concerns the condition under which a constituency victory becomes a parliamentary seat.',
        'Educational reconstruction, not a quotation: the reform abolished constituencies entirely, so German voters can no longer vote for local candidates.',
      ],
    },
    explanation: {
      ru: 'Измененное условие получения мандата подменено вымышленной отменой всей окружной части выборов.',
      en: 'A changed condition for obtaining a seat is replaced with an invented abolition of the entire constituency element of the election.',
    },
    source: sources.bundestagElection,
  },
  {
    key: 'eu-extra-023',
    country: 'germany',
    family: 'hasty-generalization',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'При новой системе некоторые кандидаты, занявшие первое место в округе, могут не получить мандат, если партии не хватает мест по результату второго голоса.',
      en: 'Under the new system, some candidates who finish first in a constituency may not receive a seat if their party lacks sufficient seats under the second-vote result.',
    },
    segments: {
      ru: [
        'Первый голос продолжает ранжировать окружных кандидатов внутри распределения мест соответствующей партии.',
        'Учебная реконструкция, не цитата: если некоторые победители округа не получают место, первый голос вообще никогда не влияет на то, кто войдет в Бундестаг.',
        'Влияние первого голоса изменилось и ограничено партийным покрытием, но оно не исчезло во всех случаях.',
      ],
      en: [
        'The first vote continues to rank constituency candidates within the allocation available to the relevant party.',
        'Educational reconstruction, not a quotation: if some constituency winners do not receive seats, the first vote never affects who enters the Bundestag at all.',
        'The effect of the first vote has changed and is limited by party coverage, but it has not disappeared in every case.',
      ],
    },
    explanation: {
      ru: 'Возможность одного исхода для части округов поспешно распространена на каждый округ и каждое применение первого голоса.',
      en: 'A possible outcome in some constituencies is hastily generalised to every constituency and every use of the first vote.',
    },
    source: sources.bundestagElection,
  },
  {
    key: 'eu-extra-024',
    country: 'germany',
    family: 'false-dilemma',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'Принятая модель ограничивала число мест 630 и отменяла дополнительные и компенсационные мандаты; в ходе обсуждения предлагались также иные размеры палаты и иное число округов.',
      en: 'The adopted model capped the chamber at 630 seats and removed overhang and compensatory seats; the debate also included different chamber sizes and different numbers of constituencies.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: выбор был только между точным лимитом в 630 мест и бесконтрольным ростом Бундестага без какого-либо предела.',
        'Официальная страница описывает альтернативные предложения, включая ориентиры в 590 мест и 270 округов.',
        'Размер палаты можно ограничивать разными сочетаниями правил, а не только двумя заявленными крайностями.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the only choice was an exact cap of 630 seats or uncontrolled growth of the Bundestag without any limit.',
        'The official page describes alternative proposals, including benchmarks of 590 seats and 270 constituencies.',
        'The size of a chamber can be constrained through different combinations of rules, not only the two stated extremes.',
      ],
    },
    explanation: {
      ru: 'Реальный набор конкурирующих моделей скрыт за искусственным выбором между одним точным проектом и отсутствием регулирования.',
      en: 'The actual set of competing models is hidden behind an artificial choice between one exact proposal and no control at all.',
    },
    source: sources.bundestagElection,
  },
  {
    key: 'eu-extra-025',
    country: 'germany',
    family: 'composition',
    difficulty: 3,
    correctIndex: 1,
    context: {
      ru: 'В реформе итог второго голоса определяет пропорциональное число мест каждой партии, а конкретные кандидаты получают эти места по окружным результатам и партийным спискам.',
      en: 'Under the reform, the second-vote result determines the proportional number of seats for each party, while individual candidates fill those seats through constituency results and party lists.',
    },
    segments: {
      ru: [
        'Пропорциональность партийного состава относится к распределению мест между партиями на уровне палаты.',
        'Учебная реконструкция, не цитата: если каждый депутат получил место по установленным правилам, Бундестаг в целом обязан идеально отражать каждое местное предпочтение в каждом округе.',
        'Корректность индивидуального распределения мест не гарантирует одновременного полного совпадения агрегированной пропорциональности со всеми локальными результатами.',
      ],
      en: [
        'Party proportionality concerns the distribution of seats among parties at chamber level.',
        'Educational reconstruction, not a quotation: if every member received a seat under the stated rules, the Bundestag as a whole must perfectly reflect every local preference in every constituency.',
        'Valid individual seat allocations do not guarantee a simultaneous perfect match between aggregate proportionality and all local outcomes.',
      ],
    },
    explanation: {
      ru: 'Свойство отдельных мандатов переносится на всю палату, хотя агрегированная пропорциональность и локальное представительство измеряют разные отношения.',
      en: 'A property of individual seats is transferred to the whole chamber even though aggregate proportionality and local representation measure different relationships.',
    },
    source: sources.bundestagElection,
  },
  {
    key: 'eu-extra-026',
    country: 'germany',
    family: 'equivocation',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'Единый проездной Германии действует по всей Германии в местном и региональном общественном транспорте, но обычно не распространяется на IC, EC, ICE, частные дальние перевозки и первый класс.',
      en: 'The Deutschlandticket is valid across Germany on local and regional public transport but generally excludes IC, EC, ICE, private long-distance services, and first class.',
    },
    segments: {
      ru: [
        'Слово «общенациональный» описывает географический охват определенной категории транспорта.',
        'Официальные исключения показывают, что охват страны не равен охвату каждого существующего поезда и класса обслуживания.',
        'Учебная реконструкция, не цитата: раз билет называется общенациональным, он по смыслу действителен в любом поезде Германии, включая ICE и первый класс.',
      ],
      en: [
        'The word nationwide describes the geographic reach of a defined category of transport.',
        'The official exclusions show that nationwide reach is not the same as coverage of every train and service class.',
        'Educational reconstruction, not a quotation: because the ticket is called nationwide, it is valid by definition on every German train, including ICE and first class.',
      ],
    },
    explanation: {
      ru: 'Географическое значение слова «общенациональный» подменено значением «все виды услуг без исключения».',
      en: 'The geographic meaning of nationwide is replaced with the meaning every kind of service without exception.',
    },
    source: sources.germanyTicket,
  },
  {
    key: 'eu-extra-027',
    country: 'germany',
    family: 'bandwagon',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'По данным федерального правительства, к маю 2026 года единый проездной Германии использовали около 14,5 млн клиентов.',
      en: 'According to the Federal Government, about 14.5 million customers were using the Deutschlandticket by May 2026.',
    },
    segments: {
      ru: [
        'Число клиентов показывает широкое использование единого билета.',
        'Учебная реконструкция, не цитата: 14,5 млн пользователей сами по себе доказывают, что билет оптимален для каждого пассажира, региона и транспортного оператора.',
        'Оптимальность по цене, доступности, качеству перевозок и бюджетной эффективности требует дополнительных показателей.',
      ],
      en: [
        'The customer count shows that the unified ticket is widely used.',
        'Educational reconstruction, not a quotation: 14.5 million users alone prove that the ticket is optimal for every passenger, region, and transport operator.',
        'Optimality in price, access, service quality, and fiscal efficiency requires additional measures.',
      ],
    },
    explanation: {
      ru: 'Популярность услуги ошибочно принимается за доказательство ее превосходства для всех участников и по всем критериям.',
      en: 'The popularity of the service is mistaken for proof of its superiority for every participant and under every criterion.',
    },
    source: sources.germanyTicket,
  },
  {
    key: 'eu-extra-028',
    country: 'germany',
    family: 'false-authority',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'Правительственная страница приводит оценку консорциума под руководством исследовательского института «Инфас»: использование билета связано с сокращением выбросов примерно на 2,5 млн тонн CO2 в год.',
      en: 'The government page reports an estimate by a consortium led by infas that use of the ticket is associated with savings of about 2.5 million tonnes of CO2 per year.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: поскольку цифру рассчитали эксперты, ровно 2,5 млн тонн сокращения гарантированы в каждом будущем году при любой цене и любом качестве перевозок.',
        'Источник называет величину оценкой, а не неизменной физической константой.',
        'Будущий результат зависит от числа поездок, замещения автомобилей, состава энергии и условий транспортной системы.',
      ],
      en: [
        'Educational reconstruction, not a quotation: because experts calculated the figure, exactly 2.5 million tonnes of savings are guaranteed in every future year at any price and service level.',
        'The source presents the figure as an estimate, not an unchanging physical constant.',
        'Future results depend on ridership, substitution away from cars, the energy mix, and transport-system conditions.',
      ],
    },
    explanation: {
      ru: 'Ссылка на компетентных авторов оценки превращена в гарантию точного будущего результата за пределами условий расчета.',
      en: 'Reference to qualified authors of an estimate is turned into a guarantee of an exact future result beyond the conditions of the calculation.',
    },
    source: sources.germanyTicket,
  },
  {
    key: 'eu-extra-029',
    country: 'germany',
    family: 'post-hoc',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Постоянный единый проездной Германии появился после временного билета за девять евро, который предлагался летом 2022 года и был продан 52 млн раз.',
      en: 'The permanent Deutschlandticket followed the temporary nine-euro ticket, which was offered in summer 2022 and sold 52 million times.',
    },
    segments: {
      ru: [
        'Временная акция предшествовала постоянному предложению и послужила одним из его политических предшественников.',
        'Для причинного вывода о поведении пассажиров нужны сравнения с теми, кто не участвовал в акции, и учет цен, маршрутов и иных изменений.',
        'Учебная реконструкция, не цитата: поскольку единый проездной Германии появился после билета за девять евро, прежняя акция единолично создала всех нынешних пользователей, которые иначе не ездили бы общественным транспортом.',
      ],
      en: [
        'The temporary campaign preceded the permanent offer and was one of its policy precursors.',
        'A causal conclusion about passenger behaviour requires comparisons with non-participants and consideration of prices, routes, and other changes.',
        'Educational reconstruction, not a quotation: because the Deutschlandticket followed the nine-euro ticket, the earlier campaign alone created every current user, none of whom would otherwise use public transport.',
      ],
    },
    explanation: {
      ru: 'Хронологическая последовательность двух программ подменяет доказательство того, что первая единолично вызвала все использование второй.',
      en: 'The chronological order of two programmes substitutes for evidence that the first solely caused all use of the second.',
    },
    source: sources.germanyTicket,
  },
  {
    key: 'eu-extra-030',
    country: 'germany',
    family: 'base-rate',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'Временный билет за девять евро был продан 52 млн раз за летние месяцы 2022 года; постоянный билет в 2026 году стоил 63 евро в месяц и имел около 14,5 млн клиентов.',
      en: 'The temporary nine-euro ticket sold 52 million times during the summer months of 2022; the permanent ticket cost EUR63 per month in 2026 and had about 14.5 million customers.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: 52 млн продаж дешевой временной акции являются правильной базой для прогноза 52 млн ежемесячных подписчиков более дорогого постоянного билета.',
        'Различия в цене, длительности, единице учета и правилах подписки меняют исходную частоту, на которой строится прогноз.',
        'Фактическое число клиентов постоянного билета, указанное источником, заметно отличается от общего числа продаж временной акции.',
      ],
      en: [
        'Educational reconstruction, not a quotation: 52 million sales in the cheap temporary campaign are the correct base for predicting 52 million monthly subscribers to the more expensive permanent ticket.',
        'Differences in price, duration, unit of measurement, and subscription rules change the base rate used for a forecast.',
        'The actual customer count for the permanent ticket reported by the source differs markedly from total sales in the temporary campaign.',
      ],
    },
    explanation: {
      ru: 'Показатель из несопоставимой программы используется как готовая базовая частота, хотя условия и даже единица наблюдения изменились.',
      en: 'A rate from a non-comparable programme is used as the ready-made base rate even though the conditions and unit of observation changed.',
    },
    source: sources.germanyTicket,
  },
  {
    key: 'eu-extra-031',
    country: 'germany',
    family: 'slippery-slope',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Федеральный конституционный суд признал недостаточно определенными цели сокращения выбросов после 2030 года, поскольку большая будущая нагрузка могла затронуть практически все виды свободы.',
      en: 'The Federal Constitutional Court found the post-2030 emission-reduction targets insufficiently specified because major future burdens could affect practically every type of freedom.',
    },
    segments: {
      ru: [
        'Суд потребовал заблаговременно конкретизировать путь сокращения, чтобы не перекладывать непропорциональную нагрузку на будущие периоды.',
        'Учебная реконструкция, не цитата: требование установить цели после 2030 года неизбежно закончится запретом любой деятельности, при которой выделяется хотя бы немного парниковых газов.',
        'Решение говорит о распределении нагрузки и соразмерности, а не создает автоматическую последовательность тотальных запретов.',
      ],
      en: [
        'The Court required the reduction path to be specified in advance so that disproportionate burdens would not be shifted into future periods.',
        'Educational reconstruction, not a quotation: requiring targets after 2030 will inevitably end in a ban on every activity that emits even a small amount of greenhouse gas.',
        'The decision concerns the distribution and proportionality of burdens; it does not create an automatic sequence of total prohibitions.',
      ],
    },
    explanation: {
      ru: 'Требование планирования превращено в неизбежную цепочку до крайнего запрета без правового или причинного механизма между этапами.',
      en: 'A planning requirement is turned into an inevitable chain ending in an extreme ban without a legal or causal mechanism between the stages.',
    },
    source: sources.germanClimateDecision,
  },
  {
    key: 'eu-extra-032',
    country: 'germany',
    family: 'straw-man',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'Суд признал отдельные положения несовместимыми с основными правами лишь постольку, поскольку не хватало правил для целей после 2030 года; в остальной части жалобы были отклонены, а нормы временно сохранили действие.',
      en: 'The Court found particular provisions incompatible with fundamental rights only insofar as rules for targets after 2030 were missing; the complaints were otherwise rejected, and the provisions remained applicable for the time being.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: суд немедленно отменил весь закон 2019 года и приказал Германии сразу довести выбросы до абсолютного нуля.',
        'Решение касалось конкретного пробела в траектории после 2030 года, а не полного уничтожения закона.',
        'Законодателю дали срок до 31 декабря 2022 года для более подробного регулирования будущих целей.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the Court immediately annulled the entire 2019 Act and ordered Germany to reduce emissions to absolute zero at once.',
        'The decision concerned a specific gap in the post-2030 pathway, not the destruction of the entire Act.',
        'The legislature was given until 31 December 2022 to regulate future targets in greater detail.',
      ],
    },
    explanation: {
      ru: 'Ограниченное и отсроченное требование суда заменено гораздо более радикальным приказом, которого в решении нет.',
      en: 'The limited and deferred requirement imposed by the Court is replaced with a far more radical order that the decision does not contain.',
    },
    source: sources.germanClimateDecision,
  },
  {
    key: 'eu-extra-033',
    country: 'germany',
    family: 'sunk-cost',
    difficulty: 3,
    correctIndex: 2,
    context: {
      ru: 'Суд указал, что разрешенные до 2030 года объемы выбросов необратимо сужают оставшиеся варианты и могут переносить особенно тяжелое сокращение на последующие годы.',
      en: 'The Court stated that emissions allowed until 2030 irreversibly narrow the remaining options and can shift especially severe reductions into later years.',
    },
    segments: {
      ru: [
        'Уже выпущенные парниковые газы нельзя вернуть решением о будущей траектории.',
        'Будущая политика должна учитывать оставшийся углеродный бюджет и распределение нагрузки между периодами.',
        'Учебная реконструкция, не цитата: поскольку значительная часть углеродного бюджета уже использована, прежнюю траекторию надо продолжать, чтобы прошлые выбросы не оказались напрасными.',
      ],
      en: [
        'Greenhouse gases already emitted cannot be recovered through a decision about the future pathway.',
        'Future policy should account for the remaining carbon budget and the distribution of burdens across periods.',
        'Educational reconstruction, not a quotation: because much of the carbon budget has already been used, the old pathway must continue so that past emissions are not wasted.',
      ],
    },
    explanation: {
      ru: 'Невозвратные прошлые выбросы используются как основание для новых выбросов, хотя это только дополнительно сужает будущие возможности.',
      en: 'Irrecoverable past emissions are used to justify new emissions even though that only narrows future options further.',
    },
    source: sources.germanClimateDecision,
  },
  {
    key: 'eu-extra-034',
    country: 'germany',
    family: 'false-dilemma',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'Конституционные жалобы были удовлетворены частично: один недостаток потребовал исправления, иные требования отклонили, а двум экологическим ассоциациям отказали в процессуальной правоспособности для такой жалобы.',
      en: 'The constitutional complaints were partially successful: one deficiency required correction, other claims were rejected, and two environmental associations lacked standing to bring such a complaint.',
    },
    segments: {
      ru: [
        'Разные требования и разные заявители могли получить разные процессуальные и материальные результаты.',
        'Учебная реконструкция, не цитата: суд мог только полностью подтвердить весь закон или полностью отменить его; частичный результат логически невозможен.',
        'Само постановление сочетает несовместимость отдельных положений, отклонение остальной части жалоб и временное сохранение норм в силе.',
      ],
      en: [
        'Different claims and different applicants could receive different procedural and substantive outcomes.',
        'Educational reconstruction, not a quotation: the Court could only uphold the entire Act or annul it completely; a partial result is logically impossible.',
        'The order itself combines incompatibility of specific provisions, rejection of the remaining complaints, and temporary continued application of the rules.',
      ],
    },
    explanation: {
      ru: 'Множество доступных судебных результатов сведено к двум крайностям, прямо опровергнутым структурой постановления.',
      en: 'The range of available judicial outcomes is reduced to two extremes directly contradicted by the structure of the order.',
    },
    source: sources.germanClimateDecision,
  },
  {
    key: 'eu-extra-035',
    country: 'germany',
    family: 'circular-reasoning',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'Суд обязал законодателя подробнее определить обновление целей сокращения выбросов на периоды после 2030 года, связав достаточность правил с защитой будущей свободы.',
      en: 'The Court required the legislature to specify in greater detail how reduction targets would be updated for periods after 2030, linking the sufficiency of the rules to protection of future freedom.',
    },
    segments: {
      ru: [
        'Название показателя целью еще не устанавливает, насколько ясно он распределяет объемы и сроки сокращения.',
        'Достаточность можно проверять по содержанию траектории, правовым критериям и ожидаемой нагрузке после 2030 года.',
        'Учебная реконструкция, не цитата: будущие цели достаточно определенны, потому что закон называет их целями, а это название верно, потому что они достаточно определенны.',
      ],
      en: [
        'Calling a figure a target does not establish how clearly it allocates the amount and timing of reductions.',
        'Sufficiency can be tested against the content of the pathway, legal criteria, and the expected post-2030 burden.',
        'Educational reconstruction, not a quotation: the future targets are sufficiently specific because the Act calls them targets, and that label is correct because they are sufficiently specific.',
      ],
    },
    explanation: {
      ru: 'Вывод о достаточности повторяется в собственном основании, не добавляя независимого критерия, которого как раз потребовал суд.',
      en: 'The conclusion that the targets are sufficient is repeated in its own premise without adding the independent criterion required by the Court.',
    },
    source: sources.germanClimateDecision,
  },
  {
    key: 'eu-extra-036',
    country: 'united-kingdom',
    family: 'bandwagon',
    difficulty: 2,
    correctIndex: 0,
    context: {
      ru: 'Первого ноября 2023 года страны - участницы Саммита по безопасности ИИ согласовали Блетчлискую декларацию о совместной работе над рисками и возможностями передовых систем искусственного интеллекта.',
      en: 'On 1 November 2023, countries attending the AI Safety Summit agreed the Bletchley Declaration on joint work concerning the risks and opportunities of frontier AI systems.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: раз декларацию поддержало много государств, каждое ее техническое предположение научно доказано, а выбранный подход обязательно лучший.',
        'Международная поддержка показывает наличие общей политической повестки и готовность сотрудничать.',
        'Сама декларация призывает продолжать научные исследования и формировать общее доказательное понимание рисков.',
      ],
      en: [
        'Educational reconstruction, not a quotation: because many states supported the declaration, every technical assumption in it is scientifically proven and its chosen approach must be the best one.',
        'International support demonstrates a shared policy agenda and willingness to cooperate.',
        'The declaration itself calls for continuing scientific research and building a shared evidence-based understanding of risks.',
      ],
    },
    explanation: {
      ru: 'Широкое согласие участников подменяет научную проверку утверждений, которую документ, наоборот, считает еще необходимой.',
      en: 'Broad agreement among participants substitutes for scientific validation that the document itself still considers necessary.',
    },
    source: sources.bletchleyDeclaration,
  },
  {
    key: 'eu-extra-037',
    country: 'united-kingdom',
    family: 'composition',
    difficulty: 3,
    correctIndex: 2,
    context: {
      ru: 'Декларация распределяет роли между государствами, международными площадками, компаниями, гражданским обществом и наукой, особо выделяя ответственность разработчиков необычно мощных и потенциально опасных систем.',
      en: 'The declaration assigns roles to states, international forums, companies, civil society, and academia, while emphasising the responsibility of developers of unusually powerful and potentially harmful systems.',
    },
    segments: {
      ru: [
        'Наличие роли у каждого типа участника задает распределение ответственности, но не подтверждает качество исполнения этой роли.',
        'Безопасность всей экосистемы зависит от координации, стимулов, охвата, тестирования и взаимодействия между участниками.',
        'Учебная реконструкция, не цитата: если у каждого названного участника есть обязанность содействовать безопасности, вся экосистема ИИ автоматически уже безопасна.',
      ],
      en: [
        'Giving each type of actor a role allocates responsibility but does not establish how well that role is performed.',
        'Safety across the ecosystem depends on coordination, incentives, coverage, testing, and interactions among actors.',
        'Educational reconstruction, not a quotation: if every named actor has a role in promoting safety, the entire AI ecosystem is automatically safe already.',
      ],
    },
    explanation: {
      ru: 'Нормативное свойство отдельных участников переносится на сложную систему без проверки исполнения и взаимодействия ее частей.',
      en: 'A normative property of individual actors is transferred to a complex system without checking performance or interactions among its parts.',
    },
    source: sources.bletchleyDeclaration,
  },
  {
    key: 'eu-extra-038',
    country: 'united-kingdom',
    family: 'false-dilemma',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'Декларация одновременно признает значительные выгоды ИИ и риски, рекомендуя пропорциональное, благоприятное для инноваций управление с учетом национальных правовых условий.',
      en: 'The declaration recognises both major benefits and risks from AI and recommends proportionate, pro-innovation governance that accounts for national legal circumstances.',
    },
    segments: {
      ru: [
        'Документ пытается совместить развитие технологии с тестированием, прозрачностью и управлением рисками.',
        'Учебная реконструкция, не цитата: возможны только полностью неограниченная разработка ИИ или полный запрет передовых моделей во всех странах.',
        'Между этими крайностями существуют разные риск-ориентированные правила, стандарты и механизмы оценки.',
      ],
      en: [
        'The document seeks to combine technological development with testing, transparency, and risk management.',
        'Educational reconstruction, not a quotation: the only possibilities are completely unrestricted AI development or a total ban on frontier models in every country.',
        'Different risk-based rules, standards, and evaluation mechanisms exist between those extremes.',
      ],
    },
    explanation: {
      ru: 'Диапазон пропорциональных мер сведен к двум полюсам, хотя источник прямо описывает промежуточный подход.',
      en: 'A range of proportionate measures is reduced to two poles even though the source expressly describes a middle approach.',
    },
    source: sources.bletchleyDeclaration,
  },
  {
    key: 'eu-extra-039',
    country: 'united-kingdom',
    family: 'equivocation',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'В декларации «передовой ИИ» означает необычно мощные и потенциально опасные системы, для которых особенно важны испытания, оценки и снижение вредных возможностей.',
      en: 'In the declaration, frontier AI means unusually powerful and potentially harmful systems for which testing, evaluation, and mitigation of harmful capabilities are especially important.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: выражение «передовой ИИ» относится только к системам, используемым на географических границах государств.',
        'Термин в документе классифицирует системы по уровню возможностей и риска, а не по месту развертывания.',
        'Обычное пространственное значение слова «граница» не определяет специальный технологический термин.',
      ],
      en: [
        'Educational reconstruction, not a quotation: the expression frontier AI refers only to systems deployed at the geographical borders of states.',
        'The term in the document classifies systems by capability and risk, not by deployment location.',
        'The ordinary spatial meaning of frontier does not define the specialised technology term.',
      ],
    },
    explanation: {
      ru: 'Специальное значение термина подменено буквальным географическим значением одного слова.',
      en: 'The specialised meaning of a term is replaced with the literal geographic meaning of one word.',
    },
    source: sources.bletchleyDeclaration,
  },
  {
    key: 'eu-extra-040',
    country: 'united-kingdom',
    family: 'false-authority',
    difficulty: 3,
    correctIndex: 1,
    context: {
      ru: 'Участники поддержали международную сеть научных исследований, общее доказательное понимание рисков, разработку метрик и инструментов испытаний передового ИИ.',
      en: 'Participants supported an international network of scientific research, a shared evidence-based understanding of risks, and the development of metrics and tools for testing frontier AI.',
    },
    segments: {
      ru: [
        'Политические участники декларации определили направления сотрудничества, а не завершили все технические измерения риска.',
        'Учебная реконструкция, не цитата: подписи правительств окончательно установили точные технические пороги опасности, поэтому дальнейшие испытания и исследования не нужны.',
        'Призыв разрабатывать методы оценки показывает, что ответы должны уточняться научной работой и новыми данными.',
      ],
      en: [
        'The political participants in the declaration set directions for cooperation; they did not complete every technical measurement of risk.',
        'Educational reconstruction, not a quotation: government signatures conclusively established the exact technical danger thresholds, so no further testing or research is needed.',
        'The call to develop evaluation methods shows that answers must be refined through scientific work and new evidence.',
      ],
    },
    explanation: {
      ru: 'Политический авторитет подписантов ошибочно используется как замена еще не завершенной технической и научной проверке.',
      en: 'The political authority of the signatories is wrongly used as a substitute for technical and scientific validation that remains unfinished.',
    },
    source: sources.bletchleyDeclaration,
  },
  {
    key: 'eu-extra-041',
    country: 'united-kingdom',
    family: 'straw-man',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Закон о безопасности в интернете создал новый режим для незаконного и вредного контента, возложил требования на поисковые и интернет-сервисы и наделил британского медиарегулятора полномочиями регулятора.',
      en: 'The Online Safety Act created a new regime for illegal and harmful content, imposed requirements on search and internet services, and gave Ofcom powers as the regulator.',
    },
    segments: {
      ru: [
        'Обязанности адресованы поставщикам регулируемых сервисов, а британский медиарегулятор получает полномочия надзора за режимом.',
        'Надзор за исполнением правил отличается от предварительного написания или одобрения каждого сообщения регулятором.',
        'Учебная реконструкция, не цитата: закон требует, чтобы британский медиарегулятор прочитал и одобрил каждое пользовательское сообщение до его публикации.',
      ],
      en: [
        'The duties apply to providers of regulated services, while Ofcom receives powers to oversee the regime.',
        'Oversight of compliance is different from the regulator writing or pre-approving every message.',
        'Educational reconstruction, not a quotation: the Act requires Ofcom to read and approve every user message before it is published.',
      ],
    },
    explanation: {
      ru: 'Регуляторный режим для поставщиков подменен гораздо более широким и несуществующим предварительным контролем каждой реплики.',
      en: 'A regulatory regime for providers is replaced with a far broader and nonexistent system of prior approval for every message.',
    },
    source: sources.onlineSafetyAct,
  },
  {
    key: 'eu-extra-042',
    country: 'united-kingdom',
    family: 'slippery-slope',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Парламентская страница сообщает о новых юридических требованиях к сервисам и новых полномочиях британского медиарегулятора в отношении безопасности в интернете.',
      en: 'The parliamentary page reports new legal requirements for services and new Ofcom powers concerning online safety.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: предоставление британскому медиарегулятору этих полномочий неизбежно сначала уничтожит анонимную речь, затем частную переписку, а после этого любую критику правительства.',
        'Источник описывает конкретный закон и полномочия регулятора, но не устанавливает автоматической последовательности таких запретов.',
        'Каждое дополнительное ограничение потребовало бы собственного правового основания, сферы применения и механизма исполнения.',
      ],
      en: [
        'Educational reconstruction, not a quotation: giving Ofcom these powers will inevitably eliminate anonymous speech, then private messages, and finally all criticism of the government.',
        'The source describes a particular Act and regulatory powers but establishes no automatic sequence of those prohibitions.',
        'Each additional restriction would require its own legal basis, scope, and enforcement mechanism.',
      ],
    },
    explanation: {
      ru: 'От одного набора полномочий проведена неизбежная цепочка к всеобщей цензуре без промежуточного механизма.',
      en: 'One set of powers is extended into an inevitable chain ending in universal censorship without an intermediate mechanism.',
    },
    source: sources.onlineSafetyAct,
  },
  {
    key: 'eu-extra-043',
    country: 'united-kingdom',
    family: 'false-dilemma',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Закон направлен на работу с незаконным и вредным контентом и устанавливает требования к нескольким категориям онлайн-сервисов.',
      en: 'The Act addresses illegal and harmful content and establishes requirements for several categories of online service.',
    },
    segments: {
      ru: [
        'Эффект режима может различаться по видам риска, сервисам, уровню соблюдения и качеству надзора.',
        'Учебная реконструкция, не цитата: закон либо устранит абсолютно весь вред в интернете, либо окажется полностью бесполезным.',
        'Частичное снижение отдельных рисков остается содержательным результатом, даже если другие риски сохраняются.',
      ],
      en: [
        'The effects of the regime can vary by type of risk, service, compliance level, and quality of enforcement.',
        'Educational reconstruction, not a quotation: the Act will either eliminate absolutely all online harm or be completely useless.',
        'A partial reduction in particular risks remains a meaningful outcome even if other risks persist.',
      ],
    },
    explanation: {
      ru: 'Градуированный результат искусственно заменен выбором между абсолютным успехом и нулевой пользой.',
      en: 'A graded outcome is artificially replaced with a choice between absolute success and zero value.',
    },
    source: sources.onlineSafetyAct,
  },
  {
    key: 'eu-extra-044',
    country: 'united-kingdom',
    family: 'composition',
    difficulty: 3,
    correctIndex: 2,
    context: {
      ru: 'Закон возлагает юридические требования на регулируемые поисковые системы и интернет-сервисы, включая сервисы с порнографическим контентом.',
      en: 'The Act imposes legal requirements on regulated search engines and internet services, including services providing pornographic content.',
    },
    segments: {
      ru: [
        'Обязанность отдельного сервиса описывает его собственное поведение в пределах применимых правил.',
        'Безопасность всей онлайн-среды зависит также от охвата закона, соблюдения, надзора, переходов между сервисами и действий пользователей.',
        'Учебная реконструкция, не цитата: если каждый регулируемый сервис получил обязанность по безопасности, интернет в целом автоматически безопасен для каждого человека.',
      ],
      en: [
        'A duty imposed on an individual service describes its own conduct within the applicable rules.',
        'Safety across the online environment also depends on legal coverage, compliance, enforcement, movement between services, and user behaviour.',
        'Educational reconstruction, not a quotation: if every regulated service has a safety duty, the internet as a whole is automatically safe for every person.',
      ],
    },
    explanation: {
      ru: 'Обязанности отдельных компонентов переносятся на всю систему без учета пробелов охвата и взаимодействия частей.',
      en: 'Duties of individual components are transferred to the whole system without accounting for coverage gaps and interactions among parts.',
    },
    source: sources.onlineSafetyAct,
  },
  {
    key: 'eu-extra-045',
    country: 'united-kingdom',
    family: 'tradition',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'После рассмотрения Палатой лордов с января по сентябрь 2023 года, согласования поправок обеими палатами и королевской санкции 26 октября законопроект стал законом.',
      en: 'After consideration by the House of Lords from January to September 2023, agreement on amendments by both Houses, and Royal Assent on 26 October, the bill became law.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: поскольку интернет долго развивался без этого режима, одна только прежняя традиция доказывает, что Парламент никогда не должен был вводить новые обязанности.',
        'Парламентская процедура позволяет принимать новые законы и изменять действующие правила.',
        'Историческое отсутствие режима не показывает, насколько он отвечает нынешним рискам, затратам и правам пользователей.',
      ],
      en: [
        'Educational reconstruction, not a quotation: because the internet developed for a long time without this regime, past tradition alone proves that Parliament should never have introduced new duties.',
        'The parliamentary process permits new Acts to be adopted and existing rules to be changed.',
        'The historical absence of a regime does not show how well it addresses current risks, costs, and user rights.',
      ],
    },
    explanation: {
      ru: 'Прежнее отсутствие регулирования объявлено достаточным основанием сохранить его отсутствие независимо от изменившихся условий.',
      en: 'The previous absence of regulation is treated as sufficient reason to preserve that absence regardless of changed conditions.',
    },
    source: sources.onlineSafetyAct,
  },
  {
    key: 'eu-extra-046',
    country: 'united-kingdom',
    family: 'ad-hominem',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'В деле о политике в отношении Руанды Верховный суд придал особое значение данным УВКБ ООН из-за его мандата и практического опыта работы с руандийской системой убежища.',
      en: 'In the Rwanda policy case, the Supreme Court gave particular weight to UNHCR evidence because of its remit and practical experience of the Rwandan asylum system.',
    },
    segments: {
      ru: [
        'Вес доказательства зависит от его качества, релевантности, метода получения и опыта источника.',
        'Учебная реконструкция, не цитата: УВКБ ООН защищает беженцев, поэтому его данные можно отбросить как пристрастные, не проверяя содержание.',
        'Критика доказательства должна разбирать наблюдения и метод, а не ограничиваться характеристикой роли организации.',
      ],
      en: [
        'The weight of evidence depends on its quality, relevance, method of collection, and the experience of its source.',
        'Educational reconstruction, not a quotation: UNHCR advocates for refugees, so its evidence can be discarded as biased without examining its content.',
        'A critique of evidence should address the observations and method rather than merely characterising the institutional role of the organisation.',
      ],
    },
    explanation: {
      ru: 'Доказательства отклоняются через нападение на институциональную роль источника вместо проверки их содержания и метода.',
      en: 'The evidence is rejected by attacking the institutional role of its source instead of examining its content and method.',
    },
    source: sources.rwandaJudgment,
  },
  {
    key: 'eu-extra-047',
    country: 'united-kingdom',
    family: 'false-authority',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'Политика основывалась на меморандуме и дипломатических заверениях Великобритании и Руанды, но суд потребовал фактической оценки того, как система и заверения работают на практике.',
      en: 'The policy rested on a memorandum and diplomatic assurances between the United Kingdom and Rwanda, but the Court required a factual assessment of how the system and assurances operated in practice.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: раз министр внутренних дел и правительство Руанды официально согласовали меморандум, их авторитет окончательно доказывает безопасность переводов без проверки практики.',
        'Официальное заверение является релевантным доказательством, но суд оценивал также правоприменение, прошлое соблюдение обещаний и механизмы мониторинга.',
        'Юридический тест требовал от суда самостоятельно определить наличие существенных оснований полагать, что существует реальный риск.',
      ],
      en: [
        'Educational reconstruction, not a quotation: because the Home Secretary and the Rwandan government officially agreed the memorandum, their authority conclusively proves that transfers are safe without reviewing practice.',
        'An official assurance is relevant evidence, but the Court also assessed implementation, past compliance with assurances, and monitoring mechanisms.',
        'The legal test required the Court to decide for itself whether substantial grounds established a real risk.',
      ],
    },
    explanation: {
      ru: 'Авторитет сторон соглашения подменяет независимую проверку фактов, которую правовой стандарт прямо требовал от суда.',
      en: 'The authority of the parties to the agreement replaces the independent factual review expressly required by the legal test.',
    },
    source: sources.rwandaJudgment,
  },
  {
    key: 'eu-extra-048',
    country: 'united-kingdom',
    family: 'hasty-generalization',
    difficulty: 2,
    correctIndex: 2,
    context: {
      ru: 'Суд признал, что правительство Руанды заключило партнерство добросовестно, имело стимулы его соблюдать и согласилось на мониторинг, но счел, что необходимые изменения системы еще не были реализованы.',
      en: 'The Court accepted that the Rwandan government entered the partnership in good faith, had incentives to comply, and agreed to monitoring, but found that the necessary systemic changes had not yet been delivered.',
    },
    segments: {
      ru: [
        'Добросовестность при заключении соглашения относится к намерениям сторон в момент его заключения.',
        'Точность отдельных решений по убежищу зависит также от процедур, компетенций, независимости и фактического исполнения.',
        'Учебная реконструкция, не цитата: одно добросовестно заключенное соглашение доказывает, что каждое будущее решение по убежищу будет правильным и ни одного случая высылки не произойдет.',
      ],
      en: [
        'Good faith in entering an agreement concerns the intentions of the parties when it was made.',
        'The accuracy of individual asylum decisions also depends on procedures, capacity, independence, and actual implementation.',
        'Educational reconstruction, not a quotation: one agreement made in good faith proves that every future asylum decision will be correct and no refoulement will occur.',
      ],
    },
    explanation: {
      ru: 'Один положительный признак соглашения поспешно распространяется на все будущие административные решения и исключает любой неблагоприятный исход.',
      en: 'One positive feature of the agreement is hastily generalised to every future administrative decision and used to rule out any adverse outcome.',
    },
    source: sources.rwandaJudgment,
  },
  {
    key: 'eu-extra-049',
    country: 'united-kingdom',
    family: 'survivorship',
    difficulty: 3,
    correctIndex: 1,
    context: {
      ru: 'Верховный суд сопоставил добросовестность и мониторинг с данными о прошлых высылках, недостатках процедур, необычно высоком отклонении заявлений граждан некоторых конфликтных стран и прежнем несоблюдении заверений.',
      en: 'The Supreme Court weighed good faith and monitoring against evidence of past refoulement, procedural defects, unusually high rejection rates for applicants from some conflict states, and previous non-compliance with assurances.',
    },
    segments: {
      ru: [
        'Мониторинг и стимулы к соблюдению были частью доказательственной картины, но не всей картиной.',
        'Учебная реконструкция, не цитата: достаточно учитывать только наличие мониторинга и добросовестное обещание, а прошлые неудачи системы можно исключить из выборки как устаревшие исключения.',
        'Оценка текущего риска требует включать как заявленные гарантии, так и наблюдаемые случаи, когда сходные гарантии или процедуры не сработали.',
      ],
      en: [
        'Monitoring and incentives to comply formed part of the evidential picture but were not the whole picture.',
        'Educational reconstruction, not a quotation: it is enough to count monitoring and a good-faith promise, while past system failures can be removed from the sample as outdated exceptions.',
        'Assessing current risk requires both stated safeguards and observed cases in which similar assurances or procedures failed.',
      ],
    },
    explanation: {
      ru: 'Отбираются только благоприятные элементы механизма, а наблюдаемые провалы исключаются, из-за чего риск систематически занижается.',
      en: 'Only favourable elements of the mechanism are selected while observed failures are excluded, systematically understating risk.',
    },
    source: sources.rwandaJudgment,
  },
  {
    key: 'eu-extra-050',
    country: 'united-kingdom',
    family: 'equivocation',
    difficulty: 3,
    correctIndex: 0,
    context: {
      ru: 'В деле выражение «безопасная третья страна» оценивалось применительно к реальному риску того, что просителя убежища прямо или косвенно вернут туда, где ему грозят преследование или бесчеловечное обращение.',
      en: 'In the case, the expression safe third country was assessed by reference to a real risk that an asylum seeker would be returned directly or indirectly to a place where they faced persecution or inhuman treatment.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: если Руанда в целом безопасна для обычного туриста, юридическое условие «безопасной третьей страны» для любого просителя убежища автоматически выполнено.',
        'Правовой термин относится к конкретной защите просителей от высылки и качеству процедуры рассмотрения убежища.',
        'Общая бытовая оценка безопасности поездки и специальный юридический тест отвечают на разные вопросы.',
      ],
      en: [
        'Educational reconstruction, not a quotation: if Rwanda is generally safe for an ordinary tourist, the legal safe-third-country condition is automatically met for every asylum seeker.',
        'The legal term concerns specific protection of asylum seekers from refoulement and the quality of the asylum process.',
        'An ordinary assessment of travel safety and the specialised legal test answer different questions.',
      ],
    },
    explanation: {
      ru: 'Специальное правовое значение безопасности подменено общим бытовым значением, хотя они оценивают разные риски для разных лиц.',
      en: 'The specialised legal meaning of safety is replaced with its ordinary meaning even though they assess different risks for different people.',
    },
    source: sources.rwandaJudgment,
  },
]
