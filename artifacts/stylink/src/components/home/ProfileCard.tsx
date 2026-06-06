import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: number;
  name: string;
  type: string;
  city: string;
  specialty: string;
  rating: number;
  image: string;
}

interface ProfileCardProps {
  profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const { toast } = useToast();

  const handleContact = () => {
    toast({
      title: "Demande envoyée",
      description: `Demande envoyée à ${profile.name}`,
      duration: 3000,
    });
  };

  return (
    <div 
      className="group flex flex-col h-full bg-card overflow-hidden cursor-pointer"
      data-testid={`card-profile-${profile.id}`}
    >
      {/* Large Image Header */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img 
          src={profile.image} 
          alt={profile.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
        
        {/* Floating Badge */}
        <div 
          className="absolute top-4 left-4 px-4 py-1.5 bg-background/90 backdrop-blur-sm text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-foreground"
          data-testid={`badge-type-${profile.id}`}
        >
          {profile.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow bg-card border border-t-0 border-border/50 group-hover:border-primary/30 transition-colors duration-500">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-serif text-2xl font-medium text-foreground leading-tight">
            {profile.name}
          </h3>
        </div>
        
        <div className="flex flex-col gap-1 mb-8 text-sm">
          <span className="font-sans text-muted-foreground uppercase tracking-wider text-xs">
            {profile.city}
          </span>
          <span className="font-serif italic text-foreground/80 text-base">
            {profile.specialty}
          </span>
        </div>

        <div className="mt-auto">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleContact();
            }}
            className="w-full border-b border-border pb-3 text-sm font-sans font-medium tracking-[0.2em] uppercase text-left group-hover:border-primary group-hover:text-primary transition-all duration-300 flex justify-between items-center"
            data-testid={`button-contact-${profile.id}`}
          >
            <span>Contacter</span>
            <span className="text-lg font-serif italic font-light opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}
