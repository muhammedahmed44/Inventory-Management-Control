import { NavLink } from "react-router-dom";


export default function OwnerNavbar() {

  const linkClass =
    "px-4 py-2 rounded-md text-sm font-medium transition";

  const activeClass =
    "bg-blue-600 text-white";

  const normalClass =
    "text-gray-600 hover:bg-gray-200";

  return (
    <div className="bg-white shadow mb-6">

      <div className="flex flex-wrap gap-2 p-4">

        <NavLink
          to="/owner/inventory"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          Inventory
        </NavLink>

        <NavLink
          to="/owner/orders"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          Orders
        </NavLink>

        <NavLink
          to="/owner/restock"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          Restock
        </NavLink>

        <NavLink
          to="/owner/riders"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          Riders
        </NavLink>

        <NavLink
          to="/owner/reports"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : normalClass}`
          }
        >
          Reports
        </NavLink>
        <NavLink
            to="/owner/analytics"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : normalClass}`
            }
          >
            Analytics
        </NavLink>

      </div>

    </div>
  );
}