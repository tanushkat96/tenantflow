import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Footer from "../components/layout/Footer";
import HeroImage from "../assets/Hero.svg";

function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: FolderKanban,
      title: "Project Management",
      description:
        "Organize and manage all your projects in one centralized place with ease",
    },
    {
      icon: CheckSquare,
      title: "Task Tracking",
      description:
        "Keep track of tasks with Kanban boards and real-time updates",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Invite team members and work together seamlessly",
    },
    {
      icon: BarChart3,
      title: "Analytics & Stats",
      description:
        "Get insights into your project progress and team performance",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Stay updated with instant notifications and live data",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security",
    },
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "50K+", label: "Projects Managed" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-gray-100 to-accent">
      {/* Header - Minimal for Landing */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">
              TenantFlow
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 text-gray-700 hover:text-purple-600 transition font-medium"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="btn-primary px-5 py-2.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fadeIn">
              
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Team's{" "}
                <span className="gradient-text">Workflow</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Streamline project management, empower your team, and deliver
                results faster with TenantFlow. The all-in-one platform for
                modern organizations.
              </p>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap gap-4 pt-2">
                {["Free 14-day trial", "No credit card", "Cancel anytime"].map(
                  (item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {item}
                    </div>
                  ),
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate("/register")}
                  className="btn-primary px-8 py-4 text-lg flex items-center justify-center gap-2"
                >
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 text-lg border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition font-medium"
                >
                  View Demo
                </button>
              </div>
            </div>

            {/* Right - Hero Image with Glass Frame */}
            <div className="relative h-96 lg:h-full min-h-96 flex items-center justify-center animate-slideIn">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative glass rounded-2xl p-4 w-full h-full">
                <img
                  src={HeroImage}
                  alt="Organization workflow"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for{" "}
              <span className="gradient-text">Modern Teams</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage projects, tasks, and teams in one
              unified platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass card-hover p-8 rounded-2xl"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                Join thousands of teams already using TenantFlow to streamline
                their work
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/register")}
                  className="btn-primary px-8 py-4 text-lg"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 text-lg border-2 border-purple-200 text-purple-700 rounded-xl hover:bg-purple-50 transition font-medium"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
