import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function FeaturesSection({ features }: { features: FeatureType[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-16 md:px-0">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="h-full border-none shadow-xl hover:shadow-2xl transition duration-300 rounded-2xl bg-gradient-to-b from-white to-gray-50">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                <feature.icon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Define types if needed
type FeatureType = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};
