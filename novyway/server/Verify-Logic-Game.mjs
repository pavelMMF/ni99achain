import assert from 'node:assert/strict'
import {
  filterLogicChallenges,
  logicChallenges,
  presentLogicChallenge,
  scoreLogicAnswer,
} from './lib/logic-game.mjs'

const officialHosts = new Set([
  'bank.gov.ua',
  'cbr.ru',
  'court.gov.ua',
  'duma.gov.ru',
  'eu-ua.kmu.gov.ua',
  'government.ru',
  'house.gov.by',
  'kremlin.ru',
  'mindev.gov.ua',
  'minfin.gov.ru',
  'pravo.by',
  'president.gov.by',
  'publication.pravo.gov.ru',
  'restoration.gov.ua',
  'supremecourt.uk',
  'www.assemblee-nationale.fr',
  'www.belstat.gov.by',
  'www.bls.gov',
  'www.bundesregierung.de',
  'www.bundestag.de',
  'www.bundesverfassungsgericht.de',
  'www.cbo.gov',
  'www.cbr.ru',
  'www.ccomptes.fr',
  'www.congress.gov',
  'www.conseil-constitutionnel.fr',
  'www.elysee.fr',
  'www.epa.gov',
  'www.federalreserve.gov',
  'www.ftc.gov',
  'www.gao.gov',
  'www.gouvernement.fr',
  'www.gov.uk',
  'www.govinfo.gov',
  'www.kmu.gov.ua',
  'www.kremlin.ru',
  'www.ksrf.ru',
  'www.nasa.gov',
  'www.nb-rb.by',
  'www.nbrb.by',
  'www.parliament.uk',
  'www.president.gov.ua',
  'www.rada.gov.ua',
  'www.sec.gov',
  'www.supremecourt.gov',
  'www.whitehouse.gov',
  'zakon.rada.gov.ua',
])

const cultureHosts = new Set([
  'encyclopedia.ushmm.org',
  'en.wikipedia.org',
  'history.state.gov',
  'jamesclear.com',
  'player.bfi.org.uk',
  'theleanstartup.com',
  'trumpwhitehouse.archives.gov',
  'www.archives.gov',
  'www.bfi.org.uk',
  'www.britannica.com',
  'www.chicagoreviewpress.com',
  'www.churchillarchive.com',
  'www.crytek.com',
  'www.cyberpunk.net',
  'www.ea.com',
  'www.encyclopediaofukraine.com',
  'www.jimcollins.com',
  'www.penguinrandomhouse.com',
  'www.richdad.com',
  'www.simonandschuster.com',
  'www.spike-chunsoft.com',
  'www.thewitcher.com',
  'www.tolkienestate.com',
  'www.warnerbros.com',
])

const allowedRussianLatinTokens = new Set([
  'AI', 'Atomic', 'Blade', 'CBO', 'CO', 'Crysis', 'Cyberpunk', 'DC', 'Drive',
  'EC', 'EDF', 'EPA', 'FDA', 'FDR', 'FOMC', 'FTC', 'GAO', 'Gate', 'Habits',
  'IC', 'ICE', 'III', 'IX', 'Lean', 'Mass', 'Effect', 'Natsiocracy', 'OMB',
  'PM', 'Runner', 'SEC', 'Startup', 'Steins',
])

const addedSourceTypes = new Set([
  'Вымышленный сюжет|Fictional story',
  'Историческая риторика|Historical rhetoric',
  'Идея деловой книги|Business-book idea',
])

