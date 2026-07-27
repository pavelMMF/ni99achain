import { realWorldRuBelCases } from './logic-game-real-cases-ru-bel.mjs'
import { realWorldUaUsCases } from './logic-game-real-cases-ua-us.mjs'
import { realWorldEuCases } from './logic-game-real-cases-eu.mjs'
import { realWorldRussiaExtraCases } from './logic-game-real-cases-russia-extra.mjs'
import { realWorldBelarusUkraineExtraCases } from './logic-game-real-cases-belarus-ukraine-extra.mjs'
import { realWorldUsExtraCases } from './logic-game-real-cases-us-extra.mjs'
import { realWorldEuropeExtraCases } from './logic-game-real-cases-europe-extra.mjs'

const familyLabels = {
  'ad-hominem': { ru: 'Переход на личность', en: 'Ad hominem' },
  bandwagon: { ru: 'Довод большинством', en: 'Appeal to popularity' },
  'false-dilemma': { ru: 'Ложная дилемма', en: 'False dilemma' },
  'slippery-slope': { ru: 'Скользкий склон', en: 'Slippery slope' },
  'hasty-generalization': { ru: 'Поспешное обобщение', en: 'Hasty generalisation' },
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

const sourcePrompts = [
  {
    ru: 'Какой фрагмент содержит логическую ошибку, если сверяться с официальным документом?',
    en: 'Which fragment contains a reasoning error when checked against the official record?',
  },
  {
    ru: 'Где учебная реплика делает вывод, которого не подтверждает официальный источник?',
    en: 'Where does the educational statement make a claim unsupported by the official source?',
  },
  {
    ru: 'Выберите фрагмент, в котором факт превращается в слишком сильный вывод.',
    en: 'Select the fragment that turns a fact into an overstrong conclusion.',
  },
  {
    ru: 'Какая из трёх реплик ломает рассуждение о реальном решении?',
    en: 'Which of the three statements breaks the reasoning about the real decision?',
  },
  {
    ru: 'Найдите логический скачок в учебном разборе официального материала.',
    en: 'Find the logical leap in this educational analysis of an official record.',
  },
  {
    ru: 'Какую реплику нельзя принять без дополнительных данных или проверки?',
    en: 'Which statement cannot be accepted without more evidence or verification?',
  },
]

function seededShuffle(items, seed = 20260721) {
  const result = [...items]
  let state = seed >>> 0
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x100000000
  }
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

const legacyRawCases = seededShuffle([
  ...realWorldRuBelCases,
  ...realWorldUaUsCases,
  ...realWorldEuCases,
])

const extraRawCases = seededShuffle([
  ...realWorldRussiaExtraCases,
  ...realWorldBelarusUkraineExtraCases,
  ...realWorldUsExtraCases,
  ...realWorldEuropeExtraCases,
], 20260722)

// Keep the first 50 IDs stable and retain the first 150 expansion cases.
// The remaining source material stays available for later catalog rotations.
const rawCases = [...legacyRawCases, ...extraRawCases.slice(0, 150)]

if (legacyRawCases.length !== 50) throw new Error('legacy_real_world_logic_catalog_must_contain_50_cases')
if (extraRawCases.length !== 200) throw new Error('extra_real_world_logic_catalog_must_contain_200_cases')
if (rawCases.length !== 200) throw new Error('documented_logic_catalog_must_contain_200_cases')

export const realWorldLogicChallenges = rawCases.map((item, index) => {
  const label = familyLabels[item.family]
  if (!label) throw new Error('unknown_logic_family:' + item.family)

  return {
    id: 'logic-real-' + String(index + 1).padStart(3, '0') + '-v1',
    family: item.family,
    contextId: 'real-' + String(index + 1).padStart(3, '0'),
    country: item.country,
    origin: 'documented',
    difficulty: item.difficulty,
    label,
    explanation: item.explanation,
    contextLabel: item.context,
    sourceType: {
      ru: 'Официальный источник и разбор аргумента',
      en: 'Official source and argument analysis',
    },
    prompt: sourcePrompts[index % sourcePrompts.length],
    segments: item.segments,
    correctIndex: item.correctIndex,
    source: item.source,
  }
})
