import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Waves,
  LayoutDashboard,
  Bot,
  Workflow,
  FolderKanban,
  Users,
  TrendingUp,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  Compass,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

export default function Members() {

  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [

    {
      name: "Command Center",
      path: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      name: "AI Tools",
      path: "/tools",
      icon: Bot,
    },

    {
      name: "Automation Hub",
      path: "/automation",
      icon: Workflow,
    },

    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },

    {
      name: "Lead Navigator",
      path: "/leads",
      icon: Users,
    },

    {
      name: "Revenue Dashboard",
      path: "/analytics",
      icon: TrendingUp,
    },

    {
      name: "Billing",
      path: "/billing",
      icon: CreditCard,
    },

    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },

  ];


  return (

    <div
      className="min-h-screen bg-slate-950 text-white flex"
      style={{
        backgroundImage: 'linear-gradient(rgba(2,12,30,0.92), rgba(2,12,30,0.96)), url("/images/Members-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >


      {/* Ocean Glow Background */}

      <div className="fixed inset-0 pointer-events-none">

        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 blur-[140px] rounded-full" />

        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 blur-[140px] rounded-full" />

      </div>




      {/* Sidebar */}

      <aside className="hidden md:flex w-72 flex-col border-r border-white/10 bg-slate-950/80 backdrop-blur-xl relative z-10">


        {/* Logo */}

        <div className="p-6 border-b border-white/10">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 flex items-center justify-center">

              <Waves className="text-cyan-400 w-7 h-7" />

            </div>


            <div>

              <h1 className="font-black text-lg">
                OCEAN TIDE DROP
              </h1>

              <p className="text-xs text-cyan-400 font-bold tracking-widest">
                AI SURFER
              </p>

            </div>

          </div>


        </div>





        {/* Navigation */}

        <nav className="flex-1 p-4 space-y-2">


          {menuItems.map((item) => {

            const Icon = item.icon;

            const active =
              location.pathname === item.path;


            return (

              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all
                  ${
                    active
                    ? "bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                  }
                `}
              >

                <Icon className="w-5 h-5" />

                <span>
                  {item.name}
                </span>


              </Link>

            );

          })}


        </nav>







        {/* Bottom Member Card */}

        <div className="p-4">


          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">


            <Sparkles className="text-cyan-300 mb-3" />


            <h3 className="font-bold">
              Ride The AI Wave
            </h3>


            <p className="text-xs text-white/60 mt-2">
              Your AI crew is ready to help your business grow.
            </p>


          </div>




          <button
            onClick={() => { if (window.confirm("Are you sure you want to sign out?")) logout(); }}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition"
          >

            <LogOut className="w-4 h-4" />

            Logout

          </button>


        </div>


      </aside>








      {/* Main Content */}

      <main className="flex-1 relative z-10">


        {/* Top Header */}

        <header className="h-20 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl flex items-center justify-between px-6">


          <div>

            <p className="text-xs text-cyan-400 font-bold tracking-widest">
              MEMBERS AREA
            </p>


            <h2 className="text-xl font-black">
              AI Surfer Command Deck
            </h2>


          </div>




          <div className="flex items-center gap-3">


            <Compass className="text-cyan-400" />


            <div className="text-right">

              <p className="text-sm font-bold">
                Captain Account
              </p>

              <p className="text-xs text-white/50">
                Active Member
              </p>

            </div>


          </div>


        </header>







        {/* Pages Render Here */}

        <div className="p-6 md:p-10">


          <Outlet />


        </div>



      </main>




    </div>

  );

}