const mechanicalCultureOpenings = {
  ru: /^(?:Применительно к ситуации|Анализируя сцену|В эпизоде|Предмет учебного разбора|Если держаться событий сцены|Оценивая ситуацию|В центре эпизода|Для проверки рассуждения возьмём сцену|Разбор касается сцены|В описанном споре|Отправная точка|Конкретный вопрос|При оценке эпизода|Здесь предмет проверки|Сцена для анализа|В рамках этого выбора|Если разбирать момент|Для этого конфликта|Контекст ограничивает вывод сценой|Рассуждение относится к моменту|Сначала зафиксируем ситуацию|Аргумент проверяется на материале сцены|Для различения факта и вывода важна сцена|Основания оцениваются в сцене|Логический разбор привязан к сцене|Данные нужно соотнести со сценой|Перед выводом уточним сцену|Довод относится к сцене|Проверка начинается со сцены|В этом контексте рассматривается сцена)/i,
  en: /^(?:Applied to the situation|Analyzing the scene|In the episode|The subject of this exercise|Following the events of the scene|Evaluating the situation|At the center of the episode|To test the reasoning, take the scene|The analysis concerns the scene|In the described dispute|The starting point is|The specific question is|When evaluating the episode|Here the subject of the test is|The scene for analysis is|Within this choice|When examining the moment|For this conflict|The context limits the conclusion to the scene|The reasoning concerns the moment|First fix the situation|The argument is tested against the scene|To distinguish fact from inference, consider the scene|The grounds are evaluated in the scene|The logical analysis is tied to the scene|The data must be related to the scene|Before drawing a conclusion, clarify the scene|The claim concerns the scene|The test begins with the scene|This context considers the scene)/i,
}

