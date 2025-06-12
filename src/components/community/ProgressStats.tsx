// components/ProgressDrawer.tsx
import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function ProgressDrawer({
    stats,
    trigger,
}: {
    stats: { totalReadingDays: number; readingStreak: number; todayDay: number };
    trigger?: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const progressPercent = Math.round((stats.totalReadingDays / 90) * 100);

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
        circumference * ((100 - progressPercent) / 100);

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            {trigger ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                <DrawerTrigger asChild>
                    <Button variant="outline" size="sm">
                    </Button>
                </DrawerTrigger>
            )}

            <DrawerContent className="px-4 pb-10 rounded-t-3xl">
                <Card className="bg-transparent border-none shadow-none">
                    <CardContent className="pt-6 space-y-6">
                        <div className="flex justify-center">
                            <div className="relative w-28 h-28">
                                <svg className="w-full h-full rotate-[-90deg]">
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r={radius}
                                        stroke="#e4e4e7"
                                        className="dark:stroke-gray-800"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="50%"
                                        cy="50%"
                                        r={radius}
                                        stroke="#7c3aed"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-700"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-foreground">
                                            {progressPercent}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Complete
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                {
                                    value: stats.totalReadingDays,
                                    label: "Days Complete",
                                },
                                {
                                    value: stats.readingStreak,
                                    label: "Day Streak",
                                },
                                {
                                    value: stats.todayDay,
                                    label: "Today is Day",
                                },
                            ].map((stat, index, arr) => (
                                <div
                                    key={index}
                                    className={`rounded-xl border p-4 bg-muted/30 backdrop-blur text-center shadow-sm space-y-1 ${index === arr.length - 1 && arr.length % 2 !== 0 ? "col-span-2" : ""
                                        }`}
                                >
                                    <div className="text-xl font-semibold text-foreground">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                    </CardContent>
                </Card>
            </DrawerContent>
        </Drawer>
    );
}
