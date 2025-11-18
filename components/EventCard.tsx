import Link from 'next/link'
import { title } from 'process'
import Image from 'next/image'

interface Props {
  title: string
  image: string
}
const EventCard = ({ title, image }: Props) => {
  return (
    <Link href={`/events`} id='event-card'>
      <Image src={image} alt='image' />

      <p className='title'>{title}</p>
    </Link>
  )
}

export default EventCard
