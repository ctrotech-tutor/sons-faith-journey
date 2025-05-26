
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  gender: z.string().min(1, 'Please select your gender'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  expectations: z.string().min(10, 'Please share your expectations (at least 10 characters)')
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        ...data,
        registeredAt: new Date(),
        status: 'active'
      });

      toast({
        title: 'Registration Successful!',
        description: 'Thanks for joining! Get the WhatsApp group link below.',
      });

      // Store registration status in localStorage
      localStorage.setItem('isRegistered', 'true');
      
      // Redirect to home page
      navigate('/', { state: { showWhatsAppLink: true } });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Join THE SONS Challenge
              </h1>
              <p className="text-gray-600">
                Start your 90-day journey of faith, growth, and purpose
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(value) => setValue('gender', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  {...register('phoneNumber')}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter your email address"
                  className="mt-1"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Enter your city/state"
                  className="mt-1"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="expectations">What are your expectations? *</Label>
                <Textarea
                  id="expectations"
                  {...register('expectations')}
                  placeholder="Share what you hope to gain from this challenge..."
                  className="mt-1 min-h-[100px]"
                />
                {errors.expectations && (
                  <p className="text-red-500 text-sm mt-1">{errors.expectations.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3"
              >
                {isSubmitting ? 'Joining...' : 'Join the Challenge'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              By registering, you agree to participate in the 90-day challenge starting June 1st
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
