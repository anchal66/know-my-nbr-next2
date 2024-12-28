import Image from 'next/image'
import { FaCrown, FaHeart, FaRegComment, FaUserFriends, FaHandshake } from 'react-icons/fa'

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

interface UserFeatured {
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

export default function UserCardFeatured({ user }: { user: UserFeatured }) {
  // We'll show only the first image big (like normal user), but visually with a silver border & crown
  const mainImage = user.media[0]

  return (
    <div className="relative border-2 border-gray-400 p-4 rounded-lg bg-neutral-800 flex items-center space-x-4">
      {/* Featured crown in top-left corner */}
      <div className="absolute top-2 left-2 text-gray-300 text-xl">
        <FaCrown />
      </div>

      {/* Image */}
      {mainImage ? (
        <div className="relative w-24 h-24 rounded-md overflow-hidden">
          <Image
            src={mainImage.url}
            alt={`${user.name}'s profile`}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex items-center justify-center w-24 h-24 bg-neutral-700 text-gray-400 rounded-md">
          No Image
        </div>
      )}

      {/* User details */}
      <div className="flex-1 text-gray-200">
        <h2 className="text-lg font-bold text-gray-100">
          {user.name} (@{user.username})
        </h2>

        <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
          <span className="flex items-center gap-1">
            <span className="font-semibold">Age:</span> {user.age}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-semibold">Gender:</span> {user.gender.name}
          </span>
          <span className="flex items-center gap-1">
            <span className="font-semibold">Nationality:</span> {user.nationality.name}
          </span>
        </div>

        {/* Example stats with icons */}
        <div className="flex items-center gap-4 text-sm pt-2">
          <div className="flex items-center gap-1">
            <FaHeart className="text-red-500" />
            <span>{user.hearts ?? 100}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaRegComment />
            <span>{user.comments ?? 15}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaUserFriends />
            <span>{user.followers ?? 200}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaHandshake />
            <span>{user.matches ?? 10}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
