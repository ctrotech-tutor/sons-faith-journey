import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const PostSkeleton = () => {
  return (
    <Card className="rounded-none border-x-0 border-t-0 shadow-none dark:bg-gray-900/60 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-3 mb-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      
      <Skeleton className="w-full aspect-square mb-3" />
      
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </Card>
  );
};

export default PostSkeleton;