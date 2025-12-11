
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Zap, MapPin, Send, Sparkles, User, Bot, Plus, Search, Filter, Activity, Clock, Flame, X, Dumbbell, ChevronRight, Camera, Check, Image as ImageIcon, Calendar as CalendarIcon, Play, Grid, Users, Link as LinkIcon, ChevronLeft, Award, Flag, Slash, Copy, Share, ChevronDown, Trophy } from 'lucide-react';
import { ChatMessage } from '../types.ts';
import { askFitnessCoach } from '../services/geminiService.ts';
import { Button } from '../components/ui/Button.tsx';
import { EXERCISE_DB } from '../data/exercises.ts';

// --- Types & Mock Data ---

interface Story {
  id: string;
  user: { name: string; avatar: string; isPro?: boolean };
  hasUnseen: boolean;
}

interface Post {
  id: string;
  user: { name: string; avatar: string; role?: string; isPro?: boolean; };
  image: string;
  caption: string;
  location?: string;
  stats: { likes: number; comments: number; shares: number };
  workout?: { title: string; duration: string; calories: string; type: string; score?: number };
  timeAgo: string;
  isLiked: boolean;
  mediaType?: 'image' | 'video';
}

interface Conversation {
  id: string;
  user: { name: string; avatar: string; isBot?: boolean; isOnline?: boolean };
  lastMessage: string;
  time: string;
  unread: number;
}

interface Comment {
  id: string;
  user: { name: string; avatar: string };
  text: string;
  timeAgo: string;
}

interface UserProfile {
  name: string;
  avatar: string;
  role?: string;
  isPro?: boolean;
  bio: string;
  followers: string;
  following: string;
  workouts: number;
  location?: string;
  posts: string[];
  isFollowing?: boolean;
  website?: string;
  isCurrentUser?: boolean;
}

