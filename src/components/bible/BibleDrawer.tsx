
import React, { ReactNode } from "react";
import { Drawer, DrawerContent } from "../ui/drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, EllipsisVertical } from "lucide-react";

type BibleDrawerProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTestament: "OT" | "NT" | "All";
  setSelectedTestament: (testament: "OT" | "NT" | "All") => void;
  newTestamentBooks: any[];
  oldTestamentBooks: any[];
  bibleBooks: { chapters: number }[];
  trigger?: React.ReactNode;
};

const BibleDrawer = ({
  searchTerm,
  setSearchTerm,
  selectedTestament,
  setSelectedTestament,
  newTestamentBooks,
  oldTestamentBooks,
  bibleBooks,
  trigger,
}: BibleDrawerProps) => {
  return (
    <div>
        <Drawer>
        <DrawerContent>
          {/* Search and Filter */}
          <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                {["All", "OT", "NT"].map((testament) => (
                  <Button
                    key={testament}
                    variant={
                      selectedTestament === testament ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setSelectedTestament(testament as "OT" | "NT" | "All")
                    }
                    className="flex-1"
                  >
                    {testament === "All" ? "All" : `${testament}`}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {oldTestamentBooks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Old Testament
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {newTestamentBooks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  New Testament
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {bibleBooks.reduce((total, book) => total + book.chapters, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Chapters
                </div>
              </CardContent>
            </Card>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default BibleDrawer