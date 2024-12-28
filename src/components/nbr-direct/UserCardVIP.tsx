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

interface UserVIP {
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

export default function UserCardVIP({ user }: { user: UserVIP }) {
  // We’ll show up to 3 images. The first one is big, the next two side by side, same height as the first
  const imagesToShow = user.media.slice(0, 3)

  return (
    <div className="relative border-2 border-yellow-400 p-4 rounded-lg bg-neutral-800 flex flex-col md:flex-row">
      {/* VIP crown in top-left corner */}
      <div className="absolute top-2 left-2 text-yellow-400 text-2xl">
        <FaCrown />
      </div>

      <div className="flex flex-col md:flex-row">
        {/* First (largest) image */}
        {imagesToShow[0] ? (
          <div className="relative w-full md:w-60 h-60 md:h-60 mr-2 mb-2 md:mb-0">
            <Image
              src={imagesToShow[0].url}
              alt={`${user.name}'s profile`}
              fill
              className="object-cover rounded-md"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full md:w-60 h-60 md:h-60 bg-neutral-700 text-gray-400 rounded-md mr-2 mb-2 md:mb-0">
            No Image
          </div>
        )}

        {/* Next two images stacked horizontally */}
        <div className="flex md:flex-col md:justify-start space-x-2 md:space-x-0 md:space-y-2">
          {imagesToShow[1] ? (
            <div className="relative w-28 h-28 rounded-md overflow-hidden">
              <Image
                src={imagesToShow[1].url}
                alt="Additional Image"
                fill
                className="object-cover"
              />
            </div>
          ) : null}
          {imagesToShow[2] ? (
            <div className="relative w-28 h-28 rounded-md overflow-hidden">
              <Image
                src={imagesToShow[2].url}
                alt="Additional Image"
                fill
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* User details */}
      <div className="flex-1 mt-2 md:mt-0 md:ml-4 text-gray-200 space-y-2">
        <h2 className="text-xl font-bold text-yellow-300">
          {user.name} (@{user.username})
        </h2>

        <div className="flex flex-wrap items-center gap-2 text-sm">
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
            <span>{user.hearts ?? 128}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaRegComment />
            <span>{user.comments ?? 42}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaUserFriends />
            <span>{user.followers ?? 300}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaHandshake />
            <span>{user.matches ?? 12}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