const slopPatterns = {
  ru: [
    /важно отметить/i,
    /следует подчеркнуть/i,
    /в современном мире/i,
    /играет ключевую роль/i,
    /комплексный подход/i,
    /широкий спектр/i,
    /данн(?:ый|ая|ое|ые)\s+(?:вопрос|проблем|решен)/i,
  ],
  en: [
    /it is important to note/i,
    /in today['’]s world/i,
    /plays? a crucial role/i,
    /comprehensive approach/i,
    /\bdelve\b/i,
    /\bmultifaceted\b/i,
  ],
}

const addedCatalogSlopPatterns = {
  ru: [
    /\bэтот вывод\b/i,
    /^Основание должно/i,
    /^Сторонам нужен/i,
    /^Важно выяснить/i,
    /^Для общего правила нужны/i,
  ],
  en: [
    /\bthis conclusion\b/i,
    /^The grounds? (?:must|should)/i,
    /^The parties need/i,
    /^It is necessary to determine/i,
    /^A general rule needs/i,
  ],
}

function countBy(items, key) {
  const counts = new Map()
  for (const item of items) counts.set(item[key], (counts.get(item[key]) ?? 0) + 1)
  return counts
}

function maximumRepetition(values) {
  const counts = new Map()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return Math.max(...counts.values())
}

function sortedEntries(counts) {
  return [...counts.entries()].sort(([left], [right]) => Number(left) - Number(right))
}

function assertBalanced(values, tolerance, message) {
  const spread = Math.max(...values) - Math.min(...values)
  assert.ok(spread <= tolerance, `${message}; spread ${spread} exceeds ${tolerance}`)
}

function maximumOriginGap(origin) {
  const positions = logicChallenges
    .map((challenge, index) => challenge.origin === origin ? index : -1)
    .filter((index) => index >= 0)
  return Math.max(...positions.slice(1).map((position, index) => position - positions[index]))
}

function assertRussianLanguageIsolation(text, challengeId) {
  const latinTokens = text.match(/[A-Za-z]{2,}/g) ?? []
  for (const token of latinTokens) {
    assert.equal(
      allowedRussianLatinTokens.has(token),
      true,
      `${challengeId}: English token leaked into Russian copy: ${token}`,
    )
  }
}

const officialChallenges = logicChallenges.filter((challenge) => /^logic-real-\d{3}-v1$/.test(challenge.id))
const lifeChallenges = logicChallenges.filter((challenge) => /^logic-life-\d{3}-v1$/.test(challenge.id))
const addedChallenges = logicChallenges.filter((challenge) => /^logic-culture-\d{3}-v1$/.test(challenge.id))
const documentedChallenges = logicChallenges.filter((challenge) => challenge.origin === 'documented')
const fictionChallenges = logicChallenges.filter((challenge) => challenge.origin === 'fiction')
const addedRealChallenges = addedChallenges.filter((challenge) => challenge.origin === 'documented')
const retiredTrainingChallenges = logicChallenges.filter((challenge) => /^logic-\d{3}-v2$/.test(challenge.id))

assert.equal(logicChallenges.length, 400, 'The active catalog must contain 400 challenges')
assert.equal(officialChallenges.length, 200, 'The catalog must retain 200 official public cases')
assert.equal(documentedChallenges.length, 250, 'The Real examples category must contain 250 cases')
assert.equal(lifeChallenges.length, 50, 'The catalog must contain 50 modeled life situations')
assert.equal(fictionChallenges.length, 100, 'The Fictional worlds category must contain 100 cases')
assert.equal(addedRealChallenges.length, 50, 'Historical and book cases must be classified as real examples')
assert.equal(addedChallenges.length, 150, 'The added catalog must retain all 150 stable challenge IDs')
assert.equal(retiredTrainingChallenges.length, 0, 'Generic training challenges must not remain active')
assert.equal(new Set(logicChallenges.map((challenge) => challenge.id)).size, 400, 'Challenge IDs must be unique')
assert.equal(new Set(logicChallenges.map((challenge) => challenge.family)).size, 15, 'The catalog must cover 15 fallacy families')
assert.equal(new Set(documentedChallenges.map((challenge) => challenge.family)).size, 15, 'Real examples must cover all 15 families')
assert.equal(new Set(lifeChallenges.map((challenge) => challenge.family)).size, 15, 'Life situations must cover all 15 families')
assert.equal(new Set(fictionChallenges.map((challenge) => challenge.family)).size, 15, 'Fictional worlds must cover all 15 families')
assert.ok(documentedChallenges.every((challenge) => challenge.origin === 'documented' && challenge.source), 'Real examples require a context source')
assert.ok(lifeChallenges.every((challenge) => challenge.origin === 'life' && !challenge.source), 'Modeled life situations must not claim a source')
assert.ok(fictionChallenges.every((challenge) => challenge.origin === 'fiction' && challenge.source), 'Fictional worlds require a context source')

const answerPositions = [0, 0, 0]
for (const challenge of logicChallenges) {
  assert.match(challenge.id, /^(?:logic-real-\d{3}-v1|logic-life-\d{3}-v1|logic-culture-\d{3}-v1)$/)
  assert.ok([1, 2, 3].includes(challenge.difficulty), challenge.id + ': invalid difficulty')
  assert.ok([0, 1, 2].includes(challenge.correctIndex), challenge.id + ': invalid answer position')
  assert.ok(['documented', 'life', 'fiction'].includes(challenge.origin), challenge.id + ': invalid origin')
  answerPositions[challenge.correctIndex] += 1

  for (const lang of ['ru', 'en']) {
    const segments = challenge.segments[lang]
    const visibleText = [
      challenge.contextLabel[lang],
      challenge.scenario?.[lang] ?? '',
      challenge.sourceType[lang],
      challenge.prompt[lang],
      ...segments,
    ].join('\n')

    assert.equal(segments.length, 3, challenge.id + '/' + lang + ': expected three selectable fragments')
    assert.ok(segments.every((segment) => typeof segment === 'string' && segment.trim().length >= 35), challenge.id + '/' + lang + ': fragment too short')
    assert.ok(segments.every((segment) => segment.length <= 420), challenge.id + '/' + lang + ': fragment too long')
    assert.ok(challenge.prompt[lang].trim().length >= 25, challenge.id + '/' + lang + ': prompt too short')
    assert.equal(visibleText.includes('\uFFFD'), false, challenge.id + '/' + lang + ': replacement character found')

    if (lang === 'ru') assertRussianLanguageIsolation(visibleText, challenge.id)
    else assert.equal(/[А-Яа-яЁё]/.test(visibleText), false, challenge.id + ': Russian leaked into English copy')

    for (const pattern of slopPatterns[lang]) {
      assert.equal(pattern.test(visibleText), false, challenge.id + '/' + lang + ': generic AI phrasing found: ' + pattern)
    }
    if (/^logic-culture-/.test(challenge.id)) {
      for (const pattern of addedCatalogSlopPatterns[lang]) {
        assert.equal(pattern.test(visibleText), false, challenge.id + '/' + lang + ': generic template leaked into added catalog: ' + pattern)
      }
    }

    const publicChallenge = presentLogicChallenge(challenge, lang)
    assert.deepEqual(
      Object.keys(publicChallenge).sort(),
      ['contextLabel', 'difficulty', 'id', 'origin', 'prompt', 'scenario', 'segments', 'sourceType'].sort(),
      challenge.id + ': public challenge shape changed',
    )
    for (const hidden of ['correctIndex', 'explanation', 'category', 'categoryLabel', 'family', 'country', 'contextId', 'source']) {
      assert.equal(Object.hasOwn(publicChallenge, hidden), false, challenge.id + ': leaked ' + hidden)
    }
    assert.equal(
      publicChallenge.segments.some((segment) => /(?:not a quotation|\u043d\u0435\s+\u0446\u0438\u0442\u0430\u0442\u0430)/iu.test(segment)),
      false,
      challenge.id + '/' + lang + ': editorial provenance marker leaked into public copy',
    )

    const correctResult = scoreLogicAnswer(challenge, challenge.correctIndex, lang)
    assert.equal(correctResult.points, challenge.difficulty * 10)
    assert.equal(correctResult.category, challenge.family)
    assert.equal(correctResult.categoryLabel, challenge.label[lang])
    assert.equal(scoreLogicAnswer(challenge, (challenge.correctIndex + 1) % segments.length, lang).points, 0)

    if (challenge.source) {
      assert.deepEqual(correctResult.source, {
        title: challenge.source.title[lang],
        url: challenge.source.url,
      })
    } else {
      assert.equal(correctResult.source, null)
    }
  }

  if (/^logic-real-/.test(challenge.id)) {
    const sourceUrl = new URL(challenge.source.url)
    assert.equal(sourceUrl.protocol, 'https:', challenge.id + ': source must use HTTPS')
    assert.equal(officialHosts.has(sourceUrl.hostname), true, challenge.id + ': source host is not approved: ' + sourceUrl.hostname)
    const serial = Number(challenge.id.match(/logic-real-(\d{3})-v1/)?.[1])
    assert.ok(serial >= 1 && serial <= 200, challenge.id + ': documented ID is outside the active range')
    if (serial >= 51) {
      assert.ok(challenge.segments.ru.some((segment) => segment.startsWith('Учебная реконструкция, не цитата:')), challenge.id + ': Russian reconstruction marker missing')
      assert.ok(challenge.segments.en.some((segment) => segment.startsWith('Educational reconstruction, not a quotation:')), challenge.id + ': English reconstruction marker missing')
    }
  } else if (/^logic-culture-/.test(challenge.id)) {
    assert.ok(challenge.scenario?.ru && challenge.scenario?.en, challenge.id + ': added scenario is required')
    const sourceUrl = new URL(challenge.source.url)
    assert.equal(sourceUrl.protocol, 'https:', challenge.id + ': source must use HTTPS')
    assert.equal(cultureHosts.has(sourceUrl.hostname), true, challenge.id + ': context source host is not approved: ' + sourceUrl.hostname)
    assert.equal(
      addedSourceTypes.has(`${challenge.sourceType.ru}|${challenge.sourceType.en}`),
      true,
      challenge.id + ': added source type must identify fiction, history, or a business-book idea',
    )
    const serial = Number(challenge.id.match(/logic-culture-(\d{3})-v1/)?.[1])
    assert.ok(serial >= 1 && serial <= 150, challenge.id + ': added ID is outside the active range')
    assert.equal(challenge.origin, serial <= 100 ? 'fiction' : 'documented', challenge.id + ': case is in the wrong visible category')
  } else {
    assert.equal(challenge.scenario, undefined, challenge.id + ': life situations should keep their context in the selectable fragments')
    const serial = Number(challenge.id.match(/logic-life-(\d{3})-v1/)?.[1])
    assert.ok(serial >= 1 && serial <= 50, challenge.id + ': life-situation ID is outside the active range')
  }

  if (challenge.source) {
    assert.ok(challenge.source.title.ru.trim().length >= 5, challenge.id + ': Russian source title is missing')
    assert.ok(challenge.source.title.en.trim().length >= 5, challenge.id + ': English source title is missing')
  }
}

assertBalanced(answerPositions, 8, 'Correct answers must remain balanced across all three positions')
assert.deepEqual(sortedEntries(countBy(lifeChallenges, 'difficulty')), [[1, 17], [2, 18], [3, 15]], 'Life-case difficulty balance changed')
assert.deepEqual(sortedEntries(countBy(lifeChallenges, 'correctIndex')), [[0, 17], [1, 17], [2, 16]], 'Life-case answer positions changed')
assert.deepEqual(sortedEntries(countBy(fictionChallenges, 'difficulty')), [[1, 34], [2, 33], [3, 33]], 'Fiction difficulty balance changed')
assert.deepEqual(sortedEntries(countBy(fictionChallenges, 'correctIndex')), [[0, 34], [1, 33], [2, 33]], 'Fiction answer positions changed')
assert.ok([...countBy(addedChallenges, 'family').values()].every((count) => count === 10), 'Each added-catalog fallacy family must have exactly ten cases')

for (const lang of ['ru', 'en']) {
  assert.equal(new Set(lifeChallenges.map((challenge) => challenge.contextLabel[lang])).size, 50, lang + ': life contexts must be distinct')
  assert.equal(new Set(addedChallenges.map((challenge) => challenge.contextLabel[lang])).size, 150, lang + ': added contexts must be distinct')
  assert.equal(new Set(addedChallenges.map((challenge) => challenge.scenario[lang])).size, 150, lang + ': added scenarios must be distinct')
  const addedSegments = addedChallenges.flatMap((challenge) => challenge.segments[lang])
  const addedSignatures = addedChallenges.map((challenge) => [challenge.contextLabel[lang], challenge.scenario[lang], ...challenge.segments[lang]].join('|'))
  assert.equal(new Set(addedSignatures).size, 150, lang + ': complete added cases must be distinct')
  assert.ok(maximumRepetition(addedSegments) <= 3, lang + ': one argument fragment is repeated too often')
  for (const challenge of addedChallenges) {
    assert.equal(challenge.scenario[lang].includes(challenge.contextLabel[lang]), false, challenge.id + '/' + lang + ': scenario repeats its heading')
    for (const segment of challenge.segments[lang]) {
      assert.equal(segment.includes(challenge.contextLabel[lang]), false, challenge.id + '/' + lang + ': segment repeats the full context label')
      assert.equal(segment.includes(challenge.scenario[lang]), false, challenge.id + '/' + lang + ': segment repeats the scenario')
      assert.equal(mechanicalCultureOpenings[lang].test(segment), false, challenge.id + '/' + lang + ': mechanical framing leaked into segment')
    }
  }
}

for (const origin of ['documented', 'life', 'fiction']) {
  const challenges = filterLogicChallenges(logicChallenges, { origin })
  for (const difficulty of [1, 2, 3]) {
    const filtered = filterLogicChallenges(logicChallenges, { origin, difficulty })
    assert.ok(filtered.length > 0, `${origin}/${difficulty}: empty filter result`)
    assert.ok(filtered.every((challenge) => challenge.origin === origin && challenge.difficulty === difficulty), `${origin}/${difficulty}: filter leaked another group`)
  }
  const expectedTotal = origin === 'documented' ? 250 : origin === 'life' ? 50 : 100
  assert.equal(challenges.length, expectedTotal)
}
assert.equal(filterLogicChallenges(logicChallenges).length, 400)

for (const lang of ['ru', 'en']) {
  const texts = logicChallenges.map((challenge) => [challenge.scenario?.[lang] ?? '', ...challenge.segments[lang]].join('\n'))
  assert.equal(new Set(texts).size, texts.length, 'Duplicate ' + lang + ' challenges found')

  const officialPrompts = new Set(officialChallenges.map((challenge) => challenge.prompt[lang]))
  const lifePrompts = new Set(lifeChallenges.map((challenge) => challenge.prompt[lang]))
  const addedPrompts = new Set(addedChallenges.map((challenge) => challenge.prompt[lang]))
  assert.equal(officialPrompts.size, 6, lang + ': expected six official-case prompt phrasings')
  assert.ok(lifePrompts.size >= 4, lang + ': life situations need varied prompt phrasings')
  assert.ok(addedPrompts.size >= 6, lang + ': added cases need varied prompt phrasings')
}

const uniqueOfficialSources = new Set(officialChallenges.map((challenge) => challenge.source.url))
const uniqueAddedSources = new Set(addedChallenges.map((challenge) => challenge.source.url))
const addedTypeCounts = countBy(addedChallenges.map((challenge) => ({
  type: challenge.sourceType.en,
})), 'type')

assert.ok(uniqueOfficialSources.size >= 55, 'Documented catalog must not recycle a small source pool')
assert.ok(uniqueAddedSources.size >= 30, 'Added catalog needs broad source coverage')
assert.equal(addedTypeCounts.get('Fictional story'), 100, 'Fiction case count changed')
assert.equal(addedTypeCounts.get('Historical rhetoric'), 31, 'Historical case count changed')
assert.equal(addedTypeCounts.get('Business-book idea'), 19, 'Book case count changed')
assert.ok(maximumOriginGap('documented') <= 2, 'Documented cases must remain interleaved')
assert.ok(maximumOriginGap('fiction') <= 5, 'Fictional-world cases must remain evenly interleaved')
assert.ok(maximumOriginGap('life') <= 8, 'Life situations must remain evenly interleaved')

console.log(JSON.stringify({
  challenges: logicChallenges.length,
  documentedChallenges: documentedChallenges.length,
  lifeChallenges: lifeChallenges.length,
  fictionChallenges: fictionChallenges.length,
  addedRealChallenges: addedRealChallenges.length,
  families: new Set(logicChallenges.map((challenge) => challenge.family)).size,
  difficultyDistribution: {
    documented: Object.fromEntries(countBy(documentedChallenges, 'difficulty')),
    life: Object.fromEntries(countBy(lifeChallenges, 'difficulty')),
    fiction: Object.fromEntries(countBy(fictionChallenges, 'difficulty')),
  },
  answerPositions,
  uniqueOfficialSources: uniqueOfficialSources.size,
  uniqueAddedSources: uniqueAddedSources.size,
  uniqueAddedScenariosPerLanguage: 150,
  maximumAddedSegmentRepetition: maximumRepetition(addedChallenges.flatMap((challenge) => challenge.segments.ru)),
  retiredTrainingChallenges: retiredTrainingChallenges.length,
  filtersValidated: true,
  answersAndSourcesHiddenUntilSubmission: true,
  languageIsolationValidated: true,
  antiSlopChecksPassed: true,
  scoreValidated: true,
}, null, 2))
