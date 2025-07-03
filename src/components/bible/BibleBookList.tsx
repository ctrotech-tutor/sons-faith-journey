import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Bookmark, ArrowLeft, User } from "lucide-react";
import { useState } from "react";
import { bibleBooks, getBooksByTestament, BibleBook } from "@/data/bibleBooks";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/lib/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
interface BibleBookListProps {
  onSelectBook: (book: BibleBook) => void;
}

const BibleBookList: React.FC<BibleBookListProps> = ({ onSelectBook }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const profile = useUserProfile();
  const [selectedTestament, setSelectedTestament] = useState<
    "OT" | "NT" | "All"
  >("All");

  const filteredBooks = bibleBooks.filter((book) => {
    const matchesSearch =
      book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.shortName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTestament =
      selectedTestament === "All" || book.testament === selectedTestament;
    return matchesSearch && matchesTestament;
  });

  const oldTestamentBooks = getBooksByTestament("OT");
  const newTestamentBooks = getBooksByTestament("NT");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-newseader text-bible-text">
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 left-0 w-full z-40 backdrop-blur-md bg-white/70 dark:bg-gray-900/60 border-b border-white/20 dark:border-white/10 shadow-sm"
      >
        <div className="container mx-auto flex items-center justify-between px-2 py-3">
          {/* Back button and title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-black dark:text-white ripple-effect rounded-full w-8 h-8 bg-transparent active:bg-purple-600 active:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 via-purple-700 to-fuchsia-600 bg-clip-text text-transparent">
              Study Scripture
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-bible-border bg-white focus:border-primary focus:ring-primary"
              />
            </div>
            <button className="rounded-md p-2 hover:bg-gray-100 hidden">
              <Bookmark className="h-6 w-6 text-gray-500" />
            </button>
            <Avatar className="size-10">
              <AvatarImage
                src={profile?.profilePhoto || ""}
                alt={profile?.displayName || "User Avatar"}
                onClick={() => navigate("/profile")}
              />
              <AvatarFallback>
                <div className="size-10 rounded-full bg-cover bg-center bg-gray-300">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </motion.div>

      <main className="container mx-auto flex-1 px-4 md:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold tracking-tight text-bible-text">
              The Holy Bible
            </h2>
            <p className="mt-4 text-lg text-bible-muted max-w-2xl mx-auto">
              Explore the collected sacred texts of the Old and New Testaments,
              offering guidance, wisdom, and the story of God's relationship
              with humanity.
            </p>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 outline-none bg-white"
              />
            </div>
          </div>

          {/* Testament Filter */}
          <div className="flex gap-2 mb-8 justify-center">
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
                className="px-6"
              >
                {testament === "All" ? "All" : `${testament}`}
              </Button>
            ))}
          </div>

          <div className="space-y-16">
            {/* Old Testament */}
            {(selectedTestament === "All" || selectedTestament === "OT") && (
              <section id="old-testament">
                <h3 className="text-3xl font-bold tracking-tight text-bible-text border-b-2 border-primary pb-3 mb-8">
                  Old Testament
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {filteredBooks
                    .filter((book) => book.testament === "OT")
                    .map((book, index) => (
                      <motion.div
                        key={book.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="book-item"
                        onClick={() => onSelectBook(book)}
                      >
                        <Card className="border border-bible-border p-4 bg-white transition-all duration-200 hover:bg-[#fdfaf7] hover:-translate-y-0.5">
                          <h4 className="font-bold text-lg text-bible-text leading-relaxed">
                            {book.name}
                          </h4>
                          <p className="text-sm text-bible-muted mt-1">
                            {book.category} • {book.chapters} chapters
                          </p>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </section>
            )}

            {/* New Testament */}
            {(selectedTestament === "All" || selectedTestament === "NT") && (
              <section id="new-testament">
                <h3 className="text-3xl font-bold tracking-tight text-bible-text border-b-2 border-primary pb-3 mb-8">
                  New Testament
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 bg-white dark:bg-gray-900">
                  {filteredBooks
                    .filter((book) => book.testament === "NT")
                    .map((book, index) => (
                      <motion.div
                        key={book.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="book-item"
                        onClick={() => onSelectBook(book)}
                      >
                        <Card className="border border-bible-border p-4 bg-white transition-all duration-200 hover:bg-[#fdfaf7] hover:-translate-y-0.5">
                          <h4 className="font-bold text-lg text-bible-text leading-relaxed">
                            {book.name}
                          </h4>
                          <p className="text-sm text-bible-muted mt-1">
                            {book.category} • {book.chapters} chapters
                          </p>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-bible-border/30 mt-16">
        <div className="container mx-auto px-6 py-8 text-center text-bible-muted">
          <p>© 2024 Scripture Study. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default BibleBookList;
