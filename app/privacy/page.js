export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-4">Last updated: October 6, 2025</p>
          
          <h2>Information We Collect</h2>
          <p>
            PrepLoot collects information to provide better services to our users. We collect information in the following ways:
          </p>
          
          <h3>Information you give us</h3>
          <ul>
            <li>Account information (name, email address, profile picture) when you sign up</li>
            <li>Learning progress and quiz results</li>
            <li>User preferences and settings</li>
          </ul>
          
          <h3>Information we get from your use of our services</h3>
          <ul>
            <li>Usage statistics and analytics</li>
            <li>Device information and browser type</li>
            <li>Log information including IP address and timestamps</li>
          </ul>
          
          <h2>How We Use Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Track your learning progress and provide personalized recommendations</li>
            <li>Communicate with you about updates and features</li>
            <li>Ensure the security of our platform</li>
          </ul>
          
          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul>
            <li>With your consent</li>
            <li>For legal reasons or to protect our rights</li>
            <li>With service providers who help us operate our platform</li>
          </ul>
          
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@preploot.com" className="text-primary hover:underline">
              privacy@preploot.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}