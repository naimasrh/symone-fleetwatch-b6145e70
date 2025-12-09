import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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
          
          <div className="relative">
            <Bell className="h-5 w-5 text-white/70 cursor-pointer hover:text-white transition-colors" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs"
            >
              3
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
