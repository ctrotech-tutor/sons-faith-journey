
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Users, FileText, Plus } from 'lucide-react';
import Layout from '@/components/Layout';

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

const Admin = () => {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [devotionalTitle, setDevotionalTitle] = useState('');
  const [devotionalContent, setDevotionalContent] = useState('');
  const [devotionalScripture, setDevotionalScripture] = useState('');

  useEffect(() => {
    if (user) {
      fetchRegistrations();
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

  const addDevotional = async () => {
    if (!devotionalTitle || !devotionalContent || !devotionalScripture) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all devotional fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addDoc(collection(db, 'devotionals'), {
        title: devotionalTitle,
        content: devotionalContent,
        scripture: devotionalScripture,
        date: new Date(),
        createdBy: user?.email
      });

      toast({
        title: 'Devotional Added',
        description: 'New devotional content has been published.'
      });

      setDevotionalTitle('');
      setDevotionalContent('');
      setDevotionalScripture('');
    } catch (error) {
      console.error('Error adding devotional:', error);
      toast({
        title: 'Error',
        description: 'Failed to add devotional. Please try again.',
        variant: 'destructive'
      });
    }
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

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Content</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>

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
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Devotional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label htmlFor="devotionalContent">Content</Label>
                    <Textarea
                      id="devotionalContent"
                      value={devotionalContent}
                      onChange={(e) => setDevotionalContent(e.target.value)}
                      placeholder="Enter devotional content"
                      className="mt-1 min-h-[200px]"
                    />
                  </div>
                  <Button
                    onClick={addDevotional}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Publish Devotional
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {registrations.length}
                      </div>
                      <p className="text-gray-600">Total Registrations</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {registrations.filter(r => 
                          r.registeredAt?.toDate?.()?.toDateString() === new Date().toDateString()
                        ).length}
                      </div>
                      <p className="text-gray-600">Today's Signups</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {Math.round((registrations.filter(r => r.gender === 'male').length / registrations.length) * 100) || 0}%
                      </div>
                      <p className="text-gray-600">Male Participants</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
