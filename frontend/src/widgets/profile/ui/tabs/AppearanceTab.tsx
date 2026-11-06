import { TweaksBody } from '@shared/ui/tweaks-body'

// Полные настройки оформления. В плавающей панели доступны тема и акцент.
// Сетка 2 колонки на широких экранах — настройки слева, info-блок справа.
export function AppearanceTab() {
  return (
    <section className="prof-section">
      <div className="prof-appearance">
        <div className="prof-appearance-panel">
          <TweaksBody />
        </div>
        <aside className="prof-appearance-aside">
          <h3 className="prof-appearance-title">Оформление</h3>
          <p className="prof-appearance-blurb">
            Тему и акцент можно быстро поменять через кнопку справа внизу.
            Изменения применяются сразу и сохраняются в этом браузере.
          </p>
        </aside>
      </div>
    </section>
  )
}
