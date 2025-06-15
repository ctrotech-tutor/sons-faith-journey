
import { useState } from 'react';
import { updateDoc, doc, deleteDoc, addDoc, collection, getDocs, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/lib/hooks/use-toast';

export const useCommunityActions = (user: any, userProfile: any, posts: any[]) => {
  const { toast } = useToast();
  const [expandedPosts, setExpandedPosts] = useState<{ [postId: string]: boolean }>({});
  const [likeAnimations, setLikeAnimations] = useState<{ [postId: string]: boolean }>({});
  const [bookmarkAnimations, setBookmarkAnimations] = useState<{ [postId: string]: boolean }>({});

  const toggleExpanded = (postId: string) => {
    setExpandedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const isLiked = post.likes.includes(user.uid);
      const updatedLikes = isLiked
        ? post.likes.filter(id => id !== user.uid)
        : [...post.likes, user.uid];

      await updateDoc(doc(db, 'communityPosts', postId), {
        likes: updatedLikes,
        likeCount: updatedLikes.length
      });

      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleLike = (postId: string) => {
    toggleLike(postId);
    setLikeAnimations((prev) => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setLikeAnimations((prev) => ({ ...prev, [postId]: false }));
    }, 300);
  };

  const toggleBookmark = async (postId: string) => {
    if (!user) return;

    try {
      const bookmarkQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('postId', '==', postId)
      );
      const snapshot = await getDocs(bookmarkQuery);
      const isBookmarked = !snapshot.empty;

      if (isBookmarked) {
        snapshot.docs.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, 'bookmarks', docSnapshot.id));
        });
        toast({
          title: 'Bookmark Removed',
          description: 'Post removed from your bookmarks.'
        });
      } else {
        const postDoc = await getDoc(doc(db, 'communityPosts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          await addDoc(collection(db, 'bookmarks'), {
            userId: user.uid,
            postId: postId,
            authorId: postData.authorId,
            authorName: postData.authorName,
            authorAvatar: postData.authorAvatar,
            content: postData.content,
            mediaUrl: postData.mediaUrl,
            mediaType: postData.mediaType,
            likes: postData.likes || [],
            likeCount: postData.likeCount || 0,
            commentCount: postData.commentCount || 0,
            timestamp: postData.timestamp,
            isAdmin: postData.isAdmin || false,
            bookmarkedAt: new Date()
          });
          toast({
            title: 'Post Bookmarked',
            description: 'Post saved to your bookmarks.'
          });
        }
      }

      setBookmarkAnimations(prev => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setBookmarkAnimations(prev => ({ ...prev, [postId]: false }));
      }, 300);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bookmark. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const sharePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      await updateDoc(doc(db, 'communityPosts', postId), {
        shareCount: (post.shareCount || 0) + 1
      });

      const shareUrl = `${window.location.origin}/community?post=${postId}`;
      const shareText = `Check out this post from ${post.authorName}: ${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Community Post - THE SONS',
            text: shareText,
            url: shareUrl
          });
          
          toast({
            title: 'Shared Successfully',
            description: 'Post has been shared!'
          });
          return;
        } catch (shareError) {
          console.log('Web Share API failed or canceled:', shareError);
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link Copied',
          description: 'Post link has been copied to clipboard.'
        });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast({
          title: 'Link Copied',
          description: 'Post link has been copied to clipboard.'
        });
      }

      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: 'Share Failed',
        description: 'Unable to share post. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const openCommentsModal = (postId: string) => {
    console.log('Opening comments modal for postId:', postId);
    
    if (user) {
      const postRef = doc(db, 'communityPosts', postId);
      updateDoc(postRef, {
        [`views.${user.uid}`]: new Date()
      }).catch(console.error);
    }
  };

  return {
    expandedPosts,
    likeAnimations,
    bookmarkAnimations,
    toggleExpanded,
    handleLike,
    toggleBookmark,
    sharePost,
    openCommentsModal
  };
};
