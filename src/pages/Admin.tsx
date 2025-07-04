import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, addDoc, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/lib/hooks/use-toast';
import { LogIn, Users, FileText, Plus, Edit, Trash2, Eye, Calendar, BarChart2, BookOpen, User, EyeOff, Activity, Monitor } from 'lucide-react';
import Layout from '@/components/Layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import UserTrackingDashboard from '@/components/admin/UserTrackingDashboard';
import VerseOfTheDayManager from '@/components/admin/VerseOfTheDayManager';
import RealTimeUserTracker from '@/components/admin/RealTimeUserTracker';
import AdvancedUserDashboard from '@/components/admin/AdvancedUserDashboard';

interface Registration {
  id: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  email: string;
  location: string;
  expectations: string;
  registeredAt: any;
}

interface Devotional {
  id: string;
  title: string;
  content: string;
  scripture: string;
  imageURL?: string;
  date: any;
  createdBy: string;
}

const Admin = () => {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(false);
  const [devotionalTitle, setDevotionalTitle] = useState('');
  const [devotionalContent, setDevotionalContent] = useState('');
  const [devotionalScripture, setDevotionalScripture] = useState('');
  const [devotionalImageURL, setDevotionalImageURL] = useState('');
  const [editingDevotional, setEditingDevotional] = useState<Devotional | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
      fetchDevotionals();
    }
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      const registrationsQuery = query(
        collection(db, 'registrations'),
        orderBy('registeredAt', 'desc')
      );
      const querySnapshot = await getDocs(registrationsQuery);
      const regs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Registration[];
      setRegistrations(regs);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchDevotionals = async () => {
    try {
      const devotionalsQuery = query(
        collection(db, 'devotionals'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(devotionalsQuery);
      const devs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Devotional[];
      setDevotionals(devs);
    } catch (error) {
      console.error('Error fetching devotionals:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'Login Successful',
        description: 'Welcome to the admin panel!'
      });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const MiniChart = ({ color }: { color: string }) => {
    return (
      <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full animate-pulse"
          style={{ width: "0%", backgroundColor: color }}
        />
      </div>
    );
  };

  const addOrUpdateDevotional = async () => {
    if (!devotionalTitle || !devotionalContent || !devotionalScripture) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required devotional fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const devotionalData = {
        title: devotionalTitle,
        content: devotionalContent,
        scripture: devotionalScripture,
        imageURL: devotionalImageURL || null,
        date: new Date(),
        createdBy: user?.email
      };

      if (editingDevotional) {
        await updateDoc(doc(db, 'devotionals', editingDevotional.id), devotionalData);
        toast({
          title: 'Devotional Updated',
          description: 'Devotional content has been updated successfully.'
        });
      } else {
        await addDoc(collection(db, 'devotionals'), devotionalData);
        toast({
          title: 'Devotional Added',
          description: 'New devotional content has been published.'
        });
      }

      resetForm();
      fetchDevotionals();
    } catch (error) {
      console.error('Error saving devotional:', error);
      toast({
        title: 'Error',
        description: 'Failed to save devotional. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const editDevotional = (devotional: Devotional) => {
    setEditingDevotional(devotional);
    setDevotionalTitle(devotional.title);
    setDevotionalContent(devotional.content);
    setDevotionalScripture(devotional.scripture);
    setDevotionalImageURL(devotional.imageURL || '');
  };

  const deleteDevotional = async (id: string) => {
    if (!confirm('Are you sure you want to delete this devotional?')) return;

    try {
      await deleteDoc(doc(db, 'devotionals', id));
      toast({
        title: 'Devotional Deleted',
        description: 'Devotional has been removed successfully.'
      });
      fetchDevotionals();
    } catch (error) {
      console.error('Error deleting devotional:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete devotional. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;

    try {
      await deleteDoc(doc(db, 'registrations', id));
      toast({
        title: 'Registration Deleted',
        description: 'Registration has been removed successfully.'
      });
      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete registration. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setDevotionalTitle('');
    setDevotionalContent('');
    setDevotionalScripture('');
    setDevotionalImageURL('');
    setEditingDevotional(null);
    setShowPreview(false);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Gender', 'Phone', 'Email', 'Location', 'Expectations', 'Registration Date'];
    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => [
        `"${reg.fullName}"`,
        `"${reg.gender}"`,
        `"${reg.phoneNumber}"`,
        `"${reg.email}"`,
        `"${reg.location}"`,
        `"${reg.expectations.replace(/"/g, '""')}"`,
        `"${reg.registeredAt?.toDate?.()?.toLocaleDateString() || 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `the-sons-registrations-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full space-y-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center space-x-2">
                  <LogIn className="h-6 w-6 text-purple-600" />
                  <span>Admin Login</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage THE SONS challenge</p>
          </motion.div>

          <Tabs defaultValue="advanced" className="space-y-6">
            <TabsList className="w-full overflow-x-auto gap-2 no-scrollbar">
              <TabsTrigger value="advanced" className="flex items-center space-x-2">
                <BarChart2 className="h-4 w-4" />
                <span>Advanced Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="realtime" className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>Real-Time Tracking</span>
              </TabsTrigger>
              <TabsTrigger value="tracking" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>User Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="verse" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Verse of Day</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="devotionals" className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Devotionals</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="advanced">
              <AdvancedUserDashboard />
            </TabsContent>

            <TabsContent value="realtime">
              <RealTimeUserTracker />
            </TabsContent>

            <TabsContent value="tracking">
              <UserTrackingDashboard />
            </TabsContent>

            <TabsContent value="verse">
              <VerseOfTheDayManager />
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {editingDevotional ? 'Edit' : 'New'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setShowPreview(!showPreview)}
                          className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
                        >
                          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="ml-0.5">{showPreview ? 'Hide' : 'Show'}</span>
                        </Button>
                      </motion.div>

                      <AnimatePresence>
                        {editingDevotional && (
                          <motion.div
                            key="cancel-btn"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.25 }}
                          >
                            <Button
                              variant="outline"
                              onClick={resetForm}
                              className="transition-all duration-200 hover:scale-105"
                            >
                              Cancel
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="devotionalTitle">Title</Label>
                        <Input
                          id="devotionalTitle"
                          value={devotionalTitle}
                          onChange={(e) => setDevotionalTitle(e.target.value)}
                          placeholder="Enter devotional title"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="devotionalScripture">Scripture Reference</Label>
                        <Input
                          id="devotionalScripture"
                          value={devotionalScripture}
                          onChange={(e) => setDevotionalScripture(e.target.value)}
                          placeholder="e.g., John 3:16 - 'For God so loved the world...'"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="devotionalImageURL">Image URL (Optional)</Label>
                        <Input
                          id="devotionalImageURL"
                          value={devotionalImageURL}
                          onChange={(e) => setDevotionalImageURL(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="devotionalContent">Content (Markdown Supported)</Label>
                        <Textarea
                          id="devotionalContent"
                          value={devotionalContent}
                          onChange={(e) => setDevotionalContent(e.target.value)}
                          placeholder="Enter devotional content using Markdown formatting..."
                          className="mt-1 min-h-[400px] font-mono resize-none"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Supports: **bold**, *italic*, # headers, &gt; blockquotes, - lists
                        </p>
                      </div>
                      <Button
                        onClick={addOrUpdateDevotional}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {editingDevotional ? 'Update' : 'Publish'}
                      </Button>
                    </div>

                    {showPreview && (
                      <div className="border-t bg-white">
                        <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                        <div className="space-y-4">
                          {devotionalTitle && (
                            <h2 className="text-xl font-bold text-purple-800">{devotionalTitle}</h2>
                          )}
                          {devotionalScripture && (
                            <p className="text-purple-600 font-medium italic">{devotionalScripture}</p>
                          )}
                          {devotionalImageURL && (
                            <img
                              src={devotionalImageURL}
                              alt="Devotional"
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          {devotionalContent && (
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {devotionalContent}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devotionals">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Devotionals ({devotionals.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto no-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Scripture</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {devotionals.map((devotional) => (
                          <TableRow key={devotional.id}>
                            <TableCell className="font-medium">{devotional.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{devotional.scripture}</TableCell>
                            <TableCell>{devotional.createdBy}</TableCell>
                            <TableCell>
                              {devotional.date?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editDevotional(devotional)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteDevotional(devotional.id)}
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
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Registered Users ({registrations.length})</CardTitle>
                    <Button onClick={exportToCSV} variant="outline">
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrations.map((reg) => (
                          <TableRow key={reg.id}>
                            <TableCell className="font-medium">{reg.fullName}</TableCell>
                            <TableCell>{reg.gender}</TableCell>
                            <TableCell>{reg.phoneNumber}</TableCell>
                            <TableCell>{reg.email}</TableCell>
                            <TableCell>{reg.location}</TableCell>
                            <TableCell>
                              {reg.registeredAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteRegistration(reg.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 py-6">

                {/* Total Registrations */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="rounded-xl shadow-md border border-purple-100 hover:shadow-lg transition">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-500">Total Registrations</h2>
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-4xl font-bold text-purple-600">
                        {registrations.length}
                      </div>
                      <MiniChart color="#a855f7" />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Total Devotionals */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="rounded-xl shadow-md border border-green-100 hover:shadow-lg transition">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-500">Total Devotionals</h2>
                        <BookOpen className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-4xl font-bold text-green-600">
                        {devotionals.length}
                      </div>
                      <MiniChart color="#16a34a" />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Male Participants */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-500">Male Participants</h2>
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-4xl font-bold text-blue-600">
                        {Math.round(
                          (registrations.filter(r => r.gender === 'male').length / registrations.length) * 100
                        ) || 0}
                        %
                      </div>
                      <MiniChart color="#2563eb" />
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Female Participants */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="rounded-xl shadow-md border border-pink-100 hover:shadow-lg transition">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-gray-500">Female Participants</h2>
                        <User className="h-5 w-5 text-pink-500" />
                      </div>
                      <div className="text-4xl font-bold text-pink-500">
                        {Math.round(
                          (registrations.filter(r => r.gender === 'female').length / registrations.length) * 100
                        ) || 0}
                        %
                      </div>
                      <MiniChart color="#ec4899" />
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
