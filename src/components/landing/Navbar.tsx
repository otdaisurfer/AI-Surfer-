import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


export default function Navbar() {
  const { user, loading } = useAuth();

  return (

    <motion.nav

      initial={{
        opacity:0,
        y:-30
      }}

      animate={{
        opacity:1,
        y:0
      }}

      transition={{
        duration:0.8
      }}

      className="
        sticky
        top-3
        z-50
        w-[90%]
        max-w-6xl
        mx-auto
        rounded-full
        border
        border-white/20
        bg-white/10
        backdrop-blur-xl
        px-6
        py-3
        shadow-2xl
      "

    >


      <div className="flex items-center justify-between">


        <Link
          to="/"
          className="flex items-center gap-3 font-bold text-white"
        >
          <span>AI SURFER</span>


        </Link>




        <div
          className="
            flex
            items-center
            gap-3
          "
        >


          <Link
            to="/pricing"
            className="
              hidden
              md:block
              text-white/90
              hover:text-cyan-300
              transition
            "
          >
            Pricing
          </Link>




          <Link
            to="/members"
            className="
              hidden
              md:block
              rounded-full
              border
              border-cyan-300/40
              px-5
              py-2
              text-cyan-200
              font-bold
              hover:bg-cyan-300/20
              transition
            "
          >
            🌊 Members
          </Link>




          <Link
            to={user ? "/members" : "/login"}
            className="
              rounded-full
              bg-cyan-400
              px-5
              py-2
              font-bold
              text-slate-950
              hover:scale-105
              transition
            "
          >
            {loading ? "Checking Tide..." : user ? "My Dashboard" : "Enter Harbor"}
          </Link>



        </div>



      </div>


    </motion.nav>

  );

}
