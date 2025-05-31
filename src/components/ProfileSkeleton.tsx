import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ProfileSkeleton = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 space-y-6">
    <Skeleton circle height={80} width={80} />
    <Skeleton height={24} width={160} />
    <Skeleton height={16} width={240} />
    <div className="w-full max-w-md space-y-4 mt-4">
      <Skeleton height={20} />
      <Skeleton height={20} />
      <Skeleton height={20} />
      <Skeleton height={20} />
    </div>
  </div>
    </>
  )
}

export default ProfileSkeleton
