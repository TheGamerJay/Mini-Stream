import VideoCard from './VideoCard'
import './HorizontalRow.css'

export default function HorizontalRow({ title, items = [], type = 'video' }) {
  if (!items || items.length === 0) return null
  return (
    <section className="h-row">
      <h2 className="h-row__title">{title}</h2>
      <div className="h-row__scroll">
        {items.map((item) => (
          <VideoCard key={item.id} item={item} type={type} />
        ))}
      </div>
    </section>
  )
}
