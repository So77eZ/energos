// Скелетон каталога — показывается, пока серверный компонент грузит напитки/отзывы.
// Header/footer из layout остаются на месте, скелетится только контент.
export default function Loading() {
  return (
    <div className="page page-home" aria-busy="true" aria-label="Загрузка каталога">
      <div className="skel skel-strip" />
      <div className="skel skel-sortbar" />
      <div className="grid grid-regular">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skel skel-card" />
        ))}
      </div>
    </div>
  )
}
