import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Users,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
} from "lucide-react";
import Header from "../components/layout/Header";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-gray-100 to-accent">
      {/* Header - Minimal for Landing */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TenantFlow
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 text-gray-700 hover:text-primary transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition transform hover:scale-105"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Team's{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Workflow
                </span>
              </h1>
              <p className="text-lg text-gray-600">
                Streamline project management, empower your team, and deliver
                results faster with TenantFlow. The all-in-one platform for
                modern organizations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2 font-semibold"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition font-semibold"
                >
                  Login
                </button>
              </div>
            </div>

            {/* Right - Hero Image */}
            <div className="relative h-96 lg:h-full min-h-96 flex items-center justify-center">
              <img
                src={HeroImage}
                alt="Organization workflow"
                className="w-full h-full object-cover rounded-2xl"
              />
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
              <span className="text-primary">Modern Teams</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage projects, tasks, and teams in one
              unified platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition hover:scale-105 hover:border-primary/30"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
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
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join thousands of teams already using TenantFlow to streamline their
            work
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-gray-50 transition font-semibold transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
