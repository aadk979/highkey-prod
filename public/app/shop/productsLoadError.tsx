import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProductsLoadError = () => {
    return (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-5 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-1">
                <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-heading font-semibold text-foreground tracking-tight">Failed to Load Collection</h2>
                <p className="text-muted-foreground text-[16px] max-w-md mx-auto">
                    We encountered an issue while retrieving the latest items. Please try again or check your connection.
                </p>
            </div>
            <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4 rounded-full px-8 h-12 text-[15px] font-medium border-border/60 shadow-sm hover:bg-secondary/50 transition-all duration-300"
            >
                Refresh Page
            </Button>
        </div>
    );
};

export { ProductsLoadError };