import { useState } from 'react'
import { useT } from '../i18n'
import { Panel } from '../ui/components'

const transactionTypes = [
  { key: 'document', ru: 'документ', en: 'document', ruText: 'публикует хэш файла или метаданных; сам текст может лежать на сайте, а сеть доказывает, что байты не подменили.', enText: 'anchors a file or metadata hash; the site may store the text, while the network proves the bytes were not changed.' },
  { key: 'election_created', ru: 'голосование создано', en: 'election created', ruText: 'фиксирует предмет решения, категорию, сроки, порог принятия, кворум и снимок весов.', enText: 'records the decision subject, category, dates, pass threshold, quorum, and frozen weight snapshot.' },
  { key: 'vote', ru: 'голос', en: 'vote', ruText: 'показывает, какой аккаунт подписал бюллетень и как он распределил 100% своего веса.', enText: 'shows which account signed a ballot and how that account split 100% of its weight.' },
  { key: 'revote', ru: 'переголосование', en: 'revote', ruText: 'заменяет текущий вклад в подсчёте; старая ревизия остаётся в журнале как история.', enText: 'replaces the current tally contribution; the previous revision remains in the log as history.' },
  { key: 'finalized', ru: 'завершено', en: 'finalized', ruText: 'фиксирует итог после дедлайна: кворум, поддержку и принято ли решение.', enText: 'records the final result after the deadline: quorum, support, and whether the decision passed.' },
  { key: 'admin', ru: 'управление', en: 'governance', ruText: 'изменяет роли, правила или служебные параметры организации через разрешённого администратора.', enText: 'changes roles, rules, or organization parameters through an authorized administrator.' },
]

const fields = [
  { ru: 'Дата', en: 'Date', ruText: 'время транзакции или записи, приведённое сайтом для чтения.', enText: 'the transaction or record time formatted by the site.' },
  { ru: 'Тип', en: 'Type', ruText: 'класс действия: документ, голос, снимок, итог, управление и так далее.', enText: 'the action class: document, vote, snapshot, result, governance, and so on.' },
  { ru: 'Участник', en: 'Actor', ruText: 'адрес кошелька или связанная с ним личность из реестра сайта.', enText: 'the wallet address or the linked registry identity shown by the site.' },
  { ru: 'Событие', en: 'Event', ruText: 'человеческое описание того, что произошло; это удобная подпись, а не отдельное доказательство.', enText: 'a human-readable description; useful context, not a separate proof.' },
  { ru: 'Доказательство', en: 'Proof', ruText: 'хэш транзакции и версия реестра. По ним можно открыть Aptos Explorer и сверить запись независимо.', enText: 'the transaction hash and ledger version. Use them in Aptos Explorer to verify the record independently.' },
]

export function AuditExplainer() {
  const { lang } = useT()
  const ru = lang === 'ru'
  const [open, setOpen] = useState(false)

  return (
    <div className="audit-explainer">
      <button className="btn small" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {ru ? 'Как читать журнал' : 'How to read the log'}
      </button>
      {open && (
        <Panel className="audit-explainer-panel">
          <div className="callout" style={{ marginBottom: 14 }}>
            {ru
              ? 'Members-only означает видимость внутри сайта: интерфейсы, списки и рабочие страницы доступны только участникам организации. On-chain доказательства в публичной сети остаются публичными: если у человека есть хэш транзакции, он сможет сверить её в обозревателе.'
              : 'Members-only controls visibility inside the website: interfaces, lists, and workspace pages are available only to organization members. On-chain proofs in a public network remain public: anyone with a transaction hash can verify it in an explorer.'}
          </div>
          <div className="grid c2">
            <div className="stack">
              <h3>{ru ? 'Поля строки' : 'Row fields'}</h3>
              {fields.map((field) => (
                <div key={field.en} className="audit-help-item">
                  <strong>{ru ? field.ru : field.en}</strong>
                  <span>{ru ? field.ruText : field.enText}</span>
                </div>
              ))}
            </div>
            <div className="stack">
              <h3>{ru ? 'Примеры типов' : 'Type examples'}</h3>
              {transactionTypes.map((item) => (
                <div key={item.key} className="audit-help-item">
                  <span className="chip mono mute">{ru ? item.ru : item.en}</span>
                  <span>{ru ? item.ruText : item.enText}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="callout green" style={{ marginTop: 14 }}>
            {ru
              ? 'Практическая проверка: нажмите «Сверить», откройте транзакцию в Aptos Explorer, сравните адрес модуля, функцию, отправителя, события и итоговые числа с тем, что показывает сайт.'
              : 'Practical check: click Verify, open the transaction in Aptos Explorer, and compare the module address, function, sender, events, and final numbers with the site.'}
          </div>
        </Panel>
      )}
    </div>
  )
}
