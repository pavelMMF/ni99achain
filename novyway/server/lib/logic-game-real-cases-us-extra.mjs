// Every segment is an educational reconstruction; each flawed segment is explicitly labeled.
export const realWorldUsExtraCases = [
  {
    key: 'us-extra-001',
    country: 'united-states',
    family: 'ad-hominem',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'В деле FDA против Альянса гиппократовой медицины Верховный суд указал, что процессуальная правоспособность по статье III требует фактического вреда, причинной связи и возможности устранить вред судебным решением.',
      en: 'In FDA v. Alliance for Hippocratic Medicine, the Supreme Court stated that Article III standing requires injury in fact, causation, and redressability.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: Истцы занимают резкую позицию по спорному вопросу, поэтому их доводы о процессуальной правоспособности заведомо несостоятельны.',
        'Личные взгляды истцов не заменяют проверку фактического вреда, причинной связи и возможности судебного устранения вреда.',
        'Суд решил вопрос о процессуальной правоспособности через требования статьи III, а не через оценку характера или убеждений врачей.',
      ],
      en: [
        'Educational reconstruction, not a quotation: The plaintiffs hold a strong position on a disputed issue, so their standing arguments are necessarily invalid.',
        'The plaintiffs’ personal views do not replace analysis of injury in fact, causation, and redressability.',
        'The Court resolved standing under Article III requirements rather than by judging the doctors’ character or beliefs.',
      ],
    },
    explanation: {
      ru: 'Ошибка атакует позицию и качества истцов вместо проверки трёх юридически значимых элементов процессуальной правоспособности.',
      en: 'The flawed statement attacks the plaintiffs’ position and character instead of testing the three legally relevant elements of standing.',
    },
    source: {
      title: { ru: 'FDA против Альянса гиппократовой медицины, решение от 13 июня 2024 года', en: 'FDA v. Alliance for Hippocratic Medicine, decided June 13, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-235_n7ip.pdf',
    },
  },
  {
    key: 'us-extra-002',
    country: 'united-states',
    family: 'bandwagon',
    difficulty: 2,
    correctIndex: 1,
    context: {
      ru: 'Решение по вопросу процессуальной правоспособности было единогласным; отдельное совпадение голосов не превращало спор о законности действий FDA в решённый по существу вопрос.',
      en: 'The standing decision was unanimous; agreement among the Justices did not turn the legality of the FDA actions into a merits question that the Court had resolved.',
    },
    segments: {
      ru: [
        'Единогласие подтверждает результат рассмотрения вопроса о процессуальной правоспособности, но не расширяет предмет решения.',
        'Учебная реконструкция, не цитата: Раз все судьи согласились, их число само по себе доказывает законность действий FDA по существу.',
        'Для вывода по существу потребовался бы анализ требований административного права, которого решение о процессуальной правоспособности не заменяет.',
      ],
      en: [
        'Unanimity confirms the result on standing but does not enlarge the question that the Court decided.',
        'Educational reconstruction, not a quotation: Because every Justice agreed, the number of votes alone proves that the FDA actions were lawful on the merits.',
        'A merits conclusion would require analysis of administrative-law requirements that a standing decision does not replace.',
      ],
    },
    explanation: {
      ru: 'Ошибка использует единогласие как самостоятельное доказательство другого тезиса, которого суд не разрешал.',
      en: 'The flawed statement treats unanimity as independent proof of a different proposition that the Court did not decide.',
    },
    source: {
      title: { ru: 'FDA против Альянса гиппократовой медицины, решение от 13 июня 2024 года', en: 'FDA v. Alliance for Hippocratic Medicine, decided June 13, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-235_n7ip.pdf',
    },
  },
  {
    key: 'us-extra-003',
    country: 'united-states',
    family: 'false-dilemma',
    difficulty: 3,
    correctIndex: 2,
    context: {
      ru: 'Верховный суд отменил решение апелляционного суда, поскольку конкретные истцы не доказали процессуальную правоспособность; это пороговый вопрос, отличный от законности изменений FDA 2016 и 2021 годов.',
      en: 'The Supreme Court reversed because the particular plaintiffs failed to establish standing; that threshold issue is distinct from the legality of the FDA changes made in 2016 and 2021.',
    },
    segments: {
      ru: [
        'Отсутствие процессуальной правоспособности у этих истцов не является одобрением действий FDA по существу.',
        'Суд мог завершить дело на пороговом вопросе, не выбирая между подтверждением и отменой спорных правил.',
        'Учебная реконструкция, не цитата: Возможны лишь два исхода: либо суд признал изменения FDA законными, либо признал их незаконными; третьего варианта нет.',
      ],
      en: [
        'These plaintiffs’ lack of standing is not an endorsement of the FDA actions on the merits.',
        'The Court could end the case on a threshold issue without choosing between upholding and invalidating the challenged changes.',
        'Educational reconstruction, not a quotation: There are only two outcomes: the Court either held the FDA changes lawful or held them unlawful; no third option exists.',
      ],
    },
    explanation: {
      ru: 'Ошибка исключает реальный третий исход: прекращение спора из-за отсутствия процессуальной правоспособности без решения по существу.',
      en: 'The flawed statement excludes the actual third outcome: resolving the case for lack of standing without reaching the merits.',
    },
    source: {
      title: { ru: 'FDA против Альянса гиппократовой медицины, решение от 13 июня 2024 года', en: 'FDA v. Alliance for Hippocratic Medicine, decided June 13, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-235_n7ip.pdf',
    },
  },
  {
    key: 'us-extra-004',
    country: 'united-states',
    family: 'circular-reasoning',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Медицинские ассоциации ссылались на расходы, понесённые при противодействии действиям FDA, но суд указал, что организация не создаёт процессуальную правоспособность простым расходованием средств на несогласие с политикой.',
      en: 'The medical associations relied on costs incurred while opposing the FDA actions, but the Court held that an organization cannot create standing merely by spending money to oppose a policy.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: Ассоциация вправе судиться, потому что её иск допустим, а иск допустим, потому что ассоциация вправе судиться.',
        'Добровольные расходы на противодействие политике сами по себе не показывают, что ответчик непосредственно повредил основной деятельности организации.',
        'Организационный истец, как и физическое лицо, должен отдельно доказать вред, причинную связь и возможность устранения вреда.',
      ],
      en: [
        'Educational reconstruction, not a quotation: The association may sue because its case is admissible, and its case is admissible because the association may sue.',
        'Voluntary spending to oppose a policy does not by itself show that the defendant directly impaired the organization’s core activities.',
        'An organizational plaintiff, like an individual, must separately establish injury, causation, and redressability.',
      ],
    },
    explanation: {
      ru: 'Ошибка повторяет вывод как его собственное основание и не приводит независимого факта о вреде организации.',
      en: 'The flawed statement repeats the conclusion as its own premise and supplies no independent fact showing organizational injury.',
    },
    source: {
      title: { ru: 'FDA против Альянса гиппократовой медицины, решение от 13 июня 2024 года', en: 'FDA v. Alliance for Hippocratic Medicine, decided June 13, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-235_n7ip.pdf',
    },
  },
  {
    key: 'us-extra-005',
    country: 'united-states',
    family: 'hasty-generalization',
    difficulty: 3,
    correctIndex: 1,
    context: {
      ru: 'Суд отклонил аргумент «если не эти истцы, то кто», одновременно отметив, что из материалов не следует невозможность для любого другого лица когда-либо доказать процессуальную правоспособность.',
      en: 'The Court rejected the “if not us, who” argument while noting that the record did not establish that no other person could ever have standing.',
    },
    segments: {
      ru: [
        'Решение касается доказательств вреда и причинной связи, представленных именно этими врачами и ассоциациями.',
        'Учебная реконструкция, не цитата: Раз эти истцы не доказали процессуальную правоспособность, ни один возможный истец никогда не сможет оспорить действия FDA.',
        'Возможность другого иска зависит от конкретного, индивидуального вреда, причинённого спорным действием и устранимого судом.',
      ],
      en: [
        'The decision addresses the injury and causation evidence offered by these doctors and associations.',
        'Educational reconstruction, not a quotation: Because these plaintiffs lacked standing, no possible plaintiff will ever be able to challenge the FDA actions.',
        'A different suit would depend on concrete, particularized injury caused by the challenged action and redressable by a court.',
      ],
    },
    explanation: {
      ru: 'Ошибка без достаточного основания распространяет вывод о конкретных истцах на всех возможных будущих истцов.',
      en: 'The flawed statement extends a conclusion about particular plaintiffs to every possible future plaintiff without sufficient support.',
    },
    source: {
      title: { ru: 'FDA против Альянса гиппократовой медицины, решение от 13 июня 2024 года', en: 'FDA v. Alliance for Hippocratic Medicine, decided June 13, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-235_n7ip.pdf',
    },
  },
  {
    key: 'us-extra-006',
    country: 'united-states',
    family: 'post-hoc',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'В деле «Трамп против Соединённых Штатов» нижестоящие суды сначала полностью отвергли уголовный иммунитет бывшего президента, а Верховный суд позднее установил дифференцированную систему иммунитета и вернул дело для анализа отдельных действий.',
      en: 'In Trump v. United States, the lower courts first rejected former-presidential criminal immunity altogether; the Supreme Court later adopted a differentiated immunity framework and remanded for act-by-act analysis.',
    },
    segments: {
      ru: [
        'Последовательность решений показывает ход процесса, но сама по себе не объясняет содержание конституционного правила.',
        'Верховный суд обосновал рамку разделением властей и различием между официальными и неофициальными действиями.',
        'Учебная реконструкция, не цитата: Нижестоящие суды вынесли решения раньше, поэтому именно их поспешность вызвала появление всех категорий иммунитета.',
      ],
      en: [
        'The sequence of decisions describes the litigation but does not by itself explain the constitutional rule.',
        'The Supreme Court grounded its framework in separation of powers and the distinction between official and unofficial acts.',
        'Educational reconstruction, not a quotation: The lower courts ruled earlier, so their speed caused every category of immunity to come into existence.',
      ],
    },
    explanation: {
      ru: 'Ошибка превращает временную последовательность судебных актов в доказательство причинной связи без самостоятельного механизма.',
      en: 'The flawed statement converts the timing of judicial decisions into proof of causation without an independent mechanism.',
    },
    source: {
      title: { ru: 'Трамп против Соединённых Штатов, решение от 1 июля 2024 года', en: 'Trump v. United States, decided July 1, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-939_e2pg.pdf',
    },
  },
  {
    key: 'us-extra-007',
    country: 'united-states',
    family: 'circular-reasoning',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Решение различает абсолютный иммунитет для действий в пределах исключительных конституционных полномочий, как минимум презумптивный иммунитет для иных официальных действий и отсутствие иммунитета для неофициальных действий.',
      en: 'The decision distinguishes absolute immunity for acts within exclusive constitutional authority, at least presumptive immunity for other official acts, and no immunity for unofficial acts.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: Действие официальное, потому что на него распространяется иммунитет, а иммунитет распространяется, потому что действие официальное.',
        'Сначала суд должен классифицировать действие по его функции и конституционному контексту, а затем применить соответствующий уровень иммунитета.',
        'Категория исключительных полномочий требует иного анализа, чем остальные официальные действия или частное поведение.',
      ],
      en: [
        'Educational reconstruction, not a quotation: An act is official because it is immune, and it is immune because it is official.',
        'A court must first classify an act by its function and constitutional context and then apply the corresponding level of immunity.',
        'Exclusive constitutional authority requires different analysis from other official acts or private conduct.',
      ],
    },
    explanation: {
      ru: 'Ошибка определяет каждое из двух понятий через другое и пропускает независимый функциональный анализ действия.',
      en: 'The flawed statement defines each concept by the other and omits the independent functional analysis of the act.',
    },
    source: {
      title: { ru: 'Трамп против Соединённых Штатов, решение от 1 июля 2024 года', en: 'Trump v. United States, decided July 1, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-939_e2pg.pdf',
    },
  },
  {
    key: 'us-extra-008',
    country: 'united-states',
    family: 'straw-man',
    difficulty: 1,
    correctIndex: 1,
    context: {
      ru: 'Верховный суд не завершил уголовное дело: он установил рамку иммунитета и вернул нижестоящему суду фактически зависимые вопросы о классификации оставшихся эпизодов.',
      en: 'The Supreme Court did not terminate the criminal case; it established an immunity framework and remanded fact-dependent questions about the remaining alleged acts.',
    },
    segments: {
      ru: [
        'Неофициальные действия бывшего президента не получили иммунитета по установленной судом рамке.',
        'Учебная реконструкция, не цитата: Верховный суд постановил, что бывшего президента нельзя привлекать к уголовной ответственности ни за какие действия, и полностью прекратил обвинение.',
        'После возврата дела нижестоящий суд должен отдельно оценить, какие эпизоды являются официальными или неофициальными.',
      ],
      en: [
        'Unofficial acts by a former President receive no immunity under the Court’s framework.',
        'Educational reconstruction, not a quotation: The Supreme Court held that a former President can never be prosecuted for any act and dismissed the indictment in full.',
        'On remand, the lower court must separately assess which alleged acts are official or unofficial.',
      ],
    },
    explanation: {
      ru: 'Ошибка заменяет многоуровневое решение абсолютным тезисом о всеобщем иммунитете, которого в документе нет.',
      en: 'The flawed statement replaces a tiered holding with an absolute claim of universal immunity that the opinion does not contain.',
    },
    source: {
      title: { ru: 'Трамп против Соединённых Штатов, решение от 1 июля 2024 года', en: 'Trump v. United States, decided July 1, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-939_e2pg.pdf',
    },
  },
  {
    key: 'us-extra-009',
    country: 'united-states',
    family: 'false-authority',
    difficulty: 1,
    correctIndex: 2,
    context: {
      ru: 'Суд отнёс взаимодействие президента с Министерством юстиции к особой области конституционного анализа, но потребовал фактической оценки других контактов, включая общение с должностными и частными лицами.',
      en: 'The Court treated presidential interactions with the Justice Department as a distinct area of constitutional analysis but required factual assessment of other contacts, including communications with public and private persons.',
    },
    segments: {
      ru: [
        'Классификация конкретного сообщения зависит от функции, адресата и контекста, описанных в судебном материале.',
        'Мнение комментатора можно проверить по трём категориям иммунитета и указаниям суда о возврате дела.',
        'Учебная реконструкция, не цитата: Известный телеведущий назвал все президентские сообщения официальными, поэтому фактический анализ нижестоящего суда больше не нужен.',
      ],
      en: [
        'Classification of a particular communication depends on its function, audience, and context as described in the opinion.',
        'A commentator’s interpretation can be tested against the three immunity categories and the remand instructions.',
        'Educational reconstruction, not a quotation: A famous television host called every presidential communication official, so the lower court no longer needs factual analysis.',
      ],
    },
    explanation: {
      ru: 'Ошибка подменяет юридически значимый анализ известностью человека, не являющейся доказательством правильной классификации действий.',
      en: 'The flawed statement substitutes a person’s fame for legally relevant analysis; fame does not establish the correct classification of conduct.',
    },
    source: {
      title: { ru: 'Трамп против Соединённых Штатов, решение от 1 июля 2024 года', en: 'Trump v. United States, decided July 1, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-939_e2pg.pdf',
    },
  },
  {
    key: 'us-extra-010',
    country: 'united-states',
    family: 'tradition',
    difficulty: 1,
    correctIndex: 0,
    context: {
      ru: 'Суд назвал дело первым в истории США уголовным преследованием бывшего президента за действия во время его полномочий и вывел правило из структуры разделения властей, а не только из отсутствия прежних дел.',
      en: 'The Court described the case as the first U.S. criminal prosecution of a former President for conduct during the Presidency and derived its rule from separation-of-powers structure, not merely from the absence of earlier cases.',
    },
    segments: {
      ru: [
        'Учебная реконструкция, не цитата: Раньше бывших президентов так не преследовали, следовательно, одна традиция бездействия доказывает конституционный запрет любого такого дела.',
        'Историческая беспрецедентность может быть контекстом, но правовой вывод требует анализа полномочий, официальных функций и разделения властей.',
        'Само отсутствие прежнего дела совместимо с несколькими объяснениями и не устанавливает полный иммунитет.',
      ],
      en: [
        'Educational reconstruction, not a quotation: Former Presidents were not prosecuted this way before, so the tradition of inaction alone proves a constitutional ban on every such case.',
        'Historical novelty may supply context, but a legal conclusion requires analysis of powers, official functions, and separation of powers.',
        'The absence of an earlier case is compatible with several explanations and does not establish complete immunity.',
      ],
    },
    explanation: {
      ru: 'Ошибка считает прежнее отсутствие практики достаточным доказательством её конституционной обязательности.',
      en: 'The flawed statement treats the prior absence of a practice as sufficient proof that the Constitution forbids it.',
    },
    source: {
      title: { ru: 'Трамп против Соединённых Штатов, решение от 1 июля 2024 года', en: 'Trump v. United States, decided July 1, 2024' },
      url: 'https://www.supremecourt.gov/opinions/23pdf/23-939_e2pg.pdf',
    },
  },
  {
    key: 'us-extra-011', country: 'united-states', family: 'sunk-cost', difficulty: 2, correctIndex: 1,
    context: { ru: 'Закон об уважении брака отменил положение, добавленное разделом 2 Закона о защите брака, и установил федеральное признание брака двух лиц, действительного по праву места заключения.', en: 'The Respect for Marriage Act repealed the provision added by section 2 of the Defense of Marriage Act and established federal recognition of a marriage between two individuals that was valid where entered into.' },
    segments: {
      ru: ['Расходы на переход к новому правилу можно учитывать, но они не отвечают на вопрос, какое правило лучше защищает права в будущем.', 'Учебная реконструкция, не цитата: Государство уже много лет строило процедуры вокруг прежнего закона, поэтому отменять его нельзя независимо от будущих последствий.', 'Оценка перехода должна сравнивать будущие правовые и административные последствия доступных вариантов.'],
      en: ['Transition costs may be considered, but they do not answer which rule better protects rights going forward.', 'Educational reconstruction, not a quotation: The government spent years building procedures around the former law, so repeal is impermissible regardless of future consequences.', 'Evaluation of the transition should compare the future legal and administrative consequences of the available options.'],
    },
    explanation: { ru: 'Ошибка делает уже понесённые затраты решающим аргументом и игнорирует будущие результаты нового и старого правил.', en: 'The flawed statement makes past expenditures decisive while ignoring the future results of the old and new rules.' },
    source: { title: { ru: 'Закон об уважении брака, окончательный текст', en: 'Respect for Marriage Act, enrolled text' }, url: 'https://www.congress.gov/bill/117th-congress/house-bill/8404/text/enr' },
  },
  {
    key: 'us-extra-012', country: 'united-states', family: 'equivocation', difficulty: 3, correctIndex: 2,
    context: { ru: 'Закон запрещает лицам, действующим от имени штата, отказывать в признании определённых браков из других штатов по основаниям пола, расы, этнического или национального происхождения; федеральное правило отдельно определяет брак для федерального права.', en: 'The Act bars persons acting under color of state law from denying recognition to certain out-of-state marriages based on sex, race, ethnicity, or national origin; a separate rule defines marriage for federal law.' },
    segments: {
      ru: ['Признание уже заключённого брака и выдача новой лицензии на брак являются разными юридическими действиями.', 'Текст нужно читать с учётом разграничения федерального признания, межштатного признания и права места заключения брака.', 'Учебная реконструкция, не цитата: Слово «признание» означает выдачу лицензии, поэтому закон заставляет каждый штат заключать любой брак по правилам другого штата.'],
      en: ['Recognizing an existing marriage and issuing a new marriage license are distinct legal acts.', 'The text must be read with the distinctions among federal recognition, interstate recognition, and the law of the place of celebration.', 'Educational reconstruction, not a quotation: The word “recognition” means licensing, so the Act forces every state to solemnize any marriage under another state’s rules.'],
    },
    explanation: { ru: 'Ошибка незаметно меняет значение «признания» с учёта существующего брака на обязанность заключить новый брак.', en: 'The flawed statement shifts “recognition” from giving effect to an existing marriage to an obligation to create a new one.' },
    source: { title: { ru: 'Закон об уважении брака, окончательный текст', en: 'Respect for Marriage Act, enrolled text' }, url: 'https://www.congress.gov/bill/117th-congress/house-bill/8404/text/enr' },
  },
  {
    key: 'us-extra-013', country: 'united-states', family: 'straw-man', difficulty: 2, correctIndex: 0,
    context: { ru: 'Раздел 6 сохраняет существующие гарантии религиозной свободы и освобождает перечисленные некоммерческие религиозные организации от обязанности предоставлять товары, услуги или помещения для заключения или празднования брака.', en: 'Section 6 preserves existing religious-liberty protections and exempts listed nonprofit religious organizations from having to provide goods, services, or facilities for the solemnization or celebration of a marriage.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Закон обязывает каждую церковь, мечеть, синагогу и религиозную школу проводить любую свадебную церемонию по требованию.', 'Текст прямо предусматривает защиту перечисленных некоммерческих религиозных организаций в отношении заключения и празднования брака.', 'Критика закона должна учитывать сформулированные исключения, а не заменять их противоположным правилом.'],
      en: ['Educational reconstruction, not a quotation: The Act requires every church, mosque, synagogue, and religious school to host any requested wedding ceremony.', 'The text expressly protects listed nonprofit religious organizations concerning the solemnization and celebration of marriage.', 'Criticism of the Act should account for the stated exceptions instead of replacing them with the opposite rule.'],
    },
    explanation: { ru: 'Ошибка приписывает закону обязанность, противоположную его прямо сформулированному исключению, а затем атакует эту подмену.', en: 'The flawed statement attributes a duty opposite to the Act’s express exception and then attacks that substitute claim.' },
    source: { title: { ru: 'Закон об уважении брака, окончательный текст', en: 'Respect for Marriage Act, enrolled text' }, url: 'https://www.congress.gov/bill/117th-congress/house-bill/8404/text/enr' },
  },
  {
    key: 'us-extra-014', country: 'united-states', family: 'slippery-slope', difficulty: 2, correctIndex: 1,
    context: { ru: 'Закон признаёт для федеральных целей брак между двумя лицами и отдельно указывает, что не требует и не разрешает федеральное признание браков более чем между двумя лицами.', en: 'The Act recognizes a marriage between two individuals for federal purposes and separately states that it neither requires nor authorizes federal recognition of marriages involving more than two individuals.' },
    segments: {
      ru: ['Предел в два лица сформулирован в тексте как отдельное ограничение федерального признания.', 'Учебная реконструкция, не цитата: Как только признан один новый класс браков двух лиц, федеральное признание браков любого числа лиц становится неизбежным без дополнительных решений.', 'Для каждого предполагаемого расширения потребовались бы правовое основание и отдельный механизм, которых эта цепочка не показывает.'],
      en: ['The two-person limit appears in the text as a separate restriction on federal recognition.', 'Educational reconstruction, not a quotation: Once one new class of two-person marriages is recognized, federal recognition of marriages among any number of people becomes inevitable without further decisions.', 'Each predicted expansion would require legal authority and a separate mechanism that this chain does not identify.'],
    },
    explanation: { ru: 'Ошибка объявляет дальнейшее расширение неизбежным вопреки явному пределу и без объяснения промежуточных шагов.', en: 'The flawed statement declares further expansion inevitable despite an express limit and without explaining the intermediate steps.' },
    source: { title: { ru: 'Закон об уважении брака, окончательный текст', en: 'Respect for Marriage Act, enrolled text' }, url: 'https://www.congress.gov/bill/117th-congress/house-bill/8404/text/enr' },
  },
  {
    key: 'us-extra-015', country: 'united-states', family: 'survivorship', difficulty: 3, correctIndex: 2,
    context: { ru: 'Закон разрешает Генеральному прокурору предъявлять гражданские иски и даёт частное право на иск лицу, которому причинён вред нарушением правила межштатного признания.', en: 'The Act authorizes civil actions by the Attorney General and gives a private right of action to a person harmed by a violation of the interstate-recognition rule.' },
    segments: {
      ru: ['Число успешных исков не показывает отдельно невыявленные нарушения, отказы от обращения и дела, прекращённые по процедурным причинам.', 'Оценка работы средства защиты требует данных как об удовлетворённых требованиях, так и о безуспешных или непредъявленных требованиях.', 'Учебная реконструкция, не цитата: Несколько пар добились судебной защиты, значит механизм одинаково доступен всем пострадавшим и скрытых неуспешных случаев нет.'],
      en: ['A count of successful suits does not reveal undetected violations, abandoned claims, or cases dismissed on procedural grounds.', 'Evaluating the remedy requires evidence about successful, unsuccessful, and unfiled claims.', 'Educational reconstruction, not a quotation: Several couples obtained relief, so the remedy is equally accessible to every harmed person and no hidden unsuccessful cases exist.'],
    },
    explanation: { ru: 'Ошибка рассматривает только заметных получателей защиты и исключает из оценки невидимые неуспешные случаи.', en: 'The flawed statement considers only visible recipients of relief and leaves hidden unsuccessful cases out of the assessment.' },
    source: { title: { ru: 'Закон об уважении брака, окончательный текст', en: 'Respect for Marriage Act, enrolled text' }, url: 'https://www.congress.gov/bill/117th-congress/house-bill/8404/text/enr' },
  },
  {
    key: 'us-extra-016', country: 'united-states', family: 'false-authority', difficulty: 3, correctIndex: 0,
    context: { ru: 'Обновление CBO от июня 2024 года представляет базовый прогноз бюджета и экономики при общем предположении, что действующие законы о налогах и расходах останутся без изменений.', en: 'CBO’s June 2024 update presents baseline budget and economic projections under the general assumption that current tax and spending laws remain unchanged.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Поскольку CBO обладает бюджетной экспертизой, его базовый прогноз сам решает, какой политический выбор морально обязателен для Конгресса.', 'Экспертиза CBO относится к оценке последствий при заданных предпосылках, а нормативный выбор требует дополнительно заявленных целей и ценностей.', 'Базовый прогноз служит точкой сравнения сценариев и не превращает аналитическое ведомство в источник всех политических приоритетов.'],
      en: ['Educational reconstruction, not a quotation: Because CBO has budget expertise, its baseline projection itself determines which policy choice Congress is morally required to make.', 'CBO expertise concerns estimated consequences under stated assumptions; a normative choice also requires explicit goals and values.', 'A baseline supplies a comparison point for scenarios and does not make an analytical agency the source of every policy priority.'],
    },
    explanation: { ru: 'Ошибка переносит профильный авторитет в прогнозировании на отдельный нормативный вопрос, который прогноз сам по себе не разрешает.', en: 'The flawed statement transfers relevant forecasting expertise to a separate normative question that the projection alone cannot resolve.' },
    source: { title: { ru: 'Обновление бюджетного и экономического прогноза: 2024–2034 годы', en: 'An Update to the Budget and Economic Outlook: 2024 to 2034' }, url: 'https://www.cbo.gov/publication/60039' },
  },
  {
    key: 'us-extra-017', country: 'united-states', family: 'bandwagon', difficulty: 2, correctIndex: 1,
    context: { ru: 'CBO прогнозировало скорректированный дефицит 6,9 процента ВВП в 2034 году против среднего значения 3,7 процента за предыдущие 50 лет.', en: 'CBO projected an adjusted deficit of 6.9 percent of GDP in 2034, compared with a 50-year historical average of 3.7 percent.' },
    segments: {
      ru: ['Сравнение с историческим средним показывает масштаб отклонения, но не заменяет анализ устойчивости и вариантов политики.', 'Учебная реконструкция, не цитата: Если большинство участников опроса назовёт дефицит неприемлемым, прогноз CBO тем самым станет математически точным.', 'Точность прогноза зависит от модели, данных и предпосылок, а не от популярности оценки дефицита.'],
      en: ['Comparison with the historical average shows the size of the departure but does not replace sustainability and policy analysis.', 'Educational reconstruction, not a quotation: If most poll respondents call the deficit unacceptable, the CBO projection thereby becomes mathematically certain.', 'Forecast accuracy depends on the model, data, and assumptions rather than on the popularity of an opinion about the deficit.'],
    },
    explanation: { ru: 'Ошибка делает массовое одобрение или неодобрение доказательством точности количественного прогноза.', en: 'The flawed statement makes popular approval or disapproval evidence for the accuracy of a quantitative forecast.' },
    source: { title: { ru: 'Обновление бюджетного и экономического прогноза: 2024–2034 годы', en: 'An Update to the Budget and Economic Outlook: 2024 to 2034' }, url: 'https://www.cbo.gov/publication/60039' },
  },
  {
    key: 'us-extra-018', country: 'united-states', family: 'false-dilemma', difficulty: 3, correctIndex: 2,
    context: { ru: 'CBO связывало рост долга с несколькими компонентами: процентными расходами, обязательными программами, дискреционными расходами и доходами.', en: 'CBO linked the rise in debt to several components, including interest costs, mandatory programs, discretionary spending, and revenues.' },
    segments: {
      ru: ['Несколько факторов допускают множество сочетаний изменений доходов, расходов, сроков и параметров программ.', 'Сравнение вариантов должно учитывать распределительные последствия и влияние на долг, а не только два крайних сценария.', 'Учебная реконструкция, не цитата: Есть ровно два выбора: немедленно отменить все программы для пожилых людей или неизбежно объявить дефолт.'],
      en: ['Multiple drivers permit many combinations of changes to revenues, spending, timing, and program parameters.', 'Comparing options should consider distributional effects and debt effects rather than only two extreme scenarios.', 'Educational reconstruction, not a quotation: There are exactly two choices: immediately abolish every program for older people or inevitably default.'],
    },
    explanation: { ru: 'Ошибка искусственно оставляет два крайних варианта, хотя сам состав прогноза указывает на множество изменяемых параметров.', en: 'The flawed statement invents two extreme options even though the projection itself identifies many adjustable components.' },
    source: { title: { ru: 'Обновление бюджетного и экономического прогноза: 2024–2034 годы', en: 'An Update to the Budget and Economic Outlook: 2024 to 2034' }, url: 'https://www.cbo.gov/publication/60039' },
  },
  {
    key: 'us-extra-019', country: 'united-states', family: 'slippery-slope', difficulty: 2, correctIndex: 0,
    context: { ru: 'В базовом прогнозе долг, удерживаемый населением, увеличивался с 99 процентов ВВП в 2024 году до 122 процентов в 2034 году.', en: 'In the baseline projection, debt held by the public rose from 99 percent of GDP in 2024 to 122 percent in 2034.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Достижение 122 процентов ВВП автоматически вызовет дефолт, затем закроет все банки и после этого уничтожит валюту.', 'Прогноз уровня долга не устанавливает неизбежность каждого последующего события в такой цепочке.', 'Оценка риска требует механизмов, сроков, стоимости обслуживания долга и реакции политики для каждого предполагаемого шага.'],
      en: ['Educational reconstruction, not a quotation: Reaching 122 percent of GDP will automatically cause default, then close every bank, and finally destroy the currency.', 'A projected debt ratio does not establish that every later event in such a chain is inevitable.', 'Risk assessment requires mechanisms, timing, debt-service costs, and policy responses for each predicted step.'],
    },
    explanation: { ru: 'Ошибка превращает один прогнозный показатель в неизбежную цепь всё более тяжёлых последствий без доказательства переходов.', en: 'The flawed statement turns one projected measure into an inevitable chain of escalating consequences without supporting the transitions.' },
    source: { title: { ru: 'Обновление бюджетного и экономического прогноза: 2024–2034 годы', en: 'An Update to the Budget and Economic Outlook: 2024 to 2034' }, url: 'https://www.cbo.gov/publication/60039' },
  },
  {
    key: 'us-extra-020', country: 'united-states', family: 'hasty-generalization', difficulty: 3, correctIndex: 1,
    context: { ru: 'Июньское обновление повысило ряд февральских оценок и включило недавно принятые законы; базовая траектория при этом по определению зависела от предположения о в целом неизменных действующих законах.', en: 'The June update revised several February estimates and incorporated newly enacted legislation; by definition, the baseline path depended on the assumption that current laws generally remained unchanged.' },
    segments: {
      ru: ['Изменение входных законов или экономических данных может изменить последующий базовый прогноз.', 'Учебная реконструкция, не цитата: Один опубликованный базовый сценарий доказывает, что дефицит будет тем же при любом будущем налоговом законе и любом уровне расходов.', 'Сценарий с условием неизменности законов нельзя без анализа переносить на все возможные изменения политики.'],
      en: ['Changes in enacted laws or economic data can alter a later baseline projection.', 'Educational reconstruction, not a quotation: One published baseline proves that the deficit will be identical under every future tax law and every spending level.', 'A scenario conditioned on generally unchanged laws cannot be extended to every possible policy change without analysis.'],
    },
    explanation: { ru: 'Ошибка обобщает условный сценарий на несовместимые с его предпосылкой варианты будущего законодательства.', en: 'The flawed statement generalizes a conditional scenario to future legislation that contradicts its defining assumption.' },
    source: { title: { ru: 'Обновление бюджетного и экономического прогноза: 2024–2034 годы', en: 'An Update to the Budget and Economic Outlook: 2024 to 2034' }, url: 'https://www.cbo.gov/publication/60039' },
  },
  {
    key: 'us-extra-021', country: 'united-states', family: 'survivorship', difficulty: 3, correctIndex: 2,
    context: { ru: 'GAO сообщило примерно о 1 200 текущих и планируемых вариантах применения ИИ в 20 ведомствах, но лишь около 200 из них находились в промышленной эксплуатации; большинство оставалось на стадии планирования.', en: 'GAO reported about 1,200 current and planned AI use cases across 20 agencies, but only about 200 were in production; most remained in the planning phase.' },
    segments: {
      ru: ['Производственные примеры показывают только ту часть портфеля, которая дошла до эксплуатации.', 'Для оценки всего портфеля нужны результаты планируемых, остановленных, изменённых и не попавших в эксплуатацию вариантов.', 'Учебная реконструкция, не цитата: Достаточно изучить только 200 работающих примеров, чтобы доказать успешность всех 1 200 текущих и планируемых применений.'],
      en: ['Production examples show only the portion of the portfolio that reached operational use.', 'Assessing the whole portfolio requires outcomes for planned, discontinued, modified, and nonproduction use cases.', 'Educational reconstruction, not a quotation: Studying only the 200 operating examples is enough to prove the success of all 1,200 current and planned uses.'],
    },
    explanation: { ru: 'Ошибка отбирает наиболее видимую дошедшую до эксплуатации группу и исключает случаи, по которым исход ещё неизвестен или оказался неуспешным.', en: 'The flawed statement selects the most visible group that reached production and excludes cases whose outcomes remain unknown or unsuccessful.' },
    source: { title: { ru: 'Искусственный интеллект: ведомства начали внедрение, но должны выполнить ключевые требования', en: 'Artificial Intelligence: Agencies Have Begun Implementation but Need to Complete Key Requirements' }, url: 'https://www.gao.gov/products/gao-24-105980' },
  },
  {
    key: 'us-extra-022', country: 'united-states', family: 'circular-reasoning', difficulty: 1, correctIndex: 0,
    context: { ru: 'GAO обнаружило неполные и неточные данные в ведомственных реестрах ИИ; два реестра содержали применения, которые сами ведомства позднее признали не относящимися к ИИ.', en: 'GAO found incomplete and inaccurate data in agency AI inventories; two inventories included uses that the agencies later determined were not AI.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Запись является ИИ, потому что она находится в реестре ИИ, а реестр точен, потому что каждая его запись является ИИ.', 'Классификацию записи следует проверять по определению и подтверждающим характеристикам независимо от её присутствия в реестре.', 'Факт последующей переклассификации показывает, что одно название списка не удостоверяет содержание каждой записи.'],
      en: ['Educational reconstruction, not a quotation: An entry is AI because it appears in the AI inventory, and the inventory is accurate because every entry in it is AI.', 'An entry should be tested against a definition and supporting characteristics independently of its presence in the inventory.', 'Later reclassification shows that the name of a list alone does not validate every entry in it.'],
    },
    explanation: { ru: 'Ошибка заставляет два утверждения подтверждать друг друга без независимого критерия определения ИИ или точности реестра.', en: 'The flawed statement makes two claims support each other without an independent criterion for AI or inventory accuracy.' },
    source: { title: { ru: 'Искусственный интеллект: ведомства начали внедрение, но должны выполнить ключевые требования', en: 'Artificial Intelligence: Agencies Have Begun Implementation but Need to Complete Key Requirements' }, url: 'https://www.gao.gov/products/gao-24-105980' },
  },
  {
    key: 'us-extra-023', country: 'united-states', family: 'straw-man', difficulty: 2, correctIndex: 1,
    context: { ru: 'GAO сформулировало 35 рекомендаций для 19 ведомств: обновить реестры, обеспечить требуемые данные, выпустить руководство и завершить предусмотренные законом планы.', en: 'GAO made 35 recommendations to 19 agencies, including updating inventories, supplying required data, issuing guidance, and completing plans required by law and policy.' },
    segments: {
      ru: ['Рекомендации направлены на качество учёта, руководство, кадровые категории и выполнение уже установленных требований.', 'Учебная реконструкция, не цитата: GAO потребовало закрыть все федеральные системы ИИ и навсегда запретить ведомствам автоматизацию.', 'Оценивать рекомендации следует по их реальному объёму и адресатам, а не по более радикальному тезису.'],
      en: ['The recommendations concern inventory quality, guidance, occupational categories, and completion of existing requirements.', 'Educational reconstruction, not a quotation: GAO demanded that every federal AI system be shut down and that agencies permanently ban automation.', 'The recommendations should be assessed by their actual scope and recipients rather than by a more radical substitute claim.'],
    },
    explanation: { ru: 'Ошибка заменяет точечные меры управления и подотчётности выдуманным всеобщим запретом.', en: 'The flawed statement replaces targeted governance and accountability measures with an invented universal ban.' },
    source: { title: { ru: 'Искусственный интеллект: ведомства начали внедрение, но должны выполнить ключевые требования', en: 'Artificial Intelligence: Agencies Have Begun Implementation but Need to Complete Key Requirements' }, url: 'https://www.gao.gov/products/gao-24-105980' },
  },
  {
    key: 'us-extra-024', country: 'united-states', family: 'composition', difficulty: 3, correctIndex: 2,
    context: { ru: 'Из 20 ведомств, представивших варианты применения ИИ, только пять дали полную информацию по каждому сообщённому случаю; у остальных 15 встречались неполные или неточные данные.', en: 'Of the 20 agencies reporting AI use cases, only five supplied comprehensive information for every reported case; the other 15 had instances of incomplete or inaccurate data.' },
    segments: {
      ru: ['Качество пяти полных ведомственных реестров не устраняет недостатки в остальных пятнадцати.', 'Общая надёжность федерального набора зависит от покрытия и качества всех составляющих его реестров.', 'Учебная реконструкция, не цитата: Поскольку пять частей набора полностью заполнены, весь сводный федеральный реестр автоматически полный и точный.'],
      en: ['The quality of five complete agency inventories does not remove deficiencies in the other fifteen.', 'The reliability of the federal collection depends on the coverage and quality of all component inventories.', 'Educational reconstruction, not a quotation: Because five parts of the collection are complete, the combined federal inventory is automatically complete and accurate.'],
    },
    explanation: { ru: 'Ошибка переносит свойство нескольких частей на совокупность, большинство частей которой не обладает этим свойством.', en: 'The flawed statement transfers a property of several parts to a whole whose remaining parts do not share that property.' },
    source: { title: { ru: 'Искусственный интеллект: ведомства начали внедрение, но должны выполнить ключевые требования', en: 'Artificial Intelligence: Agencies Have Begun Implementation but Need to Complete Key Requirements' }, url: 'https://www.gao.gov/products/gao-24-105980' },
  },
  {
    key: 'us-extra-025', country: 'united-states', family: 'ad-hominem', difficulty: 1, correctIndex: 0,
    context: { ru: 'GAO сопоставило ведомственные реестры с требованиями федерального руководства и отдельно описало пропущенные поля, ошибочные классификации и степень выполнения требований.', en: 'GAO compared agency inventories with federal guidance and separately documented missing fields, classification errors, and the extent of compliance.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Аудиторы не руководят технологическими стартапами, поэтому все найденные ими пропуски данных следует считать выдуманными.', 'Профессиональный статус проверяющего не опровергает конкретное сопоставление поля реестра с обязательным требованием.', 'Возражение против вывода должно показывать ошибку в выборке, критерии или данных аудита.'],
      en: ['Educational reconstruction, not a quotation: The auditors do not run technology startups, so every data omission they found should be treated as invented.', 'The reviewer’s professional status does not refute a concrete comparison between an inventory field and a required element.', 'A rebuttal should identify an error in the audit sample, criterion, or data.'],
    },
    explanation: { ru: 'Ошибка атакует биографию проверяющих вместо методики и конкретных свидетельств неполноты реестров.', en: 'The flawed statement attacks the reviewers’ background instead of the method and concrete evidence of incomplete inventories.' },
    source: { title: { ru: 'Искусственный интеллект: ведомства начали внедрение, но должны выполнить ключевые требования', en: 'Artificial Intelligence: Agencies Have Begun Implementation but Need to Complete Key Requirements' }, url: 'https://www.gao.gov/products/gao-24-105980' },
  },
  {
    key: 'us-extra-026', country: 'united-states', family: 'sunk-cost', difficulty: 1, correctIndex: 1,
    context: { ru: '18 сентября 2024 года FOMC снизил целевой диапазон ставки на половину процентного пункта до 4,75–5 процентов, сохранил сокращение портфеля и заявил, что будущие корректировки зависят от новых данных и баланса рисков.', en: 'On September 18, 2024, the FOMC lowered its target range by half a percentage point to 4.75–5 percent, continued reducing its holdings, and said future adjustments would depend on incoming data and the balance of risks.' },
    segments: {
      ru: ['Ранее понесённые издержки политики можно учитывать как ограничения перехода, но они не определяют оптимальную будущую ставку.', 'Учебная реконструкция, не цитата: На прежний курс уже затрачены значительные усилия, поэтому комитет обязан сохранять его даже при изменении данных и рисков.', 'Будущее решение логично связывать с ожидаемыми последствиями, новыми показателями и целями двойного мандата.'],
      en: ['Past policy costs may constrain a transition, but they do not determine the optimal future rate.', 'Educational reconstruction, not a quotation: The Committee invested substantial effort in its previous stance, so it must preserve that stance even when data and risks change.', 'A future decision can properly turn on expected consequences, incoming indicators, and the dual-mandate goals.'],
    },
    explanation: { ru: 'Ошибка превращает невозвратные усилия по прежнему курсу в основание игнорировать новую информацию.', en: 'The flawed statement turns unrecoverable effort spent on the former stance into a reason to ignore new information.' },
    source: { title: { ru: 'Заявление Федерального комитета по операциям на открытом рынке от 18 сентября 2024 года', en: 'Federal Open Market Committee statement, September 18, 2024' }, url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm' },
  },
  {
    key: 'us-extra-027', country: 'united-states', family: 'equivocation', difficulty: 2, correctIndex: 2,
    context: { ru: 'Решение установило целевой диапазон ставки по федеральным фондам 4,75–5 процентов; это ставка однодневного межбанковского рынка, влияющая на финансовые условия, но не тождественная каждой потребительской ставке.', en: 'The decision set a 4.75–5 percent target range for the federal funds rate, an overnight interbank rate that influences financial conditions but is not identical to every consumer rate.' },
    segments: {
      ru: ['Целевой диапазон описывает конкретную ставку денежного рынка, а не единый тариф для всех кредитных договоров.', 'Перед выводом о конкретной ипотеке или карте нужно учесть срок, риск, маржу и механизм передачи денежной политики.', 'Учебная реконструкция, не цитата: Слово «ставка» в решении означает любую ставку, поэтому на следующий день каждый кредит в стране обязан стоить ровно 4,75 процента.'],
      en: ['The target range describes a particular money-market rate rather than a universal price for every credit contract.', 'A conclusion about a particular mortgage or card also requires term, risk, margin, and monetary-transmission analysis.', 'Educational reconstruction, not a quotation: The word “rate” means every interest rate, so the next day every loan in the country must cost exactly 4.75 percent.'],
    },
    explanation: { ru: 'Ошибка подменяет специальное значение ставки по федеральным фондам общим значением любой процентной ставки.', en: 'The flawed statement switches from the specific federal funds rate to the general meaning of any interest rate.' },
    source: { title: { ru: 'Заявление Федерального комитета по операциям на открытом рынке от 18 сентября 2024 года', en: 'Federal Open Market Committee statement, September 18, 2024' }, url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm' },
  },
  {
    key: 'us-extra-028', country: 'united-states', family: 'composition', difficulty: 2, correctIndex: 0,
    context: { ru: 'FOMC учитывал занятость, инфляцию и ожидания, финансовые и международные события; комитет признал риски для двух целей примерно сбалансированными, а перспективу — неопределённой.', en: 'The FOMC considered employment, inflation and expectations, and financial and international developments; it judged risks to its two goals roughly balanced and the outlook uncertain.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Если каждый показатель по отдельности не выглядит тревожным, их совокупность автоматически свободна от взаимодействий и общего риска.', 'Отдельно умеренные показатели могут сочетаться, усиливать друг друга или указывать на конфликт между целями.', 'Совокупную оценку нельзя получить простым присвоением целому свойства каждой рассмотренной части.'],
      en: ['Educational reconstruction, not a quotation: If each indicator looks unalarming in isolation, their combination is automatically free of interactions and overall risk.', 'Individually moderate indicators may combine, reinforce one another, or reveal tension between goals.', 'An aggregate assessment cannot be obtained by simply assigning each part’s property to the whole.'],
    },
    explanation: { ru: 'Ошибка переносит оценку отдельных показателей на систему, не рассматривая их взаимодействие и общий баланс рисков.', en: 'The flawed statement transfers assessments of individual indicators to the system without considering interactions or the overall balance of risks.' },
    source: { title: { ru: 'Заявление Федерального комитета по операциям на открытом рынке от 18 сентября 2024 года', en: 'Federal Open Market Committee statement, September 18, 2024' }, url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm' },
  },
  {
    key: 'us-extra-029', country: 'united-states', family: 'base-rate', difficulty: 3, correctIndex: 1,
    context: { ru: 'За снижение на половину пункта проголосовали 11 членов; один член предпочёл снижение на четверть пункта. Документ не сообщает базовую частоту последующих разворотов после одиночного несогласия.', en: 'Eleven members voted for the half-point cut; one member preferred a quarter-point cut. The statement does not provide the base rate of later reversals following a single dissent.' },
    segments: {
      ru: ['Один голос показывает наличие альтернативы по размеру шага, но не даёт сам по себе вероятность решения на следующем заседании.', 'Учебная реконструкция, не цитата: Раз появился один голос против выбранного размера снижения, на следующем заседании комитет почти наверняка полностью развернёт курс.', 'Для такой вероятности нужны история голосований, частота разворотов и данные об условиях, при которых они происходили.'],
      en: ['One vote shows an alternative view about the size of the move but does not by itself supply the probability of the next decision.', 'Educational reconstruction, not a quotation: Because one member opposed the chosen size of the cut, the Committee will almost certainly reverse course completely at its next meeting.', 'That probability requires voting history, reversal frequency, and evidence about the conditions under which reversals occurred.'],
    },
    explanation: { ru: 'Ошибка делает сильный вероятностный вывод из одного сигнала без базовой частоты сходных голосований и последующих решений.', en: 'The flawed statement draws a strong probability conclusion from one signal without the base rate of comparable votes and later decisions.' },
    source: { title: { ru: 'Заявление Федерального комитета по операциям на открытом рынке от 18 сентября 2024 года', en: 'Federal Open Market Committee statement, September 18, 2024' }, url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm' },
  },
  {
    key: 'us-extra-030', country: 'united-states', family: 'survivorship', difficulty: 2, correctIndex: 2,
    context: { ru: 'Комитет отметил прогресс инфляции, замедление роста рабочих мест, повышение безработицы с низкого уровня и неопределённость перспектив, обязавшись учитывать широкий набор информации.', en: 'The Committee noted progress on inflation, slower job gains, a rise in unemployment from a low level, and an uncertain outlook, and committed to considering a broad range of information.' },
    segments: {
      ru: ['Оценка решения должна включать показатели, которые поддерживали шаг, и показатели, которые предупреждали о противоположных рисках.', 'Отбор только удобных рядов не показывает, как решение работает при неблагоприятных или конфликтующих данных.', 'Учебная реконструкция, не цитата: Достаточно показать лишь прогресс инфляции; показатели занятости, финансовые условия и международные события можно исключить как неудачные для выбранного вывода.'],
      en: ['Evaluation should include indicators supporting the move and indicators warning of opposing risks.', 'Selecting only favorable series does not show how the decision performs under adverse or conflicting evidence.', 'Educational reconstruction, not a quotation: Inflation progress alone is enough; employment, financial conditions, and international developments may be excluded because they are inconvenient for the chosen conclusion.'],
    },
    explanation: { ru: 'Ошибка сохраняет только удобные наблюдения и исключает менее благоприятные данные из совокупности, которую сам комитет считал значимой.', en: 'The flawed statement keeps only favorable observations and excludes less convenient evidence from the set the Committee itself treated as relevant.' },
    source: { title: { ru: 'Заявление Федерального комитета по операциям на открытом рынке от 18 сентября 2024 года', en: 'Federal Open Market Committee statement, September 18, 2024' }, url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20240918a.htm' },
  },
  {
    key: 'us-extra-031', country: 'united-states', family: 'ad-hominem', difficulty: 1, correctIndex: 0,
    context: { ru: 'Указ Белого дома от 23 января 2025 года установил политику усиления лидерства США в ИИ, распорядился подготовить план действий и пересмотреть меры, принятые во исполнение отменённого указа № 14110.', en: 'The White House order of January 23, 2025 set a policy of strengthening U.S. AI leadership, directed preparation of an action plan, and ordered review of measures taken under revoked Executive Order 14110.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Мне не нравится президент, подписавший указ, поэтому все содержащиеся в нём административные поручения логически ложны.', 'Личное отношение к подписавшему не показывает, выполнимы ли сроки, полномочны ли исполнители и связаны ли меры с заявленной целью.', 'Критика указа должна обращаться к его полномочиям, механизму, затратам и последствиям.'],
      en: ['Educational reconstruction, not a quotation: I dislike the President who signed the order, so every administrative direction in it is logically false.', 'Personal dislike of the signer does not show whether deadlines are feasible, officials have authority, or measures connect to the stated goal.', 'Criticism of the order should address authority, mechanism, costs, and consequences.'],
    },
    explanation: { ru: 'Ошибка заменяет разбор документа личным отношением к его подписанту.', en: 'The flawed statement replaces analysis of the document with a personal attitude toward its signer.' },
    source: { title: { ru: 'Устранение барьеров для американского лидерства в искусственном интеллекте', en: 'Removing Barriers to American Leadership in Artificial Intelligence' }, url: 'https://www.whitehouse.gov/presidential-actions/2025/01/removing-barriers-to-american-leadership-in-artificial-intelligence/' },
  },
  {
    key: 'us-extra-032', country: 'united-states', family: 'bandwagon', difficulty: 1, correctIndex: 1,
    context: { ru: 'Указ объявил целью поддержание глобального лидерства США в ИИ ради экономической конкурентоспособности, национальной безопасности и иных заявленных результатов.', en: 'The order declared a goal of sustaining U.S. global AI leadership for economic competitiveness, national security, and other stated outcomes.' },
    segments: {
      ru: ['Популярность цели и фактическая результативность конкретного механизма являются разными вопросами.', 'Учебная реконструкция, не цитата: Если большинство технологических компаний поддержит лозунг лидерства, план автоматически достигнет всех заявленных результатов.', 'Результативность следует проверять по действиям, ресурсам, срокам и измеримым последствиям.'],
      en: ['The popularity of a goal and the effectiveness of a particular mechanism are separate questions.', 'Educational reconstruction, not a quotation: If most technology companies support the leadership slogan, the plan will automatically achieve every stated outcome.', 'Effectiveness should be tested through actions, resources, deadlines, and measurable consequences.'],
    },
    explanation: { ru: 'Ошибка принимает возможную массовую поддержку цели за доказательство эффективности ещё не оценённого плана.', en: 'The flawed statement treats possible popular support for a goal as proof that an unevaluated plan will be effective.' },
    source: { title: { ru: 'Устранение барьеров для американского лидерства в искусственном интеллекте', en: 'Removing Barriers to American Leadership in Artificial Intelligence' }, url: 'https://www.whitehouse.gov/presidential-actions/2025/01/removing-barriers-to-american-leadership-in-artificial-intelligence/' },
  },
  {
    key: 'us-extra-033', country: 'united-states', family: 'false-dilemma', difficulty: 2, correctIndex: 2,
    context: { ru: 'Указ требует выявить меры прежнего указа, несовместимые с новой политикой или создающие ей препятствия, и при необходимости приостановить, пересмотреть или отменить их в соответствии с законом.', en: 'The order requires identification of prior-order measures inconsistent with or obstructing the new policy and, as appropriate and consistent with law, their suspension, revision, or rescission.' },
    segments: {
      ru: ['Проверка совместимости допускает сохранение одних мер, изменение других и отмену третьих.', 'Оговорки «при необходимости» и «в соответствии с законом» исключают автоматический единый исход для каждой меры.', 'Учебная реконструкция, не цитата: Есть только два варианта: отменить каждое требование безопасности ИИ или полностью отказаться от американского лидерства.'],
      en: ['A compatibility review permits some measures to remain, others to be revised, and others to be rescinded.', 'The qualifications “as appropriate” and “consistent with law” prevent one automatic outcome for every measure.', 'Educational reconstruction, not a quotation: There are only two choices: repeal every AI safety requirement or abandon American leadership entirely.'],
    },
    explanation: { ru: 'Ошибка скрывает предусмотренный указом спектр решений и оставляет два искусственных крайних варианта.', en: 'The flawed statement hides the range of outcomes contemplated by the order and leaves two artificial extremes.' },
    source: { title: { ru: 'Устранение барьеров для американского лидерства в искусственном интеллекте', en: 'Removing Barriers to American Leadership in Artificial Intelligence' }, url: 'https://www.whitehouse.gov/presidential-actions/2025/01/removing-barriers-to-american-leadership-in-artificial-intelligence/' },
  },
  {
    key: 'us-extra-034', country: 'united-states', family: 'slippery-slope', difficulty: 2, correctIndex: 0,
    context: { ru: 'Указ поручил нескольким должностным лицам в течение 180 дней подготовить план действий по ИИ в координации с экономическими, внутренними, бюджетными и профильными ведомствами.', en: 'The order directed several officials to prepare an AI action plan within 180 days in coordination with economic, domestic, budget, and relevant agencies.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Подготовка межведомственного плана неизбежно приведёт к федеральной собственности на все модели, а затем к запрету частных исследований.', 'Поручение разработать план не устанавливает ни один из этих последующих шагов.', 'Для прогнозируемой цепочки нужны отдельные полномочия, решения и доказательства перехода на каждой стадии.'],
      en: ['Educational reconstruction, not a quotation: Preparing an interagency plan will inevitably lead to federal ownership of every model and then to a ban on private research.', 'The direction to develop a plan establishes neither of those later steps.', 'The predicted chain requires separate authority, decisions, and transition evidence at each stage.'],
    },
    explanation: { ru: 'Ошибка объявляет два радикальных последствия неизбежными, не показывая решений и полномочий между ними.', en: 'The flawed statement declares two radical consequences inevitable without showing the intervening decisions or authority.' },
    source: { title: { ru: 'Устранение барьеров для американского лидерства в искусственном интеллекте', en: 'Removing Barriers to American Leadership in Artificial Intelligence' }, url: 'https://www.whitehouse.gov/presidential-actions/2025/01/removing-barriers-to-american-leadership-in-artificial-intelligence/' },
  },
  {
    key: 'us-extra-035', country: 'united-states', family: 'hasty-generalization', difficulty: 3, correctIndex: 1,
    context: { ru: 'Указ отменил указ № 14110, распорядился пересмотреть связанные с ним ведомственные действия и изменить два меморандума OMB, но сохранил законные полномочия ведомств и потребовал исполнения в соответствии с применимым правом.', en: 'The order revoked Executive Order 14110, directed review of related agency actions, and required revision of two OMB memoranda, while preserving lawful agency authority and requiring implementation consistent with applicable law.' },
    segments: {
      ru: ['Отмена одного указа не отменяет автоматически законы, независимые правила или полномочия, сохранённые общими положениями нового указа.', 'Учебная реконструкция, не цитата: Поскольку отменён один указ об ИИ, в тот же момент прекратило существовать всё федеральное право, относящееся к ИИ.', 'Объём изменения нужно определять по происхождению каждой нормы, процедуре её отмены и оговоркам нового документа.'],
      en: ['Revoking one executive order does not automatically repeal statutes, independent rules, or authority preserved by the new order’s general provisions.', 'Educational reconstruction, not a quotation: Because one AI order was revoked, every part of federal law relating to AI ceased to exist at that moment.', 'The scope of change depends on each rule’s source, the procedure for rescission, and the new document’s qualifications.'],
    },
    explanation: { ru: 'Ошибка распространяет отмену одного акта на всю неоднородную систему норм вопреки существенным юридическим оговоркам.', en: 'The flawed statement generalizes the revocation of one instrument to an entire heterogeneous body of law despite substantial legal qualifications.' },
    source: { title: { ru: 'Устранение барьеров для американского лидерства в искусственном интеллекте', en: 'Removing Barriers to American Leadership in Artificial Intelligence' }, url: 'https://www.whitehouse.gov/presidential-actions/2025/01/removing-barriers-to-american-leadership-in-artificial-intelligence/' },
  },
  {
    key: 'us-extra-036', country: 'united-states', family: 'sunk-cost', difficulty: 1, correctIndex: 2,
    context: { ru: 'Финальное правило SEC сократило стандартный цикл расчётов по большинству брокерских сделок с T+2 до T+1 и добавило связанные требования к обработке институциональных сделок и учёту.', en: 'The SEC final rule shortened the standard settlement cycle for most broker-dealer transactions from T+2 to T+1 and added related institutional-processing and recordkeeping requirements.' },
    segments: {
      ru: ['Расходы на переход входят в оценку, но сравнение должно учитывать будущие риски, выгоды и эксплуатационные затраты обоих циклов.', 'Инфраструктуру можно адаптировать, если ожидаемые преимущества изменения превышают дополнительные будущие расходы.', 'Учебная реконструкция, не цитата: Участники уже вложились в системы T+2, поэтому T+2 необходимо сохранять навсегда независимо от будущих рисков расчётов.'],
      en: ['Transition expenses belong in the analysis, but the comparison should include future risks, benefits, and operating costs of both cycles.', 'Infrastructure may be adapted when expected benefits exceed the additional future costs of change.', 'Educational reconstruction, not a quotation: Market participants already invested in T+2 systems, so T+2 must remain forever regardless of future settlement risks.'],
    },
    explanation: { ru: 'Ошибка делает прошлые инвестиции решающими и исключает сравнение будущих последствий.', en: 'The flawed statement makes past investment decisive and excludes comparison of future consequences.' },
    source: { title: { ru: 'Сокращение цикла расчётов по операциям с ценными бумагами', en: 'Shortening the Securities Transaction Settlement Cycle' }, url: 'https://www.sec.gov/rules-regulations/2023/02/34-96930' },
  },
  {
    key: 'us-extra-037', country: 'united-states', family: 'equivocation', difficulty: 2, correctIndex: 0,
    context: { ru: 'Обозначение T+1 означает стандартный расчёт через один рабочий день после даты сделки; оно описывает расчёт, а не момент исполнения распоряжения на торговой площадке.', en: 'T+1 means standard settlement one business day after the trade date; it describes settlement rather than the moment an order executes on a trading venue.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: T+1 означает, что сама сделка исполняется только через день после нажатия кнопки, поэтому торговля в день T невозможна.', 'Исполнение сделки и последующая передача денег и бумаг относятся к разным стадиям.', 'Смысл обозначения нужно сохранять неизменным при выводах о сроках каждой стадии.'],
      en: ['Educational reconstruction, not a quotation: T+1 means the trade itself executes only one day after the button is pressed, so trading on day T is impossible.', 'Trade execution and the later transfer of cash and securities are different stages.', 'The notation must keep the same meaning when drawing conclusions about each stage.'],
    },
    explanation: { ru: 'Ошибка подменяет значение «расчёта» значением «исполнения сделки».', en: 'The flawed statement switches the meaning of “settlement” to “trade execution.”' },
    source: { title: { ru: 'Сокращение цикла расчётов по операциям с ценными бумагами', en: 'Shortening the Securities Transaction Settlement Cycle' }, url: 'https://www.sec.gov/rules-regulations/2023/02/34-96930' },
  },
  {
    key: 'us-extra-038', country: 'united-states', family: 'composition', difficulty: 2, correctIndex: 1,
    context: { ru: 'Помимо T+1, SEC приняла правила обработки институциональных сделок для брокеров и отдельных клиринговых организаций, а также изменила требования к учёту инвестиционных консультантов.', en: 'Beyond T+1, the SEC adopted institutional-trade processing rules for broker-dealers and certain clearing agencies and amended investment-adviser recordkeeping requirements.' },
    segments: {
      ru: ['Надёжность системы зависит не только от каждой организации, но и от согласованности сообщений, ликвидности, исключений и взаимозависимостей.', 'Учебная реконструкция, не цитата: Если каждый участник по отдельности вовремя выполняет свою внутреннюю процедуру, вся система автоматически лишена расчётного риска и сбоев.', 'Свойство отдельного процесса нельзя без проверки переносить на сеть взаимосвязанных участников.'],
      en: ['System reliability depends not only on each organization but also on message alignment, liquidity, exceptions, and interdependencies.', 'Educational reconstruction, not a quotation: If each participant completes its internal process on time, the entire system is automatically free of settlement risk and failures.', 'A property of one process cannot be transferred to a network of interdependent participants without analysis.'],
    },
    explanation: { ru: 'Ошибка переносит локальное соблюдение процедуры на систему, где результат зависит от взаимодействия частей.', en: 'The flawed statement transfers local procedural compliance to a system whose outcome depends on interactions among its parts.' },
    source: { title: { ru: 'Сокращение цикла расчётов по операциям с ценными бумагами', en: 'Shortening the Securities Transaction Settlement Cycle' }, url: 'https://www.sec.gov/rules-regulations/2023/02/34-96930' },
  },
  {
    key: 'us-extra-039', country: 'united-states', family: 'tradition', difficulty: 1, correctIndex: 2,
    context: { ru: 'SEC заменила стандарт T+2 на T+1 после отдельного нормотворческого процесса; длительность использования прежнего стандарта не была единственным критерием решения.', en: 'The SEC replaced the T+2 standard with T+1 after a separate rulemaking process; the age of the former standard was not the sole criterion for the decision.' },
    segments: {
      ru: ['Долгая эксплуатация может дать данные о надёжности и цене перехода, которые следует оценивать отдельно.', 'Старый стандарт и новый стандарт нужно сравнивать по рискам, срокам и операционным последствиям.', 'Учебная реконструкция, не цитата: T+2 применялся раньше, поэтому сама давность практики доказывает, что он безопаснее любого более короткого цикла.'],
      en: ['Long use may provide evidence about reliability and transition cost that should be assessed separately.', 'The old and new standards should be compared by risk, timing, and operational effects.', 'Educational reconstruction, not a quotation: T+2 was used before, so the age of the practice itself proves it safer than any shorter cycle.'],
    },
    explanation: { ru: 'Ошибка принимает возраст практики за достаточное доказательство её превосходства.', en: 'The flawed statement treats the age of a practice as sufficient proof of its superiority.' },
    source: { title: { ru: 'Сокращение цикла расчётов по операциям с ценными бумагами', en: 'Shortening the Securities Transaction Settlement Cycle' }, url: 'https://www.sec.gov/rules-regulations/2023/02/34-96930' },
  },
  {
    key: 'us-extra-040', country: 'united-states', family: 'post-hoc', difficulty: 2, correctIndex: 0,
    context: { ru: 'SEC опубликовала предложение в феврале 2022 года, а финальное правило — в феврале 2023 года после нормотворческого процесса и приёма комментариев.', en: 'The SEC published its proposal in February 2022 and the final rule in February 2023 after rulemaking and public comment.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Финальное правило появилось позже предложения, значит само течение года разрешило каждое техническое возражение против T+1.', 'Более поздняя дата не показывает, какие комментарии были приняты, отклонены или учтены изменением текста.', 'Связь между процедурой и итогом нужно подтверждать материалами решения, а не календарной последовательностью.'],
      en: ['Educational reconstruction, not a quotation: The final rule came after the proposal, so the passage of one year itself resolved every technical objection to T+1.', 'A later date does not show which comments were accepted, rejected, or addressed through textual changes.', 'The connection between process and outcome must be supported by the decision record rather than calendar order.'],
    },
    explanation: { ru: 'Ошибка выдаёт простое следование во времени за причину разрешения всех содержательных возражений.', en: 'The flawed statement treats temporal succession as the cause that resolved every substantive objection.' },
    source: { title: { ru: 'Сокращение цикла расчётов по операциям с ценными бумагами', en: 'Shortening the Securities Transaction Settlement Cycle' }, url: 'https://www.sec.gov/rules-regulations/2023/02/34-96930' },
  },
  {
    key: 'us-extra-041', country: 'united-states', family: 'tradition', difficulty: 1, correctIndex: 1,
    context: { ru: 'Финальное правило FTC 2024 года направлено против скрытия общей цены и вводящих в заблуждение сборов при продаже билетов на мероприятия и краткосрочного жилья.', en: 'The FTC’s 2024 final rule targets hidden total prices and misleading fees in live-event ticketing and short-term lodging.' },
    segments: {
      ru: ['Длительность использования поэтапного раскрытия цены не показывает, понимают ли покупатели итоговую стоимость.', 'Учебная реконструкция, не цитата: Скрытые сборы применялись давно, поэтому сама привычность практики доказывает её честность.', 'Практику следует оценивать по точности раскрытия, возможности сравнения и последствиям для покупателей.'],
      en: ['The age of drip pricing does not show whether buyers understand the final price.', 'Educational reconstruction, not a quotation: Hidden fees were used for a long time, so familiarity with the practice proves that it is honest.', 'The practice should be evaluated by disclosure accuracy, comparability, and effects on buyers.'],
    },
    explanation: { ru: 'Ошибка принимает давность коммерческой практики за доказательство её справедливости и прозрачности.', en: 'The flawed statement treats the age of a commercial practice as proof that it is fair and transparent.' },
    source: { title: { ru: 'FTC объявляет двухпартийное правило против скрытых сборов за билеты и гостиницы', en: 'Federal Trade Commission Announces Bipartisan Rule Banning Junk Ticket and Hotel Fees' }, url: 'https://www.ftc.gov/news-events/news/press-releases/2024/12/federal-trade-commission-announces-bipartisan-rule-banning-junk-ticket-hotel-fees' },
  },
  {
    key: 'us-extra-042', country: 'united-states', family: 'equivocation', difficulty: 3, correctIndex: 2,
    context: { ru: 'Правило требует заметно показывать общую цену со всеми обязательными сборами; допустимые исключения, например отдельные налоги или доставку, нужно ясно раскрыть до согласия покупателя на оплату.', en: 'The rule requires prominent display of the total price including mandatory fees; allowable exclusions, such as certain taxes or shipping, must be clearly disclosed before the consumer consents to pay.' },
    segments: {
      ru: ['«Общая цена» в правиле относится к обязательной сумме предложения, а не к каждой возможной дополнительной покупке.', 'Разрешённое исключение из первого показа не означает разрешения скрыть его до момента согласия на оплату.', 'Учебная реконструкция, не цитата: «Общая» означает все мыслимые расходы, поэтому первая реклама обязана включать даже необязательные услуги и ещё не определённую доставку.'],
      en: ['“Total price” in the rule concerns the mandatory amount of the offer rather than every possible add-on purchase.', 'An allowable exclusion from the first display is not permission to hide it until after payment consent.', 'Educational reconstruction, not a quotation: “Total” means every conceivable expense, so the first advertisement must include optional services and shipping that has not yet been determined.'],
    },
    explanation: { ru: 'Ошибка меняет определённое правилом значение общей обязательной цены на сумму всех возможных, в том числе необязательных и неизвестных, расходов.', en: 'The flawed statement shifts the rule’s defined mandatory total to every possible cost, including optional and unknown charges.' },
    source: { title: { ru: 'FTC объявляет двухпартийное правило против скрытых сборов за билеты и гостиницы', en: 'Federal Trade Commission Announces Bipartisan Rule Banning Junk Ticket and Hotel Fees' }, url: 'https://www.ftc.gov/news-events/news/press-releases/2024/12/federal-trade-commission-announces-bipartisan-rule-banning-junk-ticket-hotel-fees' },
  },
  {
    key: 'us-extra-043', country: 'united-states', family: 'straw-man', difficulty: 2, correctIndex: 0,
    context: { ru: 'FTC прямо указала, что правило не запрещает ни вид, ни размер сбора и не запрещает конкретную ценовую стратегию; оно регулирует правдивость и своевременность раскрытия цены.', en: 'The FTC expressly stated that the rule prohibits neither any type or amount of fee nor any particular pricing strategy; it regulates truthful and timely price disclosure.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: FTC запретила каждый сервисный, курортный и билетный сбор, поэтому продавцы больше не могут взимать их ни при каких условиях.', 'Правило допускает сборы, но требует включать обязательные сборы в заметную общую цену и не искажать сведения о них.', 'Возражение против раскрытия цены нельзя строить на выдуманном полном запрете сборов.'],
      en: ['Educational reconstruction, not a quotation: The FTC banned every service, resort, and ticket fee, so sellers may never charge them under any circumstances.', 'The rule permits fees but requires mandatory fees in the prominent total and prohibits misrepresentation.', 'An objection to price disclosure cannot rest on an invented complete ban on fees.'],
    },
    explanation: { ru: 'Ошибка заменяет правило о раскрытии цены гораздо более радикальным запретом, который источник прямо отрицает.', en: 'The flawed statement replaces a disclosure rule with a much broader prohibition that the source expressly disclaims.' },
    source: { title: { ru: 'FTC объявляет двухпартийное правило против скрытых сборов за билеты и гостиницы', en: 'Federal Trade Commission Announces Bipartisan Rule Banning Junk Ticket and Hotel Fees' }, url: 'https://www.ftc.gov/news-events/news/press-releases/2024/12/federal-trade-commission-announces-bipartisan-rule-banning-junk-ticket-hotel-fees' },
  },
  {
    key: 'us-extra-044', country: 'united-states', family: 'false-dilemma', difficulty: 1, correctIndex: 1,
    context: { ru: 'Правило позволяет разбивать цену на составляющие, если общая обязательная цена показана заметнее и сведения о сборах не вводят в заблуждение.', en: 'The rule permits truthful itemization so long as the mandatory total is more prominent and fee information is not misleading.' },
    segments: {
      ru: ['Продавец может взимать и расшифровывать сборы, одновременно показывая обязательную общую цену заранее.', 'Учебная реконструкция, не цитата: У бизнеса только два выбора: полностью скрывать сборы до оплаты или вообще не взимать никаких сборов.', 'Между этими крайностями существует предусмотренный правилом вариант прозрачного раскрытия и разбивки.'],
      en: ['A seller may charge and itemize fees while disclosing the mandatory total up front.', 'Educational reconstruction, not a quotation: A business has only two choices: hide every fee until payment or charge no fees at all.', 'The rule expressly permits the intermediate option of transparent disclosure and itemization.'],
    },
    explanation: { ru: 'Ошибка исключает прямо разрешённый третий вариант: сборы с предварительным правдивым раскрытием общей цены.', en: 'The flawed statement excludes the expressly permitted third option: fees accompanied by truthful advance disclosure of the total.' },
    source: { title: { ru: 'FTC объявляет двухпартийное правило против скрытых сборов за билеты и гостиницы', en: 'Federal Trade Commission Announces Bipartisan Rule Banning Junk Ticket and Hotel Fees' }, url: 'https://www.ftc.gov/news-events/news/press-releases/2024/12/federal-trade-commission-announces-bipartisan-rule-banning-junk-ticket-hotel-fees' },
  },
  {
    key: 'us-extra-045', country: 'united-states', family: 'composition', difficulty: 3, correctIndex: 2,
    context: { ru: 'Финальное правило распространяет специальные требования на билеты на живые мероприятия и краткосрочное жильё; в других отраслях FTC продолжает преследовать обман со сборами по общему закону в каждом конкретном случае.', en: 'The final rule applies its specific requirements to live-event tickets and short-term lodging; in other industries, the FTC continues case-by-case enforcement against deceptive fees under longstanding law.' },
    segments: {
      ru: ['Правило для двух секторов и общие полномочия против обмана имеют разные правовые основания и объём.', 'Сфера специального правила определяется охваченными предложениями, а не тем, что они являются частями национальной экономики.', 'Учебная реконструкция, не цитата: Билеты и гостиницы являются частями экономики, поэтому специальное правило для этих частей автоматически регулирует цены во всей экономике.'],
      en: ['The two-sector rule and general anti-deception authority have different legal bases and scope.', 'The special rule’s scope follows the covered offers, not the fact that they are parts of the national economy.', 'Educational reconstruction, not a quotation: Tickets and lodging are parts of the economy, so the special rule for those parts automatically regulates prices throughout the whole economy.'],
    },
    explanation: { ru: 'Ошибка переносит юридическое свойство двух частей на всю экономику, хотя источник отдельно описывает иной режим для прочих отраслей.', en: 'The flawed statement transfers a legal property of two parts to the entire economy even though the source describes a different regime for other industries.' },
    source: { title: { ru: 'FTC объявляет двухпартийное правило против скрытых сборов за билеты и гостиницы', en: 'Federal Trade Commission Announces Bipartisan Rule Banning Junk Ticket and Hotel Fees' }, url: 'https://www.ftc.gov/news-events/news/press-releases/2024/12/federal-trade-commission-announces-bipartisan-rule-banning-junk-ticket-hotel-fees' },
  },
  {
    key: 'us-extra-046', country: 'united-states', family: 'post-hoc', difficulty: 1, correctIndex: 0,
    context: { ru: 'В сообщении EPA о новом стандарте указано, что с 2000 года концентрация PM2.5 в наружном воздухе снизилась на 42 процента, а реальный ВВП США за тот же период вырос на 52 процента.', en: 'EPA’s announcement stated that outdoor PM2.5 concentrations fell 42 percent since 2000 while real U.S. GDP rose 52 percent over the same period.' },
    segments: {
      ru: ['Учебная реконструкция, не цитата: Снижение PM2.5 произошло одновременно с ростом ВВП, значит оно одно вызвало все 52 процента экономического роста.', 'Параллельные временные ряды совместимы с множеством общих и независимых причин.', 'Причинный вклад требует механизма и сравнения с альтернативным сценарием, а не только порядка и совпадения трендов.'],
      en: ['Educational reconstruction, not a quotation: PM2.5 fell while GDP rose, so the pollution decline alone caused all 52 percent of economic growth.', 'Parallel time series are compatible with many common and independent causes.', 'A causal contribution requires a mechanism and a counterfactual comparison, not merely timing and coincident trends.'],
    },
    explanation: { ru: 'Ошибка превращает одновременное изменение двух рядов в доказательство единственной причины экономического роста.', en: 'The flawed statement turns simultaneous movement in two series into proof of a sole cause of economic growth.' },
    source: { title: { ru: 'EPA утверждает усиленный стандарт по опасному загрязнению мелкими частицами', en: 'EPA finalizes stronger standards for harmful soot pollution' }, url: 'https://www.epa.gov/newsreleases/epa-finalizes-stronger-standards-harmful-soot-pollution-significantly-increasing' },
  },
  {
    key: 'us-extra-047', country: 'united-states', family: 'base-rate', difficulty: 3, correctIndex: 1,
    context: { ru: 'Иллюстративная карта EPA показывала 119 округов с полными данными мониторинга за 2020–2022 годы выше нового годового уровня 9 мкг/м³; агентство предупредило, что это не прогноз окончательных решений о соответствии.', en: 'An illustrative EPA map showed 119 counties with complete 2020–2022 monitoring data above the new annual level of 9 µg/m³; the agency cautioned that it did not predict final attainment designations.' },
    segments: {
      ru: ['Для вероятности по случайному округу нужны общее число округов, охват мониторингом, правила выборки и последующие данные для официального решения.', 'Учебная реконструкция, не цитата: Число 119 велико, поэтому случайно выбранный округ почти наверняка будет официально признан несоответствующим стандарту.', 'Предварительное превышение на карте и окончательное правовое обозначение не являются одним и тем же событием.'],
      en: ['A probability for a random county requires the total number of counties, monitoring coverage, selection rules, and later data used for official designation.', 'Educational reconstruction, not a quotation: The number 119 is large, so a randomly selected county is almost certainly officially designated nonattainment.', 'A preliminary mapped exceedance and a final legal designation are not the same event.'],
    },
    explanation: { ru: 'Ошибка игнорирует базовую долю округов, структуру выборки и явную оговорку о том, что карта не определяет окончательный статус.', en: 'The flawed statement ignores the base share of counties, sample structure, and the express qualification that the map does not determine final status.' },
    source: { title: { ru: 'EPA утверждает усиленный стандарт по опасному загрязнению мелкими частицами', en: 'EPA finalizes stronger standards for harmful soot pollution' }, url: 'https://www.epa.gov/newsreleases/epa-finalizes-stronger-standards-harmful-soot-pollution-significantly-increasing' },
  },
  {
    key: 'us-extra-048', country: 'united-states', family: 'false-authority', difficulty: 1, correctIndex: 2,
    context: { ru: 'EPA снизило первичный годовой стандарт PM2.5 с 12 до 9 мкг/м³, сославшись на требования Закона о чистом воздухе, доступную науку и рассмотрение обширных публичных комментариев.', en: 'EPA lowered the primary annual PM2.5 standard from 12 to 9 µg/m³, citing Clean Air Act requirements, available science, and consideration of extensive public comments.' },
    segments: {
      ru: ['Мнение известного человека можно сопоставить с эпидемиологическими данными, но известность не заменяет профильную экспертизу.', 'Обоснование численного уровня требует анализа здоровья, экспозиции, неопределённости и установленной законом процедуры.', 'Учебная реконструкция, не цитата: Популярный актёр считает уровень 12 полностью безопасным, поэтому научный обзор EPA можно не читать.'],
      en: ['A famous person’s view may be compared with epidemiological evidence, but fame does not replace relevant expertise.', 'Justifying a numerical level requires analysis of health, exposure, uncertainty, and the legally required process.', 'Educational reconstruction, not a quotation: A popular actor considers 12 completely safe, so the EPA scientific review need not be read.'],
    },
    explanation: { ru: 'Ошибка подменяет профильные данные мнением человека, чья популярность не подтверждает компетентность в оценке загрязнения воздуха.', en: 'The flawed statement replaces relevant evidence with a view from someone whose popularity does not establish air-pollution expertise.' },
    source: { title: { ru: 'EPA утверждает усиленный стандарт по опасному загрязнению мелкими частицами', en: 'EPA finalizes stronger standards for harmful soot pollution' }, url: 'https://www.epa.gov/newsreleases/epa-finalizes-stronger-standards-harmful-soot-pollution-significantly-increasing' },
  },
  {
    key: 'us-extra-049', country: 'united-states', family: 'hasty-generalization', difficulty: 2, correctIndex: 1,
    context: { ru: 'EPA пояснило, что одни мелкие частицы выбрасываются напрямую при сгорании, строительстве и промышленных процессах, а другие образуются в атмосфере в реакциях диоксида серы, оксидов азота и иных загрязнителей.', en: 'EPA explained that some fine particles are emitted directly by combustion, construction, and industrial processes, while others form in the atmosphere through reactions involving sulfur dioxide, nitrogen oxides, and other pollutants.' },
    segments: {
      ru: ['Один локальный замер у стройплощадки не определяет происхождение частиц во всех регионах и сезонах.', 'Учебная реконструкция, не цитата: В одной пробе рядом со стройкой преобладали прямые выбросы, значит все PM2.5 в стране всегда поступают напрямую и атмосферные реакции несущественны.', 'Для общего вывода нужны репрезентативные места, периоды и химический анализ источников.'],
      en: ['One local sample near a construction site does not determine particle origins across all regions and seasons.', 'Educational reconstruction, not a quotation: Direct emissions dominated one sample near a construction site, so all PM2.5 nationwide always comes directly from sources and atmospheric reactions are irrelevant.', 'A general conclusion requires representative locations, periods, and chemical source analysis.'],
    },
    explanation: { ru: 'Ошибка распространяет один локальный состав пробы на всю страну и исключает второй механизм, прямо описанный источником.', en: 'The flawed statement generalizes one local sample to the entire country and excludes a second mechanism expressly described by the source.' },
    source: { title: { ru: 'EPA утверждает усиленный стандарт по опасному загрязнению мелкими частицами', en: 'EPA finalizes stronger standards for harmful soot pollution' }, url: 'https://www.epa.gov/newsreleases/epa-finalizes-stronger-standards-harmful-soot-pollution-significantly-increasing' },
  },
  {
    key: 'us-extra-050', country: 'united-states', family: 'base-rate', difficulty: 3, correctIndex: 1,
    context: { ru: 'EPA оценило, что новый стандарт в 2032 году может предотвратить до 4 500 преждевременных смертей и 290 000 потерянных рабочих дней и дать до 46 млрд долларов чистой пользы для здоровья.', en: 'EPA estimated that in 2032 the new standard could prevent up to 4,500 premature deaths and 290,000 lost workdays and yield up to $46 billion in net health benefits.' },
    segments: {
      ru: ['Агрегированное число предотвращённых исходов нужно соотнести с размером населения, исходными рисками, распределением экспозиции и неопределённостью модели.', 'Учебная реконструкция, не цитата: Число 4 500 велико, поэтому у каждого отдельного жителя страны высокая вероятность лично избежать преждевременной смерти благодаря правилу.', 'Формулировка «до» обозначает верхнюю оценку совокупного эффекта, а не индивидуальную гарантию.'],
      en: ['An aggregate count of avoided outcomes must be related to population size, baseline risks, exposure distribution, and model uncertainty.', 'Educational reconstruction, not a quotation: The number 4,500 is large, so every individual resident has a high probability of personally avoiding premature death because of the rule.', 'The phrase “up to” describes an upper estimate of aggregate effect rather than an individual guarantee.'],
    },
    explanation: { ru: 'Ошибка переносит крупный совокупный прогноз на вероятность для отдельного человека без базового риска и знаменателя.', en: 'The flawed statement transfers a large aggregate projection to an individual probability without a baseline risk or denominator.' },
    source: { title: { ru: 'EPA утверждает усиленный стандарт по опасному загрязнению мелкими частицами', en: 'EPA finalizes stronger standards for harmful soot pollution' }, url: 'https://www.epa.gov/newsreleases/epa-finalizes-stronger-standards-harmful-soot-pollution-significantly-increasing' },
  },
]
