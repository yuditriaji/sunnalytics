import React from 'react';
   import { useRouter } from 'next/router';
   import { FaChartBar, FaFolder, FaSearch, FaQuestion, FaCog } from 'react-icons/fa';

   interface BottomNavProps {
     className?: string;
   }

   const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
     const router = useRouter();
     const { pathname } = router;

     const menuItems = [
       { key: '/', label: 'Market', icon: <FaChartBar className="h-5 w-5" /> },
       { key: '/portfolio', label: 'Portfolio', icon: <FaFolder className="h-5 w-5" /> },
       { key: '/search', label: 'Search', icon: <FaSearch className="h-5 w-5" /> },
       { key: '/tbd', label: 'TBD', icon: <FaQuestion className="h-5 w-5" /> },
       { key: '/settings', label: 'Settings', icon: <FaCog className="h-5 w-5" /> },
     ];

     const handleClick = (key: string) => {
       router.push(key);
     };

     return (
       <nav
         className={`fixed bottom-0 left-0 right-0 bg-gray-800 shadow-lg border-t border-gray-600 ${className}`}
       >
         <div className="flex justify-around items-center h-16">
           {menuItems.map(item => (
             <button
               key={item.key}
               onClick={() => handleClick(item.key)}
               className={`flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-green-500 transition-colors ${
                 pathname === item.key ? 'text-green-500' : ''
               }`}
             >
               {item.icon}
               <span className="text-xs mt-1">{item.label}</span>
             </button>
           ))}
         </div>
       </nav>
     );
   };

   export default BottomNav;