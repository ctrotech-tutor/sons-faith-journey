import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

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
  const { user } = useAuth();

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
      const q = query(collection(db, 'registrations'), where('email', '==', data.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast({
          title: 'Already Registered',
          description: 'You’ve already joined the challenge.',
          variant: 'default'
        });
        navigate('/', { state: { showWhatsAppLink: true } });
        return;
      }

      await addDoc(collection(db, 'registrations'), {
        ...data,
        userId: user?.uid ?? null,
        registeredAt: serverTimestamp(),
        status: 'active'
      });

      toast({
        title: 'Registration Successful!',
        description: 'Thanks for joining! WhatsApp link will be shared.',
      });

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">Join THE SONS Challenge</h1>
          <p className="mt-2 text-sm text-gray-500">Start your 90-day journey of faith, growth, and purpose</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" placeholder="e.g. John Doe" {...register('fullName')} />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select onValueChange={(value) => setValue('gender', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender.message}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input id="phoneNumber" placeholder="e.g. +234..." {...register('phoneNumber')} />
            {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="e.g. you@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g. Lagos, Nigeria" {...register('location')} />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
          </div>

          {/* Expectations */}
          <div>
            <Label htmlFor="expectations">Your Expectations</Label>
            <Textarea
              id="expectations"
              placeholder="What do you hope to gain from this challenge?"
              {...register('expectations')}
              className="min-h-[100px]"
            />
            {errors.expectations && <p className="text-xs text-red-500 mt-1">{errors.expectations.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              'Join the Challenge'
            )}
          </Button>
        </form>

        <div className="text-xs text-center text-gray-400 mt-4">
          By registering, you agree to participate in the 90-day challenge starting June 1st.
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
