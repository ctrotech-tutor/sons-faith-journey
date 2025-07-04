import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { ArrowLeft, Heart, Copy, Share, Trash2, Search, Filter, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import MetaUpdater from '@/components/MetaUpdater';

interface FavoriteVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
  addedDate: any;
  tags?: string[];
  note?: string;
}

const FavoritesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [favoriteVerses, setFavoriteVerses] = useState<FavoriteVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'book'>('all');
  const [selectedBook, setSelectedBook] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      navigate('/community');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const verses = data.favoriteVerses || [];
        setFavoriteVerses(verses.sort((a: FavoriteVerse, b: FavoriteVerse) => {
          const dateA = a.addedDate?.toDate ? a.addedDate.toDate() : new Date(a.addedDate);
          const dateB = b.addedDate?.toDate ? b.addedDate.toDate() : new Date(b.addedDate);
          return dateB.getTime() - dateA.getTime();
        }));
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user, navigate]);

  const removeFavorite = async (verseId: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedVerses = favoriteVerses.filter(verse => verse.id !== verseId);
      
      await updateDoc(userDocRef, {
        favoriteVerses: updatedVerses
      });

      toast({
        title: "Removed from favorites",
        description: "The verse has been removed from your favorites.",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove verse from favorites.",
        variant: "destructive"
      });
    }
  };

  const copyVerse = async (verse: FavoriteVerse) => {
    const text = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse} (${verse.version.toUpperCase()})`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${verse.book} ${verse.chapter}:${verse.verse} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy verse",
        variant: "destructive",
      });
    }
  };

  const shareVerse = async (verse: FavoriteVerse) => {
    const text = `"${verse.text}" - ${verse.book} ${verse.chapter}:${verse.verse}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${verse.book} ${verse.chapter}:${verse.verse}`,
          text,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      copyVerse(verse);
    }
  };

  const getFilteredVerses = () => {
    let filtered = favoriteVerses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(verse =>
        verse.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verse.book.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verse.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Book filter
    if (selectedBook !== 'all') {
      filtered = filtered.filter(verse => verse.book === selectedBook);
    }

    // Sort filter
    if (filterBy === 'book') {
      filtered.sort((a, b) => {
        if (a.book === b.book) {
          if (a.chapter === b.chapter) {
            return a.verse - b.verse;
          }
          return a.chapter - b.chapter;
        }
        return a.book.localeCompare(b.book);
      });
    }

    return filtered;
  };

  const getUniqueBooks = () => {
    const books = [...new Set(favoriteVerses.map(verse => verse.book))];
    return books.sort();
  };

  const getStatistics = () => {
    const totalVerses = favoriteVerses.length;
    const uniqueBooks = getUniqueBooks().length;
    const recentlyAdded = favoriteVerses.filter(verse => {
      const addedDate = verse.addedDate?.toDate ? verse.addedDate.toDate() : new Date(verse.addedDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return addedDate > weekAgo;
    }).length;

    return { totalVerses, uniqueBooks, recentlyAdded };
  };

  const filteredVerses = getFilteredVerses();
  const stats = getStatistics();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to view your favorite verses.
          </p>
          <Button onClick={() => navigate('/auth/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MetaUpdater
        title="My Favorite Verses"
        description="Your collection of favorite Bible verses and spiritual inspiration"
      />
      
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-500" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  My Favorites
                </h1>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {stats.totalVerses} verses
            </Badge>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 p-4 border-b dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.totalVerses}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Verses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.uniqueBooks}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Books</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.recentlyAdded}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">This Week</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-4 space-y-4 border-b dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search verses, books, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verses</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="book">By Book Order</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger className="w-full sm:w-48">
                <BookOpen className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                {getUniqueBooks().map(book => (
                  <SelectItem key={book} value={book}>{book}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Verses List */}
        <div className="p-4">
          {filteredVerses.length > 0 ? (
            <div className="space-y-4">
              {filteredVerses.map((verse) => (
                <Card key={verse.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Verse Reference */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-sm font-medium">
                            {verse.book} {verse.chapter}:{verse.verse}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {verse.version.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Added {verse.addedDate?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </div>
                      </div>

                      {/* Verse Text */}
                      <blockquote className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 italic border-l-4 border-purple-500 pl-4">
                        "{verse.text}"
                      </blockquote>

                      {/* Note */}
                      {verse.note && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            <strong>Note:</strong> {verse.note}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {verse.tags && verse.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {verse.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyVerse(verse)}
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => shareVerse(verse)}
                            className="text-gray-600 dark:text-gray-400 hover:text-green-600"
                          >
                            <Share className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFavorite(verse.id)}
                          className="text-gray-600 dark:text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💝</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {searchTerm || selectedBook !== 'all' 
                  ? 'No matching verses found' 
                  : 'No favorite verses yet'
                }
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6">
                {searchTerm || selectedBook !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start building your collection by adding verses to favorites while reading the Bible'
                }
              </p>
              <Button onClick={() => navigate('/bible')}>
                Browse Bible
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;