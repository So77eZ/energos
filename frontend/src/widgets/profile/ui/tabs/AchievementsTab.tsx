import { Medal, type EvaluatedAchievement } from '@entities/achievement'
import { Icons } from '@shared/ui/icons'

interface AchievementsTabProps {
  achievements: EvaluatedAchievement[]
}

export function AchievementsTab({ achievements }: AchievementsTabProps) {
  // секретные показываем только после разблокировки (без спойлера)
  const visible = achievements.filter((a) => a.source !== 'secret' || a.unlocked)
  const unlocked = visible.filter((a) => a.unlocked)
  const locked = visible.filter((a) => !a.unlocked)
  const sorted = [...unlocked, ...locked]

  return (
    <section className="prof-section">
      <div className="section-head">
        <h2 className="section-title">Все достижения</h2>
        <span className="section-sub">
          {unlocked.length} разблокировано · {locked.length} в процессе
        </span>
      </div>
      <div className="ach-grid">
        {sorted.map((a) => (
          <AchCard key={a.id} ach={a} />
        ))}
      </div>
    </section>
  )
}

function AchCard({ ach }: { ach: EvaluatedAchievement }) {
  return (
    <div className={`ach-card ${ach.unlocked ? 'unlocked' : 'locked'}`}>
      <div className={`ach-medal-wrap${!ach.unlocked ? ' bl-medal' : ''}${ach.awaitingBackend ? ' is-pending' : ''}`}>
        <Medal badge={ach} size="md" />
      </div>
      <div className="ach-info">
        <div className="ach-name">{ach.name}</div>
        <div className="ach-desc">{ach.desc}</div>
        {ach.unlocked ? (
          <div className="ach-date">разблокировано</div>
        ) : ach.awaitingBackend ? (
          <div className="bl-pending"><Icons.spinner w={12} /> ожидает данных</div>
        ) : (
          <div className="ach-progress">
            <div className="ach-progress-track">
              <div className="ach-progress-fill" style={{ width: `${ach.progress}%` }} />
            </div>
            <span>{ach.progress}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
