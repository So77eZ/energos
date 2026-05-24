import { TweaksBody } from '@widgets/tweaks-panel/ui/TweaksBody'

// Дублирует контент floating-панели TweaksPanel внутри вкладки профиля.
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
            Те же настройки доступны через плавающую кнопку в правом нижнем углу.
            Выбор сохраняется в браузере — на других устройствах нужно настроить заново.
          </p>
        </aside>
      </div>
    </section>
  )
}
