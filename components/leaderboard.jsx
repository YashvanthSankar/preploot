"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Flame, 
  Star, 
  Medal,
  Crown,
  Users,
  TrendingUp,
  Zap,
  RefreshCw
} from 'lucide-react';

export function Leaderboard({ className = "" }) {
  const { data: session } = useSession();
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('xp');

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const fetchLeaderboard = async (type = 'xp') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?type=${type}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setLoading(false);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };

  const getRankBackground = (rank, isCurrentUser) => {
    if (isCurrentUser) {
      return "bg-blue-50 border-blue-200 border-2";
    }
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100";
      default:
        return "bg-white hover:bg-gray-50";
    }
  };

  const formatLastActive = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3 p-3 rounded-lg">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Leaderboard</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLeaderboard(activeTab)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="xp" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>XP Leaders</span>
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center space-x-2">
              <Flame className="h-4 w-4" />
              <span>Streak Leaders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="mt-4">
            <LeaderboardContent 
              data={leaderboardData} 
              type="xp" 
              currentUserId={session?.user?.id}
              getRankIcon={getRankIcon}
              getRankBackground={getRankBackground}
              formatLastActive={formatLastActive}
            />
          </TabsContent>

          <TabsContent value="streak" className="mt-4">
            <LeaderboardContent 
              data={leaderboardData} 
              type="streak" 
              currentUserId={session?.user?.id}
              getRankIcon={getRankIcon}
              getRankBackground={getRankBackground}
              formatLastActive={formatLastActive}
            />
          </TabsContent>
        </Tabs>

        {/* Statistics */}
        {leaderboardData?.stats && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Community Stats
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-medium text-gray-900">{leaderboardData.stats.totalUsers}</div>
                <div className="text-gray-500">Active Users</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-medium text-gray-900">{leaderboardData.stats.averageXP}</div>
                <div className="text-gray-500">Avg XP</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeaderboardContent({ data, type, currentUserId, getRankIcon, getRankBackground, formatLastActive }) {
  if (!data?.leaderboard) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>No leaderboard data available</p>
      </div>
    );
  }

  const { leaderboard, currentUserRank } = data;
  const valueKey = type === 'xp' ? 'xp' : 'streak';
  const icon = type === 'xp' ? Star : Flame;
  const IconComponent = icon;

  return (
    <div className="space-y-2">
      <ScrollArea className="h-96">
        <div className="space-y-2 pr-4">
          {leaderboard.map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${getRankBackground(user.rank, user.isCurrentUser)}`}
            >
              {/* Rank */}
              <div className="flex-shrink-0">
                {getRankIcon(user.rank)}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                    {user.isCurrentUser && (
                      <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{formatLastActive(user.lastActiveAt)}</span>
                  <span>{user.totalQuizzes} quizzes</span>
                  <span>{user.totalVideos} videos</span>
                </div>
              </div>

              {/* Score */}
              <div className="flex items-center space-x-1 text-sm font-medium">
                <IconComponent className="h-4 w-4 text-gray-600" />
                <span className="text-gray-900">{user[valueKey]}</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Current User Rank (if not in top) */}
      {currentUserRank && (
        <div className="mt-4 pt-4 border-t">
          <div className={`flex items-center space-x-3 p-3 rounded-lg ${getRankBackground(currentUserRank.rank, true)}`}>
            <div className="flex-shrink-0">
              {getRankIcon(currentUserRank.rank)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {currentUserRank.name}
                <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
              </p>
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium">
              <IconComponent className="h-4 w-4 text-gray-600" />
              <span className="text-gray-900">{currentUserRank[valueKey]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}