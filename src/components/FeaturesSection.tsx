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
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="h-full bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition duration-300 rounded-2xl hover:scale-[1.02]">
            <CardContent className="p-8 flex flex-col items-center text-center">
              {/* Icon Container with Pulse Hover */}
              <div className="bg-purple-100 dark:bg-purple-800 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md hover:animate-pulse transition">
                <feature.icon className="h-8 w-8 text-purple-600 dark:text-purple-300" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Feature type
type FeatureType = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};
