import Image from 'next/image'
import Link from 'next/link'
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
    // Show up to 3 images
    const imagesToShow = user.media.slice(0, 3)

    return (
        <li className="relative border-2 border-gray-400 p-3 rounded-lg bg-neutral-800 flex flex-col md:flex-row hover:bg-gray-400 hover:bg-opacity-5">
            {/* Featured crown in top-left corner */}
            <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 text-gray-300 text-3xl z-10">
                <FaCrown />
            </div>

            <div className="flex flex-col md:flex-row">
                {/* First (largest) image */}
                {imagesToShow[0] ? (
                    <div className="relative w-full md:w-44 h-44 md:h-44 mr-2 mb-2 md:mb-0">
                        <Image
                            src={imagesToShow[0].url}
                            alt={`${user.name}'s profile`}
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full md:w-44 h-44 md:h-44 bg-neutral-700 text-gray-400 rounded-md mr-2 mb-2 md:mb-0">
                        No Image
                    </div>
                )}

                {/* Next two images stacked horizontally */}
                <div className="flex md:flex-col md:justify-start space-x-2 md:space-x-0 md:space-y-2">
                    {imagesToShow[1] ? (
                        <div className="relative w-20 h-20 rounded-md overflow-hidden">
                            <Image
                                src={imagesToShow[1].url}
                                alt="Additional Image"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : null}
                    {imagesToShow[2] ? (
                        <div className="relative w-20 h-20 rounded-md overflow-hidden">
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
                <Link
                    href={`/${user.username}`}
                    className="hover:underline"
                >
                    <h2 className="text-lg font-bold text-gray-100">
                        {user.name} (@{user.username})
                    </h2>
                </Link>
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
        </li>
    )
}
