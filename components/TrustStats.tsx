"use client";

import { Users, Star, MapPin, Shield } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { motion, Variants } from "framer-motion";

const stats = [
  {
    icon: Users,
    value: "50K+",
    label: "Happy Travelers",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    icon: MapPin,
    value: "10K+",
    label: "Verified Drivers",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
  },
  {
    icon: Star,
    value: "4.8",
    label: "Average Rating",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Safe & Secure",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const TrustStats = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      <div className="container mx-auto px-3 md:px-6 lg:px-9">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
            Trusted by Thousands
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Join our growing community of travelers and providers worldwide
          </p>
        </div>

        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.01, y: -3 }}
              >
                <Card className="group relative hover:shadow-xl transition-all">
                  <CardHeader>
                    <div className={`w-fit p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </span>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 font-medium">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2 flex-wrap">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-medium">24/7 Customer Support</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium">Verified Providers</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium">Secure Payments</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustStats;
