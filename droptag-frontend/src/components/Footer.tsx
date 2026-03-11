import { Hash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="container max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Hash className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium">
            DropTag<span className="text-muted-foreground">.cloud</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Separator orientation="vertical" className="h-3" />
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Separator orientation="vertical" className="h-3" />
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
