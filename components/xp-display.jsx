"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Flame, 
  Star, 
  Calendar,
  Zap,
  TrendingUp,
  Gift
} from 'lucide-react';

export function XPDisplay({ className = "" }) {
  const { data: session } = useSession();
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchXPData();
    }
  }, [session?.user?.id]);

  const fetchXPData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/xp');
      if (response.ok) {
        const data = await response.json();
        setXpData(data);
      }
    } catch (error) {
      console.error('Error fetching XP data:', error);
    }
    setLoading(false);
  };

  const handleDailyCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await fetch('/api/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'daily_checkin',
          data: {}
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // Refresh XP data
        await fetchXPData();
        
        // Show success message
        alert(`Daily check-in successful! +${result.xpAwarded} XP earned. Streak: ${result.currentStreak} days!`);
      } else {
        alert(result.error || 'Check-in failed');
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      alert('Check-in failed');
    }
    setCheckingIn(false);
  };

  if (!session?.user?.id) {
    return null;
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!xpData) {
    return null;
  }

  const { user, canCheckIn, recentAchievements } = xpData;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>Your Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* XP and Streak Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">XP</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">{user.xp}</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Flame className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Streak</span>
            </div>
            <div className="text-2xl font-bold text-orange-800">{user.streak}</div>
          </div>
        </div>

        {/* Daily Check-in Button */}
        {canCheckIn && (
          <Button 
            onClick={handleDailyCheckIn}
            disabled={checkingIn}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {checkingIn ? 'Checking in...' : 'Daily Check-in'}
          </Button>
        )}

        {/* Recent Achievements */}
        {recentAchievements && recentAchievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <Gift className="h-4 w-4 mr-1" />
              Recent Activity
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recentAchievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className="text-xs p-2 bg-gray-50 rounded flex justify-between items-center">
                  <span className="truncate flex-1">{achievement.title}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    +{achievement.xpReward} XP
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Stats */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Member since:</span>
            <span>{new Date(user.memberSince).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Last active:</span>
            <span>{new Date(user.lastActiveAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}