
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  doc,
  arrayUnion 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrayerRequest {
  id: string;
  content: string;
  authorName: string;
  authorId: string;
  createdAt: any;
  prayers: string[];
  isApproved: boolean;
}

const PrayerWall = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'prayerRequests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PrayerRequest[];

      // Filter approved requests for regular users
      const filteredRequests = userProfile?.isAdmin 
        ? requests 
        : requests.filter(req => req.isApproved);

      setPrayerRequests(filteredRequests);
    });

    return unsubscribe;
  }, [userProfile?.isAdmin]);

  const submitPrayerRequest = async () => {
    if (!user || !newRequest.trim() || loading) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'prayerRequests'), {
        content: newRequest.trim(),
        authorName: userProfile?.displayName || 'Anonymous',
        authorId: user.uid,
        createdAt: new Date(),
        prayers: [],
        isApproved: false
      });

      setNewRequest('');
      toast({
        title: 'Prayer Request Submitted',
        description: 'Your request is pending approval and will be visible soon.',
      });
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit prayer request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addPrayer = async (requestId: string) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'prayerRequests', requestId), {
        prayers: arrayUnion(user.uid)
      });

      toast({
        title: 'Prayer Added',
        description: 'Thank you for joining in prayer!',
      });
    } catch (error) {
      console.error('Error adding prayer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add prayer. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const approvePrayerRequest = async (requestId: string) => {
    if (!userProfile?.isAdmin) return;

    try {
      await updateDoc(doc(db, 'prayerRequests', requestId), {
        isApproved: true
      });

      toast({
        title: 'Request Approved',
        description: 'Prayer request is now visible to all users.',
      });
    } catch (error) {
      console.error('Error approving prayer request:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-purple-600" />
          <span>Prayer Wall</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Submit New Prayer Request */}
        {user && (
          <div className="space-y-3">
            <Textarea
              placeholder="Share your prayer request with the community..."
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={submitPrayerRequest}
              disabled={!newRequest.trim() || loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Prayer Request'}
            </Button>
          </div>
        )}

        {/* Prayer Requests */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {prayerRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{request.authorName}</span>
                    {!request.isApproved && userProfile?.isAdmin && (
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {request.createdAt?.toDate?.()?.toLocaleDateString()}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{request.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {user && !request.prayers.includes(user.uid) && (
                      <Button
                        onClick={() => addPrayer(request.id)}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Pray
                      </Button>
                    )}
                    <span className="text-xs text-gray-500">
                      {request.prayers.length} prayers
                    </span>
                  </div>
                  
                  {userProfile?.isAdmin && !request.isApproved && (
                    <Button
                      onClick={() => approvePrayerRequest(request.id)}
                      size="sm"
                      className="text-xs bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {prayerRequests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No prayer requests yet. Be the first to share!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrayerWall;
