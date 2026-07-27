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

const SOURCE_TYPE = {
  ru: 'Смоделированная жизненная ситуация',
  en: 'Modeled everyday situation',
}

const PROMPTS = [
  {
    ru: 'Какой из трёх фрагментов содержит логическую ошибку в этой жизненной ситуации?',
    en: 'Which of the three statements contains a reasoning error in this everyday situation?',
  },
  {
    ru: 'Где собеседник делает вывод, для которого в разговоре не хватает оснований?',
    en: 'Where does a speaker reach a conclusion that the conversation does not support?',
  },
  {
    ru: 'В какой реплике спор уходит от фактов к логической уловке?',
    en: 'Which statement shifts the disagreement from evidence to a reasoning shortcut?',
  },
  {
    ru: 'Какая реплика звучит убедительно, но не следует из описанной ситуации?',
    en: 'Which statement sounds persuasive but does not follow from the situation described?',
  },
  {
    ru: 'Найдите фрагмент, где предположение без проверки превращается в уверенный вывод.',
    en: 'Find the fragment where an untested assumption becomes a confident conclusion.',
  },
]

const RAW_CHALLENGES = [
  {
    family: 'ad-hominem', difficulty: 1,
    contextLabel: { ru: 'Первое свидание и спор о месте следующей встречи', en: 'A first date and a disagreement about where to meet next' },
    explanation: { ru: 'Предпочтение места не опровергают замечанием о характере человека.', en: 'A remark about someone’s character does not refute their preference about the venue.' },
    segments: {
      ru: ['Ты выбираешь тихое кафе только потому, что вообще боишься всего нового.', 'Мне в баре трудно слышать собеседника, поэтому я предложил более тихое место.', 'Можно выбрать кафе сегодня, а в следующий раз вместе поискать другой вариант.'],
      en: ['You only choose a quiet café because you are generally afraid of anything new.', 'I struggle to hear people in that bar, so I suggested a quieter place.', 'We can choose the café today and look for another option together next time.'],
    }, correctIndex: 0,
  },
  {
    family: 'bandwagon', difficulty: 1,
    contextLabel: { ru: 'Переписка после знакомства и разная скорость ответов', en: 'Messaging after meeting and different reply speeds' },
    explanation: { ru: 'Популярная привычка в переписке не становится обязательным правилом для конкретной пары.', en: 'A popular messaging habit does not become a binding rule for a particular couple.' },
    segments: {
      ru: ['Я обычно отвечаю вечером, потому что днём редко могу спокойно открыть сообщения.', 'Все нормальные пары отвечают сразу, значит и ты обязан постоянно быть на связи.', 'Давай обсудим, какая задержка нас тревожит и когда срочный ответ действительно нужен.'],
      en: ['I usually reply in the evening because I can rarely check messages calmly during the day.', 'Every normal couple replies at once, so you must stay available all the time too.', 'Let’s discuss what delay worries us and when an urgent reply is actually needed.'],
    }, correctIndex: 1,
  },
  {
    family: 'false-dilemma', difficulty: 1,
    contextLabel: { ru: 'Ожидания от выходных после начала отношений', en: 'Weekend expectations at the start of a relationship' },
    explanation: { ru: 'Между полным отказом от друзей и отсутствием чувств остаётся много реальных вариантов.', en: 'There are many realistic options between abandoning friends entirely and having no feelings.' },
    segments: {
      ru: ['Мне хочется провести субботу вместе, а воскресенье оставить для друзей и отдыха.', 'Мы можем заранее выбрать хотя бы один общий вечер на этих выходных.', 'Либо ты отменяешь все планы ради меня, либо наши отношения для тебя ничего не значат.'],
      en: ['I would like to spend Saturday together and leave Sunday for friends and rest.', 'We can choose at least one evening together in advance this weekend.', 'Either you cancel every plan for me, or our relationship means nothing to you.'],
    }, correctIndex: 2,
  },
  {
    family: 'slippery-slope', difficulty: 1,
    contextLabel: { ru: 'Граница близости и просьба остановиться без спора', en: 'A boundary around intimacy and a request to stop without debate' },
    explanation: { ru: 'Одна просьба остановиться не доказывает неизбежную цепочку отказов от любой близости.', en: 'One request to stop does not prove an inevitable chain ending all forms of intimacy.' },
    segments: {
      ru: ['Если мы сейчас остановимся, скоро исчезнут объятия, потом встречи, и отношения точно закончатся.', 'Я услышал, что ты хочешь остановиться; давай остановимся и позже спокойно поговорим.', 'Согласие на прошлой встрече не означает согласия сегодня, поэтому я уточняю ещё раз.'],
      en: ['If we stop now, hugs will disappear next, then dates, and the relationship will certainly end.', 'I hear that you want to stop; let’s stop and talk calmly later.', 'Consent on our previous date does not mean consent today, so I am checking again.'],
    }, correctIndex: 0,
  },
  {
    family: 'hasty-generalization', difficulty: 1,
    contextLabel: { ru: 'Ревность после одного дружеского сообщения коллеге', en: 'Jealousy after one friendly message to a coworker' },
    explanation: { ru: 'Одного дружеского сообщения недостаточно для общего вывода о честности человека.', en: 'One friendly message is not enough evidence for a broad conclusion about someone’s honesty.' },
    segments: {
      ru: ['Мне стало тревожно из-за этого сообщения, и я хочу уточнить, что оно для тебя значит.', 'Ты один раз написал коллеге поздно вечером, значит тебе вообще нельзя доверять.', 'Мы можем договориться, какие переписки считаем личными и что готовы обсуждать.'],
      en: ['That message made me uneasy, and I want to ask what it means to you.', 'You messaged a coworker late once, so you cannot be trusted at all.', 'We can agree on which conversations we consider private and what we are willing to discuss.'],
    }, correctIndex: 1,
  },
  {
    family: 'post-hoc', difficulty: 1,
    contextLabel: { ru: 'Доверие после смены фотографии в профиле', en: 'Trust after changing a profile picture' },
    explanation: { ru: 'Последовательность событий сама по себе не показывает, что разговор вызвал смену фотографии.', en: 'The order of events alone does not show that the conversation caused the profile-picture change.' },
    segments: {
      ru: ['Я заметила новую фотографию и хочу спросить, почему ты решил её сменить.', 'Возможно, события связаны, но без разговора мы этого пока не знаем.', 'После нашего спора ты сменил фотографию, значит сделал это специально, чтобы меня задеть.'],
      en: ['I noticed the new picture and want to ask why you decided to change it.', 'The events may be connected, but we do not know that without a conversation.', 'You changed your picture after our argument, so you did it specifically to hurt me.'],
    }, correctIndex: 2,
  },
  {
    family: 'circular-reasoning', difficulty: 1,
    contextLabel: { ru: 'Общий бюджет и решение о дорогой покупке', en: 'A shared budget and a decision about an expensive purchase' },
    explanation: { ru: 'Покупка объявляется разумной лишь потому, что её предложил якобы разумный покупатель.', en: 'The purchase is called sensible only because it was proposed by a supposedly sensible buyer.' },
    segments: {
      ru: ['Эта покупка разумна, потому что я разумно трачу деньги, а это видно по этой покупке.', 'Цена выше нашего месячного лимита, поэтому сначала посмотрим бюджет и альтернативы.', 'Мне вещь нравится, но я готов отложить решение до разговора об общих расходах.'],
      en: ['This purchase is sensible because I spend sensibly, as this very purchase proves.', 'The price exceeds our monthly limit, so let’s check the budget and alternatives first.', 'I like the item, but I am willing to delay the decision until we discuss shared expenses.'],
    }, correctIndex: 0,
  },
  {
    family: 'straw-man', difficulty: 1,
    contextLabel: { ru: 'Распределение бытовых дел после переезда вместе', en: 'Dividing household tasks after moving in together' },
    explanation: { ru: 'Просьбу делить уборку поровну подменяют требованием вести дом по чужому расписанию.', en: 'A request to share cleaning equally is replaced with a demand to run the home on one person’s schedule.' },
    segments: {
      ru: ['Я прошу поровну разделить уборку кухни и ванной на этой неделе.', 'То есть теперь я должен жить по твоему графику и спрашивать разрешение на каждый шаг.', 'Давай запишем задачи и выберем те, которые каждому удобнее делать.'],
      en: ['I am asking us to divide the kitchen and bathroom cleaning equally this week.', 'So now I must live by your schedule and ask permission for every move I make.', 'Let’s list the tasks and choose the ones each of us finds easier to do.'],
    }, correctIndex: 1,
  },
  {
    family: 'false-authority', difficulty: 1,
    contextLabel: { ru: 'Отношения на расстоянии и частота видеозвонков', en: 'A long-distance relationship and the frequency of video calls' },
    explanation: { ru: 'Популярность ведущего не делает его экспертом и не определяет удобный ритм этой пары.', en: 'A host’s popularity does not make them an expert or determine the right rhythm for this couple.' },
    segments: {
      ru: ['Мне удобно созваниваться трижды в неделю, но я хочу услышать твой вариант.', 'Рабочий график изменился, поэтому прежнее время звонка стоит пересмотреть.', 'Известный ведущий сказал, что любящие пары звонят каждый час, значит спорить тут не о чем.'],
      en: ['Three calls a week work for me, but I want to hear what would work for you.', 'My work schedule changed, so we should reconsider our old call time.', 'A famous host says loving couples call hourly, so there is nothing to discuss.'],
    }, correctIndex: 2,
  },
  {
    family: 'tradition', difficulty: 1,
    contextLabel: { ru: 'Влияние родителей на решение о совместном празднике', en: 'Parents influencing a decision about a shared holiday' },
    explanation: { ru: 'Семейный обычай может быть важен, но его давность сама по себе не решает нынешний спор.', en: 'A family custom may matter, but its age alone does not settle the present disagreement.' },
    segments: {
      ru: ['В нашей семье всегда праздновали только у родителей, поэтому иначе поступать неправильно.', 'Мне важна семейная встреча, а тебе нужен тихий вечер; попробуем разделить день.', 'Спросим обе семьи о времени, но окончательное решение примем вдвоём.'],
      en: ['My family has always celebrated only at my parents’ home, so doing anything else is wrong.', 'The family gathering matters to me, while you need a quiet evening; let’s split the day.', 'We can ask both families about timing, but we will make the final decision together.'],
    }, correctIndex: 0,
  },
  {
    family: 'sunk-cost', difficulty: 1,
    contextLabel: { ru: 'Извинение после повторяющейся ссоры о пунктуальности', en: 'An apology after repeated arguments about punctuality' },
    explanation: { ru: 'Прошлые вложения не делают продолжение прежней договорённости выгодным или обязательным.', en: 'Past investment does not make continuing the old arrangement beneficial or mandatory.' },
    segments: {
      ru: ['Я опоздал снова; извинение будет честнее, если я назову, что изменю в следующий раз.', 'Мы уже потратили два года на эту договорённость, поэтому обязаны сохранять её любой ценой.', 'Можно признать прошлые усилия и всё же выбрать новый способ планировать встречи.'],
      en: ['I was late again; my apology will mean more if I say what I will change next time.', 'We spent two years on this arrangement, so we must preserve it at any cost.', 'We can value our past effort and still choose a new way to plan our meetings.'],
    }, correctIndex: 1,
  },
  {
    family: 'equivocation', difficulty: 1,
    contextLabel: { ru: 'Конфликт из-за разных значений слова «свободен»', en: 'A conflict over different meanings of the word “free”' },
    explanation: { ru: 'Слово «свободен» незаметно меняет значение с отсутствия дел на отсутствие обязательств.', en: 'The word “free” quietly shifts from having no plans to having no commitments.' },
    segments: {
      ru: ['Под «свободен вечером» я имел в виду, что у меня не было назначенных встреч.', 'Похоже, мы вложили в одно слово разные смыслы; давай уточнять конкретнее.', 'Ты сказал, что свободен, а свободный человек никому ничего не должен, включая обещанный звонок.'],
      en: ['By “free tonight,” I meant that I had no scheduled appointments.', 'It seems we gave one word different meanings; let’s be more specific next time.', 'You said you were free, and a free person owes nobody anything, including the promised call.'],
    }, correctIndex: 2,
  },
  {
    family: 'composition', difficulty: 1,
    contextLabel: { ru: 'Расставание и вывод о всей истории по одной плохой неделе', en: 'A breakup and judging the whole history by one bad week' },
    explanation: { ru: 'Свойство одной тяжёлой части отношений без основания переносят на всю их историю.', en: 'A feature of one difficult part of the relationship is unjustifiably applied to its entire history.' },
    segments: {
      ru: ['Последняя неделя была ужасной, значит все три года наших отношений были сплошной ошибкой.', 'Мы можем признать тяжёлый конец, не стирая хорошие и спокойные периоды.', 'Для решения о расставании важны нынешние условия, а не единая оценка каждого прошлого дня.'],
      en: ['The last week was awful, so all three years of our relationship were nothing but a mistake.', 'We can acknowledge a painful ending without erasing the good and quiet periods.', 'The current conditions matter for a breakup decision, not one verdict on every past day.'],
    }, correctIndex: 0,
  },
  {
    family: 'base-rate', difficulty: 1,
    contextLabel: { ru: 'Совместное родительство и единичное опоздание к ребёнку', en: 'Co-parenting and one late arrival for the child' },
    explanation: { ru: 'Одно заметное опоздание оценивают без учёта обычной пунктуальности во все другие дни.', en: 'One noticeable late arrival is judged without considering the usual record on all other days.' },
    segments: {
      ru: ['Сегодняшнее опоздание нарушило план ребёнка, поэтому обсудим, как предупредить повторение.', 'Ты опоздал сегодня на десять минут, значит почти наверняка всегда будешь срывать передачи.', 'За последние месяцы передачи обычно начинались вовремя; сегодняшний случай всё равно стоит разобрать.'],
      en: ['Today’s delay disrupted the child’s plan, so let’s discuss how to prevent a repeat.', 'You were ten minutes late today, so you will almost certainly disrupt every handoff.', 'Handoffs have usually started on time for months; today’s incident is still worth discussing.'],
    }, correctIndex: 1,
  },
  {
    family: 'survivorship', difficulty: 1,
    contextLabel: { ru: 'Советы друзей о том, как сохранить отношения', en: 'Friends giving advice about how to keep a relationship' },
    explanation: { ru: 'Видимые успешные примеры скрывают пары, которые применяли тот же совет без успеха.', en: 'Visible success stories hide couples who followed the same advice without succeeding.' },
    segments: {
      ru: ['Совет друзей может дать идею, но нам всё равно нужно проверить, подходит ли она нам.', 'Три знакомые пары выбрали разные способы решать споры, и результаты тоже различались.', 'Все пары из нашего чата, которые вместе путешествуют, счастливы; поездки гарантированно спасают отношения.'],
      en: ['Our friends’ advice may offer an idea, but we still need to see whether it fits us.', 'Three couples we know handle arguments differently, and their outcomes differ too.', 'Every couple in our chat who travels together is happy; trips are guaranteed to save relationships.'],
    }, correctIndex: 2,
  },
  {
    family: 'ad-hominem', difficulty: 1,
    contextLabel: { ru: 'Знакомство в приложении и предложение встретиться позже', en: 'A dating-app match and a suggestion to meet later' },
    explanation: { ru: 'Оскорбительная оценка личности не отвечает на практическую просьбу перенести встречу.', en: 'An insulting judgment about personality does not answer the practical request to reschedule.' },
    segments: {
      ru: ['Только несерьёзный человек переносит встречу из-за работы, поэтому твоё объяснение ничего не стоит.', 'В пятницу я задержусь на смене; могу встретиться в субботу после обеда.', 'Если перенос тебе неудобен, давай прямо скажем, есть ли другая подходящая дата.'],
      en: ['Only an unserious person reschedules because of work, so your explanation is worthless.', 'I will be held late at work on Friday; I can meet Saturday afternoon.', 'If rescheduling does not work for you, let’s say plainly whether another date does.'],
    }, correctIndex: 0,
  },
  {
    family: 'bandwagon', difficulty: 1,
    contextLabel: { ru: 'Переписка и ожидание пароля от телефона партнёра', en: 'Messaging and expecting a partner’s phone password' },
    explanation: { ru: 'Поведение знакомых пар не доказывает, что обмен паролями необходим для доверия всем.', en: 'What familiar couples do does not prove that sharing passwords is necessary for everyone’s trust.' },
    segments: {
      ru: ['Мне спокойнее без обмена паролями, но я готов обсудить конкретные причины тревоги.', 'Все наши друзья знают пароли друг друга, значит без этого настоящего доверия не бывает.', 'Можно договориться о прозрачности в важных вопросах, сохранив личное пространство в телефоне.'],
      en: ['I am more comfortable not sharing passwords, but I will discuss the specific worries.', 'All our friends know each other’s passwords, so real trust cannot exist without that.', 'We can agree on openness in important matters while keeping personal space on our phones.'],
    }, correctIndex: 1,
  },
  {
    family: 'false-dilemma', difficulty: 2,
    contextLabel: { ru: 'Ожидания от знакомства с друзьями нового партнёра', en: 'Expectations about meeting a new partner’s friends' },
    explanation: { ru: 'Отказ от одной вечеринки не оставляет лишь два варианта: немедленное знакомство или стыд.', en: 'Declining one party does not leave only two options: meeting immediately or being ashamed.' },
    segments: {
      ru: ['На большой вечеринке мне будет неуютно, но я могу познакомиться с ними в маленькой компании.', 'Мне важно понять, почему ты не хочешь идти именно в этот раз.', 'Либо ты сегодня знакомишь меня со всеми друзьями, либо ты явно меня стесняешься.'],
      en: ['A large party would feel uncomfortable, but I can meet them in a smaller group.', 'I want to understand why you do not want to go on this particular occasion.', 'Either you introduce me to every friend tonight, or you are clearly ashamed of me.'],
    }, correctIndex: 2,
  },
  {
    family: 'slippery-slope', difficulty: 2,
    contextLabel: { ru: 'Личная граница вокруг чтения старых сообщений', en: 'A personal boundary around reading old messages' },
    explanation: { ru: 'Запрет читать старую переписку не ведёт автоматически к полной секретности во всех делах.', en: 'Keeping old messages private does not automatically lead to complete secrecy in every matter.' },
    segments: {
      ru: ['Если ты не покажешь старую переписку, дальше скроешь встречи, деньги и в итоге целую вторую жизнь.', 'Я не хочу показывать личные разговоры друзей, но отвечу на твои вопросы о наших договорённостях.', 'Давай отделим тревогу о настоящем от права других людей на приватность в старых сообщениях.'],
      en: ['If you hide old messages, next you will hide meetings, money, and eventually an entire second life.', 'I will not expose my friends’ private conversations, but I will answer questions about our agreements.', 'Let’s separate worries about the present from other people’s privacy in old messages.'],
    }, correctIndex: 0,
  },
  {
    family: 'hasty-generalization', difficulty: 2,
    contextLabel: { ru: 'Ревность после неловкой встречи с бывшим партнёром', en: 'Jealousy after an awkward encounter with an ex-partner' },
    explanation: { ru: 'Одна неловкая встреча не подтверждает общее правило о намерениях всех бывших партнёров.', en: 'One awkward encounter does not establish a general rule about every ex-partner’s intentions.' },
    segments: {
      ru: ['Встреча вышла неловкой, поэтому я хочу обсудить, как нам вести себя при случайных встречах.', 'Бывшие всегда пытаются вернуть отношения, значит этот разговор точно был скрытым флиртом.', 'Я видел только часть разговора и не хочу додумывать остальное без твоего объяснения.'],
      en: ['The encounter was awkward, so I want to discuss how we handle chance meetings.', 'Ex-partners always try to restart relationships, so that conversation was definitely covert flirting.', 'I saw only part of the conversation and do not want to invent the rest without your explanation.'],
    }, correctIndex: 1,
  },
  {
    family: 'post-hoc', difficulty: 2,
    contextLabel: { ru: 'Снижение доверия после совета близкой подруги', en: 'Reduced trust after advice from a close friend' },
    explanation: { ru: 'То, что сомнения появились после разговора, ещё не доказывает, что именно подруга их создала.', en: 'The fact that doubts followed the conversation does not prove that the friend created them.' },
    segments: {
      ru: ['Разговор с подругой повлиял на меня, но сомнения могли возникнуть и по другим причинам.', 'Я хочу проверить, какие события между нами вызвали тревогу, а не искать одного виновника.', 'Ты стала сомневаться сразу после встречи с ней, значит она намеренно разрушает наши отношения.'],
      en: ['The talk with my friend affected me, but my doubts may have had other causes too.', 'I want to examine which events between us caused concern instead of finding one culprit.', 'You started doubting us right after seeing her, so she is deliberately destroying our relationship.'],
    }, correctIndex: 2,
  },
  {
    family: 'circular-reasoning', difficulty: 2,
    contextLabel: { ru: 'Разговор о личных и общих расходах в паре', en: 'A discussion about personal and shared spending' },
    explanation: { ru: 'Право решать единолично обосновывают самим заявлением, что деньги являются только личными.', en: 'The right to decide alone is justified only by repeating that the money is solely personal.' },
    segments: {
      ru: ['Эти деньги только мои, потому что лишь я решаю, мои ли они, а решаю я именно так.', 'Доход личный, но крупная трата может повлиять на общий платёж, поэтому сверим суммы.', 'Давайте заранее определим порог, выше которого мы предупреждаем друг друга о расходах.'],
      en: ['This money is mine alone because only I decide whether it is mine, and that is my decision.', 'The income is personal, but a large expense may affect our shared payment, so let’s check.', 'Let’s set a threshold above which we tell each other about expenses in advance.'],
    }, correctIndex: 0,
  },
  {
    family: 'straw-man', difficulty: 2,
    contextLabel: { ru: 'Бытовой спор о тишине во время удалённой работы', en: 'A household dispute about quiet during remote work' },
    explanation: { ru: 'Ограниченную просьбу о часе тишины подменяют запретом пользоваться домом весь день.', en: 'A limited request for one quiet hour is replaced with a ban on using the home all day.' },
    segments: {
      ru: ['Мне нужен тихий час с двух до трёх для рабочего звонка.', 'Получается, ты запрещаешь мне весь день ходить по собственной квартире и издавать любой звук.', 'Я могу заняться покупками в этот час, если потом кухня будет свободна для моего звонка.'],
      en: ['I need one quiet hour from two to three for a work call.', 'So you are forbidding me to move around my own home or make any sound all day.', 'I can do the shopping during that hour if the kitchen is free for my call afterward.'],
    }, correctIndex: 1,
  },
  {
    family: 'false-authority', difficulty: 2,
    contextLabel: { ru: 'Дальние отношения и совет спортивного блогера', en: 'A long-distance relationship and advice from a fitness influencer' },
    explanation: { ru: 'Опыт в спорте не даёт специальных знаний о том, как всем парам строить дальние отношения.', en: 'Expertise in fitness does not provide special knowledge about how every couple should handle distance.' },
    segments: {
      ru: ['Ежедневные отчёты меня утомляют; лучше обсудим, какая связь помогает нам обоим.', 'У блогера может быть личный опыт, но он не знает нашего графика и обстоятельств.', 'Этот чемпион говорит, что расстояние выдерживают только пары с геолокацией, значит так и есть.'],
      en: ['Daily reports exhaust me; let’s discuss what kind of contact helps both of us.', 'The influencer may have personal experience, but does not know our schedules or circumstances.', 'That champion says only couples sharing location survive distance, so it must be true.'],
    }, correctIndex: 2,
  },
  {
    family: 'tradition', difficulty: 2,
    contextLabel: { ru: 'Родители и порядок принятия решений о свадьбе', en: 'Parents and the process for making wedding decisions' },
    explanation: { ru: 'Привычный семейный порядок не доказывает, что родители должны принимать решение за пару.', en: 'A familiar family practice does not prove that parents should make the couple’s decision.' },
    segments: {
      ru: ['У нас старшие всегда выбирали формат свадьбы, поэтому передать решение паре было бы неправильно.', 'Совет родителей для нас важен, но бюджет и список гостей мы хотим согласовать сами.', 'Можно сохранить значимый семейный ритуал, не отдавая родственникам каждое решение.'],
      en: ['In our family, elders always chose the wedding format, so letting the couple decide would be wrong.', 'Our parents’ advice matters, but we want to agree on the budget and guest list ourselves.', 'We can keep a meaningful family ritual without giving relatives every decision.'],
    }, correctIndex: 0,
  },
  {
    family: 'sunk-cost', difficulty: 2,
    contextLabel: { ru: 'Извинение и дорогая поездка, которая больше не подходит', en: 'An apology and an expensive trip that no longer works' },
    explanation: { ru: 'Уже оплаченная часть поездки не должна одна определять решение о новых расходах и рисках.', en: 'Money already paid should not by itself determine whether to accept further costs and risks.' },
    segments: {
      ru: ['Жаль терять предоплату, но сравним эту потерю с ценой и стрессом всей поездки.', 'Мы уже внесли невозвратный аванс, поэтому обязаны ехать, сколько бы ещё это ни стоило.', 'Я извиняюсь, что поздно сообщил об изменениях; давай отдельно решим вопрос с билетами.'],
      en: ['Losing the deposit hurts, but let’s compare that loss with the full cost and stress of the trip.', 'We paid a nonrefundable deposit, so we must go regardless of every additional cost.', 'I am sorry I shared the change late; let’s decide what to do about the tickets separately.'],
    }, correctIndex: 1,
  },
  {
    family: 'equivocation', difficulty: 2,
    contextLabel: { ru: 'Спор о честности после пропущенной детали разговора', en: 'A dispute about honesty after omitting one detail' },
    explanation: { ru: 'Значение «не скрывать важное» подменяют требованием сообщать вообще каждую бытовую деталь.', en: 'The meaning of “not hiding important things” shifts into reporting every ordinary detail.' },
    segments: {
      ru: ['Я не рассказал о короткой встрече, потому что не счёл её важной; понимаю, почему тебя это задело.', 'Давай уточним, какие события мы оба считаем важными и хотим сообщать заранее.', 'Ты обещал ничего не скрывать, а не назвал каждую остановку по пути, значит обещание нарушено.'],
      en: ['I did not mention the brief meeting because it seemed minor; I understand why it upset you.', 'Let’s define which events we both consider important and want disclosed in advance.', 'You promised to hide nothing but omitted every stop on your route, so you broke the promise.'],
    }, correctIndex: 2,
  },
  {
    family: 'composition', difficulty: 2,
    contextLabel: { ru: 'Расставание после нескольких несовместимых привычек', en: 'A breakup after several incompatible habits' },
    explanation: { ru: 'Несовместимость отдельных привычек не означает, что каждый элемент отношений был несовместим.', en: 'Incompatibility in several habits does not mean every part of the relationship was incompatible.' },
    segments: {
      ru: ['Мы по-разному относимся к порядку и гостям, значит между нами вообще никогда не было ничего общего.', 'Различия в быту реальны, и нам нужно решить, можно ли с ними жить без постоянной ссоры.', 'Даже при расставании можно отдельно оценить дружбу, поддержку и бытовую совместимость.'],
      en: ['We differ about tidiness and guests, so we have never had anything at all in common.', 'Our household differences are real, and we must decide whether we can live with them peacefully.', 'Even during a breakup, we can assess friendship, support, and household compatibility separately.'],
    }, correctIndex: 0,
  },
  {
    family: 'base-rate', difficulty: 2,
    contextLabel: { ru: 'Совместное родительство и один забытый школьный пакет', en: 'Co-parenting and one forgotten school bag' },
    explanation: { ru: 'Яркий единичный промах заслоняет частоту успешных передач вещей за длительный период.', en: 'One vivid mistake obscures the longer-term frequency of successful handoffs.' },
    segments: {
      ru: ['Пакет забыли сегодня, и ребёнку пришлось вернуться; введём общий список перед выходом.', 'Один забытый пакет доказывает, что у тебя ребёнок постоянно остаётся без нужных вещей.', 'За двадцать прошлых передач вещи были собраны; это не отменяет неудобства сегодня.'],
      en: ['The bag was forgotten today and the child had to return; let’s use a shared checklist.', 'One forgotten bag proves the child constantly lacks essential things while staying with you.', 'The previous twenty handoffs included everything; that does not erase today’s inconvenience.'],
    }, correctIndex: 1,
  },
  {
    family: 'survivorship', difficulty: 2,
    contextLabel: { ru: 'Друзья советуют никогда не ложиться спать после ссоры', en: 'Friends advise never sleeping before resolving an argument' },
    explanation: { ru: 'Истории пар, которым помог ночной разговор, не включают тех, кому усталость только навредила.', en: 'Stories where late-night talks helped omit couples whose conflicts worsened through exhaustion.' },
    segments: {
      ru: ['Мы оба устали, поэтому запишем главный вопрос и вернёмся к нему утром.', 'Некоторым помогает договорить сразу, а другим сначала нужно успокоиться и выспаться.', 'Все счастливые пары, о которых пишут друзья, мирятся до сна; значит этот способ всегда спасает конфликт.'],
      en: ['We are both tired, so let’s note the main issue and return to it in the morning.', 'Some people benefit from talking immediately, while others need calm and sleep first.', 'Every happy couple our friends post about makes peace before bed, so that method always saves a conflict.'],
    }, correctIndex: 2,
  },
  {
    family: 'ad-hominem', difficulty: 2,
    contextLabel: { ru: 'Знакомство и спор о безопасности ночной встречи', en: 'Dating and a disagreement about safety during a late meeting' },
    explanation: { ru: 'Насмешка над смелостью человека не отвечает на его конкретные опасения о месте и времени.', en: 'Mocking someone’s courage does not answer their specific concerns about the place and time.' },
    segments: {
      ru: ['Только параноик боится идти ночью через этот район, поэтому твои доводы можно не слушать.', 'Я предпочту людное место у метро и сообщу другу, когда вернусь домой.', 'Если позднее время неудобно, перенесём встречу на день без оценки чьей-либо смелости.'],
      en: ['Only a paranoid person fears walking through that area at night, so your reasons do not matter.', 'I prefer a busy place near the station and will tell a friend when I get home.', 'If the late hour is inconvenient, we can move the date to daytime without judging anyone’s courage.'],
    }, correctIndex: 0,
  },
  {
    family: 'bandwagon', difficulty: 2,
    contextLabel: { ru: 'Переписка и публичный статус отношений в соцсети', en: 'Messaging and publicly labeling a relationship online' },
    explanation: { ru: 'Распространённая публикация статуса не доказывает, что она обязательна для серьёзных отношений.', en: 'A common practice of posting a status does not prove it is required for a serious relationship.' },
    segments: {
      ru: ['Мне важна ясность между нами, но публичный статус для меня не обязателен.', 'Сейчас все серьёзные пары ставят общий статус, значит отказ доказывает несерьёзность.', 'Давай отдельно договоримся, что считаем отношениями и чем готовы делиться публично.'],
      en: ['Clarity between us matters to me, but a public relationship status does not.', 'Every serious couple posts a shared status now, so refusing proves a lack of commitment.', 'Let’s agree separately on what our relationship is and what we want to share publicly.'],
    }, correctIndex: 1,
  },
  {
    family: 'false-dilemma', difficulty: 2,
    contextLabel: { ru: 'Разные ожидания о совместном отпуске и личном времени', en: 'Different expectations about a shared vacation and personal time' },
    explanation: { ru: 'Совместный отпуск допускает промежуточные планы между постоянной близостью и полной разобщённостью.', en: 'A shared vacation allows middle-ground plans between constant togetherness and total separation.' },
    segments: {
      ru: ['Я хочу один день провести в музее, пока ты пойдёшь в поход, а вечером встретимся.', 'Мы можем заранее выбрать обязательные общие дни и оставить каждому немного своего времени.', 'Либо мы каждую минуту отпуска вместе, либо нет смысла вообще ехать как пара.'],
      en: ['I want one museum day while you hike, and then we can meet in the evening.', 'We can choose our shared days in advance and leave each person some private time.', 'Either we spend every vacation minute together, or there is no point traveling as a couple.'],
    }, correctIndex: 2,
  },
  {
    family: 'slippery-slope', difficulty: 2,
    contextLabel: { ru: 'Согласие на публикацию общей фотографии', en: 'Consent to posting a photograph together' },
    explanation: { ru: 'Отказ от одной публикации не запускает неизбежный путь к полному отрицанию отношений.', en: 'Declining one post does not start an inevitable path toward denying the entire relationship.' },
    segments: {
      ru: ['Если не разрешишь эту фотографию, потом запретишь упоминать нас и вскоре станешь скрывать отношения.', 'Мне нравится снимок, но я не хочу публиковать его до разговора о приватности.', 'Мы можем сохранить фотографию для себя или выбрать другую, которую оба согласны показать.'],
      en: ['If you refuse this photo, next you will ban any mention of us and soon hide the relationship.', 'I like the picture, but I do not want it posted before we discuss privacy.', 'We can keep it private or choose another photo that we both agree to share.'],
    }, correctIndex: 0,
  },
  {
    family: 'hasty-generalization', difficulty: 2,
    contextLabel: { ru: 'Ревность из-за одного пропущенного звонка вечером', en: 'Jealousy over one missed call in the evening' },
    explanation: { ru: 'Один пропущенный звонок не даёт достаточных оснований судить обо всём отношении к договорённостям.', en: 'One missed call is not enough evidence to judge someone’s entire attitude toward agreements.' },
    segments: {
      ru: ['Я ждал звонка и расстроился; хочу узнать, что произошло и как предупредить такое в будущем.', 'Ты один раз не позвонила вовремя, значит любые договорённости для тебя ничего не значат.', 'Можно установить запасное сообщение на случай, если созвон неожиданно не получается.'],
      en: ['I waited for the call and felt upset; I want to know what happened and how to prevent repeats.', 'You missed one scheduled call, so agreements of any kind mean nothing to you.', 'We can use a backup text whenever an unexpected problem makes the call impossible.'],
    }, correctIndex: 1,
  },
  {
    family: 'post-hoc', difficulty: 3,
    contextLabel: { ru: 'Доверие после начала новой работы у партнёра', en: 'Trust after a partner starts a new job' },
    explanation: { ru: 'Совпадение усталости с началом новой работы не доказывает единственную причину перемены в общении.', en: 'Fatigue coinciding with a new job does not prove a single cause for the change in communication.' },
    segments: {
      ru: ['После новой работы наши разговоры стали короче, но на это могли повлиять усталость и другие события.', 'Я замечаю перемену и хочу спросить, что сейчас отнимает силы и какая поддержка нужна.', 'Ты стал отвечать короче после выхода на работу, значит там появился человек, который тебе важнее меня.'],
      en: ['Our talks became shorter after the new job, but fatigue and other events may have contributed.', 'I notice the change and want to ask what drains your energy and what support would help.', 'Your replies shortened after starting that job, so someone there must matter more than I do.'],
    }, correctIndex: 2,
  },
  {
    family: 'circular-reasoning', difficulty: 3,
    contextLabel: { ru: 'Общий долг и спор о справедливой доле платежа', en: 'Shared debt and a dispute about a fair payment share' },
    explanation: { ru: 'Долю называют справедливой только потому, что она якобы соответствует справедливому правилу.', en: 'The share is called fair only because it supposedly follows a rule already labeled fair.' },
    segments: {
      ru: ['Моя доля справедлива, потому что рассчитана по справедливому правилу, а правило справедливо из-за этой доли.', 'Сравним доходы, происхождение долга и прежние договорённости, прежде чем назначать доли.', 'Если не договоримся сами, можно вместе обратиться к нейтральному финансовому консультанту.'],
      en: ['My share is fair because it follows a fair rule, and the rule is fair because it gives this share.', 'Let’s compare incomes, the debt’s origin, and prior agreements before assigning shares.', 'If we cannot agree, we can consult a neutral financial adviser together.'],
    }, correctIndex: 0,
  },
  {
    family: 'straw-man', difficulty: 3,
    contextLabel: { ru: 'Быт и просьба не принимать гостей без предупреждения', en: 'Household boundaries and advance notice before guests visit' },
    explanation: { ru: 'Просьбу предупреждать о гостях превращают в более сильный и не заявленный запрет на дружбу.', en: 'A request for advance notice about guests is turned into an unstated, stronger ban on friendships.' },
    segments: {
      ru: ['Я прошу писать хотя бы за пару часов до прихода гостей в нашу общую квартиру.', 'То есть ты хочешь запретить мне дружить и полностью контролировать, с кем я общаюсь.', 'Предупреждение поможет мне перестроить планы; оно не означает автоматического запрета на визит.'],
      en: ['I am asking for at least a couple of hours’ notice before guests enter our shared home.', 'So you want to ban my friendships and completely control who I talk to.', 'Advance notice lets me adjust my plans; it does not automatically veto the visit.'],
    }, correctIndex: 1,
  },
  {
    family: 'false-authority', difficulty: 3,
    contextLabel: { ru: 'Дальние отношения и совет успешного предпринимателя', en: 'A long-distance relationship and advice from a successful entrepreneur' },
    explanation: { ru: 'Деловой успех не подтверждает компетентность в отношениях и не заменяет данные об этой паре.', en: 'Business success does not establish relationship expertise or replace evidence about this couple.' },
    segments: {
      ru: ['Переезд может сократить расстояние, но сначала сравним работу, жильё и наши ожидания.', 'Личная история предпринимателя интересна, однако наши риски и ресурсы отличаются.', 'Известный основатель говорит, что ради любви надо сразу переезжать, значит это объективно лучший выбор.'],
      en: ['Moving could close the distance, but first let’s compare work, housing, and our expectations.', 'The entrepreneur’s story is interesting, but our risks and resources are different.', 'A famous founder says love requires moving immediately, so that is objectively the best choice.'],
    }, correctIndex: 2,
  },
  {
    family: 'tradition', difficulty: 3,
    contextLabel: { ru: 'Влияние родителей на фамилию будущего ребёнка', en: 'Parents influencing the surname of a future child' },
    explanation: { ru: 'Многолетний семейный обычай не является достаточным доводом против обсуждения других вариантов.', en: 'A longstanding family custom is not sufficient reason to reject discussion of other options.' },
    segments: {
      ru: ['В нашей семье дети всегда получали одну фамилию, поэтому обсуждать другие варианты неправильно.', 'Обе фамилии связаны с нашими семьями; давай проверим юридические и практические варианты.', 'Мнение родителей важно выслушать, но решение повлияет прежде всего на нас и ребёнка.'],
      en: ['Children in our family have always received one surname, so discussing alternatives is wrong.', 'Both surnames connect to our families; let’s examine the legal and practical options.', 'Our parents’ views deserve a hearing, but the decision chiefly affects us and the child.'],
    }, correctIndex: 0,
  },
  {
    family: 'sunk-cost', difficulty: 3,
    contextLabel: { ru: 'Извинения и решение продолжать семейную терапию', en: 'Apologies and deciding whether to continue couples counseling' },
    explanation: { ru: 'Количество уже проведённых встреч не определяет, полезно ли оплачивать и продолжать новые.', en: 'The number of sessions already completed does not determine whether paying for more will help.' },
    segments: {
      ru: ['Мы можем оценить, изменилось ли общение за восемь встреч и подходят ли нам методы специалиста.', 'Мы уже оплатили восемь встреч, поэтому обязаны ходить дальше, даже если формат нам не помогает.', 'Я жалею, что пропустил встречу; отдельно решим, продолжать ли этот формат или искать другой.'],
      en: ['We can assess whether communication changed over eight sessions and whether the methods fit us.', 'We paid for eight sessions already, so we must continue even if the format does not help.', 'I regret missing the appointment; separately, we can decide whether to continue or seek another format.'],
    }, correctIndex: 1,
  },
  {
    family: 'equivocation', difficulty: 3,
    contextLabel: { ru: 'Конфликт вокруг обещания всегда поддерживать партнёра', en: 'A conflict over a promise to always support a partner' },
    explanation: { ru: 'Поддержку как внимание и помощь незаметно приравнивают к согласию с любым решением.', en: 'Support meaning care and assistance is quietly equated with agreement with every decision.' },
    segments: {
      ru: ['Я готов выслушать и помочь с последствиями, хотя само решение считаю рискованным.', 'Похоже, для одного поддержка означает участие, а для другого — полное согласие.', 'Ты обещал всегда меня поддерживать, значит обязан признать правильным любое моё решение.'],
      en: ['I will listen and help with the consequences, although I think the decision is risky.', 'It seems support means involvement to one of us and complete agreement to the other.', 'You promised to always support me, so you must declare every decision I make correct.'],
    }, correctIndex: 2,
  },
  {
    family: 'composition', difficulty: 3,
    contextLabel: { ru: 'Расставание и оценка отношений по отдельным конфликтам', en: 'A breakup and judging a relationship by individual conflicts' },
    explanation: { ru: 'То, что несколько конфликтов были болезненными, не делает каждое взаимодействие вредным.', en: 'The fact that several conflicts were painful does not make every interaction harmful.' },
    segments: {
      ru: ['Несколько наших ссор были разрушительными, значит абсолютно всё общение между нами было разрушительным.', 'Мы расстаёмся из-за повторяющихся проблем, но можем точнее назвать и хорошее, и трудное.', 'Точная оценка прошлого поможет договориться о вещах и контактах без единого ярлыка на всю историю.'],
      en: ['Several of our arguments were destructive, so absolutely every interaction between us was destructive.', 'We are separating because of repeated problems, but we can name both the good and the difficult parts.', 'A precise view of the past can help us arrange belongings and contact without one label for everything.'],
    }, correctIndex: 0,
  },
  {
    family: 'base-rate', difficulty: 3,
    contextLabel: { ru: 'Совместное родительство и тревога после болезни ребёнка', en: 'Co-parenting and worry after a child becomes ill' },
    explanation: { ru: 'Один эмоционально яркий эпизод оценивают отдельно от обычной частоты ухода и соблюдения режима.', en: 'One emotionally vivid episode is judged apart from the usual record of care and routines.' },
    segments: {
      ru: ['Ребёнок заболел после выходных, поэтому сверим симптомы, контакты и рекомендации врача.', 'Раз ребёнок вернулся с температурой один раз, у тебя почти наверняка всегда небезопасно.', 'За прошлый год режим обычно соблюдался; это не мешает разобрать нынешнюю болезнь внимательно.'],
      en: ['The child became ill after the weekend, so let’s review symptoms, contacts, and medical advice.', 'Because the child returned with a fever once, your home is almost certainly always unsafe.', 'Routines were usually followed this year; we can still examine the current illness carefully.'],
    }, correctIndex: 1,
  },
  {
    family: 'survivorship', difficulty: 3,
    contextLabel: { ru: 'Друзья приводят истории пар, сошедшихся после расставания', en: 'Friends cite couples who reunited after a breakup' },
    explanation: { ru: 'Заметные истории удачных воссоединений не показывают, сколько повторных попыток не сработало.', en: 'Visible stories of successful reunions do not show how many renewed attempts failed.' },
    segments: {
      ru: ['Некоторые пары успешно сходятся снова, но нам нужны причины считать, что изменилось именно у нас.', 'Можно обсудить условия новой попытки, не принимая чужой счастливый финал за прогноз.', 'Все знакомые, которые рассказывают о втором шансе, сейчас вместе; значит возвращение почти всегда удачно.'],
      en: ['Some couples reunite successfully, but we need reasons to think our own situation has changed.', 'We can discuss conditions for another attempt without treating someone else’s happy ending as a forecast.', 'Everyone we know who talks about a second chance is together now, so reunions almost always work.'],
    }, correctIndex: 2,
  },
  {
    family: 'ad-hominem', difficulty: 3,
    contextLabel: { ru: 'Разговор о границах с родителями после рождения ребёнка', en: 'Discussing boundaries with parents after a child is born' },
    explanation: { ru: 'Обвинение в неблагодарности атакует человека, но не отвечает на просьбу согласовывать визиты.', en: 'Calling someone ungrateful attacks the person without addressing the request to arrange visits.' },
    segments: {
      ru: ['Только неблагодарный человек просит родителей заранее звонить, поэтому твоя граница нелепа.', 'Помощь родителей ценна, и всё же неожиданные визиты нарушают сон ребёнка.', 'Предложим несколько удобных часов и попросим подтверждать визит сообщением.'],
      en: ['Only an ungrateful person asks parents to call first, so your boundary is ridiculous.', 'Our parents’ help matters, yet surprise visits disrupt the child’s sleep.', 'Let’s offer several convenient times and ask them to confirm each visit by text.'],
    }, correctIndex: 0,
  },
  {
    family: 'bandwagon', difficulty: 3,
    contextLabel: { ru: 'Совместные финансы и давление знакомых купить жильё', en: 'Shared finances and social pressure to buy a home' },
    explanation: { ru: 'Массовый выбор знакомых не доказывает, что ипотека подходит этой паре при её условиях.', en: 'A common choice among friends does not prove that a mortgage fits this couple’s circumstances.' },
    segments: {
      ru: ['Мы можем сравнить аренду и покупку с учётом дохода, планов переезда и резерва.', 'Все пары нашего возраста уже берут ипотеку, значит оставаться в аренде безответственно.', 'Мне важна устойчивость, но её можно обеспечить несколькими способами, а не только покупкой.'],
      en: ['We can compare renting and buying based on income, moving plans, and emergency savings.', 'Every couple our age is getting a mortgage, so continuing to rent is irresponsible.', 'Stability matters to me, but several paths can provide it besides buying.'],
    }, correctIndex: 1,
  },
  {
    family: 'false-dilemma', difficulty: 3,
    contextLabel: { ru: 'Разрыв отношений и выбор дальнейшего способа общения', en: 'Ending a relationship and choosing how to communicate afterward' },
    explanation: { ru: 'После расставания доступны градуированные варианты между близкой дружбой и вечным молчанием.', en: 'After a breakup, graded options exist between close friendship and permanent silence.' },
    segments: {
      ru: ['Сначала мне нужен месяц без личных разговоров, затем можно обсудить спокойный контакт.', 'Мы можем общаться только по поводу оставшихся вещей, пока эмоции не улягутся.', 'Либо мы сразу остаёмся лучшими друзьями, либо должны навсегда удалить друг друга отовсюду.'],
      en: ['I need a month without personal conversations, and then we can discuss limited contact.', 'We can communicate only about remaining belongings until emotions settle.', 'Either we become best friends immediately, or we must erase each other everywhere forever.'],
    }, correctIndex: 2,
  },
  {
    family: 'slippery-slope', difficulty: 3,
    contextLabel: { ru: 'Совместное родительство и просьба поменять один выходной', en: 'Co-parenting and a request to swap one weekend' },
    explanation: { ru: 'Один обмен выходными не создаёт неизбежную цепочку, в которой расписание полностью исчезает.', en: 'One weekend swap does not create an inevitable chain in which the schedule disappears completely.' },
    segments: {
      ru: ['Если уступить один выходной, потом обмены станут еженедельными, и вскоре никакого расписания не останется.', 'Я прошу обмен только на эту дату из-за рабочей поездки и предлагаю замену письменно.', 'Можно согласовать разовое исключение, не меняя основное расписание ребёнка.'],
      en: ['If we allow one weekend swap, exchanges will become weekly and soon no schedule will remain.', 'I am requesting this one date because of work travel and offering a replacement in writing.', 'We can agree to a one-time exception without changing the child’s regular schedule.'],
    }, correctIndex: 0,
  },
  {
    family: 'hasty-generalization', difficulty: 3,
    contextLabel: { ru: 'Новое знакомство после одного неудачного свидания', en: 'Meeting someone new after one disappointing date' },
    explanation: { ru: 'Один неприятный опыт не даёт оснований приписывать одинаковое поведение всем новым знакомым.', en: 'One unpleasant experience does not justify assigning the same behavior to every new person.' },
    segments: {
      ru: ['Прошлое свидание было неприятным, поэтому теперь я заранее уточню место и время окончания.', 'Один человек проигнорировал мои границы, значит любые новые знакомства обязательно закончатся так же.', 'Я могу двигаться медленнее и оценивать поступки каждого человека отдельно.'],
      en: ['My last date was unpleasant, so now I will confirm the venue and ending time in advance.', 'One person ignored my boundaries, so every new connection will inevitably end the same way.', 'I can move more slowly and assess each person’s actions separately.'],
    }, correctIndex: 1,
  },
]

export const lifeLogicChallenges = RAW_CHALLENGES.map((challenge, index) => {
  const sequence = String(index + 1).padStart(3, '0')
  const label = FAMILY_LABELS[challenge.family]
  if (!label) throw new Error('unknown_life_logic_family:' + challenge.family)

  return {
    id: `logic-life-${sequence}-v1`,
    contextId: `life-${sequence}`,
    country: 'everyday-life',
    origin: 'life',
    difficulty: challenge.difficulty,
    family: challenge.family,
    label,
    explanation: challenge.explanation,
    contextLabel: challenge.contextLabel,
    sourceType: SOURCE_TYPE,
    prompt: PROMPTS[index % PROMPTS.length],
    segments: challenge.segments,
    correctIndex: challenge.correctIndex,
  }
})
