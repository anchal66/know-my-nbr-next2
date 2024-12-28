import Image from 'next/image'
import Link from 'next/link'
import { FaHeart, FaRegComment, FaUserFriends, FaHandshake } from 'react-icons/fa'

interface MediaItem {
  id: string
  type: string
  url: string
  orderNo: number
  isVerified: boolean
  isWatermarked: boolean
}

interface GenderItem {
  id: number
  name: string
}

interface OrientationItem {
  id: number
  name: string
}

interface NationalityItem {
  id: number
  name: string
}

interface UserNormal {
  userId: string
  username: string
  name: string
  age: number
  gender: GenderItem
  orientation: OrientationItem
  media: MediaItem[]
  nationality: NationalityItem
  // Hard-coded stats
  hearts?: number
  comments?: number
  followers?: number
  matches?: number
}

export default function UserCardNormal({ user }: { user: UserNormal }) {
  const mainImage = user.media[0]

  return (
    <li className="border border-gray-700 p-2 rounded flex items-center space-x-4 bg-neutral-800 relative">
      {/* Image */}
      <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={`${user.name}'s profile`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-neutral-700 flex items-center justify-center text-gray-300">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-gray-200">
        <Link
          href={`/${user.username}`}
          className="font-semibold text-brand-gold hover:underline"
        >
          {user.name} (@{user.username})
        </Link>
        <div className="text-sm mt-1 flex flex-wrap gap-2">
          <span>Age: {user.age}</span>
          <span>Gender: {user.gender.name}</span>
          <span>Nationality: {user.nationality.name}</span>
        </div>

        {/* Example stats with icons */}
        <div className="flex items-center gap-4 text-sm pt-2">
          <div className="flex items-center gap-1">
            <FaHeart className="text-red-500" />
            <span>{user.hearts ?? 50}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaRegComment />
            <span>{user.comments ?? 10}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaUserFriends />
            <span>{user.followers ?? 120}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaHandshake />
            <span>{user.matches ?? 5}</span>
          </div>
        </div>
      </div>
    </li>
  )
}
