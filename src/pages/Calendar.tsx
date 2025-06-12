
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/useAuth';
import { useActivitySync } from '@/lib/hooks/useActivitySync';
import { useToast } from '@/lib/hooks/use-toast';
import { useTheme } from '@/lib/context/ThemeContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle,
  Circle,
  Book,
  Users,
  Bell,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';
import { doc, updateDoc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'personal' | 'church' | 'prayer' | 'reading';
  color: string;
  userId: string;
}

const Calendar_Page = () => {
  const { user } = useAuth();
  const { userStats, updateReadingProgress } = useActivitySync();
  const { toast } = useToast();
  const { theme } = useTheme();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [readingProgress, setReadingProgress] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: 'personal' as CalendarEvent['type'],
    date: new Date()
  });

  useEffect(() => {
    if (user) {
      loadEvents();
      loadReadingProgress();
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;

    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(eventsQuery);
      const userEvents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as CalendarEvent[];
      
      setEvents(userEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadReadingProgress = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setReadingProgress(userData.readingProgress || {});
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    }
  };

  const toggleReadingDay = async (date: Date) => {
    if (!user) return;

    const dateString = date.toDateString();
    const newProgress = { 
      ...readingProgress, 
      [dateString]: !readingProgress[dateString] 
    };

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        readingProgress: newProgress
      });
      setReadingProgress(newProgress);
      
      toast({
        title: readingProgress[dateString] ? 'Reading Unmarked' : 'Reading Completed!',
        description: readingProgress[dateString] 
          ? 'Reading progress removed for this day'
          : "Great job staying committed to God's Word!"
      });
    } catch (error) {
      console.error('Error updating reading progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update reading progress',
        variant: 'destructive'
      });
    }
  };

  const handleAddEvent = async () => {
    if (!user || !eventForm.title.trim()) return;

    setLoading(true);
    try {
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: eventForm.date,
        type: eventForm.type,
        color: getEventColor(eventForm.type),
        userId: user.uid,
        createdAt: new Date()
      };

      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
        toast({ title: 'Event updated successfully' });
      } else {
        await addDoc(collection(db, 'events'), eventData);
        toast({ title: 'Event added successfully' });
      }

      setEventForm({ title: '', description: '', type: 'personal', date: new Date() });
      setEditingEvent(null);
      setShowEventModal(false);
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'events', eventId));
      toast({ title: 'Event deleted successfully' });
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive'
      });
    }
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'personal': return 'bg-blue-500';
      case 'church': return 'bg-purple-500';
      case 'prayer': return 'bg-green-500';
      case 'reading': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const isReadingComplete = (date: Date) => {
    return readingProgress[date.toDateString()] || false;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-6 text-center">
            <CardContent>
              <p className="text-gray-600">Please sign in to view your calendar.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={cn(
        "min-h-screen p-4 transition-colors",
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      )}>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold">My Calendar</h1>
              <p className={cn(
                "mt-1",
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              )}>
                Track your reading progress and manage events
              </p>
            </div>
            
            <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Event title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Event description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Select
                    value={eventForm.type}
                    onValueChange={(value: CalendarEvent['type']) => 
                      setEventForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="church">Church</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddEvent} 
                      disabled={loading || !eventForm.title.trim()}
                      className="flex-1"
                    >
                      {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Add Event'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowEventModal(false);
                        setEditingEvent(null);
                        setEventForm({ title: '', description: '', type: 'personal', date: new Date() });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="reading">Reading Progress</TabsTrigger>
              <TabsTrigger value="events">Events List</TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Calendar */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5" />
                        <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={currentDate}
                      onMonthChange={setCurrentDate}
                      className="w-full"
                      components={{
                        Day: ({ date, ...props }) => {
                          const dayEvents = getEventsForDate(date);
                          const isReading = isReadingComplete(date);
                          
                          return (
                            <div className="relative">
                              <button
                                {...props}
                                className={cn(
                                  "w-full h-10 text-sm relative",
                                  "flex items-center justify-center rounded-lg",
                                )}
                              >
                                {date.getDate()}
                                {(dayEvents.length > 0 || isReading) && (
                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                    {isReading && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    )}
                                    {dayEvents.slice(0, 2).map((event, idx) => (
                                      <div
                                        key={idx}
                                        className={cn("w-2 h-2 rounded-full", getEventColor(event.type))}
                                      />
                                    ))}
                                  </div>
                                )}
                              </button>
                            </div>
                          );
                        }
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Selected Date Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDate && (
                      <>
                        {/* Reading Status */}
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {isReadingComplete(selectedDate) ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400" />
                            )}
                            <span className="text-sm font-medium">Daily Reading</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleReadingDay(selectedDate)}
                          >
                            {isReadingComplete(selectedDate) ? 'Unmark' : 'Complete'}
                          </Button>
                        </div>

                        {/* Events for selected date */}
                        <div className="space-y-2">
                          <h4 className="font-medium">Events</h4>
                          {getEventsForDate(selectedDate).map(event => (
                            <div key={event.id} className="p-2 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className={cn("w-3 h-3 rounded-full", getEventColor(event.type))} />
                                  <span className="text-sm font-medium">{event.title}</span>
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingEvent(event);
                                      setEventForm({
                                        title: event.title,
                                        description: event.description,
                                        type: event.type,
                                        date: event.date
                                      });
                                      setShowEventModal(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              {event.description && (
                                <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                              )}
                            </div>
                          ))}
                          {getEventsForDate(selectedDate).length === 0 && (
                            <p className="text-sm text-gray-500">No events for this date</p>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reading">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Book className="h-5 w-5" />
                    <span>Reading Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(readingProgress).filter(Boolean).length}
                      </div>
                      <p className="text-sm text-green-700">Days Complete</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round((Object.values(readingProgress).filter(Boolean).length / 90) * 100)}%
                      </div>
                      <p className="text-sm text-blue-700">Progress</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {userStats.readingStreak}
                      </div>
                      <p className="text-sm text-orange-700">Current Streak</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">90</div>
                      <p className="text-sm text-purple-700">Total Days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events
                      .sort((a, b) => a.date.getTime() - b.date.getTime())
                      .map(event => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={cn("w-4 h-4 rounded-full", getEventColor(event.type))} />
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-gray-600">
                                {event.date.toLocaleDateString()} • {event.type}
                              </p>
                              {event.description && (
                                <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingEvent(event);
                                setEventForm({
                                  title: event.title,
                                  description: event.description,
                                  type: event.type,
                                  date: event.date
                                });
                                setShowEventModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    {events.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        No events yet. Click "Add Event" to get started!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar_Page;
