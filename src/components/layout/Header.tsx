import { format } from "date-fns";
import { NotificationDropdown } from "./NotificationDropdown";
import { fr } from "date-fns/locale";

export const Header = () => {
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/95">
      <div className="container flex h-14 md:h-16 items-center justify-between px-3 md:px-4">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          <h1 className="text-lg md:text-2xl font-bold font-museo text-white truncate">
            <span className="hidden sm:inline">SYMONE Supervision</span>
            <span className="sm:hidden">SYMONE</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden lg:block">
            <p className="text-xs md:text-sm text-white/70 capitalize">{today}</p>
          </div>
          
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
};