const STORIES: Story[] = [
    { id: 's0', user: { name: 'You', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }, hasUnseen: false },
    { id: 's1', user: { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', isPro: true }, hasUnseen: true },
    { id: 's2', user: { name: 'Mike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }, hasUnseen: true },
    { id: 's3', user: { name: 'Coach J', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop', isPro: true }, hasUnseen: false },
    { id: 's4', user: { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' }, hasUnseen: true },
];

const INITIAL_POSTS: Post[] = [
  { 
    id: '1', 
    user: { name: 'Kael Theron', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop', role: 'Pro Trainer', isPro: true }, 
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop', 
    caption: 'Leg day complete. The focus was absolute today. New PR on squats! 🏋️‍♂️', 
    location: 'Ironworks Gym', 
    stats: { likes: 1240, comments: 45, shares: 12 }, 
    timeAgo: '2h', 
    workout: { title: 'Heavy Legs Protocol', duration: '1h 45m', calories: '850', type: 'Strength', score: 92 },
    isLiked: false
  },
  { 
    id: '2', 
    user: { name: 'Lyra Vance', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', role: 'Yogi' }, 
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop', 
    caption: 'Morning flow to reset the mind and body. ✨', 
    location: 'City Studio', 
    stats: { likes: 856, comments: 23, shares: 5 }, 
    timeAgo: '4h',
    isLiked: true
  },
  {
    id: '3',
    user: { name: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop', role: 'Athlete', isPro: false },
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop', 
    caption: 'Early morning cardio session. Chasing that runner\'s high.',
    location: 'Central Park',
    stats: { likes: 432, comments: 12, shares: 2 }, 
    timeAgo: '6h',
    workout: { title: 'Zone 2 Run', duration: '45m', calories: '520', type: 'Cardio', score: 85 },
    isLiked: false
  }
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: 'c1', user: { name: 'NeoFit Coach', avatar: '', isBot: true, isOnline: true }, lastMessage: 'Great job on your last workout! Ready for today?', time: 'Now', unread: 1 },
  { id: 'c2', user: { name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', isOnline: true }, lastMessage: 'Are we still on for gym at 6?', time: '2m', unread: 2 },
  { id: 'c3', user: { name: 'Kael Theron', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=200&auto=format&fit=crop' }, lastMessage: 'Thanks for the spot bro.', time: '1h', unread: 0 },
];

const RECENT_COMPLETED_WORKOUTS = [
    { title: 'Morning Run', duration: '30 min', calories: '320', type: 'Cardio', score: 95 },
    { title: 'Upper Body Power', duration: '1h 15m', calories: '650', type: 'Strength', score: 98 },
    { title: 'Full Body HIIT', duration: '45 min', calories: '550', type: 'HIIT', score: 92 },
    { title: 'Active Recovery', duration: '20 min', calories: '120', type: 'Mobility', score: 88 },
];

const MOCK_PROFILES: Record<string, UserProfile> = {
  'Alex Runner': {
    name: 'Alex Runner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    role: 'Member',
    isPro: true,
    bio: 'Fitness enthusiast. 🏃‍♂️💨\nChasing goals and gains.',
    followers: '145',
    following: '120',
    workouts: 42,
    location: 'Los Angeles, CA',
    posts: [
       'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop'
    ],
    isFollowing: false,
    isCurrentUser: true
  },
  'Sarah': {
    name: 'Sarah',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    role: 'HIIT Coach',
    isPro: true,
    bio: 'Certified HIIT Instructor & Nutritionist. Helping you crush your goals one interval at a time. 💦\n\nOnline Coaching 👇',
    followers: '12.5k',
    following: '420',
    workouts: 156,
    location: 'Los Angeles, CA',
    website: 'sarahfits.com',
    posts: [
       'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400&auto=format&fit=crop'
    ],
    isFollowing: false
  },
  'Mike': {
    name: 'Mike',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    role: 'Member',
    isPro: false,
    bio: 'Just here to lift heavy circles. 🏋️‍♂️\nRoad to 500lb Deadlift.',
    followers: '842',
    following: '560',
    workouts: 89,
    location: 'New York, NY',
    posts: [
       'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop'
    ],
    isFollowing: true
  },
  'Coach J': {
    name: 'Coach J',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    role: 'Head Trainer',
    isPro: true,
    bio: 'Head Trainer at NeoFit. Specialist in functional hypertrophy and injury prevention.',
    followers: '28.4k',
    following: '150',
    workouts: 2400,
    location: 'NeoFit HQ',
    website: 'neofit.app',
    posts: [
       'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1598971639058-d11963957a84?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop',
       'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop'
    ],
    isFollowing: true
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface SocialProps {
  onStartWorkout?: (workout?: any) => void;
}

export const Social: React.FC<SocialProps> = ({ onStartWorkout }) => {
  const [activeTab, setActiveTab] = useState('FEED');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [selectedWorkout, setSelectedWorkout] = useState<Post['workout'] | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  
  // Profile Interaction State
  const [activeProfileTab, setActiveProfileTab] = useState<'GRID' | 'ACTIVITY' | 'TAGGED'>('GRID');
  const [profileStatSheet, setProfileStatSheet] = useState<{ type: 'FOLLOWERS' | 'FOLLOWING' | 'WORKOUTS', title: string } | null>(null);
  const [isProfileOptionsOpen, setIsProfileOptionsOpen] = useState(false);

  // Create Post State
  const [isCreating, setIsCreating] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [attachedWorkout, setAttachedWorkout] = useState<any>(null);
  const [isWorkoutPickerOpen, setIsWorkoutPickerOpen] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comment State
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentsData, setCommentsData] = useState<Record<string, Comment[]>>({
      '1': [
          { id: 'c1', user: { name: 'Sarah J', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }, text: 'Incredible progress! 🔥', timeAgo: '1h' },
          { id: 'c2', user: { name: 'Mike Ross', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }, text: 'That volume is insane.', timeAgo: '30m' }
      ]
  });

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I\'m your fitness coach. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeConversation]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleProfileOption = (option: string) => {
    setIsProfileOptionsOpen(false);
    showToast(`${option} action triggered`);
  };

  const toggleLike = (id: string) => {
    setPosts(currentPosts => currentPosts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          isLiked: !post.isLiked,
          stats: {
            ...post.stats,
            likes: post.isLiked ? post.stats.likes - 1 : post.stats.likes + 1
          }
        };
      }
      return post;
    }));
  };

  const handleOpenProfile = (user: { name: string; avatar: string; role?: string; isPro?: boolean }) => {
     let profile = MOCK_PROFILES[user.name];
     if (!profile) {
         profile = {
             name: user.name,
             avatar: user.avatar,
             role: user.role || 'Member',
             isPro: user.isPro,
             bio: 'Fitness enthusiast on a journey to strength and wellness.',
             followers: '342',
             following: '210',
             workouts: 42,
             location: 'Global',
             posts: [
                'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=400&auto=format&fit=crop'
             ],
             isFollowing: false
         };
     }
     setViewingProfile(profile);
     setActiveProfileTab('GRID');
  };

  const handleLoadMorePosts = () => {
    if (!viewingProfile) return;
    const newPosts = [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
    ];
    setViewingProfile({
        ...viewingProfile,
        posts: [...viewingProfile.posts, ...newPosts]
    });
    showToast('Loaded more posts');
  };

  const handleFollowToggle = () => {
    if (!viewingProfile) return;
    const isNowFollowing = !viewingProfile.isFollowing;
    setViewingProfile({ ...viewingProfile, isFollowing: isNowFollowing });
    if (MOCK_PROFILES[viewingProfile.name]) {
        MOCK_PROFILES[viewingProfile.name].isFollowing = isNowFollowing;
    }
    if (isNowFollowing) {
        showToast(`You are now following ${viewingProfile.name}`);
    } else {
        showToast(`Unfollowed ${viewingProfile.name}`);
    }
  };

  const handleMessageFromProfile = () => {
    if (!viewingProfile) return;
    setViewingProfile(null);
    setActiveTab('INBOX');
    const existing = INITIAL_CONVERSATIONS.find(c => c.user.name === viewingProfile.name);
    if (existing) {
        setActiveConversation(existing);
    } else {
        const newConv: Conversation = {
            id: `temp-${Date.now()}`,
            user: {
                name: viewingProfile.name,
                avatar: viewingProfile.avatar,
                isOnline: false, // Default
                isBot: false
            },
            lastMessage: '',
            time: 'Now',
            unread: 0
        };
        setActiveConversation(newConv);
    }
  };

  const handleWebsiteClick = (url?: string) => {
    if (url) {
        showToast(`Opening ${url}...`);
        window.open(`https://${url}`, '_blank');
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentsPostId) return;
    
    const newComment: Comment = {
        id: `c-${Date.now()}`,
        user: { name: 'Alex Runner', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
        text: commentText,
        timeAgo: 'Just now'
    };

    setCommentsData(prev => ({
        ...prev,
        [activeCommentsPostId]: [...(prev[activeCommentsPostId] || []), newComment]
    }));
    
    setPosts(prev => prev.map(p => {
        if (p.id === activeCommentsPostId) {
            return { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } };
        }
        return p;
    }));

    setCommentText('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await askFitnessCoach(userMsg, true);

    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  const handleAiEnhance = async () => {
    if (aiEnhanced) {
        setAiEnhanced(false);
        return;
    }

    setAiEnhanced(true);
    if (!newCaption.trim()) {
        setIsAiLoading(true);
        try {
            const context = attachedWorkout 
                ? `I completed a ${attachedWorkout.title} (${attachedWorkout.type}) workout. Duration: ${attachedWorkout.duration}, Calories: ${attachedWorkout.calories}.`
                : "I just finished a workout and feel great.";
            
            const prompt = `Write a short, engaging, and motivating social media caption for a fitness app post based on this context: "${context}". Include 2-3 relevant hashtags. Keep it under 20 words.`;
            const caption = await askFitnessCoach(prompt, false);
            setNewCaption(caption.replace(/"/g, ''));
        } catch (e) {
            setNewCaption("Crushed my workout today! 💪 #fitness #goals");
        } finally {
            setIsAiLoading(false);
        }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            setSelectedMedia(e.target?.result as string);
            setMediaType(file.type.startsWith('video') ? 'video' : 'image');
            setAttachedWorkout(null); // Clear attachment if media is selected
        };
        reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = () => {
    if (!newCaption.trim() && !attachedWorkout && !selectedMedia) return;
    
    const newPost: Post = {
        id: `new-${Date.now()}`,
        user: { 
            name: 'Alex Runner', 
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', 
            isPro: true 
        },
        image: selectedMedia 
            ? selectedMedia
            : attachedWorkout 
                ? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
        caption: newCaption,
        location: 'Ironworks Gym',
        stats: { likes: 0, comments: 0, shares: 0 },
        timeAgo: 'Just now',
        isLiked: false,
        workout: attachedWorkout || undefined,
        mediaType: selectedMedia ? mediaType : 'image'
    };

    setPosts([newPost, ...posts]);
    setNewCaption('');
    setSelectedMedia(null);
    setAttachedWorkout(null);
    setIsCreating(false);
    setAiEnhanced(false);
    showToast('Post Shared!');
  };

  const handleStatClick = (type: 'FOLLOWERS' | 'FOLLOWING' | 'WORKOUTS') => {
      const titles = {
          'FOLLOWERS': 'Followers',
          'FOLLOWING': 'Following',
          'WORKOUTS': 'Workouts History'
      };
      setProfileStatSheet({ type, title: titles[type] });
  };

  const renderInboxList = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
       {INITIAL_CONVERSATIONS.map((conv) => (
         <div 
           key={conv.id} 
           onClick={() => setActiveConversation(conv)}
           className="flex items-center gap-4 p-4 bg-[#1C1C1E] rounded-[24px] border border-white/5 active:bg-[#2C2C2E] transition-colors cursor-pointer"
         >
            <div className="relative">
               {conv.user.isBot ? (
                 <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                    <Bot size={24} />
                 </div>
               ) : (
                 <img src={conv.user.avatar} className="w-14 h-14 rounded-full object-cover border-2 border-[#1C1C1E]" />
               )}
               {conv.user.isOnline && (
                 <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1C1C1E]" />
               )}
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start mb-1">
                  <h3 className="text-white font-bold text-[15px]">{conv.user.name}</h3>
                  <span className="text-zinc-500 text-xs font-medium">{conv.time}</span>
               </div>
               <p className={`text-sm truncate ${conv.unread > 0 ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                  {conv.lastMessage}
               </p>
            </div>

            {conv.unread > 0 && (
               <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {conv.unread}
               </div>
            )}
         </div>
       ))}
    </motion.div>
  );

  const renderChatInterface = () => (
    <div className="flex flex-col h-[calc(100vh-220px)]">
       {/* Chat Header */}
       <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4 px-1">
          <button onClick={() => setActiveConversation(null)} className="p-2 -ml-2 text-zinc-400 hover:text-white">
             <ChevronRight size={24} className="rotate-180" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white overflow-hidden">
             {activeConversation?.user.isBot ? <Bot size={20} /> : <img src={activeConversation?.user.avatar} className="w-full h-full object-cover" />}
          </div>
          <div>
             <h3 className="text-white font-bold text-sm">{activeConversation?.user.name}</h3>
             <div className="text-green-500 text-xs font-medium flex items-center gap-1">
                {activeConversation?.user.isOnline ? (
                    <><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online</>
                ) : (
                    <span className="text-zinc-500">Offline</span>
                )}
             </div>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto px-1 space-y-4 pb-4 no-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                 {msg.role === 'model' && (
                   <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center shrink-0 border border-white/10">
                      <Bot size={14} className="text-white" />
                   </div>
                 )}
                 <div className={`py-3 px-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#0A84FF] text-white rounded-br-none' 
                      : 'bg-[#2C2C2E] text-white rounded-bl-none border border-white/10'
                  }`}>
                    {msg.text}
                  </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex items-end gap-2">
                   <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center shrink-0 border border-white/10">
                      <Sparkles size={14} className="text-white" />
                   </div>
                   <div className="bg-[#2C2C2E] px-4 py-3 rounded-2xl rounded-bl-none text-gray-400 flex items-center gap-2 text-xs border border-white/10 shadow-sm">
                      <Sparkles size={14} className="animate-pulse text-purple-400" /> Thinking...
                   </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
       </div>

       <form onSubmit={handleSendMessage} className="p-2 bg-[#1C1C1E] rounded-[24px] border border-white/10 flex gap-2 shadow-lg mb-4 items-center">
          <button type="button" className="p-2 text-zinc-400 hover:text-white transition-colors">
             <Plus size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-transparent text-white px-2 focus:outline-none text-[15px] placeholder-zinc-500 font-medium h-10"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            className={`p-2.5 rounded-full transition-all ${input.trim() ? 'bg-[#0A84FF] text-white' : 'bg-[#2C2C2E] text-zinc-500'}`}
          >
            <Send size={18} fill="currentColor" />
          </button>
       </form>
    </div>
  );

  const renderLocal = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Map Placeholder */}
        <div className="h-56 w-full bg-[#1C1C1E] rounded-[32px] border border-white/10 relative overflow-hidden flex items-center justify-center group cursor-pointer shadow-lg">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-md rounded-full flex items-center justify-center border border-blue-500/30 text-blue-400 mb-3 shadow-[0_0_30px_rgba(10,132,255,0.3)]">
                    <MapPin size={32} />
                </div>
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-2 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> 12 Gyms Nearby
                </div>
            </div>
        </div>

        <h3 className="text-white font-bold font-display text-lg px-1 pt-2">Popular Spots</h3>
        <div className="space-y-3">
            {[
                { name: 'Ironworks Gym', dist: '0.8 mi', members: 42, active: true, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop' },
                { name: 'City Studio', dist: '1.2 mi', members: 28, active: false, image: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=200&auto=format&fit=crop' },
                { name: 'Metro Fitness', dist: '2.5 mi', members: 156, active: true, image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=200&auto=format&fit=crop' },
            ].map((gym, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#1C1C1E] rounded-[24px] border border-white/5 active:scale-[0.98] transition-all hover:bg-[#2C2C2E] cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <img src={gym.image} className="w-16 h-16 rounded-[18px] object-cover" />
                        <div>
                            <div className="text-white font-bold text-[15px] mb-1">{gym.name}</div>
                            <div className="text-zinc-500 text-xs font-medium flex items-center gap-2">
                                <MapPin size={10} /> {gym.dist} • {gym.members} members
                            </div>
                        </div>
                    </div>
                    {gym.active && (
                        <div className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20 mr-2">
                            Active
                        </div>
                    )}
                </div>
            ))}
        </div>
    </motion.div>
  );

  const renderTrainers = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="grid grid-cols-2 gap-4">
            {[
                { name: 'Kael Theron', role: 'Strength', img: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop' },
                { name: 'Sarah', role: 'HIIT', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop' },
                { name: 'Mike', role: 'Bodybuilding', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
                { name: 'Emma W', role: 'Yoga', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop' },
                { name: 'David Chen', role: 'Calisthenics', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop' },
                { name: 'Lisa Ray', role: 'Pilates', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop' },
            ].map((trainer, i) => (
                <div key={i} onClick={() => handleOpenProfile({ name: trainer.name, avatar: trainer.img, role: trainer.role, isPro: true })} className="bg-[#1C1C1E] p-4 rounded-[28px] border border-white/5 flex flex-col items-center text-center active:scale-[0.98] transition-all relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img src={trainer.img} className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-white/10 group-hover:scale-105 transition-transform" />
                    <div className="text-white font-bold text-[15px] leading-tight mb-1">{trainer.name}</div>
                    <div className="text-[#0A84FF] text-[10px] font-bold uppercase tracking-wider mb-4 bg-[#0A84FF]/10 px-2 py-0.5 rounded-md">{trainer.role}</div>
                    <button className="w-full py-2.5 rounded-[14px] bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors shadow-sm">
                        Connect
                    </button>
                </div>
            ))}
        </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white pt-0 px-5 md:px-0 pb-24 transition-colors duration-300">
      
      {/* New Header */}
      <div className="pt-[calc(env(safe-area-inset-top)+20px)] px-6 pb-4 sticky top-0 z-30 pointer-events-none bg-gradient-to-b from-black via-black/90 to-transparent">
        <div className="flex justify-between items-start pointer-events-auto">
          <div>
            <h1 className="text-4xl font-extrabold font-display text-white tracking-tight leading-none mb-1.5 drop-shadow-lg">Community</h1>
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">12 Gyms Nearby • Online</p>
          </div>
          <div className="flex gap-3">
              <button 
                onClick={() => setIsCreating(true)}
                className="w-11 h-11 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-white hover:bg-[#2C2C2E] transition-all active:scale-95"
              >
                 <Plus size={20} strokeWidth={2} />
              </button>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all active:scale-95 ${isSearchOpen ? 'bg-white text-black border-white' : 'bg-[#1C1C1E] border-white/10 text-white hover:bg-[#2C2C2E]'}`}
              >
                 <Search size={20} strokeWidth={2} />
              </button>
              <button className="w-11 h-11 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-white hover:bg-[#2C2C2E] transition-colors active:scale-95 relative">
                 <Filter size={20} strokeWidth={2} />
                 <div className="absolute top-2.5 right-3 w-1.5 h-1.5 bg-[#0A84FF] rounded-full" />
              </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        <div className="pointer-events-auto">
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <input 
                            type="text" 
                            placeholder="Search posts, people, or gyms..." 
                            autoFocus
                            className="w-full bg-[#1C1C1E] border border-white/10 rounded-[20px] px-5 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#0A84FF]/50 transition-colors"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Tabs */}
        <div className="mt-6 pointer-events-auto overflow-x-auto no-scrollbar pb-1">
             <div className="flex gap-2">
                {['FEED', 'INBOX', 'LOCAL', 'TRAINERS'].map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 border ${
                        isActive 
                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                            : 'bg-[#1C1C1E] text-zinc-500 border-white/5 hover:border-white/10 hover:text-zinc-300'
                        }`}
                    >
                        {tab}
                    </button>
                    )
                })}
             </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto mt-4">
        <AnimatePresence mode='wait'>
          {activeTab === 'FEED' && (
            <motion.div 
              key="feed"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Stories Rail */}
              <motion.div variants={itemVariants} className="flex gap-5 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5 md:px-0">
                  {STORIES.map((story, i) => (
                    <div 
                        key={story.id} 
                        className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
                        onClick={() => {
                            if (i === 0) {
                                handleOpenProfile({ ...story.user, name: 'Alex Runner' });
                            } else {
                                handleOpenProfile(story.user);
                            }
                        }}
                    >
                        <div className={`w-[76px] h-[76px] rounded-full p-[3px] relative ${story.hasUnseen ? 'bg-gradient-to-tr from-blue-500 to-purple-500' : 'bg-zinc-800'}`}>
                           <div className="w-full h-full rounded-full border-[3px] border-black overflow-hidden relative">
                              <img src={story.user.avatar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           </div>
                           {story.user.isPro && (
                             <div className="absolute bottom-0 right-0 bg-black rounded-full p-0.5">
                               <div className="bg-blue-500 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] border-2 border-black">
                                 <Zap size={10} fill="currentColor" />
                               </div>
                             </div>
                           )}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white transition-colors">
                           {story.user.name}
                        </span>
                    </div>
                  ))}
              </motion.div>

              {/* Feed Posts */}
              {posts.map((post) => (
                <motion.div variants={itemVariants} key={post.id} className="bg-[#1C1C1E] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl relative">
                  
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between z-10 relative">
                    <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => handleOpenProfile(post.user)}
                    >
                      <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-purple-500 relative">
                        <img src={post.user.avatar} className="w-full h-full rounded-full object-cover border-2 border-black" />
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-white flex items-center gap-1.5">
                          {post.user.name}
                          {post.user.isPro && <Zap size={12} className="text-blue-500 fill-current" />}
                        </div>
                        {post.location && <div className="text-[11px] text-zinc-400 font-bold flex items-center gap-0.5"><MapPin size={10} /> {post.location}</div>}
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-zinc-400 transition-colors">
                        <MoreHorizontal size={20} />
                    </button>
                  </div>

                  {/* Post Image Container */}
                  <div className="relative aspect-[4/5] w-full bg-[#111] group overflow-hidden">
                    {post.mediaType === 'video' ? (
                        <video src={post.image} className="w-full h-full object-cover transition-transform duration-700" controls />
                    ) : (
                        <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    
                    {/* Dark gradient for text readability at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />

                    {/* Workout Overlay - Specialized Card */}
                    {post.workout && (
                      <div className="absolute bottom-4 left-4 right-4 z-20">
                          <div className="bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-4 flex items-center justify-between shadow-xl ring-1 ring-white/5">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                                   <Activity size={24} />
                                </div>
                                <div>
                                   <div className="text-[15px] font-bold text-white leading-tight font-display mb-1">{post.workout.title}</div>
                                   <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase tracking-wide">
                                         <Clock size={10} /> {post.workout.duration}
                                      </span>
                                      <span className="w-0.5 h-2 bg-zinc-600 rounded-full" />
                                      <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase tracking-wide">
                                         <Flame size={10} /> {post.workout.calories}
                                      </span>
                                   </div>
                                </div>
                             </div>
                             <button 
                               onClick={() => setSelectedWorkout(post.workout || null)}
                               className="h-9 px-5 rounded-full bg-[#0A84FF] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#0077ED] transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center active:scale-95"
                             >
                                VIEW
                             </button>
                          </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Caption */}
                  <div className="p-5 pt-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-5">
                          <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5 group">
                            <Heart size={26} className={`transition-all duration-300 ${post.isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white group-hover:text-red-500'}`} strokeWidth={1.5} />
                          </button>
                          <button 
                            onClick={() => setActiveCommentsPostId(post.id)} 
                            className="flex items-center gap-1.5 group"
                          >
                            <MessageCircle size={26} className="text-white group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
                          </button>
                      </div>
                      {/* Likes Count */}
                      {post.stats.likes > 0 && (
                          <div className="text-sm font-bold text-white tabular-nums">
                              {post.stats.likes.toLocaleString()} likes
                          </div>
                      )}
                    </div>
                    
                    <div className="text-[15px] text-zinc-300 leading-relaxed mb-2">
                        <span className="font-bold mr-2 text-white">{post.user.name}</span>
                        {post.caption}
                    </div>
                    {post.stats.comments > 0 && (
                      <button 
                        onClick={() => setActiveCommentsPostId(post.id)}
                        className="text-[12px] text-zinc-500 font-medium mb-1 hover:text-white transition-colors"
                      >
                        View all {post.stats.comments} comments
                      </button>
                    )}
                    <div className="text-[11px] text-zinc-500 font-bold uppercase tracking-wide">{post.timeAgo} ago</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'INBOX' && (
            <motion.div key="inbox" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               {activeConversation ? renderChatInterface() : renderInboxList()}
            </motion.div>
          )}

          {activeTab === 'LOCAL' && (
            <motion.div key="local" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               {renderLocal()}
            </motion.div>
          )}

          {activeTab === 'TRAINERS' && (
            <motion.div key="trainers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               {renderTrainers()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Create Post FAB */}
      <AnimatePresence>
          {activeTab === 'FEED' && (
              <motion.button
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreating(true)}
                  className="fixed bottom-28 right-5 z-40 w-14 h-14 rounded-full bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.25)] flex items-center justify-center border border-white/10 md:hidden"
              >
                  <Plus size={24} strokeWidth={2.5} />
              </motion.button>
          )}
      </AnimatePresence>

      {/* User Profile Modal */}
      {createPortal(
         <AnimatePresence>
            {viewingProfile && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[2000] flex items-end md:items-center justify-center"
                >
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setViewingProfile(null)} />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="bg-[#000000] w-full md:w-[600px] h-[100dvh] md:h-[95vh] rounded-none md:rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col border border-white/10"
                    >
                        {/* Header Image */}
                        <div className="h-[380px] relative w-full overflow-hidden shrink-0">
                             <img src={viewingProfile.avatar} className="w-full h-full object-cover opacity-100" />
                             <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                             
                             <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pt-[calc(env(safe-area-inset-top)+10px)]">
                                <button 
                                    onClick={() => setViewingProfile(null)}
                                    className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button 
                                    onClick={() => setIsProfileOptionsOpen(true)}
                                    className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                    <MoreHorizontal size={20} />
                                </button>
                             </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 relative -mt-40 px-6 pb-24 bg-black rounded-t-[36px] min-h-screen border-t border-white/10">
                            {/* Avatar */}
                            <div className="relative mb-3 flex justify-between items-end -mt-14">
                                <div className="w-28 h-28 rounded-full p-1.5 bg-black relative shadow-2xl">
                                    <img src={viewingProfile.avatar} className="w-full h-full rounded-full object-cover border border-white/10" />
                                    {viewingProfile.isPro && (
                                        <div className="absolute bottom-1 right-1 bg-[#0A84FF] rounded-full p-1.5 border-[4px] border-black shadow-sm">
                                            <Zap size={12} className="text-white fill-current" />
                                        </div>
                                    )}
                                </div>
                                {viewingProfile.isCurrentUser ? (
                                    <div className="flex gap-2 mb-1">
                                         <button 
                                            className="h-9 px-6 rounded-full text-[13px] font-bold bg-[#1C1C1E] text-white border border-white/10 transition-all shadow-lg active:scale-95 hover:bg-[#2C2C2E]"
                                            onClick={() => showToast('Edit Profile Clicked')}
                                         >
                                             Edit Profile
                                         </button>
                                         <button 
                                            className="h-9 w-9 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-white hover:bg-[#2C2C2E] transition-colors active:scale-95 shadow-lg"
                                            onClick={() => handleProfileOption('Share Profile')}
                                         >
                                             <Share size={18} />
                                         </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 mb-1">
                                         <button 
                                            onClick={handleFollowToggle}
                                            className={`h-9 px-6 rounded-full text-[13px] font-bold transition-all shadow-lg active:scale-95 ${viewingProfile.isFollowing ? 'bg-[#1C1C1E] text-white border border-white/10' : 'bg-white text-black hover:bg-gray-200'}`}
                                         >
                                             {viewingProfile.isFollowing ? 'Following' : 'Follow'}
                                         </button>
                                         <button 
                                            onClick={handleMessageFromProfile}
                                            className="h-9 w-9 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-white hover:bg-[#2C2C2E] transition-colors active:scale-95 shadow-lg"
                                         >
                                             <MessageCircle size={18} />
                                         </button>
                                    </div>
                                )}
                            </div>

                            {/* Bio */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold font-display text-white mb-0.5 flex items-center gap-2">
                                    {viewingProfile.name}
                                </h2>
                                <div className="text-zinc-500 text-sm font-bold mb-3">{viewingProfile.role}</div>
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mb-3">{viewingProfile.bio}</p>
                                
                                <div className="flex flex-wrap gap-4 text-xs font-medium text-zinc-400">
                                    {viewingProfile.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} /> {viewingProfile.location}
                                        </div>
                                    )}
                                    {viewingProfile.website && (
                                        <div 
                                            onClick={() => handleWebsiteClick(viewingProfile.website)}
                                            className="flex items-center gap-1 text-blue-400 cursor-pointer hover:underline"
                                        >
                                            <LinkIcon size={12} /> {viewingProfile.website}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Clickable Stats */}
                            <div className="flex justify-between py-4 border-y border-white/10 mb-6">
                                {[
                                    { label: 'Followers', val: viewingProfile.followers, type: 'FOLLOWERS' },
                                    { label: 'Following', val: viewingProfile.following, type: 'FOLLOWING' },
                                    { label: 'Workouts', val: viewingProfile.workouts, type: 'WORKOUTS' }
                                ].map((stat, i) => (
                                    <div 
                                      key={i} 
                                      onClick={() => handleStatClick(stat.type as any)}
                                      className="text-center px-4 cursor-pointer active:scale-95 transition-transform group"
                                    >
                                        <div className="text-lg font-bold font-display text-white tabular-nums group-hover:text-[#0A84FF] transition-colors">{stat.val}</div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Profile Tabs */}
                            <div className="flex border-b border-white/10 mb-6">
                                <button 
                                  onClick={() => setActiveProfileTab('GRID')}
                                  className={`flex-1 pb-3 flex justify-center transition-colors border-b-2 ${activeProfileTab === 'GRID' ? 'text-white border-white' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                                >
                                    <Grid size={20} />
                                </button>
                                <button 
                                  onClick={() => setActiveProfileTab('ACTIVITY')}
                                  className={`flex-1 pb-3 flex justify-center transition-colors border-b-2 ${activeProfileTab === 'ACTIVITY' ? 'text-white border-white' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                                >
                                    <Activity size={20} />
                                </button>
                                <button 
                                  onClick={() => setActiveProfileTab('TAGGED')}
                                  className={`flex-1 pb-3 flex justify-center transition-colors border-b-2 ${activeProfileTab === 'TAGGED' ? 'text-white border-white' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
                                >
                                    <Users size={20} />
                                </button>
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                {activeProfileTab === 'GRID' && (
                                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-3 gap-1">
                                        {viewingProfile.posts.map((img, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => showToast('Opening post...')}
                                                className="aspect-square bg-[#1C1C1E] overflow-hidden cursor-pointer group relative active:opacity-90 transition-opacity"
                                            >
                                                <img src={img} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                                {idx === 0 && (
                                                    <div className="absolute top-1 right-1">
                                                        <Zap size={12} className="text-white fill-current drop-shadow-md" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {/* Load More Card */}
                                        <div 
                                            onClick={handleLoadMorePosts}
                                            className="aspect-square bg-[#111] flex flex-col items-center justify-center border border-white/5 cursor-pointer hover:bg-[#1C1C1E] transition-colors group active:scale-95"
                                        >
                                             <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center mb-2 group-hover:border-white/30 text-zinc-500 group-hover:text-white transition-colors">
                                                <ChevronDown size={16} />
                                             </div>
                                             <span className="text-[10px] font-bold text-zinc-600 group-hover:text-zinc-400 uppercase tracking-widest transition-colors">Load More</span>
                                        </div>
                                    </motion.div>
                                )}

                                {activeProfileTab === 'ACTIVITY' && (
                                    <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                        {RECENT_COMPLETED_WORKOUTS.map((workout, idx) => (
                                            <div key={idx} className="flex items-center gap-4 p-3 bg-[#1C1C1E] rounded-2xl border border-white/5">
                                                <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center text-zinc-400 border border-white/5">
                                                    {workout.type === 'Cardio' ? <Activity size={20} /> : <Dumbbell size={20} />}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold text-sm mb-0.5">{workout.title}</div>
                                                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-2">
                                                        <span>{workout.duration}</span>
                                                        <span className="w-0.5 h-2 bg-zinc-700 rounded-full" />
                                                        <span>{workout.score} Score</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {activeProfileTab === 'TAGGED' && (
                                    <motion.div key="tagged" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-3 gap-1">
                                        {/* Mock Tagged Content */}
                                        {[1, 2].map((i) => (
                                            <div key={i} className="aspect-square bg-[#1C1C1E] relative overflow-hidden">
                                                <img src={`https://images.unsplash.com/photo-${i === 1 ? '1574680096145-d05b474e2155' : '1534438327276-14e5300c3a48'}?q=80&w=400&auto=format&fit=crop`} className="w-full h-full object-cover opacity-60" />
                                                <div className="absolute top-1 right-1">
                                                    <User size={12} className="text-white fill-current drop-shadow-md" />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="aspect-square bg-[#1C1C1E] flex items-center justify-center">
                                            <span className="text-[10px] text-zinc-600 font-bold uppercase">No more</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 text-center pb-20">
                                {activeProfileTab === 'GRID' && <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider">End of Posts</p>}
                            </div>

                        </div>
                    </motion.div>
                </motion.div>
            )}
         </AnimatePresence>,
         document.body
      )}

      {/* Profile Options Modal */}
      {createPortal(
        <AnimatePresence>
            {isProfileOptionsOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[250] flex items-end justify-center"
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsProfileOptionsOpen(false)} />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[#1C1C1E] w-full md:w-[400px] rounded-t-[32px] md:rounded-[32px] md:mb-6 shadow-2xl relative flex flex-col border-t md:border border-white/10 overflow-hidden"
                    >
                         <div className="p-2 flex justify-center">
                            <div className="w-12 h-1 bg-zinc-700 rounded-full" />
                         </div>
                         <div className="p-4 space-y-2">
                             <button onClick={() => handleProfileOption('Share Profile')} className="w-full p-4 bg-[#2C2C2E] hover:bg-[#333] rounded-2xl flex items-center gap-4 text-white font-bold text-sm transition-colors active:scale-[0.98]">
                                <Share size={20} /> Share Profile
                             </button>
                             <button onClick={() => handleProfileOption('Copy URL')} className="w-full p-4 bg-[#2C2C2E] hover:bg-[#333] rounded-2xl flex items-center gap-4 text-white font-bold text-sm transition-colors active:scale-[0.98]">
                                <Copy size={20} /> Copy Profile URL
                             </button>
                             <button onClick={() => handleProfileOption('Report')} className="w-full p-4 bg-[#2C2C2E] hover:bg-[#333] rounded-2xl flex items-center gap-4 text-red-500 font-bold text-sm transition-colors active:scale-[0.98]">
                                <Flag size={20} /> Report User
                             </button>
                             <button onClick={() => handleProfileOption('Block')} className="w-full p-4 bg-[#2C2C2E] hover:bg-[#333] rounded-2xl flex items-center gap-4 text-red-500 font-bold text-sm transition-colors active:scale-[0.98]">
                                <Slash size={20} /> Block
                             </button>
                         </div>
                         <div className="p-4 pt-2">
                             <button onClick={() => setIsProfileOptionsOpen(false)} className="w-full p-4 bg-black border border-white/10 hover:bg-zinc-900 rounded-2xl text-white font-bold text-sm transition-colors">
                                Cancel
                             </button>
                         </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}

      {/* Profile Stats Sheet (Followers/Following/Workouts) */}
      {createPortal(
        <AnimatePresence>
            {profileStatSheet && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[250] flex items-end justify-center"
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setProfileStatSheet(null)} />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[#1C1C1E] w-full md:w-[500px] h-[60vh] rounded-t-[32px] shadow-2xl relative flex flex-col border-t border-white/10"
                    >
                         <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E] shrink-0 rounded-t-[32px]">
                            <h2 className="text-lg font-bold font-display text-white">{profileStatSheet.title}</h2>
                            <button onClick={() => setProfileStatSheet(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {profileStatSheet.type === 'WORKOUTS' ? (
                                RECENT_COMPLETED_WORKOUTS.map((workout, idx) => (
                                    <div key={idx} className="bg-[#2C2C2E] p-4 rounded-[24px] border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-zinc-400 border border-white/5">
                                                {workout.type === 'Cardio' ? <Activity size={20} /> : <Dumbbell size={20} />}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-sm mb-0.5">{workout.title}</div>
                                                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-2">
                                                    <span>{workout.duration}</span>
                                                    <span className="w-0.5 h-2 bg-zinc-700 rounded-full" />
                                                    <span>{workout.calories} Kcal</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-white tabular-nums">{workout.score}</div>
                                    </div>
                                ))
                            ) : (
                                // Followers / Following List
                                [1, 2, 3, 4, 5].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2">
                                        <div className="flex items-center gap-3">
                                            <img src={`https://images.unsplash.com/photo-${1500000000000 + idx}?q=80&w=100&auto=format&fit=crop`} className="w-10 h-10 rounded-full bg-zinc-800 object-cover" />
                                            <div>
                                                <div className="text-white font-bold text-sm">User {item}</div>
                                                <div className="text-zinc-500 text-xs">Full Name</div>
                                            </div>
                                        </div>
                                        <button className="px-4 py-1.5 rounded-full bg-white/10 text-xs font-bold text-white hover:bg-white/20 transition-colors">
                                            {profileStatSheet.type === 'FOLLOWING' ? 'Following' : 'Follow'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}

      {/* Workout View Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedWorkout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedWorkout(null)} />
              
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-[#1C1C1E] w-full md:w-[500px] h-[85vh] md:rounded-[32px] rounded-t-[32px] shadow-2xl relative overflow-hidden flex flex-col border border-white/10"
              >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E] shrink-0">
                   <h2 className="text-lg font-bold font-display text-white">Workout Details</h2>
                   <button onClick={() => setSelectedWorkout(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">
                      <X size={18} />
                   </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                   <div className="bg-black/30 rounded-[24px] p-6 border border-white/5 mb-6 relative overflow-hidden">
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
                      
                      <div className="flex items-start justify-between mb-4 relative z-10">
                         <div>
                            {/* Workout Shared banner removed */}
                            <h1 className="text-3xl font-bold font-display text-white leading-tight">{selectedWorkout.title}</h1>
                         </div>
                         <div className="w-12 h-12 bg-[#2C2C2E] rounded-full flex items-center justify-center text-white border border-white/10">
                            <Activity size={24} />
                         </div>
                      </div>
                      
                      <div className="flex gap-4 relative z-10">
                         <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-bold bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                            <Clock size={14} className="text-zinc-400" /> {selectedWorkout.duration}
                         </div>
                         <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-bold bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                            <Flame size={14} className="text-orange-500" /> {selectedWorkout.calories} Kcal
                         </div>
                         <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-bold bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                            <Zap size={14} className="text-blue-500" /> {selectedWorkout.type}
                         </div>
                      </div>
                   </div>

                   <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-4 px-1">Included Exercises</h3>
                   <div className="space-y-3">
                      {/* Mock Exercises for the view */}
                      {EXERCISE_DB.slice(0, 4).map((ex, i) => (
                         <div key={i} className="bg-[#2C2C2E] p-4 rounded-2xl flex items-center gap-4 border border-white/5">
                             <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center text-sm font-bold text-zinc-500 shadow-inner border border-white/5">{i + 1}</div>
                             <div className="flex-1">
                                <div className="text-white font-bold text-sm mb-0.5">{ex.name}</div>
                                <div className="text-zinc-500 text-xs flex items-center gap-2">
                                    <span>3 Sets</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                    <span>10-12 Reps</span>
                                </div>
                             </div>
                             <ChevronRight size={16} className="text-zinc-600" />
                         </div>
                      ))}
                   </div>
                </div>

                <div className="p-6 bg-[#1C1C1E] border-t border-white/10 safe-area-bottom">
                   <div className="flex gap-3">
                       <Button onClick={() => { showToast('Added to Calendar'); setSelectedWorkout(null); }} className="flex-1 bg-white text-black h-14 rounded-[20px] text-lg font-bold hover:bg-gray-200">
                          <CalendarIcon size={18} className="mr-2" /> Add to Calendar
                       </Button>
                       <Button variant="secondary" onClick={() => { if(onStartWorkout) onStartWorkout(); setSelectedWorkout(null); }} className="flex-1 h-14 rounded-[20px] text-lg font-bold bg-[#2C2C2E] text-white hover:bg-[#3A3A3C]">
                          <Play size={18} className="mr-2 fill-current" /> Start
                       </Button>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      
      {/* Create Post Modal */}
      {createPortal(
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsCreating(false)} />
              
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-[#1C1C1E] w-full md:w-[500px] h-[80vh] md:h-auto md:rounded-[32px] rounded-t-[32px] shadow-2xl relative overflow-hidden flex flex-col border border-white/10"
              >
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E] shrink-0">
                   <h2 className="text-lg font-bold font-display text-white">New Post</h2>
                   <button onClick={() => setIsCreating(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">
                      <X size={18} />
                   </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <img src={STORIES[0].user.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-black/50" />
                            <div>
                                <div className="font-bold text-white text-[15px]">Alex Runner</div>
                                <div className="text-xs text-zinc-500 font-bold uppercase tracking-wide">Public Post</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-2">{isAiLoading ? 'Enhancing...' : 'AI Enhance'}</div>
                             <div 
                                onClick={handleAiEnhance}
                                className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer border ${aiEnhanced ? 'bg-green-500 border-green-500' : 'bg-[#2C2C2E] border-white/10'}`}
                             >
                                 <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform flex items-center justify-center text-[10px] font-bold ${aiEnhanced ? 'translate-x-5' : 'translate-x-0'}`}>
                                     {aiEnhanced ? <Zap size={10} className="text-green-500 fill-current" /> : <Bot size={10} className="text-zinc-400" />}
                                 </div>
                             </div>
                        </div>
                    </div>

                    <textarea
                        className="w-full bg-transparent text-white text-lg placeholder-zinc-500 outline-none resize-none min-h-[120px] font-medium leading-relaxed"
                        placeholder="Share your progress..."
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        autoFocus
                        disabled={isAiLoading}
                    />
                    
                    {/* Attached Content Preview */}
                    <AnimatePresence>
                        {attachedWorkout && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 bg-[#2C2C2E] rounded-[24px] p-4 border border-white/5 relative group"
                            >
                                <button 
                                    onClick={() => setAttachedWorkout(null)}
                                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-10"
                                >
                                    <X size={14} />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Attached Workout</div>
                                        <div className="text-white font-bold text-sm leading-tight mb-1">{attachedWorkout.title}</div>
                                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                                            <span className="flex items-center gap-1"><Clock size={10} /> {attachedWorkout.duration}</span>
                                            <span className="flex items-center gap-1"><Flame size={10} /> {attachedWorkout.calories}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Media / Attachment Selection */}
                    <div className="mt-6 space-y-3">
                         {selectedMedia && !attachedWorkout ? (
                             <div className="relative rounded-[24px] overflow-hidden border border-white/10 group">
                                 {mediaType === 'video' ? (
                                     <video src={selectedMedia} className="w-full h-48 object-cover" controls />
                                 ) : (
                                     <img src={selectedMedia} className="w-full h-48 object-cover" />
                                 )}
                                 <button 
                                    onClick={() => setSelectedMedia(null)}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500/80 transition-colors"
                                 >
                                     <X size={16} />
                                 </button>
                             </div>
                         ) : !attachedWorkout ? (
                             <div className="grid grid-cols-2 gap-3">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-32 rounded-[24px] border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-black transition-colors">
                                        <ImageIcon size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Photo / Video</span>
                                </div>
                                <div 
                                    onClick={() => setIsWorkoutPickerOpen(true)}
                                    className="h-32 rounded-[24px] border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-zinc-400 group-hover:bg-[#0A84FF] group-hover:text-white transition-colors">
                                        <Dumbbell size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Attach Workout</span>
                                </div>
                             </div>
                         ) : null}
                    </div>
                    {/* Hidden File Input */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,video/*" 
                        onChange={handleFileSelect} 
                    />
                </div>

                <div className="p-6 bg-[#1C1C1E] border-t border-white/10 safe-area-bottom">
                   <Button onClick={handleCreatePost} disabled={(!newCaption.trim() && !attachedWorkout && !selectedMedia) || isAiLoading} className="w-full bg-white text-black h-14 rounded-[20px] text-lg font-bold hover:bg-gray-200 disabled:opacity-50">
                      {isAiLoading ? 'Generating...' : 'Share to Community'}
                   </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Workout Picker Sheet */}
      {createPortal(
        <AnimatePresence>
            {isWorkoutPickerOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[250] flex items-end justify-center"
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsWorkoutPickerOpen(false)} />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[#1C1C1E] w-full md:w-[500px] h-[60vh] rounded-t-[32px] shadow-2xl relative flex flex-col border-t border-white/10"
                    >
                         <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E] shrink-0 rounded-t-[32px]">
                            <h2 className="text-lg font-bold font-display text-white">Select Completed Workout</h2>
                            <button onClick={() => setIsWorkoutPickerOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {RECENT_COMPLETED_WORKOUTS.map((workout, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => { setAttachedWorkout(workout); setIsWorkoutPickerOpen(false); setSelectedMedia(null); }}
                                    className="bg-[#2C2C2E] p-4 rounded-[24px] border border-white/5 active:scale-[0.98] transition-transform cursor-pointer hover:bg-[#363638] flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-zinc-400 border border-white/5 group-hover:text-white group-hover:border-white/20 transition-colors">
                                            {workout.type === 'Cardio' ? <Activity size={20} /> : <Dumbbell size={20} />}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm mb-0.5">{workout.title}</div>
                                            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-2">
                                                <span>{workout.duration}</span>
                                                <span className="w-0.5 h-2 bg-zinc-700 rounded-full" />
                                                <span>{workout.calories} Kcal</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:bg-[#0A84FF] group-hover:text-white group-hover:border-[#0A84FF] transition-all">
                                        <Plus size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}

      {/* Comment Sheet Modal */}
      {createPortal(
        <AnimatePresence>
          {activeCommentsPostId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end md:items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setActiveCommentsPostId(null)} />
              
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-[#1C1C1E] w-full md:w-[500px] h-[75vh] md:rounded-[32px] rounded-t-[32px] shadow-2xl relative overflow-hidden flex flex-col border border-white/10"
              >
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-[#1C1C1E] shrink-0">
                   <h2 className="text-lg font-bold font-display text-white">Comments</h2>
                   <button onClick={() => setActiveCommentsPostId(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors">
                      <X size={18} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                     {commentsData[activeCommentsPostId]?.map((comment) => (
                         <div key={comment.id} className="flex gap-3">
                             <img src={comment.user.avatar} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
                             <div className="flex-1">
                                 <div className="flex items-baseline gap-2 mb-0.5">
                                     <span className="text-sm font-bold text-white">{comment.user.name}</span>
                                     <span className="text-xs text-zinc-500">{comment.timeAgo}</span>
                                 </div>
                                 <p className="text-sm text-zinc-300 leading-relaxed">{comment.text}</p>
                             </div>
                         </div>
                     ))}
                     {(!commentsData[activeCommentsPostId] || commentsData[activeCommentsPostId].length === 0) && (
                         <div className="flex flex-col items-center justify-center h-full text-zinc-500 pb-10">
                             <MessageCircle size={32} className="mb-2 opacity-50" />
                             <p className="text-sm">No comments yet.</p>
                         </div>
                     )}
                </div>

                <form onSubmit={handlePostComment} className="p-4 bg-[#1C1C1E] border-t border-white/10 safe-area-bottom flex gap-3 items-center">
                    <img src={STORIES[0].user.avatar} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <input 
                        className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder-zinc-500"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        disabled={!commentText.trim()}
                        className="text-blue-500 font-bold text-sm disabled:opacity-50 hover:text-blue-400 transition-colors px-2"
                    >
                        Post
                    </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Simple Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-[#30D158] text-white px-5 py-3 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2 z-[200]"
            >
                <Check size={16} strokeWidth={3} /> {toastMessage}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
