'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { searchUserByEmail, addContact, UserProfile } from '@/lib/firestore';
import dynamic from 'next/dynamic';
import { ChevronLeft, ClockIcon, FileIcon, MusicIcon, PenIcon, PlusIcon, SendHorizonal, StickerIcon, UserIcon } from 'lucide-react'; // Swapped ChevronLeft for LogOut
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const LottiePlayer = dynamic(() => import('@/animations/LottiePlayer'), {
  ssr: false,
  loading: () => <div className="w-64 h-64 bg-gray-100/5 animate-pulse rounded-lg" />,
});

export default function ChatDashboard() {
  const { user } = useAuth();
  const { messages, isConnected, sendPrivateMessage } = useSocket();
  const router = useRouter();

  // Local State UI Controls
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [activeContact, setActiveContact] = useState<UserProfile | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll context handler down to latest message entries
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  // Real-time listener for current user's contact list
  useEffect(() => {
    if (!user) return;
    const contactsRef = collection(db, 'users', user.uid, 'contacts');

    const unsubscribe = onSnapshot(contactsRef, (snapshot) => {
      const contactList: UserProfile[] = [];
      snapshot.forEach((doc) => {
        contactList.push(doc.data() as UserProfile);
      });
      setContacts(contactList);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      // Force-clear local UI state just in case
      setActiveContact(null);
      // Manually redirect if your AuthContext middleware isn't catching it instantly
      router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setSearchResult(null);

    if (searchEmail.toLowerCase() === user?.email?.toLowerCase()) {
      setSearchError("You cannot add yourself as a contact.");
      return;
    }

    try {
      const profile = await searchUserByEmail(searchEmail);
      if (profile) {
        setSearchResult(profile);
      } else {
        setSearchError('No user discovered matching that email.');
      }
    } catch (err) {
      setSearchError('An error occurred during discovery.');
    }
  };

  const handleAddContact = async () => {
    if (!user || !searchResult) return;
    try {
      await addContact(user.uid, searchResult);
      setSearchResult(null);
      setSearchEmail('');
    } catch (err) {
      setSearchError('Could not append contact.');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeContact) return;

    sendPrivateMessage(activeContact.uid, inputMessage);
    setInputMessage('');
  };

  // Filter messages relevant only to the active one-on-one session
  const activeChatMessages = messages.filter(
    (msg) =>
      (msg.from === user?.uid && msg.to === activeContact?.uid) ||
      (msg.from === activeContact?.uid && msg.type === 'PRIVATE_MESSAGE')
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-black text-zinc-100 font-sans  bg-[url('/doodle.jpg')]">
      {/* ========================================================= */}
      {/* SIDE A: CONTACTS & SEARCH TRAYS                           */}
      {/* ========================================================= */}
      <aside className={`p-3 w-full md:w-auto  ${!activeContact ? 'flex' : 'hidden md:flex'}`}>
        <div className="w-full md:w-80 lg:w-96 bg-[#111827]/95 backdrop-blur-xl flex flex-col h-full shrink-0 shadow-2xl rounded-xl ">
          {/* Header App Title Tray */}
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between backdrop-blur-xl bg-white/5 rounded-xl">
            <div className='flex items-center gap-2'>

              <img src="/logo.png" alt="logo" className='w-6 h-6 rounded-full' />
              <h1 className="text-lg font-bold tracking-tight">Chatter!</h1>
            </div>
            {/* <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} /> */}
            <Dialog>
              <DialogTrigger asChild>
                <img src="/profileIcon.png" alt="logo" className='w-7 h-7 rounded-full' />
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 text-zinc-100 sm:max-w-[425px]">
                <DialogHeader className='flex items-center justify-center flex-col'>
                  <div className='flex items-center justify-center relative'>
                    <img src="/profileIcon.png" alt="logo" className='w-20 h-20 rounded-full' />
                    <div className='absolute bottom-0 right-0 bg-[#8840e5] rounded-full border shadow-md p-[5px]'>
                      <PenIcon className='w-3 h-3 color-white' />
                    </div>
                  </div>
                  <DialogTitle className="text-base font-semibold">{user.displayName || "Anonymous User"}</DialogTitle>
                  <DialogDescription className="text-zinc-400 text-xs mt-1 text-center">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quidem, libero est. Accusamus iste, deleniti est, repellat autem
                  </DialogDescription>

                </DialogHeader>
                <DialogFooter className="flex gap-2 mt-4 sm:justify-end">
                  <DialogClose asChild>
                    {/* <button type="button" className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium rounded-xl hover:bg-zinc-800 transition cursor-pointer">
                    C
                  </button> */}
                  </DialogClose>
                  <button
                    onClick={handleLogOut}
                    type="button"
                    className="px-4 py-2 bg-[#B22B27] hover:bg-red-700 text-white text-xs font-medium rounded-xl transition cursor-pointer"
                  >
                    Log Out
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Discovery Search Panel */}
          <div className="px-5 py-4 border-b border-white/10 bg-black/20 backdrop-blur-sm flex flex-col gap-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Find friend by email..."
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition"
              />
              <button className="rounded-full bg-[#1da1f2] hover:blue-500 cursor-pointer px-5 py-1 text-sm font-medium text-white transition shadow-lg">
                Find
              </button>
            </form>

            {searchError && <p className="text-[11px] text-red-400 mt-1">{searchError}</p>}

            {searchResult && (
              <div className="mt-2 p-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold uppercase">
                    {searchResult.displayName[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{searchResult.displayName}</span>
                  </div>
                </div>
                <button onClick={handleAddContact} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition">
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Contacts Session Stream Directory List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 rounded-xl ">
            <span className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase px-2 block mb-2">Contacts List</span>
            {contacts.length === 0 ? (
              <div className="text-center text-xs text-zinc-600 mt-8">No contacts added yet.</div>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact.uid}
                  onClick={() => setActiveContact(contact)}
                  className={`w-full rounded-2xl px-4 py-3 text-left flex items-center gap-4 transition-all duration-200  ${activeContact?.uid === contact.uid ? 'bg-violet-600/20 border border-violet-500/30 shadow-lg text-white' : 'hover:bg-white/5 text-zinc-400'
                    }`}
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br to-violet-500 from-[#1da1f2] flex items-center justify-center text-white font-semibold shadow-lg">
                    {contact.displayName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-medium truncate text-zinc-200">{contact.displayName}</h2>
                    <p className="text-xs text-zinc-500 truncate">{contact.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* SIDE B: INTERACTIVE ACTIVE CHAT LAYER                     */}
      {/* ========================================================= */}
      <main className={`flex-1 flex flex-col h-full relative bg-zinc-95 w-full md:w-auto ${activeContact ? 'flex' : 'hidden md:flex'}`}>
        {activeContact ? (
          <>
            {/* Session Recipient Top Context Header */}
            <header className="h-20 border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">

                <button
                  onClick={() => setActiveContact(null)}
                  className="md:hidden p-2 -ml-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                  aria-label="Go back to contacts"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs uppercase">
                  {activeContact.displayName[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight">{activeContact.displayName}</span>
                  <span className="text-[10px] text-zinc-500">Session ID Active</span>
                </div>
              </div>
            </header>

            {/* Live Message Bubble Stream Scroll Box */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5 bg-repeat bg-center bg-blend-overlay bg-black/40">
              {activeChatMessages.map((msg, index) => {
                const isMe = msg.from === user?.uid;
                return (
                  /* Keep this outer wrapper active so messages stay grouped on their respective sides */
                  <div key={index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] md:max-w-[70%] px-5 py-3 text-sm break-words shadow-lg transition-all ${isMe
                        ? 'bg-violet-600 text-white rounded-3xl rounded-br-md'
                        : 'bg-zinc-900/90 border border-white/10 rounded-3xl rounded-bl-md text-zinc-100'
                        }`}
                    >
                      <p>{msg.payload}</p>
                      <p className="mt-2 text-[10px] opacity-60 text-right">
                        {new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Action Tray Footer Bar */}
            <footer className="px-6 py-5 border-t border-white/10 bg-black/20 backdrop-blur-xl">
              <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3 shadow-2xl">
                {/* <PlusIcon className='w-6 h-6 ml-2' /> */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <PlusIcon className='w-6 h-6 ml-2' />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='bg-white p-4'>
                    <DropdownMenuGroup className='text-black'>
                      <DropdownMenuItem className='cursor-pointer'><FileIcon /> Documents</DropdownMenuItem>
                      <DropdownMenuItem className='cursor-pointer'><MusicIcon /> Audio</DropdownMenuItem>
                      <DropdownMenuItem className='cursor-pointer'><UserIcon /> Contact</DropdownMenuItem>
                      <DropdownMenuItem className='cursor-pointer'><StickerIcon /> Sticker</DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className='text-black cursor-pointer'><ClockIcon /> Reminder</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${activeContact.displayName}...`}
                  className="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder:text-zinc-500 outline-none"
                />
                <button
                  type="submit"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition hover:scale-105 hover:bg-violet-500 active:scale-95"
                >
                  <SendHorizonal className="w-4 h-4" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          /* Empty Unselected Splash Layer (Only visible on screens tablet size and up) */
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950/20 to-transparent text-center p-8 ">
            <div className='w-64 h-64 flex items-center justify-center'>
              <LottiePlayer src='../animations/emptyChat.json' />
            </div>
            <h3 className="text-sm font-medium text-zinc-300">No Chat Session Initiated</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Select an individual from your contact list directory on the left or add a contact to open a private line.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}