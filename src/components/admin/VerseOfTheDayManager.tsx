
import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/lib/hooks/use-toast';
import { Plus, Edit, Trash2, BookOpen, Calendar } from 'lucide-react';

interface VerseOfTheDay {
  id: string;
  verse: string;
  reference: string;
  date: any;
  isActive: boolean;
  createdBy: string;
}

const VerseOfTheDayManager = () => {
  const { toast } = useToast();
  const [verses, setVerses] = useState<VerseOfTheDay[]>([]);
  const [newVerse, setNewVerse] = useState('');
  const [newReference, setNewReference] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingVerse, setEditingVerse] = useState<VerseOfTheDay | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const versesQuery = query(
      collection(db, 'verseOfTheDay'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(versesQuery, (snapshot) => {
      const versesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as VerseOfTheDay[];
      setVerses(versesData);
    });

    return unsubscribe;
  }, []);

  const addOrUpdateVerse = async () => {
    if (!newVerse.trim() || !newReference.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in both verse and reference fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const verseData = {
        verse: newVerse,
        reference: newReference,
        date: new Date(selectedDate),
        isActive: true,
        createdBy: 'admin'
      };

      if (editingVerse) {
        await updateDoc(doc(db, 'verseOfTheDay', editingVerse.id), verseData);
        toast({
          title: 'Verse Updated',
          description: 'Verse of the day has been updated successfully.'
        });
      } else {
        await addDoc(collection(db, 'verseOfTheDay'), verseData);
        toast({
          title: 'Verse Added',
          description: 'New verse of the day has been added.'
        });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving verse:', error);
      toast({
        title: 'Error',
        description: 'Failed to save verse. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const editVerse = (verse: VerseOfTheDay) => {
    setEditingVerse(verse);
    setNewVerse(verse.verse);
    setNewReference(verse.reference);
    setSelectedDate(verse.date?.toDate?.()?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]);
  };

  const deleteVerse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this verse?')) return;

    try {
      await deleteDoc(doc(db, 'verseOfTheDay', id));
      toast({
        title: 'Verse Deleted',
        description: 'Verse has been removed successfully.'
      });
    } catch (error) {
      console.error('Error deleting verse:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete verse. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setNewVerse('');
    setNewReference('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setEditingVerse(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>{editingVerse ? 'Edit Verse' : 'Add New Verse of the Day'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="verse">Verse Text</Label>
              <Textarea
                id="verse"
                value={newVerse}
                onChange={(e) => setNewVerse(e.target.value)}
                placeholder="Enter the verse text..."
                rows={4}
              />
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reference">Scripture Reference</Label>
                <Input
                  id="reference"
                  value={newReference}
                  onChange={(e) => setNewReference(e.target.value)}
                  placeholder="e.g., John 3:16"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={addOrUpdateVerse}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {editingVerse ? 'Update Verse' : 'Add Verse'}
            </Button>
            {editingVerse && (
              <Button
                onClick={resetForm}
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Verses ({verses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Verse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verses.map((verse) => (
                  <TableRow key={verse.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{verse.date?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{verse.reference}</TableCell>
                    <TableCell className="max-w-xs truncate">{verse.verse}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        verse.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {verse.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editVerse(verse)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteVerse(verse.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerseOfTheDayManager;
