export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-4">Last updated: October 6, 2025</p>
          
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using PrepLoot, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
          
          <h2>Description of Service</h2>
          <p>
            PrepLoot is an AI-powered learning platform designed to help students prepare for competitive exams through:
          </p>
          <ul>
            <li>Personalized quizzes generated from educational content</li>
            <li>Gamified learning with XP points, badges, and streaks</li>
            <li>Progress tracking and analytics</li>
            <li>Leaderboards and social features</li>
          </ul>
          
          <h2>User Accounts</h2>
          <p>To use our services, you must:</p>
          <ul>
            <li>Create an account using valid credentials</li>
            <li>Maintain the security of your account</li>
            <li>Be responsible for all activities under your account</li>
            <li>Not share your account with others</li>
          </ul>
          
          <h2>Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt our services</li>
            <li>Share or distribute copyrighted content without permission</li>
          </ul>
          
          <h2>Intellectual Property</h2>
          <p>
            PrepLoot and its content, features, and functionality are owned by PrepLoot and are protected by intellectual property laws.
          </p>
          
          <h2>Limitation of Liability</h2>
          <p>
            PrepLoot shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of our services.
          </p>
          
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any significant changes via email or platform notifications.
          </p>
          
          <h2>Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at{" "}
            <a href="mailto:legal@preploot.com" className="text-primary hover:underline">
              legal@preploot.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}