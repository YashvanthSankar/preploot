import { Leaderboard } from '@/components/leaderboard';
import { XPDisplay } from '@/components/xp-display';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Leaderboard</h1>
          <p className="text-gray-600">
            See how you rank against other learners in XP points and daily streaks!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* XP Display - User's personal stats */}
          <div className="lg:col-span-1">
            <XPDisplay />
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Leaderboard />
          </div>
        </div>

        {/* XP Guide */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How to Earn XP</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">📚 Quiz Completion</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• 1 XP per correct answer</li>
                <li>• 5x XP bonus for perfect score</li>
                <li>• Example: 5/5 correct = 25 XP</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">🔥 Daily Check-in</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• 1 XP base reward</li>
                <li>• +1 XP per streak day</li>
                <li>• Max 10 XP streak bonus</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">📺 Video Completion</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• 2 XP per video watched</li>
                <li>• Track your learning progress</li>
                <li>• Consistent learning rewards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}