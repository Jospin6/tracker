import { Sparkles } from "lucide-react";

export const MarketingAgent = () => {
    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3">
                <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
                </div>
            </div>
        </div>
    );
}