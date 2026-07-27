import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { useOrganization } from '../tenancy/OrganizationContext'
import { DEFAULT_ORGANIZATION_SLUG } from '../tenancy/organization'

const workflow = {
  ru: [
    ['01', 'Предложение', 'Автор показывает действующий текст, то, как его предлагают изменить, и объясняет причину.'],
    ['02', 'Условия', 'До первого голоса известны участники, вес их мнения, минимальная доля участия, необходимая поддержка и точное время окончания.'],
    ['03', 'Результат', 'После подсчёта остаются итог голосования, новая либо прежняя версия документа, квитанции и история изменений.'],
  ],
  en: [
    ['01', 'Proposal', 'The author shows the current wording, the proposed change, and the reason for it.'],
    ['02', 'Conditions', 'Before the first ballot, participants, opinion weights, minimum turnout, required support, and the exact closing time are known.'],
    ['03', 'Result', 'The count leaves a result, either the new or previous document version, receipts, and a change history.'],
  ],
} as const

export default function PlatformLanding() {
  const { lang } = useT()
  const { orgSlug, branding, config } = useOrganization()
  const exampleDialogRef = useRef<HTMLDialogElement>(null)
  const ru = lang === 'ru'
  const platformHome = orgSlug === DEFAULT_ORGANIZATION_SLUG

  const title = platformHome ? (ru ? 'Новый Путь' : 'New Path') : branding.displayName
  const lead = platformHome
    ? (ru
        ? 'Помогаем группе людей договориться о правилах, принять решение и потом проверить его путь.'
        : 'We help a group agree on the rules, make a decision, and then verify its path.')
    : (config?.description || (ru
        ? 'Пространство организации для документов, предложений, голосований и проверяемой истории решений.'
        : 'An organization workspace for documents, proposals, votes, and a verifiable history of decisions.'))

  const closeExample = () => exampleDialogRef.current?.close()

  return (
    <div className="platform-landing">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-scrim" />
        <div className="landing-hero-content">
          <p className="landing-eyebrow">
            {platformHome
              ? (ru ? 'Для команд, советов и общественных организаций' : 'For teams, councils, and civic organizations')
              : (ru ? 'Пространство организации' : 'Organization workspace')}
          </p>
          <h1 id="landing-title">{title}</h1>
          <p className="landing-lead">{lead}</p>
          <div className="landing-actions">
            <Link className="btn primary" to="/">{ru ? 'Перейти к обзору' : 'Open overview'}</Link>
            <Link className="btn landing-secondary-action" to="/documents">{ru ? 'Посмотреть документы' : 'Browse documents'}</Link>
          </div>
          <div className="landing-facts" aria-label={ru ? 'Основные свойства' : 'Key properties'}>
            <span>{ru ? 'Видно, что меняют' : 'See what changes'}</span>
            <span>{ru ? 'Понятно, как считают' : 'Know how votes count'}</span>
            <span>{ru ? 'Можно проверить итог' : 'Verify the result'}</span>
          </div>
        </div>
      </section>

      {platformHome && (
        <section className="landing-band landing-story" aria-labelledby="landing-story-title">
          <div className="landing-band-grid">
            <div>
              <p className="landing-section-label">{ru ? 'С чего начинается идея?' : 'Where does the idea begin?'}</p>
              <h2 id="landing-story-title">
                {ru ? 'У толпы нет мудрости по умолчанию' : 'A crowd is not wise by default'}
              </h2>
            </div>
            <div className="landing-story-copy">
              <p>
                {ru
                  ? 'Есть известная история о сельской ярмарке: люди независимо оценивали вес быка, а средняя оценка оказалась очень близкой к результату взвешивания. Её часто пересказывают как доказательство того, что случайная толпа способна найти правильный ответ.'
                  : 'A well-known story tells of a country fair where people independently estimated an ox’s weight and the average came very close to the measured result. It is often retold as proof that a random crowd can find the right answer.'}
              </p>
              <p>
                {ru
                  ? 'Для нас важна оговорка, которая часто теряется в пересказе: это была животноводческая ярмарка, а Гальтон сам упоминал среди участников фермеров и мясников. Мы читаем этот опыт осторожнее: в 1907 году нельзя было проверить квалификационный вес каждого ответа, поэтому результат говорит не о безусловной мудрости случайной толпы, а о ценности группы, знакомой с предметом.'
                  : 'One qualification often disappears in the retelling: this was a livestock fair, and Galton himself mentioned farmers and butchers among the participants. We read the result more cautiously. In 1907 there was no practical way to test the knowledge behind each estimate, so the case speaks less to the unconditional wisdom of a random crowd than to the value of a group familiar with the subject.'}
              </p>
              <a
                className="landing-source-link"
                href="https://www.nature.com/articles/075450a0"
                target="_blank"
                rel="noreferrer"
              >
                {ru ? 'Ф. Гальтон, «Vox Populi», Nature, 1907' : 'F. Galton, “Vox Populi,” Nature, 1907'} ↗
              </a>
            </div>
          </div>
          <p className="landing-story-thesis">
            {ru
              ? 'Нам важно не просто собрать большинство, а понимать, кто разбирается в теме и как его мнение вошло в результат.'
              : 'It is not enough to collect a majority. We need to know who understands the subject and how that opinion entered the result.'}
          </p>
        </section>
      )}

      <section className="landing-band landing-example" aria-labelledby="landing-example-title">
        <div className="landing-example-copy">
          <p className="landing-section-label">{ru ? 'Как выглядит голосование?' : 'What does a vote look like?'}</p>
          <h2 id="landing-example-title">
            {ru ? 'Пример: организация имеет пункт бюджета' : 'Example: an organization has a budget clause'}
          </h2>
          <p>
            {ru
              ? 'На одной странице показаны действующий пункт, то, как его предлагают изменить, обоснование, срок и панель голосования.'
              : 'One page shows the current clause, the proposed change, the rationale, the deadline, and the voting panel.'}
          </p>
          <div className="landing-clause-example">
            <span>{ru ? 'Сейчас' : 'Current'}</span>
            <p>{ru ? 'Резервный фонд используется по решению координатора.' : 'The reserve fund is used at the coordinator’s discretion.'}</p>
            <span>{ru ? 'Предлагаемое изменение' : 'Proposed change'}</span>
            <p>{ru ? '15% фонда ежегодно направляется на открытую программу юридической помощи.' : '15% of the fund is assigned each year to an open legal-aid program.'}</p>
            <span>{ru ? 'Обоснование' : 'Rationale'}</span>
            <p>{ru ? 'Участники заранее знают назначение денег и могут проверить расходы после решения.' : 'Members know the purpose of the funds in advance and can verify the spending after the decision.'}</p>
          </div>
        </div>
        <figure className="landing-workflow-figure">
          <button
            className="landing-workflow-open"
            type="button"
            onClick={() => exampleDialogRef.current?.showModal()}
            aria-label={ru ? 'Увеличить пример страницы голосования' : 'Enlarge the voting-page example'}
          >
            <img src="/images/voting-workflow.png" alt={ru ? 'Путь предложения от документа к проверяемому решению' : 'A proposal moving from document to verifiable decision'} />
            <span>{ru ? 'Увеличить' : 'Enlarge'}</span>
          </button>
        </figure>
      </section>

      <dialog
        ref={exampleDialogRef}
        className="landing-image-dialog"
        aria-labelledby="landing-image-dialog-title"
        onCancel={closeExample}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeExample()
        }}
      >
        <div className="landing-image-dialog-body">
          <div className="landing-image-dialog-head">
            <h2 id="landing-image-dialog-title">{ru ? 'Пример страницы голосования' : 'Voting-page example'}</h2>
            <button className="icon-btn" type="button" onClick={closeExample} aria-label={ru ? 'Закрыть' : 'Close'}>×</button>
          </div>
          <img src="/images/voting-workflow.png" alt={ru ? 'Путь предложения от документа к проверяемому решению' : 'A proposal moving from document to verifiable decision'} />
        </div>
      </dialog>

      <section className="landing-band landing-process" aria-labelledby="landing-process-title">
        <div>
          <p className="landing-section-label">{ru ? 'Как проходит решение?' : 'How does a decision move?'}</p>
          <h2 id="landing-process-title">{ru ? 'Предложение, условия, результат' : 'Proposal, conditions, result'}</h2>
        </div>
        <ol className="landing-steps">
          {workflow[lang].map(([number, heading, body]) => (
            <li key={number} className="landing-step">
              <span className="landing-step-number">{number}</span>
              <h3>{heading}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing-band landing-weights" aria-labelledby="landing-weights-title">
        <div>
          <p className="landing-section-label">{ru ? 'Почему голоса могут весить по-разному?' : 'Why may votes carry different weight?'}</p>
          <h2 id="landing-weights-title">
            {ru ? 'Компетентность относится к теме, а не к человеку вообще' : 'Expertise belongs to a subject, not to a person in general'}
          </h2>
        </div>
        <div className="landing-principles">
          <p>
            <strong>{ru ? 'Вес голоса привязан к категории знаний.' : 'Vote weight belongs to a field of knowledge.'}</strong>{' '}
            {ru ? 'Экономист может иметь высокий уровень в экономике и нулевой в экологии.' : 'An economist may have a high level in economics and no level in ecology.'}
          </p>
          <p>
            <strong>{ru ? 'Уровень можно пересмотреть.' : 'A level can change.'}</strong>{' '}
            {ru ? 'Он повышается после экзамена и может измениться между голосованиями.' : 'It can rise after an exam and be revised between votes.'}
          </p>
          <p>
            <strong>{ru ? 'Прошлое не переписывается.' : 'Past decisions do not move.'}</strong>{' '}
            {ru ? 'Перед стартом создаётся снимок состава и весов. Новая квалификация не меняет уже поданный голос.' : 'A membership and weight snapshot is created before voting. A later qualification does not alter an earlier ballot.'}
          </p>
        </div>
      </section>

      <section className="landing-band landing-proof" aria-labelledby="landing-proof-title">
        <div>
          <p className="landing-section-label">{ru ? 'В чём роль блокчейна?' : 'What is the blockchain for?'}</p>
          <h2 id="landing-proof-title">
            {ru ? 'Он публично сохраняет историю голосования' : 'It keeps the voting history public'}
          </h2>
        </div>
        <div className="landing-proof-columns">
          <div>
            <h3>{ru ? 'Что можно проверить?' : 'What can be verified?'}</h3>
            <ul>
              <li>{ru ? 'какая версия документа была вынесена на голосование;' : 'which document version was put to a vote;'}</li>
              <li>{ru ? 'кто имел право участвовать, какой вес действовал и какая доля участия требовалась;' : 'who could participate, which weight applied, and what turnout was required;'}</li>
              <li>{ru ? 'какие голоса были записаны и какой итог зафиксирован.' : 'which ballots were recorded and which result was finalized.'}</li>
            </ul>
          </div>
          <div>
            <h3>{ru ? 'Чего блокчейн не решает?' : 'What does it not decide?'}</h3>
            <ul>
              <li>{ru ? 'кто действительно компетентен — это определяет процедура организации;' : 'who is genuinely competent — the organization’s process decides that;'}</li>
              <li>{ru ? 'полезно ли само предложение и хорошо ли составлен документ;' : 'whether the proposal itself is useful or the document is well written;'}</li>
              <li>{ru ? 'достаточно ли участники обсудили последствия решения.' : 'whether participants discussed the consequences thoroughly enough.'}</li>
            </ul>
          </div>
        </div>
      </section>

      {platformHome && (
        <section className="landing-band landing-organization-entry">
          <div>
            <p className="landing-section-label">{ru ? 'Как подключить организацию?' : 'How can an organization join?'}</p>
            <h2>{ru ? 'Собственное пространство на поддомене' : 'A workspace on its own subdomain'}</h2>
            <p>
              {ru
                ? 'Команда, движение или общественная организация настраивает участников, роли, документы и правила доступа. После проверки пространство открывается по адресу вроде team.novyway.com; до одобрения заявка видна только её автору и платформенному супер-администратору.'
                : 'A team, movement, or civic organization configures its members, roles, documents, and access rules. After review, its workspace opens at an address such as team.novyway.com. Before approval, the application is visible only to its author and the platform super administrator.'}
            </p>
          </div>
          <Link className="btn" to="/organizations/new">{ru ? 'Создать организацию' : 'Create organization'}</Link>
        </section>
      )}

      <section className="landing-band landing-entry">
        <div>
          <h2>{ru ? 'Начните с обзора' : 'Start with the overview'}</h2>
        </div>
        <div className="landing-entry-actions">
          <Link className="btn primary" to="/">{ru ? 'Открыть обзор' : 'Open overview'}</Link>
          <Link className="btn" to="/auth">{ru ? 'Войти' : 'Sign in'}</Link>
        </div>
      </section>
    </div>
  )
}
