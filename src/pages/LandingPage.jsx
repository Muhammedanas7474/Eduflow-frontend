import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "../components/UIComponents";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black flex flex-col justify-center items-center px-6 pt-20 text-center">
        <div className="max-w-4xl relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon/10 rounded-full blur-[100px] animate-pulse"></div>

          <h1 className="relative text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Master Any Skill with <br />
            <span className="text-neon">EduFlow</span>
          </h1>

          <p className="relative text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The modern learning platform designed for the future of education.
            Connect, learn, and grow with tailored courses and expert instructors.
          </p>

          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" className="!px-8 !py-4 text-lg">
                Start Learning Now
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="outline" className="!px-8 !py-4 text-lg">
                Access Content
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-2">Interactive Learning</h3>
            <p className="text-gray-400">Engage with dynamic content and real-time feedback.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-2">Expert Instructors</h3>
            <p className="text-gray-400">Learn from industry leaders and experienced professionals.</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <h3 className="text-xl font-bold text-white mb-2">Track Progress</h3>
            <p className="text-gray-400">Monitor your growth with detailed analytics and insights.</p>
          </div>
        </div>
      </div>
    </>
  );
}
