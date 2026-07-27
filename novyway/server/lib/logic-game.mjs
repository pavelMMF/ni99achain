import { cultureLogicChallenges } from './logic-game-culture-cases.mjs'
import { lifeLogicChallenges } from './logic-game-life-cases.mjs'
import { realWorldLogicChallenges } from './logic-game-real-cases.mjs'

const addedChallenges = cultureLogicChallenges.map((challenge, index) => ({
  ...challenge,
  origin: index < 100 ? 'fiction' : 'documented',
  difficulty: (index % 3) + 1,
}))

const fictionLogicChallenges = addedChallenges.slice(0, 100)
const addedRealLogicChallenges = addedChallenges.slice(100)
const documentedLogicChallenges = [...realWorldLogicChallenges, ...addedRealLogicChallenges]

function interleaveCatalogs(documented, life, fiction) {
  if (documented.length !== 250 || life.length !== 50 || fiction.length !== 100) {
    throw new Error('logic_challenge_catalog_sizes_invalid')
  }

  const result = []
  for (let block = 0; block < 50; block += 1) {
    result.push(
      documented[block * 5],
      fiction[block * 2],
      documented[block * 5 + 1],
      documented[block * 5 + 2],
      life[block],
      documented[block * 5 + 3],
      fiction[block * 2 + 1],
      documented[block * 5 + 4],
    )
  }

  return result
}

export const logicChallenges = interleaveCatalogs(documentedLogicChallenges, lifeLogicChallenges, fictionLogicChallenges)

if (
  realWorldLogicChallenges.length !== 200
  || lifeLogicChallenges.length !== 50
  || cultureLogicChallenges.length !== 150
  || documentedLogicChallenges.length !== 250
  || fictionLogicChallenges.length !== 100
  || logicChallenges.length !== 400
  || new Set(logicChallenges.map((item) => item.id)).size !== 400
) {
  throw new Error('logic_challenge_catalog_invalid')
}

const challengeById = new Map(logicChallenges.map((challenge) => [challenge.id, challenge]))

export function getLogicChallenge(id) {
  return challengeById.get(id) ?? null
}

export function filterLogicChallenges(challenges, { origin = 'all', difficulty = 'all' } = {}) {
  return challenges.filter((challenge) => {
    if (origin !== 'all' && challenge.origin !== origin) return false
    if (difficulty !== 'all' && challenge.difficulty !== difficulty) return false
    return true
  })
}

function removeEditorialBoilerplate(value) {
  return value
    .replace(/^Учебная реконструкция,\s*не цитата:\s*/iu, '')
    .replace(/^Educational reconstruction,\s*not a quotation:\s*/iu, '')
    .replace(/^Пересказ эпизода,\s*не цитата:\s*/iu, '')
    .replace(/^Episode paraphrase,\s*not a quotation:\s*/iu, '')
}

export function presentLogicChallenge(challenge, lang = 'ru') {
  const locale = lang === 'en' ? 'en' : 'ru'
  return {
    id: challenge.id,
    contextLabel: challenge.contextLabel[locale],
    scenario: challenge.scenario?.[locale] ?? null,
    sourceType: challenge.sourceType[locale],
    prompt: challenge.prompt[locale],
    difficulty: challenge.difficulty,
    origin: challenge.origin,
    segments: challenge.segments[locale].map(removeEditorialBoilerplate),
  }
}

export function scoreLogicAnswer(challenge, selectedIndex, lang = 'ru') {
  const locale = lang === 'en' ? 'en' : 'ru'
  const correct = selectedIndex === challenge.correctIndex
  return {
    correct,
    correctIndex: challenge.correctIndex,
    category: challenge.family,
    categoryLabel: challenge.label[locale],
    points: correct ? challenge.difficulty * 10 : 0,
    explanation: challenge.explanation[locale],
    source: challenge.source ? {
      title: challenge.source.title[locale],
      url: challenge.source.url,
    } : null,
  }
}
